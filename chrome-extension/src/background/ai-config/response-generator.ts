/**
 * @fileoverview AI分析レスポンス生成機能
 *
 * 開発時に使用される動的AI分析結果レスポンスを生成します。
 * 実際のテーブルデータに基づいてセル固有の分析結果を生成し、
 * 本番環境のOpenAI APIレスポンスをシミュレートします。
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

/**
 * テーブルデータ分析用の固定レスポンス
 *
 * @since 1.0.0
 */
export const TABLE_ANALYSIS_RESPONSE = `AI分析結果（開発モード）

このテーブルデータの分析結果：
構造化されたテーブルデータを検出しました。複数のカラムと行で構成され、数値データと文字列データが混在しています。各項目間に相関関係の可能性があり、データの分布は比較的均等です。

これは開発モード用の固定レスポンスです。実際の分析には本番のAPIキーを設定してください。

-----

データの特徴: 構造化されたテーブルデータを検出
データ形式が整理されており、複数のカラムと行で構成されています。数値データと文字列データが適切に混在し、分析に適した形式となっています。

-----

傾向とパターン: 一定のパターンが見られます
各項目間に相関関係の可能性があります。データの分布は比較的均等で、特定の傾向を示しています。継続的な監視により、より詳細な傾向分析が可能です。

-----

推奨事項: データの可視化を検討することをお勧めします
より詳細な分析には追加のデータが有効です。定期的なデータ更新で傾向を追跡し、ビジネス価値の向上を図ることができます。`

/**
 * 一般的な質問応答用の固定レスポンス
 *
 * @since 1.0.0
 */
export const GENERAL_RESPONSE = `AI応答（開発モード）

ご質問にお答えします：
入力いただいた内容について、基本的な情報整理、関連する要素の特定、推奨される次のステップの観点から回答いたします。内容を理解し、適切な対応を検討しました。

これは開発モード用の固定レスポンスです。実際のAI分析には本番のAPIキーを設定してください。

-----

基本的な情報整理: 内容を分析しました
提供された情報を体系的に整理し、重要なポイントを特定しました。関連する要素を明確にし、全体的な理解を深めることができました。

-----

関連する要素の特定: 重要な要因を抽出しました
各要素間の関係性を分析し、影響度の高い要因を特定しました。これらの要素が全体に与える影響を評価し、優先順位を設定しました。

-----

推奨される次のステップ: 具体的なアクションをご提案します
さらなる詳細が必要な場合はお知らせください。継続的なサポートが可能で、段階的な改善アプローチをお勧めします。`

/**
 * テーブルデータを検出する条件
 *
 * @since 1.0.0
 */
export const TABLE_DATA_INDICATORS = [
  '\\t', // タブ文字
  '|', // パイプ文字
  'table', // table キーワード（英語）
  'テーブル', // テーブル キーワード（日本語）
]

/**
 * メッセージからテーブルデータの存在を判定する
 *
 * @param userMessage - ユーザーメッセージ
 * @returns テーブルデータが含まれている場合 true
 *
 * @since 1.0.0
 */
export const hasTableData = (userMessage: string): boolean => {
  const lowerMessage = userMessage.toLowerCase()

  return TABLE_DATA_INDICATORS.some(indicator => {
    if (indicator.startsWith('\\')) {
      // エスケープ文字の場合
      return userMessage.includes(indicator.slice(1))
    }
    return lowerMessage.includes(indicator.toLowerCase())
  })
}

/**
 * テーブルデータから動的な固定レスポンスを生成する
 *
 * @param tableData - テーブルデータ配列
 * @returns 動的に生成された分析レスポンス
 *
 * @since 1.0.0
 */
export const generateDynamicTableResponse = (tableData: string[]): string => {
  // 各セルの内容について動的にレスポンスを生成
  const cellAnalyses = tableData.map((cellContent, index) => {
    const analysisTexts = [
      '良好な品質です',
      '改善の余地があります',
      '注意が必要です',
      '優秀な状態です',
      '標準的なレベルです',
    ]

    const randomAnalysis = analysisTexts[index % analysisTexts.length]
    return `${cellContent}についてですが、${randomAnalysis}。データの特徴を分析した結果、適切な管理が行われていることを確認しました。`
  })

  // 最初のセルは特別処理（2つ目のセルは後でオーバーライドされる）
  if (cellAnalyses.length > 1) {
    cellAnalyses[1] = '特に問題ありません'
  }

  // モーダル用のサマリーを作成
  const summary = `AI分析結果（開発モード）

このテーブルデータの分析結果：
${tableData.length}個の項目を分析しました。各項目について個別の評価を実施し、全体的な品質状況を確認しました。データは適切に構造化されており、分析に適した形式となっています。

これは開発モード用の固定レスポンスです。実際の分析には本番のAPIキーを設定してください。

-----

${cellAnalyses.join('\n\n-----\n\n')}`

  return summary
}

/**
 * 適切な固定レスポンスを取得する
 *
 * @param messages - 入力メッセージ配列
 * @returns 固定レスポンス文字列
 *
 * @since 1.0.0
 */
export const getFixedResponse = (messages: Array<{ role: string; content: string }>): string => {
  const userMessage = messages.find(m => m.role === 'user')?.content || ''

  if (hasTableData(userMessage)) {
    // テーブルデータがある場合は、メッセージからデータを抽出して動的レスポンスを生成
    const tableDataMatch = userMessage.match(/データ:\s*([\s\S]*?)(?:\n\n|$)/)
    if (tableDataMatch) {
      const dataSection = tableDataMatch[1]
      const tableData = dataSection
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 0)

      if (tableData.length > 0) {
        return generateDynamicTableResponse(tableData)
      }
    }

    // フォールバック：デフォルトのテーブル分析レスポンス
    return TABLE_ANALYSIS_RESPONSE
  }
  return GENERAL_RESPONSE
}
