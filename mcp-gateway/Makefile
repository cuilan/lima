.PHONY: help build up down restart logs shell test health clean

# 默认目标
help:
	@echo "🚀 MCP Gateway - 可用命令:"
	@echo ""
	@echo "  make build    - 构建 Docker 镜像"
	@echo "  make up       - 启动服务"
	@echo "  make down     - 停止服务"
	@echo "  make restart  - 重启服务"
	@echo "  make logs     - 查看日志"
	@echo "  make shell    - 进入容器 shell"
	@echo "  make test     - 测试 MCP 服务"
	@echo "  make health   - 健康检查"
	@echo "  make clean    - 清理所有容器和镜像"
	@echo ""

# 构建镜像
build:
	@echo "🔨 构建 MCP Gateway 镜像..."
	docker-compose build

# 启动服务
up:
	@echo "🚀 启动 MCP Gateway..."
	docker-compose up -d
	@echo "✅ 服务已启动！"
	@echo "📊 健康检查: make health"
	@echo "📝 查看日志: make logs"

# 停止服务
down:
	@echo "🛑 停止 MCP Gateway..."
	docker-compose down

# 重启服务
restart:
	@echo "🔄 重启 MCP Gateway..."
	docker-compose restart
	@echo "✅ 服务已重启！"

# 查看日志
logs:
	docker-compose logs -f

# 进入容器
shell:
	docker exec -it mcp-gateway sh

# 测试 MCP 服务
test:
	@echo "🧪 测试 MCP Gateway..."
	@echo ""
	@echo "1. 健康检查:"
	@curl -s http://localhost:3000/health | jq . || echo "❌ 服务未响应"
	@echo ""
	@echo "2. 列出服务器:"
	@curl -s http://localhost:3000/servers | jq . || echo "❌ 服务未响应"
	@echo ""

# 健康检查
health:
	@echo "🏥 MCP Gateway 健康检查..."
	@curl -s http://localhost:3000/health | jq . || echo "❌ 服务未响应"

# 清理
clean:
	@echo "🧹 清理 MCP Gateway..."
	docker-compose down -v
	docker rmi mcp-gateway || true
	@echo "✅ 清理完成！"

# 完整重建
rebuild: clean build up
	@echo "✅ 重建完成！"

# 查看状态
status:
	@echo "📊 容器状态:"
	@docker ps -a | grep mcp-gateway || echo "没有运行的容器"
	@echo ""
	@echo "🌐 端口映射:"
	@docker port mcp-gateway 2>/dev/null || echo "容器未运行"

