#!/bin/bash

echo "Testing Mock API Server..."
echo "=========================="

# Test health endpoint
echo -e "\n1. Health Check:"
curl -s http://localhost:3002/health | jq '.'

# Test chat completions endpoint
echo -e "\n2. Chat Completions API:"
curl -s -X POST http://localhost:3002/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "system",
        "content": "Analyze the following table data and provide insights."
      },
      {
        "role": "user", 
        "content": "りんご, バナナ, オレンジ"
      }
    ],
    "max_tokens": 150,
    "temperature": 0.7
  }' | jq '.'

echo -e "\nDone!"