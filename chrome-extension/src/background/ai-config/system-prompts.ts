/**
 * @fileoverview AI分析用のシステムプロンプト設定
 *
 * OpenAI APIに送信するシステムプロンプトを管理します。
 * 分析の品質と一貫性を保つため、用途別にプロンプトを定義します。
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

/**
 * テーブルデータ分析用のシステムプロンプト
 *
 * @since 1.0.0
 */
export const TABLE_ANALYSIS_SYSTEM_PROMPT = `あなたは優秀なデータアナリストです。提供されたテーブルデータを分析し、以下の観点から洞察を提供してください：

## 分析観点
1. **データの特徴**: データの種類、パターン、分布を特定
2. **傾向分析**: 数値の変化、成長率、相関関係を分析
3. **異常値検出**: 他と大きく異なる値や特異なパターンを特定
4. **ビジネス洞察**: データから読み取れるビジネス上の示唆
5. **推奨事項**: 改善提案や次のアクション

## 回答形式
- 簡潔で分かりやすい日本語で回答
- 重要な数値は具体的に示す
- 絵文字を適度に使用して視認性を向上
- 根拠を明確に示す

## 注意事項
- 推測に基づく分析の場合は明記する
- データの限界や不足している情報があれば指摘する
- 実用的で行動可能な提案を心がける`;

/**
 * 一般的な質問応答用のシステムプロンプト
 *
 * @since 1.0.0
 */
export const GENERAL_SYSTEM_PROMPT = `あなたは親切で知識豊富なAIアシスタントです。ユーザーの質問に対して正確で有用な回答を提供してください：

## 回答の原則
1. **正確性**: 事実に基づいた情報を提供
2. **明確性**: 分かりやすい言葉で説明
3. **有用性**: 実用的で行動可能な情報を含める
4. **適切性**: 文脈に応じた適切なレベルで回答

## 回答形式
- 構造化された見やすい形式
- 必要に応じて例を含める
- 重要なポイントは強調
- 日本語で自然な回答

## 注意事項
- 不確実な情報は推測であることを明記
- 専門的な内容は適切に説明を加える
- ユーザーの意図を正しく理解して回答`;

/**
 * データプライバシー保護用の追加プロンプト
 *
 * @since 1.0.0
 */
export const PRIVACY_PROTECTION_PROMPT = `

## データプライバシーに関する注意
- 個人情報や機密情報が含まれている可能性があるデータを分析する際は、プライバシーを尊重してください
- 具体的な個人名、連絡先、機密の数値等は回答に含めないでください
- 分析結果は一般化された形で提供してください`;

/**
 * システムプロンプトのタイプ
 *
 * @since 1.0.0
 */
export enum SystemPromptType {
  TABLE_ANALYSIS = 'table_analysis',
  GENERAL = 'general',
}

/**
 * 指定されたタイプに応じてシステムプロンプトを取得する
 *
 * @param type - プロンプトタイプ
 * @param includePrivacyProtection - プライバシー保護プロンプトを含めるかどうか
 * @returns システムプロンプト文字列
 *
 * @since 1.0.0
 */
export const getSystemPrompt = (
  type: SystemPromptType = SystemPromptType.TABLE_ANALYSIS,
  includePrivacyProtection: boolean = true,
): string => {
  let basePrompt: string;

  switch (type) {
    case SystemPromptType.TABLE_ANALYSIS:
      basePrompt = TABLE_ANALYSIS_SYSTEM_PROMPT;
      break;
    case SystemPromptType.GENERAL:
      basePrompt = GENERAL_SYSTEM_PROMPT;
      break;
    default:
      basePrompt = TABLE_ANALYSIS_SYSTEM_PROMPT;
  }

  return includePrivacyProtection ? basePrompt + PRIVACY_PROTECTION_PROMPT : basePrompt;
};

/**
 * メッセージ内容からプロンプトタイプを自動判定する
 *
 * @param messages - 入力メッセージ配列
 * @returns 適切なプロンプトタイプ
 *
 * @since 1.0.0
 */
export const detectPromptType = (messages: Array<{ role: string; content: string }>): SystemPromptType => {
  const userMessage = messages.find(m => m.role === 'user')?.content || '';
  const lowerMessage = userMessage.toLowerCase();

  // テーブルデータ関連のキーワードをチェック
  const tableKeywords = ['table', 'テーブル', '\\t', '|', 'データ分析', '分析', 'data'];
  const hasTableKeywords = tableKeywords.some(keyword => {
    if (keyword.startsWith('\\')) {
      return userMessage.includes(keyword.slice(1));
    }
    return lowerMessage.includes(keyword);
  });

  return hasTableKeywords ? SystemPromptType.TABLE_ANALYSIS : SystemPromptType.GENERAL;
};
