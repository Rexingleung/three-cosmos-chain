# Three Cosmos Chain - Cosmos链交互工具

一个基于React构建的Cosmos区块链交互前端应用，支持与本地Cosmos链进行完整的交互操作。

## 功能特性

### 🔗 链状态监控
- 实时查看链高度
- 监控链状态信息

### 💼 钱包管理
- 创建新钱包（生成地址和助记词）
- 通过助记词导入已有钱包
- 钱包地址显示和管理

### 📊 数据查询
- 查询账户余额
- 获取区块详细信息
- 查看交易详情
- 实时数据更新

### 💸 转账功能
- 支持代币转账
- 交易状态跟踪
- 交易历史记录

## 技术栈

- **前端框架**: React 18
- **区块链交互**: @cosmjs/stargate, @cosmjs/proto-signing
- **助记词生成**: bip39
- **UI组件**: Ant Design
- **HTTP请求**: axios
- **构建工具**: Vite

## 快速开始

### 前置要求

- Node.js >= 16.0.0
- npm 或 yarn
- 本地运行的Cosmos链（通过ignite启动）

### 方法一：使用快速安装脚本（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/Rexingleung/three-cosmos-chain.git
cd three-cosmos-chain

# 2. 给脚本执行权限
chmod +x scripts/setup.sh

# 3. 运行安装脚本
./scripts/setup.sh

# 4. 启动开发服务器
npm run dev
```

### 方法二：手动安装

```bash
# 1. 克隆项目
git clone https://github.com/Rexingleung/three-cosmos-chain.git
cd three-cosmos-chain

# 2. 安装依赖
npm install
# 或
yarn install

# 3. 启动开发服务器
npm run dev
# 或
yarn dev
```

## 本地链配置

确保您的本地Cosmos链正在运行：

```bash
ignite chain serve
```

应用默认连接到以下端点：
- **Tendermint RPC**: http://localhost:26657
- **REST API**: http://localhost:1317
- **Token Faucet**: http://localhost:4500
- **链ID**: aaa

如需修改配置，请编辑 `src/config/chain.js` 文件。

## 故障排除

### 🚨 常见问题解决

#### 问题1：`Failed to resolve import` 错误

**错误信息**：
```
Failed to resolve import "./components/ChainStatus" from "src/App.jsx". Does the file exist?
```

**解决方案**：
```bash
# 使用自动修复脚本
chmod +x scripts/fix-common-issues.sh
./scripts/fix-common-issues.sh

# 或手动修复
rm -rf node_modules
npm cache clean --force
npm install
```

#### 问题2：应用无法连接到Cosmos链

**症状**：界面显示"链连接失败"

**解决方案**：
1. 确保本地Cosmos链正在运行：
   ```bash
   ignite chain serve
   ```

2. 检查端口是否被占用：
   ```bash
   lsof -i :26657
   lsof -i :1317
   ```

3. 验证链是否正常响应：
   ```bash
   curl http://localhost:26657/status
   curl http://localhost:1317/cosmos/base/tendermint/v1beta1/node_info
   ```

#### 问题3：钱包创建或导入失败

**可能原因**：
- 助记词格式不正确
- 网络连接问题
- 浏览器缓存问题

**解决方案**：
1. 清除浏览器缓存和Local Storage
2. 检查助记词是否为12或24个单词
3. 确保助记词之间用空格分隔
4. 尝试使用无痕模式

#### 问题4：交易发送失败

**可能原因**：
- 账户余额不足
- Gas费设置过低
- 接收地址格式错误
- 网络连接不稳定

**解决方案**：
1. 检查钱包余额
2. 使用水龙头申请测试代币
3. 验证接收地址格式（应以cosmos开头）
4. 重新连接钱包

#### 问题5：构建失败

**错误信息**：
```
Build failed with errors
```

**解决方案**：
```bash
# 完整重新安装
rm -rf node_modules package-lock.json yarn.lock
npm install

# 或使用修复脚本
./scripts/fix-common-issues.sh
```

### 🛠 调试技巧

#### 开启详细日志

1. 打开浏览器开发者工具（F12）
2. 查看Console标签页的错误信息
3. 检查Network标签页的网络请求状态

#### 网络连接测试

```bash
# 测试RPC连接
curl http://localhost:26657/status

# 测试REST API
curl http://localhost:1317/cosmos/base/tendermint/v1beta1/node_info

# 测试水龙头
curl -X POST http://localhost:4500 -d '{"address":"your_address_here"}'
```

#### 环境变量检查

创建 `.env.local` 文件并自定义配置：
```env
VITE_CHAIN_ID=aaa
VITE_RPC_ENDPOINT=http://localhost:26657
VITE_REST_ENDPOINT=http://localhost:1317
VITE_FAUCET_ENDPOINT=http://localhost:4500
```

## 使用指南

### 1. 查看链状态
- 应用启动后会自动显示当前链高度
- 链状态会定期自动更新

### 2. 钱包操作

**创建新钱包**:
1. 点击"创建钱包"按钮
2. 系统会生成新的助记词和地址
3. **请务必安全保存助记词**

**导入钱包**:
1. 点击"导入钱包"按钮
2. 输入12/24位助记词
3. 系统会恢复对应的钱包地址

### 3. 查询功能

**查询余额**:
- 钱包连接后自动显示余额
- 支持多种代币余额查询

**区块信息**:
- 输入区块高度查询区块详情
- 显示区块哈希、时间戳等信息

**交易详情**:
- 输入交易哈希查询交易详情
- 显示发送方、接收方、金额等信息

### 4. 转账操作

1. 确保钱包已连接且有足够余额
2. 输入接收方地址
3. 输入转账金额
4. 点击"发送交易"按钮
5. 确认交易详情后提交

## 项目结构

```
src/
├── components/          # React组件
│   ├── BlockInfo.jsx    # 区块信息组件
│   ├── Balance.jsx      # 余额显示组件
│   ├── ChainStatus.jsx  # 链状态组件
│   ├── Transfer.jsx     # 转账组件
│   ├── TransactionInfo.jsx # 交易信息组件
│   └── WalletManager.jsx   # 钱包管理组件
├── services/           # 区块链服务
│   └── cosmosService.js # Cosmos链交互服务
├── config/             # 配置文件
│   └── chain.js        # 链配置
├── utils/              # 工具函数
│   └── wallet.js       # 钱包工具
├── App.jsx             # 主应用组件
└── main.jsx            # 应用入口
```

## API接口

应用使用以下API接口与Cosmos链交互：

- `GET /cosmos/base/tendermint/v1beta1/blocks/latest` - 获取最新区块
- `GET /cosmos/base/tendermint/v1beta1/blocks/{height}` - 获取指定高度区块
- `GET /cosmos/bank/v1beta1/balances/{address}` - 查询账户余额
- `GET /cosmos/tx/v1beta1/txs/{hash}` - 查询交易详情
- `POST /cosmos/tx/v1beta1/txs` - 广播交易

## 安全须知

⚠️ **重要提醒**：

1. **助记词安全**：助记词是恢复钱包的唯一凭证，请妥善保管，不要分享给他人
2. **测试环境**：本应用仅适用于测试环境，请勿在主网使用
3. **私钥管理**：应用不会存储您的私钥，所有密钥信息仅在本地处理
4. **网络安全**：请确保在安全的网络环境中使用

## 开发说明

### 可用脚本

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 问题修复（自动修复常见问题）
./scripts/fix-common-issues.sh
```

### 环境变量

创建 `.env.local` 文件来配置环境变量：

```env
VITE_CHAIN_ID=aaa
VITE_RPC_ENDPOINT=http://localhost:26657
VITE_REST_ENDPOINT=http://localhost:1317
VITE_FAUCET_ENDPOINT=http://localhost:4500
```

## 贡献指南

欢迎提交Issue和Pull Request来改进项目！

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 创建 [Issue](https://github.com/Rexingleung/three-cosmos-chain/issues)
- 查看 [项目文档](https://github.com/Rexingleung/three-cosmos-chain)

## 更新日志

### v1.0.1 (2025-08-19)
- 修复组件导入问题
- 添加故障排除指南
- 创建自动修复脚本
- 改进错误处理

### v1.0.0 (2025-08-19)
- 初始版本发布
- 支持基础钱包管理功能
- 实现链状态查询
- 添加转账功能
- 完整的中文界面

---

**享受您的Cosmos区块链之旅！** 🚀