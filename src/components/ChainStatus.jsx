import React from 'react'
import { Card, Statistic, Row, Col, Badge, Button, Space } from 'antd'
import { ReloadOutlined, LinkOutlined, DisconnectOutlined } from '@ant-design/icons'
import { CHAIN_CONFIG } from '../config/chain.js'

function ChainStatus({ height, status, onRefresh }) {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'success'
      case 'connecting':
        return 'processing'
      case 'disconnected':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return '已连接'
      case 'connecting':
        return '连接中'
      case 'disconnected':
        return '已断开'
      default:
        return '未知'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <LinkOutlined />
      case 'connecting':
        return <ReloadOutlined spin />
      case 'disconnected':
        return <DisconnectOutlined />
      default:
        return null
    }
  }

  return (
    <Card 
      title="🔗 链状态信息" 
      className="status-card"
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={onRefresh}
          type="text"
          size="small"
        >
          刷新
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="链 ID"
            value={CHAIN_CONFIG.chainId}
            valueStyle={{ color: '#1890ff', fontFamily: 'monospace' }}
          />
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="当前高度"
            value={height || 0}
            valueStyle={{ color: '#52c41a', fontFamily: 'monospace' }}
            suffix="块"
          />
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <div>
            <div style={{ color: '#8c8c8c', fontSize: '14px', marginBottom: '8px' }}>连接状态</div>
            <Space>
              <Badge 
                status={getStatusColor()} 
                text={getStatusText()}
              />
              {getStatusIcon()}
            </Space>
          </div>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <div>
            <div style={{ color: '#8c8c8c', fontSize: '14px', marginBottom: '8px' }}>RPC 端点</div>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '12px', 
              color: '#666',
              wordBreak: 'break-all'
            }}>
              {CHAIN_CONFIG.rpcEndpoint}
            </div>
          </div>
        </Col>
      </Row>
      
      {status === 'connected' && (
        <div style={{ 
          marginTop: '16px', 
          padding: '8px 12px', 
          background: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#389e0d'
        }}>
          ✓ 成功连接到 Cosmos 链，可以正常使用所有功能
        </div>
      )}
      
      {status === 'disconnected' && (
        <div style={{ 
          marginTop: '16px', 
          padding: '8px 12px', 
          background: '#fff2f0', 
          border: '1px solid #ffb3b3',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#cf1322'
        }}>
          ⚠ 无法连接到 Cosmos 链，请检查本地链是否启动
        </div>
      )}
    </Card>
  )
}

export default ChainStatus