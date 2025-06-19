#!/bin/bash

# Mock API サーバー起動とPostmanテスト実行スクリプト

echo "Starting Mock API Server and running Postman tests..."

# ポートが使用中かチェックする関数
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

PORT=${PORT:-3001}

# サーバーが既に起動しているかチェック
if check_port $PORT; then
    echo "Server already running on port $PORT"
    SERVER_ALREADY_RUNNING=true
else
    echo "Starting server on port $PORT..."
    PORT=$PORT npm start &
    SERVER_PID=$!
    SERVER_ALREADY_RUNNING=false
    
    # サーバーの起動を待機
    echo "Waiting for server to start..."
    for i in {1..30}; do
        if check_port $PORT; then
            echo "Server is ready!"
            break
        fi
        echo "Waiting... ($i/30)"
        sleep 1
    done
    
    # サーバーが起動しなかった場合
    if ! check_port $PORT; then
        echo "Failed to start server on port $PORT"
        if [ "$SERVER_ALREADY_RUNNING" = false ] && [ ! -z "$SERVER_PID" ]; then
            kill $SERVER_PID 2>/dev/null
        fi
        exit 1
    fi
fi

# Postmanテストの実行
echo "Running Postman tests..."
npm run test:postman:local

TEST_EXIT_CODE=$?

# サーバーを停止（新しく起動した場合のみ）
if [ "$SERVER_ALREADY_RUNNING" = false ] && [ ! -z "$SERVER_PID" ]; then
    echo "Stopping server..."
    kill $SERVER_PID 2>/dev/null
    wait $SERVER_PID 2>/dev/null
fi

# テスト結果レポートの場所を表示
if [ -f "postman-test-report.html" ]; then
    echo ""
    echo "Test report generated: $(pwd)/postman-test-report.html"
    echo "Open this file in your browser to view detailed results."
fi

echo "Postman tests completed with exit code: $TEST_EXIT_CODE"
exit $TEST_EXIT_CODE