import React, { useState } from 'react'
import { Input, Button, Card, Descriptions, Alert, Spin, Space, Typography } from 'antd'
import { SearchOutlined, BlockOutlined } from '@ant-design/icons'
import { cosmosService } from '../services/cosmosService.js'
import { formatTxHash } from '../utils/wallet.js'

const { Text } = Typography

function BlockInfo() {
  const [blockHeight, setBlockHeight] = useState('')
  const [blockData, setBlockData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async () => {
    if (!blockHeight || isNaN(blockHeight)) {
      setError('请输入有效的区块高度')
      return
    }

    setLoading(true)
    setError(null)
    setBlockData(null)

    try {
      const data = await cosmosService.getBlockByHeight(parseInt(blockHeight))
      setBlockData(data)
    } catch (err) {
      setError('获取区块信息失败: ' + err.message)
      console.error('获取区块信息失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGetLatest = async () => {
    setLoading(true)
    setError(null)
    setBlockData(null)

    try {
      const height = await cosmosService.getLatestBlockHeight()
      setBlockHeight(height.toString())
      const data = await cosmosService.getBlockByHeight(height)
      setBlockData(data)
    } catch (err) {
      setError('获取最新区块失败: ' + err.message)
      console.error('获取最新区块失败:', err)
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

  return (
    <div>
      <Space.Compact style={{ width: '100%', marginBottom: '16px' }}>
        <Input
          placeholder="请输入区块高度"
          value={blockHeight}
          onChange={(e) => setBlockHeight(e.target.value)}
          onPressEnter={handleSearch}
          prefix={<BlockOutlined />}
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

      <div style={{ marginBottom: '16px' }}>
        <Button onClick={handleGetLatest} loading={loading}>
          获取最新区块
        </Button>
      </div>

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
        {blockData && (
          <Card className="info-card">
            <Descriptions title="区块详情" column={1} bordered>
              <Descriptions.Item label="区块高度">
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  {blockData.height}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="区块哈希">
                <Text code style={{ wordBreak: 'break-all' }}>
                  {blockData.hash || '暂无'}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="时间戳">
                <Text>{formatTime(blockData.time)}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="提议者">
                <Text code style={{ wordBreak: 'break-all' }}>
                  {blockData.proposer || '暂无'}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="交易数量">
                <Text strong style={{ color: blockData.txCount > 0 ? '#52c41a' : '#8c8c8c' }}>
                  {blockData.txCount} 笔
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="数据哈希">
                <Text code style={{ wordBreak: 'break-all' }}>
                  {blockData.dataHash || '暂无'}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="验证者哈希">
                <Text code style={{ wordBreak: 'break-all' }}>
                  {blockData.validatorsHash || '暂无'}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="共识哈希">
                <Text code style={{ wordBreak: 'break-all' }}>
                  {blockData.consensusHash || '暂无'}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="应用哈希">
                <Text code style={{ wordBreak: 'break-all' }}>
                  {blockData.appHash || '暂无'}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="上次结果哈希">
                <Text code style={{ wordBreak: 'break-all' }}>
                  {blockData.lastResultsHash || '暂无'}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Spin>
    </div>
  )
}

export default BlockInfo