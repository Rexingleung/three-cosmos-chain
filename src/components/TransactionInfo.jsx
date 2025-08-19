import React, { useState } from 'react'
import { Input, Button, Card, Descriptions, Alert, Spin, Tag, Space, Typography, Divider } from 'antd'
import { SearchOutlined, TransactionOutlined } from '@ant-design/icons'
import { cosmosService } from '../services/cosmosService.js'
import { formatTxHash, formatBalance } from '../utils/wallet.js'
import { CHAIN_CONFIG } from '../config/chain.js'

const { Text } = Typography

function TransactionInfo() {
  const [txHash, setTxHash] = useState('')
  const [txData, setTxData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async () => {
    if (!txHash.trim()) {
      setError('请输入交易哈希')
      return
    }

    setLoading(true)
    setError(null)
    setTxData(null)

    try {
      const data = await cosmosService.getTransactionByHash(txHash.trim())
      setTxData(data)
    } catch (err) {
      setError('获取交易信息失败: ' + err.message)
      console.error('获取交易信息失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString('zh-CN')
    } catch (error) {
      return timestamp
    }
  }

  const getStatusTag = (code) => {
    if (code === 0) {
      return <Tag color="success">成功</Tag>
    } else {
      return <Tag color="error">失败</Tag>
    }
  }

  const formatGas = (gas) => {
    return gas ? gas.toLocaleString() : '0'
  }

  const parseTransactionMessages = (tx) => {
    if (!tx || !tx.body || !tx.body.messages) {
      return []
    }

    return tx.body.messages.map((msg, index) => {
      const typeUrl = msg['@type'] || msg.typeUrl || '未知类型'
      
      // 解析转账消息
      if (typeUrl.includes('MsgSend')) {
        return {
          type: '转账',
          from: msg.fromAddress || msg.from_address || '未知',
          to: msg.toAddress || msg.to_address || '未知',
          amount: msg.amount || []
        }
      }
      
      // 解析委托消息
      if (typeUrl.includes('MsgDelegate')) {
        return {
          type: '委托',
          delegator: msg.delegatorAddress || msg.delegator_address || '未知',
          validator: msg.validatorAddress || msg.validator_address || '未知',
          amount: msg.amount
        }
      }
      
      return {
        type: typeUrl.split('.').pop() || '未知类型',
        data: msg
      }
    })
  }

  const renderMessageDetails = (messages) => {
    return messages.map((msg, index) => (
      <Card key={index} size="small" style={{ marginBottom: '8px' }}>
        <div>
          <Text strong>消息类型: </Text>
          <Tag>{msg.type}</Tag>
        </div>
        
        {msg.type === '转账' && (
          <div style={{ marginTop: '8px' }}>
            <div>
              <Text strong>发送方: </Text>
              <Text code style={{ fontSize: '12px' }}>{msg.from}</Text>
            </div>
            <div>
              <Text strong>接收方: </Text>
              <Text code style={{ fontSize: '12px' }}>{msg.to}</Text>
            </div>
            <div>
              <Text strong>金额: </Text>
              {msg.amount.map((coin, i) => (
                <span key={i}>
                  {coin.denom === CHAIN_CONFIG.coinMinimalDenom 
                    ? formatBalance(coin.amount, CHAIN_CONFIG.coinDecimals) + ' ' + CHAIN_CONFIG.coinDenom
                    : coin.amount + ' ' + coin.denom
                  }
                  {i < msg.amount.length - 1 && ', '}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {msg.type === '委托' && (
          <div style={{ marginTop: '8px' }}>
            <div>
              <Text strong>委托人: </Text>
              <Text code style={{ fontSize: '12px' }}>{msg.delegator}</Text>
            </div>
            <div>
              <Text strong>验证者: </Text>
              <Text code style={{ fontSize: '12px' }}>{msg.validator}</Text>
            </div>
            {msg.amount && (
              <div>
                <Text strong>金额: </Text>
                <span>
                  {msg.amount.denom === CHAIN_CONFIG.coinMinimalDenom 
                    ? formatBalance(msg.amount.amount, CHAIN_CONFIG.coinDecimals) + ' ' + CHAIN_CONFIG.coinDenom
                    : msg.amount.amount + ' ' + msg.amount.denom
                  }
                </span>
              </div>
            )}
          </div>
        )}
      </Card>
    ))
  }

  return (
    <div>
      <Space.Compact style={{ width: '100%', marginBottom: '16px' }}>
        <Input
          placeholder="请输入交易哈希"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          onPressEnter={handleSearch}
          prefix={<TransactionOutlined />}
        />
        <Button 
          type="primary" 
          icon={<SearchOutlined />} 
          onClick={handleSearch}
          loading={loading}
        >
          查询
        </Button>
      </Space.Compact>

      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
          closable
          onClose={() => setError(null)}
        />
      )}

      <Spin spinning={loading}>
        {txData && (
          <Card className="info-card">
            <Descriptions title="交易详情" column={1} bordered>
              <Descriptions.Item label="交易哈希">
                <Text code className="tx-hash">
                  {txData.hash}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="区块高度">
                <Text strong style={{ color: '#1890ff' }}>
                  {txData.height}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="交易状态">
                {getStatusTag(txData.code)}
              </Descriptions.Item>
              
              <Descriptions.Item label="Gas 使用">
                <Space>
                  <Text>预估: {formatGas(txData.gasWanted)}</Text>
                  <Text>实际: {formatGas(txData.gasUsed)}</Text>
                  <Text type="secondary">
                    (效率: {txData.gasWanted ? ((txData.gasUsed / txData.gasWanted) * 100).toFixed(1) : 0}%)
                  </Text>
                </Space>
              </Descriptions.Item>
              
              {txData.timestamp && (
                <Descriptions.Item label="时间">
                  <Text>{formatTime(txData.timestamp)}</Text>
                </Descriptions.Item>
              )}
              
              {txData.result && (
                <Descriptions.Item label="执行结果">
                  <Text code style={{ wordBreak: 'break-all', fontSize: '12px' }}>
                    {txData.result}
                  </Text>
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {/* 交易消息详情 */}
            {txData.tx && (
              <div style={{ marginTop: '16px' }}>
                <Divider orientation="left">交易消息</Divider>
                {renderMessageDetails(parseTransactionMessages(txData.tx))}
              </div>
            )}
            
            {/* 事件信息 */}
            {txData.events && txData.events.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <Divider orientation="left">事件信息</Divider>
                <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {txData.events.map((event, index) => (
                    <Card key={index} size="small" style={{ marginBottom: '8px' }}>
                      <div>
                        <Text strong>事件类型: </Text>
                        <Tag>{event.type}</Tag>
                      </div>
                      {event.attributes && event.attributes.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          {event.attributes.map((attr, i) => (
                            <div key={i} style={{ fontSize: '12px' }}>
                              <Text strong>{attr.key}: </Text>
                              <Text>{attr.value}</Text>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </Spin>
    </div>
  )
}

export default TransactionInfo