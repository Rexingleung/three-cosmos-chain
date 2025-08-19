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

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/Rexingleung/three-cosmos-chain.git
cd three-cosmos-chain
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

4. 打开浏览器访问 `http://localhost:5173`

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
- 发送邮件至项目维护者

## 更新日志

### v1.0.0 (2025-08-19)
- 初始版本发布
- 支持基础钱包管理功能
- 实现链状态查询
- 添加转账功能
- 完整的中文界面

---

**享受您的Cosmos区块链之旅！** 🚀