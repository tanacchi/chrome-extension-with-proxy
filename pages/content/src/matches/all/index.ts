import { detectAndExtractTableData } from '@src/table-detection';
import { injectAnalyzeButton } from '@src/ui-injection';

console.log('[CEB] All content script loaded');

// 分析ボタンクリック時の処理
const handleAnalyzeClick = () => {
  const data = detectAndExtractTableData();
  if (data.length > 0) {
    console.log('[CEB] Table data extracted:', data);
    // TODO: 次のフェーズでAI API呼び出しを実装
    alert(`抽出されたデータ: ${data.join(', ')}`);
  } else {
    console.log('[CEB] No data found in target table');
    alert('分析対象のテーブルが見つかりません');
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
