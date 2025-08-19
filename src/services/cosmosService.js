import { StargateClient, SigningStargateClient } from '@cosmjs/stargate'
import { TendermintRpc } from '@cosmjs/tendermint-rpc'
import axios from 'axios'
import { CHAIN_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from '../config/chain.js'

/**
 * Cosmos链交互服务类
 */
class CosmosService {
  constructor() {
    this.rpcClient = null
    this.restClient = null
    this.stargateClient = null
    this.signingClient = null
    
    this.initializeClients()
  }

  /**
   * 初始化客户端
   */
  async initializeClients() {
    try {
      // 创建REST客户端
      this.restClient = axios.create({
        baseURL: CHAIN_CONFIG.restEndpoint,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // 创建Stargate客户端
      this.stargateClient = await StargateClient.connect(CHAIN_CONFIG.rpcEndpoint)
    } catch (error) {
      console.error('初始化客户端失败:', error)
    }
  }

  /**
   * 设置签名客户端
   * @param {DirectSecp256k1HdWallet} wallet - 钱包实例
   */
  async setSigningClient(wallet) {
    try {
      this.signingClient = await SigningStargateClient.connectWithSigner(
        CHAIN_CONFIG.rpcEndpoint,
        wallet,
        {
          gasPrice: `${CHAIN_CONFIG.gasPrices.average}${CHAIN_CONFIG.coinMinimalDenom}`
        }
      )
      console.log('签名客户端设置成功')
    } catch (error) {
      console.error('设置签名客户端失败:', error)
      throw new Error('设置签名客户端失败')
    }
  }

  /**
   * 获取最新区块高度
   * @returns {Promise<number>}
   */
  async getLatestBlockHeight() {
    try {
      if (this.stargateClient) {
        const height = await this.stargateClient.getHeight()
        return height
      }
      
      // 降级到REST API
      const response = await this.restClient.get(API_ENDPOINTS.latestBlock)
      return parseInt(response.data.block.header.height)
    } catch (error) {
      console.error('获取区块高度失败:', error)
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
    }
  }

  /**
   * 获取指定高度的区块信息
   * @param {number} height - 区块高度
   * @returns {Promise<Object>}
   */
  async getBlockByHeight(height) {
    try {
      const response = await this.restClient.get(API_ENDPOINTS.blockByHeight(height))
      const block = response.data.block
      
      return {
        height: parseInt(block.header.height),
        hash: block.header.app_hash,
        time: block.header.time,
        proposer: block.header.proposer_address,
        txCount: block.data.txs ? block.data.txs.length : 0,
        dataHash: block.header.data_hash,
        validatorsHash: block.header.validators_hash,
        consensusHash: block.header.consensus_hash,
        appHash: block.header.app_hash,
        lastResultsHash: block.header.last_results_hash
      }
    } catch (error) {
      console.error('获取区块信息失败:', error)
      throw new Error('获取区块信息失败')
    }
  }

  /**
   * 获取账户余额
   * @param {string} address - 账户地址
   * @returns {Promise<Array>}
   */
  async getBalance(address) {
    try {
      if (this.stargateClient) {
        const balances = await this.stargateClient.getAllBalances(address)
        return balances
      }
      
      // 降级到REST API
      const response = await this.restClient.get(API_ENDPOINTS.balances(address))
      return response.data.balances || []
    } catch (error) {
      console.error('获取余额失败:', error)
      throw new Error('获取余额失败')
    }
  }

  /**
   * 获取交易详情
   * @param {string} txHash - 交易哈希
   * @returns {Promise<Object>}
   */
  async getTransactionByHash(txHash) {
    try {
      const response = await this.restClient.get(API_ENDPOINTS.txByHash(txHash))
      const txResponse = response.data.tx_response
      
      return {
        hash: txResponse.txhash,
        height: parseInt(txResponse.height),
        code: txResponse.code,
        result: txResponse.raw_log,
        gasWanted: parseInt(txResponse.gas_wanted),
        gasUsed: parseInt(txResponse.gas_used),
        timestamp: txResponse.timestamp,
        events: txResponse.events,
        tx: response.data.tx
      }
    } catch (error) {
      console.error('获取交易详情失败:', error)
      throw new Error('获取交易详情失败')
    }
  }

  /**
   * 发送转账交易
   * @param {string} fromAddress - 发送方地址
   * @param {string} toAddress - 接收方地址
   * @param {string} amount - 转账金额（最小单位）
   * @param {string} denom - 代币单位
   * @param {string} memo - 备注
   * @returns {Promise<Object>}
   */
  async sendTokens(fromAddress, toAddress, amount, denom = CHAIN_CONFIG.coinMinimalDenom, memo = '') {
    try {
      if (!this.signingClient) {
        throw new Error('签名客户端未初始化')
      }

      const sendMsg = {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: {
          fromAddress: fromAddress,
          toAddress: toAddress,
          amount: [{
            denom: denom,
            amount: amount
          }]
        }
      }

      // 估算gas费用
      const gasEstimation = await this.signingClient.simulate(fromAddress, [sendMsg], memo)
      const gasLimit = Math.round(gasEstimation * CHAIN_CONFIG.gasMultiplier)

      // 发送交易
      const result = await this.signingClient.signAndBroadcast(
        fromAddress,
        [sendMsg],
        {
          amount: [{
            denom: CHAIN_CONFIG.coinMinimalDenom,
            amount: Math.round(gasLimit * CHAIN_CONFIG.gasPrices.average).toString()
          }],
          gas: gasLimit.toString()
        },
        memo
      )

      if (result.code !== 0) {
        throw new Error(`交易失败: ${result.rawLog}`)
      }

      return {
        hash: result.transactionHash,
        height: result.height,
        code: result.code,
        gasWanted: result.gasWanted,
        gasUsed: result.gasUsed,
        events: result.events
      }
    } catch (error) {
      console.error('发送交易失败:', error)
      throw new Error('发送交易失败: ' + error.message)
    }
  }

  /**
   * 获取账户信息
   * @param {string} address - 账户地址
   * @returns {Promise<Object>}
   */
  async getAccountInfo(address) {
    try {
      if (this.stargateClient) {
        const account = await this.stargateClient.getAccount(address)
        return account
      }
      throw new Error('无法获取账户信息')
    } catch (error) {
      console.error('获取账户信息失败:', error)
      throw new Error('获取账户信息失败')
    }
  }

  /**
   * 获取节点信息
   * @returns {Promise<Object>}
   */
  async getNodeInfo() {
    try {
      const response = await this.restClient.get(API_ENDPOINTS.nodeInfo)
      return response.data.default_node_info
    } catch (error) {
      console.error('获取节点信息失败:', error)
      throw new Error('获取节点信息失败')
    }
  }

  /**
   * 检查链连接状态
   * @returns {Promise<boolean>}
   */
  async checkConnection() {
    try {
      await this.getLatestBlockHeight()
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 估算交易费用
   * @param {string} fromAddress - 发送方地址
   * @param {Array} messages - 交易消息数组
   * @param {string} memo - 备注
   * @returns {Promise<Object>}
   */
  async estimateGas(fromAddress, messages, memo = '') {
    try {
      if (!this.signingClient) {
        throw new Error('签名客户端未初始化')
      }

      const gasEstimation = await this.signingClient.simulate(fromAddress, messages, memo)
      const gasLimit = Math.round(gasEstimation * CHAIN_CONFIG.gasMultiplier)
      const gasPrice = CHAIN_CONFIG.gasPrices.average
      const fee = Math.round(gasLimit * gasPrice)

      return {
        gasLimit,
        gasPrice,
        fee: {
          amount: fee.toString(),
          denom: CHAIN_CONFIG.coinMinimalDenom
        }
      }
    } catch (error) {
      console.error('估算gas费用失败:', error)
      throw new Error('估算gas费用失败')
    }
  }

  /**
   * 获取代币水龙头
   * @param {string} address - 接收地址
   * @returns {Promise<boolean>}
   */
  async requestFaucet(address) {
    try {
      const faucetClient = axios.create({
        baseURL: CHAIN_CONFIG.faucetEndpoint,
        timeout: 10000
      })

      await faucetClient.post('/', { address })
      return true
    } catch (error) {
      console.error('水龙头请求失败:', error)
      return false
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.stargateClient) {
      this.stargateClient.disconnect()
    }
    if (this.signingClient) {
      this.signingClient.disconnect()
    }
  }
}

// 创建单例实例
export const cosmosService = new CosmosService()
export default cosmosService