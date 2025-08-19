# 部署指南

本文档提供了Three Cosmos Chain项目的详细部署说明。

## 环境要求

### 系统要求
- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0
- Git

### 本地Cosmos链要求
- Ignite CLI
- Go >= 1.19
- 本地Cosmos链正在运行

## 快速部署

### 1. 克隆项目
```bash
git clone https://github.com/Rexingleung/three-cosmos-chain.git
cd three-cosmos-chain
```

### 2. 安装依赖
```bash
npm install
# 或使用 yarn
yarn install
```

### 3. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量（可选）
vim .env.local
```

### 4. 启动本地Cosmos链
确保您的本地Cosmos链正在运行：
```bash
# 在您的Cosmos链项目目录中
ignite chain serve
```

### 5. 启动开发服务器
```bash
npm run dev
# 或使用 yarn
yarn dev
```

应用将在 `http://localhost:5173` 启动。

## 生产部署

### 1. 构建生产版本
```bash
npm run build
# 或使用 yarn
yarn build
```

### 2. 预览生产构建
```bash
npm run preview
# 或使用 yarn
yarn preview
```

### 3. 部署到Web服务器
将 `dist/` 目录中的文件部署到您的Web服务器。

#### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 启用gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### Apache配置示例
在 `dist/` 目录中创建 `.htaccess` 文件：
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## 环境变量配置

应用支持以下环境变量配置：

### 必需配置
- `VITE_CHAIN_ID`: Cosmos链ID (默认: aaa)
- `VITE_RPC_ENDPOINT`: Tendermint RPC端点 (默认: http://localhost:26657)
- `VITE_REST_ENDPOINT`: REST API端点 (默认: http://localhost:1317)
- `VITE_FAUCET_ENDPOINT`: 水龙头端点 (默认: http://localhost:4500)

### 可选配置
- `VITE_ADDRESS_PREFIX`: 地址前缀 (默认: cosmos)
- `VITE_COIN_DENOM`: 主代币名称 (默认: stake)
- `VITE_COIN_MINIMAL_DENOM`: 最小代币单位 (默认: ustake)
- `VITE_COIN_DECIMALS`: 代币小数位数 (默认: 6)
- `VITE_NETWORK_TIMEOUT`: 网络超时时间 (默认: 10000ms)
- `VITE_GAS_PRICE_LOW`: 低gas价格 (默认: 0.01)
- `VITE_GAS_PRICE_AVERAGE`: 平均gas价格 (默认: 0.025)
- `VITE_GAS_PRICE_HIGH`: 高gas价格 (默认: 0.04)
- `VITE_GAS_MULTIPLIER`: Gas倍数 (默认: 1.3)

## Docker部署

### 创建Dockerfile
```dockerfile
# 构建阶段
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 创建nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    }
}
```

### 构建和运行Docker容器
```bash
# 构建镜像
docker build -t three-cosmos-chain .

# 运行容器
docker run -d -p 8080:80 --name cosmos-chain-app three-cosmos-chain
```

## 故障排除

### 常见问题

#### 1. 应用无法连接到Cosmos链
- 检查本地Cosmos链是否正在运行
- 验证环境变量中的端点配置
- 确保防火墙允许相应端口访问

#### 2. 钱包创建或导入失败
- 检查浏览器控制台错误信息
- 验证助记词格式是否正确
- 确保网络连接正常

#### 3. 交易发送失败
- 检查钱包余额是否足够
- 验证接收地址格式
- 确保gas费用设置合理

#### 4. 构建失败
- 清除依赖缓存：`npm cache clean --force`
- 删除node_modules并重新安装：`rm -rf node_modules && npm install`
- 检查Node.js版本兼容性

### 调试技巧

#### 启用详细日志
在开发环境中，可以在浏览器控制台中查看详细的调试信息。

#### 网络问题诊断
```bash
# 测试RPC连接
curl http://localhost:26657/status

# 测试REST API连接
curl http://localhost:1317/cosmos/base/tendermint/v1beta1/node_info

# 测试水龙头连接
curl http://localhost:4500
```

## 性能优化

### 生产环境优化
1. **启用CDN**: 将静态资源部署到CDN
2. **启用Gzip压缩**: 减少传输大小
3. **配置缓存策略**: 设置适当的缓存头
4. **代码分割**: Vite已自动处理
5. **图片优化**: 使用WebP格式

### 监控和分析
1. **性能监控**: 使用Web Vitals监控页面性能
2. **错误追踪**: 集成Sentry等错误追踪服务
3. **用户分析**: 添加Google Analytics或其他分析工具

## 安全考虑

### 生产环境安全
1. **HTTPS**: 强制使用HTTPS连接
2. **CSP头**: 配置内容安全策略
3. **环境变量**: 不要在客户端暴露敏感信息
4. **依赖更新**: 定期更新依赖包

### 用户安全
1. **助记词安全**: 提醒用户安全保存助记词
2. **私钥保护**: 应用不存储用户私钥
3. **网络验证**: 引导用户验证网络环境

## 维护和更新

### 定期维护任务
1. **依赖更新**: 定期更新npm包
2. **安全扫描**: 运行安全漏洞扫描
3. **性能检查**: 监控应用性能指标
4. **备份**: 定期备份重要配置和数据

### 版本更新流程
1. 在开发环境测试新版本
2. 在测试环境进行集成测试
3. 准备回滚计划
4. 部署到生产环境
5. 监控部署后的系统状态

---

如有其他部署问题，请参考项目README或提交Issue。