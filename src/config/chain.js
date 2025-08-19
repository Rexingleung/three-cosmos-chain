// Cosmos链配置
export const CHAIN_CONFIG = {
  chainId: 'aaa',
  chainName: 'Local Test Chain',
  rpcEndpoint: 'http://localhost:26657',
  restEndpoint: 'http://localhost:1317',
  faucetEndpoint: 'http://localhost:4500',
  addressPrefix: 'cosmos',
  coinDenom: 'stake',
  coinMinimalDenom: 'ustake',
  coinDecimals: 6,
  gasPrices: {
    low: 0.01,
    average: 0.025,
    high: 0.04
  },
  gasMultiplier: 1.3
}

// 网络配置
export const NETWORK_CONFIG = {
  timeout: 10000,
  retries: 3,
  retryDelay: 1000
}

// API端点
export const API_ENDPOINTS = {
  // Tendermint相关
  latestBlock: '/cosmos/base/tendermint/v1beta1/blocks/latest',
  blockByHeight: (height) => `/cosmos/base/tendermint/v1beta1/blocks/${height}`,
  
  // 银行模块
  balances: (address) => `/cosmos/bank/v1beta1/balances/${address}`,
  
  // 交易相关
  txByHash: (hash) => `/cosmos/tx/v1beta1/txs/${hash}`,
  broadcastTx: '/cosmos/tx/v1beta1/txs',
  
  // 节点信息
  nodeInfo: '/cosmos/base/tendermint/v1beta1/node_info'
}

// 错误消息映射
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接错误，请检查节点是否运行',
  INVALID_ADDRESS: '无效的地址格式',
  INSUFFICIENT_FUNDS: '余额不足',
  INVALID_MNEMONIC: '无效的助记词',
  TRANSACTION_FAILED: '交易失败',
  UNKNOWN_ERROR: '未知错误'
}

// 交易类型
export const TX_TYPES = {
  SEND: '/cosmos.bank.v1beta1.MsgSend',
  DELEGATE: '/cosmos.staking.v1beta1.MsgDelegate',
  UNDELEGATE: '/cosmos.staking.v1beta1.MsgUndelegate'
}