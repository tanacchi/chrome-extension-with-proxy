import { detectAndExtractTableData } from '@src/table-detection';

console.log('[CEB] All content script loaded');

// テーブルデータ抽出のデモ機能
const extractData = () => {
  const data = detectAndExtractTableData();
  if (data.length > 0) {
    console.log('[CEB] Table data extracted:', data);
  } else {
    console.log('[CEB] No table with class "ai-target-table-table" found');
  }
};

// ページ読み込み完了後に実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', extractData);
} else {
  extractData();
}
