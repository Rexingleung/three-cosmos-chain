import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from 'bip39'
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { CHAIN_CONFIG } from '../config/chain.js'

/**
 * 生成新的钱包
 * @returns {Promise<{mnemonic: string, address: string, wallet: DirectSecp256k1HdWallet}>}
 */
export async function generateWallet() {
  try {
    // 生成24位助记词
    const mnemonic = generateMnemonic(256)
    
    // 创建钱包
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
      mnemonic,
      { prefix: CHAIN_CONFIG.addressPrefix }
    )
    
    // 获取地址
    const [firstAccount] = await wallet.getAccounts()
    
    return {
      mnemonic,
      address: firstAccount.address,
      wallet
    }
  } catch (error) {
    console.error('生成钱包失败:', error)
    throw new Error('生成钱包失败')
  }
}

/**
 * 从助记词导入钱包
 * @param {string} mnemonic - 助记词
 * @returns {Promise<{address: string, wallet: DirectSecp256k1HdWallet}>}
 */
export async function importWalletFromMnemonic(mnemonic) {
  try {
    // 验证助记词
    if (!validateMnemonic(mnemonic.trim())) {
      throw new Error('无效的助记词')
    }
    
    // 创建钱包
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
      mnemonic.trim(),
      { prefix: CHAIN_CONFIG.addressPrefix }
    )
    
    // 获取地址
    const [firstAccount] = await wallet.getAccounts()
    
    return {
      address: firstAccount.address,
      wallet
    }
  } catch (error) {
    console.error('导入钱包失败:', error)
    throw new Error('导入钱包失败: ' + error.message)
  }
}

/**
 * 验证Cosmos地址格式
 * @param {string} address - 地址
 * @returns {boolean}
 */
export function validateCosmosAddress(address) {
  if (!address || typeof address !== 'string') {
    return false
  }
  
  // 检查前缀
  if (!address.startsWith(CHAIN_CONFIG.addressPrefix)) {
    return false
  }
  
  // 检查长度（通常为39-43个字符）
  if (address.length < 39 || address.length > 45) {
    return false
  }
  
  // 检查字符（base64url字符集）
  const validChars = /^[a-z0-9]+$/
  const addressPart = address.slice(CHAIN_CONFIG.addressPrefix.length)
  
  return validChars.test(addressPart)
}

/**
 * 格式化地址显示
 * @param {string} address - 地址
 * @param {number} startLength - 开始显示的字符数
 * @param {number} endLength - 结束显示的字符数
 * @returns {string}
 */
export function formatAddress(address, startLength = 8, endLength = 6) {
  if (!address || address.length <= startLength + endLength) {
    return address
  }
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

/**
 * 格式化余额显示
 * @param {string|number} amount - 金额（最小单位）
 * @param {number} decimals - 小数位数
 * @param {number} displayDecimals - 显示的小数位数
 * @returns {string}
 */
export function formatBalance(amount, decimals = 6, displayDecimals = 6) {
  if (!amount || amount === '0') {
    return '0'
  }
  
  const value = Number(amount) / Math.pow(10, decimals)
  
  return value.toFixed(displayDecimals).replace(/\.?0+$/, '')
}

/**
 * 将显示金额转换为最小单位
 * @param {string|number} amount - 显示金额
 * @param {number} decimals - 小数位数
 * @returns {string}
 */
export function parseAmount(amount, decimals = 6) {
  if (!amount || amount === '0') {
    return '0'
  }
  
  const value = Number(amount) * Math.pow(10, decimals)
  
  return Math.floor(value).toString()
}

/**
 * 格式化交易哈希显示
 * @param {string} hash - 交易哈希
 * @returns {string}
 */
export function formatTxHash(hash) {
  if (!hash) return ''
  
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      return result
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}