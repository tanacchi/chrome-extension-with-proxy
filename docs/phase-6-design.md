# フェーズ6: AI API統合機能 設計書

## 概要

OpenAI APIとの統合により、テーブルデータの実際のAI分析機能を実装します。
セキュアで効率的なAPI通信、エラーハンドリング、レート制限対応を含む包括的なソリューションです。

## アーキテクチャ設計

### 1. 全体構造

```
Background Script (API通信の管理)
    ↓ chrome.runtime.sendMessage
Content Script (UI・データ抽出)
    ↓ 分析結果表示
Web Page (テーブル表示・UI注入)
```

### 2. モジュール構成

```
packages/ai-api/                 # AI API統合パッケージ
├── lib/
│   ├── client/                  # APIクライアント層
│   │   ├── openai-client.ts     # OpenAI API クライアント
│   │   ├── api-types.ts         # API型定義
│   │   └── request-builder.ts   # リクエスト構築
│   ├── services/                # サービス層
│   │   ├── analysis-service.ts  # 分析サービス
│   │   ├── prompt-service.ts    # プロンプト構築
│   │   └── cache-service.ts     # キャッシュ管理
│   ├── utils/                   # ユーティリティ
│   │   ├── error-handler.ts     # エラーハンドリング
│   │   ├── rate-limiter.ts      # レート制限
│   │   └── security.ts          # セキュリティユーティリティ
│   └── index.ts                 # エクスポート
├── tests/                       # テストファイル
└── package.json
```

## 詳細設計

### 3. APIクライアント設計

#### 3.1 OpenAI クライアント
```typescript
interface OpenAIClient {
  // チャット補完API呼び出し
  createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
  
  // ストリーミング対応
  createChatCompletionStream(request: ChatCompletionRequest): AsyncIterable<ChatCompletionChunk>;
  
  // ヘルスチェック
  healthCheck(): Promise<boolean>;
}
```

#### 3.2 リクエスト構築
```typescript
interface RequestBuilder {
  // システムプロンプト + ユーザーデータの組み合わせ
  buildAnalysisRequest(
    tableData: string[],
    customPrompt?: string
  ): ChatCompletionRequest;
  
  // トークン数計算
  estimateTokens(messages: ChatMessage[]): number;
}
```

### 4. サービス層設計

#### 4.1 分析サービス
```typescript
interface AnalysisService {
  // メイン分析関数
  analyzeTableData(
    tableData: string[],
    settings: AISettings
  ): Promise<AnalysisResult>;
  
  // バッチ分析（複数データ同時処理）
  analyzeBatch(
    dataList: string[][],
    settings: AISettings
  ): Promise<AnalysisResult[]>;
}
```

#### 4.2 プロンプトサービス
```typescript
interface PromptService {
  // デフォルトプロンプト取得
  getDefaultPrompt(): string;
  
  // システムプロンプト構築
  buildSystemPrompt(
    tableData: string[],
    customPrompt?: string
  ): string;
  
  // プロンプト検証
  validatePrompt(prompt: string): ValidationResult;
}
```

### 5. エラーハンドリング設計

#### 5.1 エラー種別
```typescript
enum APIErrorType {
  AUTHENTICATION = 'authentication',
  RATE_LIMIT = 'rate_limit',
  QUOTA_EXCEEDED = 'quota_exceeded',
  NETWORK = 'network',
  INVALID_REQUEST = 'invalid_request',
  SERVER_ERROR = 'server_error',
  UNKNOWN = 'unknown'
}

interface APIError extends Error {
  type: APIErrorType;
  statusCode?: number;
  retryAfter?: number;
  details?: any;
}
```

#### 5.2 リトライ戦略
```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: APIErrorType[];
}
```

### 6. レート制限・キャッシュ設計

#### 6.1 レート制限
```typescript
interface RateLimiter {
  // リクエスト許可チェック
  checkRateLimit(): Promise<boolean>;
  
  // レート制限状況取得
  getRateLimitStatus(): RateLimitStatus;
  
  // 待機時間計算
  getWaitTime(): number;
}
```

#### 6.2 キャッシュ戦略
```typescript
interface CacheService {
  // 分析結果キャッシュ
  cacheAnalysisResult(
    inputHash: string,
    result: AnalysisResult,
    ttl: number
  ): Promise<void>;
  
  // キャッシュ取得
  getCachedResult(inputHash: string): Promise<AnalysisResult | null>;
  
  // キャッシュクリア
  clearExpiredCache(): Promise<void>;
}
```

## 実装戦略

### 7. 段階的実装計画

#### フェーズ6.1: 基盤実装
1. APIクライアント基本機能
2. エラーハンドリング基盤
3. 基本的なテスト

#### フェーズ6.2: サービス層実装
1. 分析サービス
2. プロンプトサービス  
3. Background Script統合

#### フェーズ6.3: 高度な機能
1. レート制限・リトライ
2. キャッシュ機能
3. パフォーマンス最適化

#### フェーズ6.4: 統合・テスト
1. Content Script統合
2. E2Eテスト
3. ドキュメント完成

### 8. テスト戦略

#### 8.1 単体テスト
- APIクライアントのモック化
- エラーケースの網羅
- 境界値テスト

#### 8.2 統合テスト
- 実際のAPI呼び出し（テスト環境）
- エラーハンドリングの動作確認
- パフォーマンステスト

#### 8.3 E2Eテスト
- 実際のWebページでの動作確認
- UI統合テスト
- エラー状況での動作確認

## セキュリティ考慮事項

### 9. APIキー保護
- Chrome Storage Syncでの暗号化保存
- メモリ上での最小限保持
- ログ出力の完全禁止
- デバッグ時のマスキング

### 10. データプライバシー
- 最小限のデータ送信
- 機密情報のフィルタリング
- 分析結果の適切な管理
- ユーザー同意の確保

### 11. 通信セキュリティ
- HTTPS強制
- リクエスト検証
- レスポンス検証
- 中間者攻撃対策

## パフォーマンス目標

- **API応答時間**: 平均3秒以内
- **レート制限遵守**: 100%
- **キャッシュヒット率**: 60%以上
- **エラー率**: 1%以下
- **メモリ使用量**: 10MB以下

## 次のステップ

1. **基盤パッケージ作成**: packages/ai-api の初期化
2. **型定義実装**: APIインターフェースの定義
3. **テスト環境構築**: モック・スタブの実装
4. **APIクライアント実装**: OpenAI統合の基本機能
5. **エラーハンドリング**: 包括的なエラー処理

この設計書に基づいて、テスト駆動開発でクリーンなコードを実装していきます。