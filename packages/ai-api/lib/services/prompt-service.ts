/**
 * @fileoverview プロンプト構築サービス
 *
 * テーブルデータAI分析用のプロンプトを構築するサービスです。
 * デフォルトプロンプトとカスタムプロンプトの組み合わせ、
 * テーブルデータの整形、プロンプトバリデーションを提供します。
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

/**
 * デフォルトシステムプロンプト
 * SPECIFICATION.mdに従った分析指示
 */
const DEFAULT_SYSTEM_PROMPT = `以下の3つの項目について、以下の指示に沿って書けているかそれぞれ分析し100文字以内で回答してください。

項目1: {項目1のデータ}
項目2: {項目2のデータ}
項目3: {項目3のデータ}

指示: {ユーザー設定のカスタムプロンプト}`;

/**
 * フォールバック用の基本プロンプト
 * カスタムプロンプトが設定されていない場合に使用
 */
const FALLBACK_PROMPT = `各項目について、内容を簡潔に要約し、特徴や注意点があれば指摘してください。`;

/**
 * プロンプト構築オプション
 *
 * @interface PromptBuildOptions
 */
export interface PromptBuildOptions {
  /** カスタムプロンプト */
  customPrompt?: string;
  /** カスタムプロンプトを使用するかどうか */
  useCustomPrompt?: boolean;
  /** 最大文字数制限 */
  maxLength?: number;
  /** デバッグモード */
  debug?: boolean;
}

/**
 * プロンプト構築結果
 *
 * @interface PromptBuildResult
 */
export interface PromptBuildResult {
  /** 構築されたプロンプト */
  prompt: string;
  /** 使用されたプロンプトタイプ */
  promptType: 'default' | 'custom' | 'fallback';
  /** テーブルデータ項目数 */
  itemCount: number;
  /** プロンプト文字数 */
  characterCount: number;
  /** 警告メッセージ（もしあれば） */
  warnings: string[];
}

/**
 * テーブルデータ用のAI分析プロンプトを構築する
 *
 * SPECIFICATION.mdに従って、テーブルの2列目データを使用して
 * AI分析用のプロンプトを生成します。カスタムプロンプトが
 * 設定されている場合は、それを組み込みます。
 *
 * @example
 * ```typescript
 * const tableData = ['データ1', 'データ2', 'データ3'];
 * const customPrompt = '各データの重要度を評価してください';
 *
 * const result = buildAnalysisPrompt(tableData, customPrompt);
 * console.log(result.prompt);
 * // "以下の3つの項目について、以下の指示に沿って書けているかそれぞれ分析し100文字以内で回答してください。
 * //  項目1: データ1
 * //  項目2: データ2
 * //  項目3: データ3
 * //  指示: 各データの重要度を評価してください"
 * ```
 *
 * @param tableData - テーブルから抽出されたデータ配列
 * @param customPrompt - ユーザー設定のカスタムプロンプト
 * @param options - プロンプト構築オプション
 * @returns 構築されたプロンプト
 *
 * @since 1.0.0
 */
export const buildAnalysisPrompt = (
  tableData: string[],
  customPrompt?: string,
  options: PromptBuildOptions = {},
): string => {
  const result = buildAnalysisPromptDetailed(tableData, customPrompt, options);
  return result.prompt;
};

/**
 * 詳細な情報を含むプロンプト構築
 *
 * デバッグやログ出力に使用される詳細情報を含むバージョンです。
 *
 * @param tableData - テーブルから抽出されたデータ配列
 * @param customPrompt - ユーザー設定のカスタムプロンプト
 * @param options - プロンプト構築オプション
 * @returns 構築結果の詳細情報
 *
 * @since 1.0.0
 */
export const buildAnalysisPromptDetailed = (
  tableData: string[],
  customPrompt?: string,
  options: PromptBuildOptions = {},
): PromptBuildResult => {
  const { useCustomPrompt = true, maxLength = 3000, debug = false } = options;

  const warnings: string[] = [];

  // データの前処理
  const sanitizedData = sanitizeTableData(tableData);

  if (sanitizedData.length === 0) {
    throw new Error('テーブルデータが空です');
  }

  if (sanitizedData.length > 10) {
    warnings.push(`データ項目数が多すぎます (${sanitizedData.length}項目)。最初の10項目のみ使用します。`);
    sanitizedData.splice(10);
  }

  // プロンプトの決定
  let instructionPrompt = FALLBACK_PROMPT;
  let promptType: 'default' | 'custom' | 'fallback' = 'fallback';

  if (useCustomPrompt && customPrompt && customPrompt.trim()) {
    const trimmedCustomPrompt = customPrompt.trim();

    if (trimmedCustomPrompt.length > 500) {
      warnings.push('カスタムプロンプトが長すぎます。切り詰められる可能性があります。');
    }

    instructionPrompt = trimmedCustomPrompt;
    promptType = 'custom';
  } else if (sanitizedData.length >= 3) {
    // デフォルトプロンプトは3項目以上の場合のみ使用
    promptType = 'default';
  }

  // プロンプトの構築
  let prompt: string;

  if (promptType === 'default' && sanitizedData.length >= 3) {
    // SPECIFICATION.mdに従った標準フォーマット
    prompt = buildDefaultPrompt(sanitizedData, customPrompt || FALLBACK_PROMPT);
  } else {
    // カスタムまたはフォールバック
    prompt = buildFlexiblePrompt(sanitizedData, instructionPrompt);
  }

  // 文字数制限チェック
  if (prompt.length > maxLength) {
    warnings.push(`プロンプトが最大文字数 (${maxLength}) を超えています。`);
    prompt = truncatePrompt(prompt, maxLength);
  }

  // デバッグ情報
  if (debug) {
    console.log('Prompt Build Debug:', {
      originalDataCount: tableData.length,
      sanitizedDataCount: sanitizedData.length,
      promptType,
      characterCount: prompt.length,
      warnings,
    });
  }

  return {
    prompt,
    promptType,
    itemCount: sanitizedData.length,
    characterCount: prompt.length,
    warnings,
  };
};

/**
 * デフォルト形式のプロンプトを構築
 *
 * @param tableData - サニタイズ済みテーブルデータ
 * @param instruction - 指示文
 * @returns 構築されたプロンプト
 *
 * @private
 */
const buildDefaultPrompt = (tableData: string[], instruction: string): string => {
  const items = tableData
    .slice(0, 3)
    .map((data, index) => `項目${index + 1}: ${data}`)
    .join('\n');

  return `以下の項目について、以下の指示に沿って書けているかそれぞれ分析してください。

${items}

指示: ${instruction}

【重要】回答形式：
- 各項目について個別に分析してください
- 各項目の分析結果を "-----" で区切って返してください
- 各項目の分析は「<セルの内容>についてですが、」という書き出しで始めてください
- 各項目について100文字以内で回答してください

回答例：
項目1の内容についてですが、[分析内容]
-----
項目2の内容についてですが、[分析内容]
-----
項目3の内容についてですが、[分析内容]`;
};

/**
 * 柔軟な形式のプロンプトを構築
 *
 * @param tableData - サニタイズ済みテーブルデータ
 * @param instruction - 指示文
 * @returns 構築されたプロンプト
 *
 * @private
 */
const buildFlexiblePrompt = (tableData: string[], instruction: string): string => {
  const items = tableData.map((data, index) => `${index + 1}. ${data}`).join('\n');
  const dataCount = tableData.length;

  // 期待する出力例を動的生成
  const expectedOutputExample = [
    '全体的な分析結果の総括をここに記載',
    ...tableData.map(data => `${data}についてですが、[この項目の具体的な分析内容]`),
  ].join('\n-----\n');

  return `以下のテーブルデータについて分析してください。

データ（${dataCount}項目）:
${items}

指示: ${instruction}

【厳密な出力形式の指示】
以下の形式で必ず${dataCount + 1}個のセクションを出力してください：

1. 最初のセクション：全体の総括（${dataCount}項目全体の総合的な分析結果）
2. 以降${dataCount}個のセクション：各項目の個別分析

【必須ルール】
- セクション数は必ず${dataCount + 1}個にしてください
- セクション間は必ず "-----" で区切ってください
- 2番目以降のセクションは「<セルの内容>についてですが、」で始めてください
- 各セクションは100文字以内にしてください
- 余分なセクションは絶対に追加しないでください

【期待する出力形式】：
${expectedOutputExample}

この形式を厳密に守って、${dataCount + 1}個のセクションで回答してください。`;
};

/**
 * テーブルデータをサニタイズする
 *
 * @param tableData - 元のテーブルデータ
 * @returns サニタイズ済みデータ
 *
 * @private
 */
const sanitizeTableData = (tableData: string[]): string[] =>
  tableData
    .filter(data => data && typeof data === 'string')
    .map(data => data.trim())
    .filter(data => data.length > 0)
    .map(data => {
      // HTMLタグを除去
      const cleanData = data.replace(/<[^>]*>/g, '');
      // 長すぎるデータを切り詰め
      return cleanData.length > 200 ? cleanData.substring(0, 200) + '...' : cleanData;
    });

/**
 * プロンプトを指定した文字数で切り詰める
 *
 * @param prompt - 元のプロンプト
 * @param maxLength - 最大文字数
 * @returns 切り詰められたプロンプト
 *
 * @private
 */
const truncatePrompt = (prompt: string, maxLength: number): string => {
  if (prompt.length <= maxLength) {
    return prompt;
  }

  // 指示部分を保持しつつ、データ部分を切り詰める
  const truncated = prompt.substring(0, maxLength - 3) + '...';
  return truncated;
};

/**
 * デフォルトシステムプロンプトを取得する
 *
 * @returns デフォルトプロンプト
 *
 * @since 1.0.0
 */
export const getDefaultPrompt = (): string => DEFAULT_SYSTEM_PROMPT;

/**
 * プロンプトをバリデーションする
 *
 * @param prompt - バリデーション対象のプロンプト
 * @returns バリデーション結果
 *
 * @since 1.0.0
 */
export const validatePrompt = (prompt: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!prompt || typeof prompt !== 'string') {
    errors.push('プロンプトが設定されていません');
    return { isValid: false, errors };
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length === 0) {
    errors.push('プロンプトが空です');
  }

  if (trimmedPrompt.length > 3000) {
    errors.push('プロンプトが長すぎます（3000文字以内）');
  }

  if (trimmedPrompt.length < 10) {
    errors.push('プロンプトが短すぎます（10文字以上）');
  }

  // 潜在的に問題のあるパターンをチェック
  const dangerousPatterns = [
    /ignore\s+(previous|above|all)\s+instructions?/i,
    /system\s*:\s*you\s+are/i,
    /forget\s+(everything|all)/i,
  ];

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(trimmedPrompt)) {
      errors.push('プロンプトに潜在的に危険なパターンが含まれています');
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};
