import { analyzeTableData, checkAISettings, formatAnalysisResult, AnalysisErrorType } from '@src/ai-analysis';
import { detectAndExtractTableData } from '@src/table-detection';
import { injectAnalyzeButton } from '@src/ui-injection';

console.log('[CEB] All content script loaded');

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

    // 結果表示用のダイアログを作成
    const resultDiv = document.createElement('div');
    resultDiv.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000; font-family: system-ui, -apple-system, sans-serif;
      max-width: 600px; max-height: 500px; overflow-y: auto;
    `;

    resultDiv.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #333;">AI分析結果</h3>
      <div style="white-space: pre-wrap; line-height: 1.5; color: #555; margin-bottom: 15px;">${formattedResult}</div>
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
      const analysisError = error as any;
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
