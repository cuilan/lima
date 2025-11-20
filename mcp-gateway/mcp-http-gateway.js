#!/usr/bin/env node

/**
 * MCP HTTP Gateway
 * 
 * 这个 gateway 将多个 stdio MCP servers 包装成 HTTP API
 * 让 Cursor 可以通过 HTTP 访问容器内的 MCP 服务
 */

const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MCP Servers 配置
const MCP_SERVERS = {
  filesystem: {
    command: 'npx',
    args: ['@modelcontextprotocol/server-filesystem', '/workspace'],
    description: 'Filesystem access'
  },
  git: {
    command: 'npx',
    args: ['@modelcontextprotocol/server-git'],
    description: 'Git operations'
  },
  github: {
    command: 'npx',
    args: ['@modelcontextprotocol/server-github'],
    description: 'GitHub API access',
    env: { GITHUB_TOKEN: process.env.GITHUB_TOKEN }
  },
  sqlite: {
    command: 'npx',
    args: ['@modelcontextprotocol/server-sqlite'],
    description: 'SQLite database access'
  }
};

// 存储活跃的 MCP server 进程
const activeServers = {};

/**
 * 启动一个 MCP server 进程
 */
function startMCPServer(serverName, config) {
  console.log(`🚀 Starting MCP server: ${serverName}`);
  
  const process = spawn(config.command, config.args, {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, ...config.env }
  });

  process.stderr.on('data', (data) => {
    console.error(`[${serverName}] ${data}`);
  });

  process.on('exit', (code) => {
    console.log(`[${serverName}] exited with code ${code}`);
    delete activeServers[serverName];
  });

  activeServers[serverName] = {
    process,
    config
  };

  return process;
}

/**
 * 向 MCP server 发送请求并获取响应
 */
async function sendToMCPServer(serverName, request) {
  if (!MCP_SERVERS[serverName]) {
    throw new Error(`Unknown MCP server: ${serverName}`);
  }

  let server = activeServers[serverName];
  
  // 如果 server 没有运行，启动它
  if (!server) {
    const process = startMCPServer(serverName, MCP_SERVERS[serverName]);
    server = activeServers[serverName];
  }

  return new Promise((resolve, reject) => {
    let responseData = '';
    
    const timeout = setTimeout(() => {
      reject(new Error('MCP server response timeout'));
    }, 30000);

    server.process.stdout.once('data', (data) => {
      clearTimeout(timeout);
      try {
        responseData += data.toString();
        resolve(JSON.parse(responseData));
      } catch (error) {
        reject(new Error(`Failed to parse MCP response: ${error.message}`));
      }
    });

    server.process.stdin.write(JSON.stringify(request) + '\n');
  });
}

// API 路由

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeServers: Object.keys(activeServers),
    availableServers: Object.keys(MCP_SERVERS)
  });
});

// 列出所有可用的 MCP servers
app.get('/servers', (req, res) => {
  const servers = Object.entries(MCP_SERVERS).map(([name, config]) => ({
    name,
    description: config.description,
    active: !!activeServers[name]
  }));
  
  res.json({ servers });
});

// 向指定的 MCP server 发送请求
app.post('/mcp/:serverName', async (req, res) => {
  const { serverName } = req.params;
  const request = req.body;

  try {
    const response = await sendToMCPServer(serverName, request);
    res.json(response);
  } catch (error) {
    console.error(`Error calling ${serverName}:`, error);
    res.status(500).json({
      error: error.message
    });
  }
});

// SSE endpoint for streaming responses
app.get('/mcp/:serverName/stream', (req, res) => {
  const { serverName } = req.params;
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 实现 SSE streaming...
  res.write('data: {"status": "connected"}\n\n');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down MCP Gateway...');
  
  Object.entries(activeServers).forEach(([name, server]) => {
    console.log(`  Stopping ${name}...`);
    server.process.kill();
  });
  
  process.exit(0);
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🚀 MCP Gateway is running!         ║
║                                       ║
║   HTTP API: http://0.0.0.0:${PORT}      ║
║                                       ║
║   Available MCP Servers:              ║
${Object.entries(MCP_SERVERS).map(([name, config]) => 
  `║     • ${name.padEnd(20)} ${config.description}`.padEnd(40) + '║'
).join('\n')}
║                                       ║
║   Health Check: GET /health           ║
║   List Servers: GET /servers          ║
║   Call MCP:     POST /mcp/:server     ║
╚═══════════════════════════════════════╝
  `);
});

