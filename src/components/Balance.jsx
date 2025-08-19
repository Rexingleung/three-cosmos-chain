import React, { useState, useEffect } from 'react'
import { Card, Spin, Alert, Button, Empty, Divider, message } from 'antd'
import { ReloadOutlined, WalletOutlined } from '@ant-design/icons'
import { cosmosService } from '../services/cosmosService.js'
import { formatBalance } from '../utils/wallet.js'
import { CHAIN_CONFIG } from '../config/chain.js'

function Balance({ walletAddress }) {
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (walletAddress) {
      fetchBalance()
      
      // 定期更新余额
      const interval = setInterval(fetchBalance, 10000)
      return () => clearInterval(interval)
    }
  }, [walletAddress])

  const fetchBalance = async () => {
    if (!walletAddress) return

    setLoading(true)
    setError(null)
    
    try {
      const balanceData = await cosmosService.getBalance(walletAddress)
      setBalances(balanceData)
    } catch (err) {
      setError('获取余额失败: ' + err.message)
      console.error('获取余额失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const requestFaucet = async () => {
    try {
      setLoading(true)
      const success = await cosmosService.requestFaucet(walletAddress)
      if (success) {
        message.success('水龙头请求成功，请等待几秒后刷新余额')
        setTimeout(fetchBalance, 3000)
      } else {
        message.error('水龙头请求失败')
      }
    } catch (error) {
      message.error('水龙头请求失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getTotalBalance = () => {
    return balances.reduce((total, balance) => {
      if (balance.denom === CHAIN_CONFIG.coinMinimalDenom) {
        return total + parseInt(balance.amount)
      }
      return total
    }, 0)
  }

  const formatDenomName = (denom) => {
    if (denom === CHAIN_CONFIG.coinMinimalDenom) {
      return CHAIN_CONFIG.coinDenom
    }
    return denom
  }

  if (!walletAddress) {
    return null
  }

  return (
    <Card 
      title="💰 钱包余额" 
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchBalance}
          loading={loading}
          size="small"
        >
          刷新
        </Button>
      }
    >
      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <Spin spinning={loading}>
        {balances.length === 0 ? (
          <div>
            <Empty 
              image={<WalletOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
              description="暂无余额"
            />
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Button type="primary" onClick={requestFaucet} disabled={loading}>
                申请测试代币
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {/* 主要余额显示 */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {formatBalance(getTotalBalance(), CHAIN_CONFIG.coinDecimals, 6)} {CHAIN_CONFIG.coinDenom}
              </div>
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>主要余额</div>
            </div>

            <Divider />

            {/* 详细余额列表 */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>所有代币余额</div>
              {balances.map((balance, index) => (
                <div key={index} className="balance-item">
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{formatDenomName(balance.denom)}</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{balance.denom}</div>
                  </div>
                  <div className="balance-amount">
                    {balance.denom === CHAIN_CONFIG.coinMinimalDenom 
                      ? formatBalance(balance.amount, CHAIN_CONFIG.coinDecimals, 6)
                      : balance.amount
                    }
                  </div>
                </div>
              ))}
            </div>

            {/* 申请测试代币按钮 */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Button onClick={requestFaucet} disabled={loading}>
                申请更多测试代币
              </Button>
            </div>
          </div>
        )}
      </Spin>
    </Card>
  )
}

export default Balance