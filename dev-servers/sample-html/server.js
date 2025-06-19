import express from 'express';
import cors from 'cors';

export function createServer() {
  const app = express();
  
  // Enable CORS for all routes
  app.use(cors());
  
  // Serve static HTML page with 3x3 table
  app.get('/', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>テーブルデータAI分析 - サンプルページ</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        .ai-target-table-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .ai-target-table-table th,
        .ai-target-table-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        .ai-target-table-table th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .ai-target-table-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .ai-target-table-table tbody tr:hover {
            background-color: #f5f5f5;
        }
        .description {
            margin-top: 20px;
            padding: 15px;
            background-color: #e8f4fd;
            border-left: 4px solid #2196F3;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>フルーツデータ分析サンプル</h1>
        
        <p>このページは、Chrome拡張機能「テーブルデータAI分析ツール」のテスト用サンプルページです。</p>
        
        <table class="ai-target-table-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>フルーツ名</th>
                    <th>色</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>りんご</td>
                    <td>赤</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>バナナ</td>
                    <td>黄</td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>オレンジ</td>
                    <td>橙</td>
                </tr>
            </tbody>
        </table>
        
        <div class="description">
            <p><strong>使用方法:</strong></p>
            <ol>
                <li>Chrome拡張機能をインストール</li>
                <li>このページでポップアップを開く</li>
                <li>「分析実行」ボタンをクリック</li>
                <li>テーブルの2列目データ（フルーツ名）が分析されます</li>
            </ol>
        </div>
    </div>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });
  
  return app;
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`Sample HTML Server running on http://localhost:${PORT}`);
    console.log('Test the AI analysis tool with the sample table data.');
  });
}