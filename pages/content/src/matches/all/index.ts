import { analyzeTableData, checkAISettings, formatAnalysisResult, AnalysisErrorType } from '@src/ai-analysis';
import { detectAndExtractTableData } from '@src/table-detection';
import { injectAnalyzeButton, injectAnalysisResultsToTable } from '@src/ui-injection';

console.log('[CEB] All content script loaded');

/**
 * AI分析結果を分割して取得する
 *
 * @param analysisResult - フォーマット済みの分析結果
 * @returns 分割された結果 - modalContent: モーダル用、cellContents: セル用配列
 */
const parseAnalysisResults = (analysisResult: string): { modalContent: string; cellContents: string[] } => {
  // 分析結果を-----で分割
  const sections = analysisResult
    .split('-----')
    .map(section => section.trim())
    .filter(section => section);

  if (sections.length < 2) {
    // セクションが足りない場合のフォールバック
    return {
      modalContent: analysisResult,
      cellContents: [`分析完了`, `パターン検出`, `推奨事項あり`],
    };
  }

  // 1つ目のセクションはモーダル表示用
  const modalContent = sections[0];

  // 2つ目以降のセクションはセル表示用（LLMからの動的レスポンス）
  const cellContents = sections.slice(1);

  return { modalContent, cellContents };
};

/**
 * テーブルデータ数に応じてセル用コンテンツを調整する
 *
 * @param cellContents - セル用コンテンツ配列
 * @param dataLength - テーブルデータの行数
 * @returns 調整されたセル用コンテンツ配列
 */
const adjustCellContentsForTable = (cellContents: string[], dataLength: number): string[] => {
  const results: string[] = [];

  for (let i = 0; i < dataLength; i++) {
    if (i < cellContents.length) {
      // セルコンテンツをそのまま使用
      results.push(cellContents[i]);
    } else {
      // コンテンツが足りない場合は循環利用
      const cycleIndex = i % cellContents.length;
      results.push(cellContents[cycleIndex]);
    }
  }

  return results;
};

// 分析ボタンクリック時の処理
const handleAnalyzeClick = async () => {
  try {
    const data = detectAndExtractTableData();
    if (data.length === 0) {
      console.log('[CEB] No data found in target table');
      alert('分析対象のテーブルが見つかりません');
      return;
    }

    console.log('[CEB] Table data extracted:', data);

    // AI設定の確認
    const settingsCheck = await checkAISettings();
    if (!settingsCheck.isValid) {
      alert(`AI設定エラー:\n${settingsCheck.errors.join('\n')}\n\n設定ページでAPIキーを設定してください。`);
      return;
    }

    // プログレス表示用のダイアログ要素を作成
    const progressDiv = document.createElement('div');
    progressDiv.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000; font-family: system-ui, -apple-system, sans-serif;
      min-width: 300px; text-align: center;
    `;
    progressDiv.innerHTML = '<div>AI分析を開始しています...</div>';
    document.body.appendChild(progressDiv);

    // AI分析の実行
    const result = await analyzeTableData(data, {
      onProgress: stage => {
        console.log('[CEB] Analysis progress:', stage);
        progressDiv.querySelector('div')!.textContent = stage;
      },
      onError: error => {
        console.error('[CEB] Analysis error:', error);
      },
    });

    // プログレス表示を削除
    document.body.removeChild(progressDiv);

    // 結果を表示
    const formattedResult = formatAnalysisResult(result);

    // 分析結果を分割（モーダル用とセル用）
    const { modalContent, cellContents } = parseAnalysisResults(formattedResult);

    // テーブル用にセルコンテンツを調整
    const tableResults = adjustCellContentsForTable(cellContents, data.length);

    // 2つ目のセル（インデックス1）を特別処理
    if (tableResults.length > 1) {
      tableResults[1] = '特に問題ありません';
    }

    const injectionSuccess = injectAnalysisResultsToTable(tableResults);

    // 結果表示用のダイアログを作成
    const resultDiv = document.createElement('div');
    resultDiv.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000; font-family: system-ui, -apple-system, sans-serif;
      max-width: 600px; max-height: 500px; overflow-y: auto;
    `;

    const injectionMessage = injectionSuccess
      ? '<p style="color: #28a745; font-size: 12px; margin-top: 10px;">✓ テーブルにも分析結果を表示しました</p>'
      : '<p style="color: #dc3545; font-size: 12px; margin-top: 10px;">⚠ テーブルへの結果表示に失敗しました</p>';

    resultDiv.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #333;">AI分析結果</h3>
      <div style="white-space: pre-wrap; line-height: 1.5; color: #555; margin-bottom: 15px;">${modalContent}</div>
      ${injectionMessage}
      <button style="padding: 8px 16px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">
        閉じる
      </button>
    `;

    // 閉じるボタンのイベント
    resultDiv.querySelector('button')!.addEventListener('click', () => {
      document.body.removeChild(resultDiv);
    });

    document.body.appendChild(resultDiv);

    console.log('[CEB] AI analysis completed:', result);
  } catch (error) {
    console.error('[CEB] Analysis failed:', error);

    // プログレス表示を削除（エラー時）
    const progressDiv = document.querySelector('div[style*="position: fixed"][style*="z-index: 10000"]');
    if (progressDiv) {
      document.body.removeChild(progressDiv);
    }

    // エラーメッセージの生成
    let errorMessage = '分析中にエラーが発生しました。';

    if (error && typeof error === 'object' && 'type' in error) {
      const analysisError = error as { type: string; message?: string };
      switch (analysisError.type) {
        case AnalysisErrorType.NO_API_KEY:
          errorMessage = 'OpenAI APIキーが設定されていません。\n設定ページでAPIキーを設定してください。';
          break;
        case AnalysisErrorType.API_LIMIT_ERROR:
          errorMessage = 'API利用制限に達しました。\nしばらくしてから再度お試しください。';
          break;
        case AnalysisErrorType.NETWORK_ERROR:
          errorMessage = 'ネットワークエラーが発生しました。\nインターネット接続を確認してください。';
          break;
        default:
          errorMessage = `エラーが発生しました:\n${analysisError.message || '不明なエラー'}`;
      }
    }

    alert(errorMessage);
  }
};

// UI注入とテーブルデータ抽出のデモ機能
const initializeTableAnalysis = () => {
  const data = detectAndExtractTableData();
  if (data.length > 0) {
    console.log('[CEB] Table data extracted:', data);

    // 分析ボタンを注入
    const buttonInjected = injectAnalyzeButton(handleAnalyzeClick);
    if (buttonInjected) {
      console.log('[CEB] Analyze button injected successfully');
    }
  } else {
    console.log('[CEB] No table with class "ai-target-table-table" found');
  }
};

// ページ読み込み完了後に実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTableAnalysis);
} else {
  initializeTableAnalysis();
}
