# AI SDK React統合設計書

## 概要

`@ai-sdk/react`の`useChat`フックを使用してAI分析機能を実装します。
Chrome拡張機能でReactベースのAI統合を効率的に行うための設計書です。

## アーキテクチャ変更

### 1. 新しい統合方針

```
Content Script (React Component)
    ↓ useChat フック
@ai-sdk/react
    ↓ API Route (Background Script)
Background Script (API Handler)
    ↓ HTTP Request
OpenAI API
```

### 2. パッケージ構成の変更

```
packages/ai-api/
├── lib/
│   ├── hooks/                   # React フック
│   │   ├── use-analysis.ts      # AI分析用カスタムフック
│   │   └── use-ai-client.ts     # AIクライアント設定フック
│   ├── providers/               # React プロバイダー
│   │   ├── ai-provider.tsx      # AI設定プロバイダー
│   │   └── analysis-provider.tsx # 分析状態プロバイダー
│   ├── services/                # サービス層
│   │   ├── background-api.ts    # Background Script API
│   │   ├── prompt-service.ts    # プロンプト構築
│   │   └── analysis-service.ts  # 分析ロジック
│   ├── utils/                   # ユーティリティ
│   │   ├── error-handler.ts     # エラーハンドリング（既存）
│   │   └── message-utils.ts     # Chrome メッセージング
│   └── types/                   # 型定義
│       ├── analysis.ts          # 分析関連型
│       └── api.ts               # API関連型
└── tests/
```

## 実装設計

### 3. useChat統合サービス

```typescript
/**
 * AI分析用カスタムフック
 * @ai-sdk/reactのuseChatを内部で使用
 */
export const useAnalysis = () => {
  const { messages, append, isLoading, error } = useChat({
    api: '/api/analyze',  // Background Script endpoint
    onError: handleAnalysisError,
    onFinish: handleAnalysisComplete
  });

  const analyzeTableData = useCallback(async (tableData: string[]) => {
    const prompt = buildAnalysisPrompt(tableData);
    await append({ role: 'user', content: prompt });
  }, [append]);

  return {
    analyzeTableData,
    isAnalyzing: isLoading,
    analysisResults: messages,
    error
  };
};
```

### 4. Background Script API Handler

```typescript
/**
 * Background Script でのAPI処理
 * useChatからのリクエストを受信してOpenAI APIを呼び出し
 */
export class BackgroundAPIHandler {
  async handleAnalysisRequest(request: {
    messages: ChatMessage[];
    settings: AISettings;
  }): Promise<ChatResponse> {
    // OpenAI API呼び出し
    const response = await this.callOpenAI(request);
    return this.formatResponse(response);
  }

  private async callOpenAI(request: any) {
    // 実際のOpenAI API呼び出し
    // 自前実装部分はここに残す
  }
}
```

### 5. React プロバイダー設計

```typescript
/**
 * AI設定プロバイダー
 */
export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AISettings>();
  
  // Chrome Storage から設定を読み込み
  useEffect(() => {
    loadAISettings().then(setSettings);
  }, []);

  return (
    <AIContext.Provider value={{ settings, updateSettings: setSettings }}>
      {children}
    </AIContext.Provider>
  );
};

/**
 * 分析状態プロバイダー
 */
export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  
  return (
    <AnalysisContext.Provider value={{ analysisHistory, addResult: setAnalysisHistory }}>
      {children}
    </AnalysisContext.Provider>
  );
};
```

## Chrome拡張機能統合

### 6. Content Script での使用

```typescript
/**
 * Content Script のReactコンポーネント
 */
const TableAnalysisComponent: React.FC = () => {
  const { analyzeTableData, isAnalyzing, analysisResults, error } = useAnalysis();
  const tableData = useTableDetection(); // 既存のテーブル検出フック

  const handleAnalyze = useCallback(async () => {
    if (tableData.length > 0) {
      await analyzeTableData(tableData);
    }
  }, [tableData, analyzeTableData]);

  return (
    <div className="ai-analysis-panel">
      <button onClick={handleAnalyze} disabled={isAnalyzing}>
        {isAnalyzing ? '分析中...' : 'AI分析'}
      </button>
      
      {error && <ErrorDisplay error={error} />}
      
      <AnalysisResults results={analysisResults} />
    </div>
  );
};
```

### 7. Background Script メッセージハンドリング

```typescript
/**
 * Chrome メッセージングでAPI呼び出しを処理
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYZE_TABLE_DATA') {
    const handler = new BackgroundAPIHandler();
    
    handler.handleAnalysisRequest(message.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // 非同期レスポンス
  }
});
```

## メリット

### 8. @ai-sdk/react 使用の利点

1. **標準化されたAPI**: Vercel AI SDKの統一インターフェース
2. **ストリーミング対応**: リアルタイムレスポンス表示
3. **状態管理**: ローディング、エラー状態の自動管理
4. **型安全性**: TypeScriptでの完全な型サポート
5. **最適化**: パフォーマンス最適化済み
6. **拡張性**: 他のAIプロバイダーへの切り替えが容易

### 9. Chrome拡張機能での適用

```typescript
/**
 * API エンドポイントの設定
 * Background Script をAPIサーバーとして使用
 */
const useAnalysisWithChromeExtension = () => {
  return useChat({
    api: async (messages) => {
      // Chrome メッセージングでBackground Scriptに送信
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: 'CHAT_REQUEST', messages },
          (response) => {
            if (response.success) {
              resolve(response.data);
            } else {
              reject(new Error(response.error));
            }
          }
        );
      });
    }
  });
};
```

## 実装ステップ

### 10. 段階的実装計画

#### Phase 6.1: 基盤実装
1. ✅ エラーハンドリング（完了）
2. 🔄 useChatラッパーフックの実装
3. 🔄 Background API ハンドラー

#### Phase 6.2: React統合
1. AIプロバイダーの実装
2. 分析プロバイダーの実装
3. カスタムフックの実装

#### Phase 6.3: Chrome拡張機能統合
1. Background Scriptとの連携
2. Content Scriptでの使用
3. メッセージング最適化

#### Phase 6.4: テスト・最適化
1. 包括的なテスト
2. パフォーマンス最適化
3. エラーハンドリング強化

この設計により、`@ai-sdk/react`の強力な機能を活用しながら、Chrome拡張機能として最適化されたAI統合を実現します。