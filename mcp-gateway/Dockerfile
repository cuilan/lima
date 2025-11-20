# MCP Gateway Docker 镜像
FROM node:20-alpine

# 安装必要的工具
RUN apk add --no-cache \
    git \
    bash \
    curl \
    jq \
    python3 \
    py3-pip

# 创建工作目录
WORKDIR /app

# 复制 package.json 并安装依赖
COPY package.json /app/
RUN npm install

# 安装常用 MCP 服务器（通过 npx 按需运行）
# 预先缓存这些包以加快启动速度
RUN npx -y @modelcontextprotocol/server-filesystem --help || true && \
    npx -y @modelcontextprotocol/server-git --help || true && \
    npx -y @modelcontextprotocol/server-github --help || true && \
    npx -y @modelcontextprotocol/server-sqlite --help || true

# 创建配置目录
RUN mkdir -p /mcp/config /mcp/data /workspace /obsidian

# 复制应用文件
COPY mcp-http-gateway.js /app/
COPY mcp-gateway.sh /app/
RUN chmod +x /app/mcp-gateway.sh /app/mcp-http-gateway.js

# 暴露端口（如果使用 HTTP gateway）
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动 HTTP Gateway
CMD ["node", "/app/mcp-http-gateway.js"]

