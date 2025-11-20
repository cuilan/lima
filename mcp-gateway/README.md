# MCP Gateway in Docker

这是一个在 Docker 容器内运行的 MCP Gateway，用于隔离 Node.js 环境，避免污染 Mac 本地环境。

## 🚀 快速开始

### 1. 构建镜像

```bash
cd mcp-gateway
docker build -t mcp-gateway .
```

### 2. 启动服务

使用 Docker Compose：

```bash
docker-compose up -d
```

或直接使用 Docker：

```bash
docker run -d \
  --name mcp-gateway \
  -p 3000:3000 \
  -v ~/code:/workspace:ro \
  -v ~/Documents/Obsidian:/obsidian:ro \
  -v ~/.gitconfig:/root/.gitconfig:ro \
  mcp-gateway
```

### 3. 查看日志

```bash
docker-compose logs -f mcp-gateway
# 或
docker logs -f mcp-gateway
```

### 4. 进入容器调试

```bash
docker exec -it mcp-gateway sh
```

## 📦 已包含的 MCP Servers

- **Filesystem Server**: 访问文件系统
- **Git Server**: Git 操作
- **GitHub Server**: GitHub API 访问
- **SQLite Server**: SQLite 数据库访问

## 🔧 配置

### 添加 Obsidian MCP Server

如果需要 Obsidian MCP Server，需要额外安装：

```bash
docker exec -it mcp-gateway sh
npm install -g @modelcontextprotocol/server-obsidian
```

### 配置 GitHub Token

在 `.env` 文件中添加：

```bash
GITHUB_TOKEN=your_github_token_here
```

## 🔗 连接到 MCP Gateway

### 方式 1: 通过 stdio (推荐)

在 Cursor MCP 配置中添加：

```json
{
  "mcpServers": {
    "docker-mcp": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-gateway", "npx", "@modelcontextprotocol/server-filesystem", "/workspace"]
    }
  }
}
```

### 方式 2: 通过 HTTP (需要额外的 HTTP gateway)

需要实现一个 HTTP wrapper，将 stdio MCP 转换为 HTTP 接口。

## 📝 自定义配置

编辑 `docker-compose.yml` 来：
- 添加更多 volume 挂载
- 修改端口映射
- 添加环境变量
- 配置网络

## 🛠️ 可用的 MCP Servers

官方 MCP Servers:
- `@modelcontextprotocol/server-filesystem` - 文件系统访问
- `@modelcontextprotocol/server-git` - Git 操作
- `@modelcontextprotocol/server-github` - GitHub API
- `@modelcontextprotocol/server-sqlite` - SQLite 数据库
- `@modelcontextprotocol/server-postgres` - PostgreSQL
- `@modelcontextprotocol/server-brave-search` - Brave 搜索

社区 MCP Servers 可以通过 `npm install` 添加。

## 🔒 安全注意事项

- 默认挂载为只读 (`:ro`)，需要写权限时移除
- SSH 密钥以只读方式挂载
- 敏感 token 通过环境变量传递
- 不要在容器内存储敏感数据

## 🐛 故障排查

### 容器无法启动
```bash
docker-compose logs mcp-gateway
```

### MCP Server 无法访问文件
检查 volume 挂载路径是否正确

### Git 操作失败
确保 `.gitconfig` 和 `.ssh` 正确挂载

## 📚 更多资源

- [MCP 官方文档](https://modelcontextprotocol.io)
- [MCP Server 列表](https://github.com/modelcontextprotocol)

