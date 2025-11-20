# MCP Gateway 快速启动指南 🚀

## 📦 1. 构建和启动

### 方式 A: 使用 Docker Compose（推荐）

```bash
cd /Users/zhangyan/code/github/lima/mcp-gateway

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 方式 B: 使用 Docker 命令

```bash
cd /Users/zhangyan/code/github/lima/mcp-gateway

# 构建镜像
docker build -t mcp-gateway .

# 启动容器
docker run -d \
  --name mcp-gateway \
  -p 3000:3000 \
  -v ~/code:/workspace:ro \
  -v ~/.gitconfig:/root/.gitconfig:ro \
  mcp-gateway

# 查看日志
docker logs -f mcp-gateway
```

## ✅ 2. 验证服务

### 检查健康状态

```bash
curl http://localhost:3000/health
```

应该返回类似：
```json
{
  "status": "ok",
  "activeServers": [],
  "availableServers": ["filesystem", "git", "github", "sqlite"]
}
```

### 列出所有可用的 MCP Servers

```bash
curl http://localhost:3000/servers
```

## 🧪 3. 测试 MCP 调用

### 测试 Filesystem Server

```bash
# 列出 /workspace 目录
curl -X POST http://localhost:3000/mcp/filesystem \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "list_directory",
      "arguments": {
        "path": "/workspace"
      }
    }
  }'
```

### 测试 Git Server

```bash
# 获取 git status
curl -X POST http://localhost:3000/mcp/git \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "git_status",
      "arguments": {}
    }
  }'
```

## 🔧 4. 在 Cursor 中配置

### 方式 1: 通过 Docker exec (stdio)

编辑 Cursor 的 MCP 配置文件：

**macOS**: `~/Library/Application Support/Cursor/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`

添加：

```json
{
  "mcpServers": {
    "docker-filesystem": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "mcp-gateway",
        "npx",
        "@modelcontextprotocol/server-filesystem",
        "/workspace"
      ]
    },
    "docker-git": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "mcp-gateway",
        "npx",
        "@modelcontextprotocol/server-git"
      ]
    }
  }
}
```

### 方式 2: 通过 HTTP API

如果 Cursor 支持 HTTP MCP servers，可以直接使用：

```json
{
  "mcpServers": {
    "docker-mcp-gateway": {
      "url": "http://localhost:3000",
      "type": "http"
    }
  }
}
```

## 📁 5. 自定义挂载目录

编辑 `docker-compose.yml`：

```yaml
volumes:
  # 添加你的 Obsidian vault
  - ~/Documents/ObsidianVault:/obsidian:ro
  
  # 添加其他项目目录
  - ~/Projects:/projects:ro
  
  # 添加 SSH 密钥（用于 git）
  - ~/.ssh:/root/.ssh:ro
```

重启服务：

```bash
docker-compose down
docker-compose up -d
```

## 🔐 6. 配置 GitHub Token（可选）

如果需要使用 GitHub MCP Server：

```bash
# 创建 .env 文件
echo "GITHUB_TOKEN=your_github_token_here" > .env

# 重启服务
docker-compose down
docker-compose up -d
```

## 🐛 7. 故障排查

### 查看日志

```bash
docker-compose logs -f mcp-gateway
```

### 进入容器调试

```bash
docker exec -it mcp-gateway sh

# 测试 MCP server
npx @modelcontextprotocol/server-filesystem /workspace
```

### 检查端口

```bash
# 确保 3000 端口没有被占用
lsof -i :3000
```

### 重新构建

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🎯 8. 常用命令

```bash
# 启动
docker-compose up -d

# 停止
docker-compose down

# 重启
docker-compose restart

# 查看日志
docker-compose logs -f

# 进入容器
docker exec -it mcp-gateway sh

# 查看资源使用
docker stats mcp-gateway
```

## 📚 9. 添加更多 MCP Servers

### 安装社区 MCP Servers

```bash
# 进入容器
docker exec -it mcp-gateway sh

# 安装新的 MCP server（例如：Postgres）
npm install -g @modelcontextprotocol/server-postgres

# 测试
npx @modelcontextprotocol/server-postgres
```

然后在 `mcp-http-gateway.js` 中添加配置。

## 🌟 10. 下一步

- ✅ 配置 Obsidian MCP Server
- ✅ 添加更多目录挂载
- ✅ 配置 GitHub、Brave Search 等 API tokens
- ✅ 在 Cursor 中测试 MCP 功能
- ✅ 根据需要添加更多 MCP servers

## 💡 提示

1. **性能优化**: 容器启动后，MCP servers 是按需启动的（lazy loading）
2. **安全性**: 默认目录挂载为只读（:ro），需要写权限时移除
3. **隔离性**: 所有 Node.js 依赖都在容器内，不会污染 Mac 环境
4. **可移植性**: 可以在任何支持 Docker 的机器上运行

## 🆘 需要帮助？

- 查看详细文档: `README.md`
- 检查 MCP 官方文档: https://modelcontextprotocol.io
- 查看日志找到错误信息

