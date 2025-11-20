#!/bin/bash
set -e

echo "🚀 Starting MCP Gateway..."
echo "🌐 Listening on port ${PORT:-3000}"

# 启动 HTTP Gateway
exec node /app/mcp-http-gateway.js

