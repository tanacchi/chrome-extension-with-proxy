#!/bin/bash

# E2Eテスト用サーバー起動スクリプト

echo "Starting E2E test servers..."

# ポートが使用中かチェックする関数
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "Port $port is already in use"
        return 0
    else
        echo "Port $port is available"
        return 1
    fi
}

# sample-html-server (port 3000) の起動
if check_port 3000; then
    echo "Sample HTML server already running on port 3000"
else
    echo "Starting sample HTML server on port 3000..."
    (cd dev-servers/sample-html && PORT=3000 pnpm start) &
    SAMPLE_SERVER_PID=$!
    echo "Sample HTML server PID: $SAMPLE_SERVER_PID"
    
    # サーバーの起動を待機
    for i in {1..30}; do
        if check_port 3000; then
            echo "Sample HTML server is ready"
            break
        fi
        echo "Waiting for sample HTML server to start... ($i/30)"
        sleep 1
    done
fi

# mock-api-server (port 3001) の起動
if check_port 3001; then
    echo "Mock API server already running on port 3001"
else
    echo "Starting mock API server on port 3001..."
    (cd dev-servers/mock-api && PORT=3001 pnpm start) &
    MOCK_API_PID=$!
    echo "Mock API server PID: $MOCK_API_PID"
    
    # サーバーの起動を待機
    for i in {1..30}; do
        if check_port 3001; then
            echo "Mock API server is ready"
            break
        fi
        echo "Waiting for mock API server to start... ($i/30)"
        sleep 1
    done
fi

echo "E2E test servers are ready!"
echo "Sample HTML: http://localhost:3000"
echo "Mock API: http://localhost:3001"