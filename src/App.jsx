import React, { useState, useEffect } from 'react'
import { Layout, Row, Col, Card, Typography, Divider, Alert } from 'antd'
import ChainStatus from './components/ChainStatus'
import WalletManager from './components/WalletManager'
import Balance from './components/Balance'
import BlockInfo from './components/BlockInfo'
import TransactionInfo from './components/TransactionInfo'
import Transfer from './components/Transfer'
import { cosmosService } from './services/cosmosService'

const { Header, Content, Footer } = Layout
const { Title, Paragraph, Text } = Typography

function App() {
  const [wallet, setWallet] = useState(null)
  const [chainHeight, setChainHeight] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('connecting')

  useEffect(() => {
    // 检查链连接状态
    checkChainConnection()
    
    // 定期更新链高度
    const interval = setInterval(() => {
      if (connectionStatus === 'connected') {
        updateChainHeight()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [connectionStatus])

  const checkChainConnection = async () => {
    try {
      const height = await cosmosService.getLatestBlockHeight()
      setChainHeight(height)
      setConnectionStatus('connected')
    } catch (error) {
      console.error('链连接失败:', error)
      setConnectionStatus('disconnected')
    }
  }

  const updateChainHeight = async () => {
    try {
      const height = await cosmosService.getLatestBlockHeight()
      setChainHeight(height)
    } catch (error) {
      console.error('更新链高度失败:', error)
    }
  }

  const handleWalletChange = (newWallet) => {
    setWallet(newWallet)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 50px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            🌌 Three Cosmos Chain
          </Title>
          <Text type="secondary">Cosmos区块链交互工具</Text>
        </div>
      </Header>

      <Content style={{ padding: '24px 50px' }}>
        <div className="app-container">
          {/* 连接状态提示 */}
          {connectionStatus === 'disconnected' && (
            <Alert
              message="链连接失败"
              description="请确保本地Cosmos链正在运行 (ignite chain serve)"
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}
          
          {connectionStatus === 'connecting' && (
            <Alert
              message="正在连接到链..."
              description="正在尝试连接到本地Cosmos链"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          {/* 链状态信息 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <ChainStatus 
                height={chainHeight} 
                status={connectionStatus}
                onRefresh={checkChainConnection}
              />
            </Col>
          </Row>

          {/* 钱包管理 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Card title="💼 钱包管理" className="wallet-section">
                <WalletManager onWalletChange={handleWalletChange} />
              </Card>
            </Col>
          </Row>

          {/* 余额显示 */}
          {wallet && (
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <Balance walletAddress={wallet.address} />
              </Col>
            </Row>
          )}

          {/* 查询功能区 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="🔍 区块信息查询" className="query-section">
                <BlockInfo />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="📋 交易信息查询" className="query-section">
                <TransactionInfo />
              </Card>
            </Col>
          </Row>

          {/* 转账功能 */}
          {wallet && (
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="💸 转账操作" className="transfer-section">
                  <Transfer wallet={wallet} />
                </Card>
              </Col>
            </Row>
          )}

          {/* 使用说明 */}
          <Divider />
          <Card title="📖 使用说明" style={{ marginTop: 24 }}>
            <Paragraph>
              <Text strong>功能介绍：</Text>
            </Paragraph>
            <ul>
              <li><Text strong>链状态监控：</Text>实时显示当前链高度和连接状态</li>
              <li><Text strong>钱包管理：</Text>创建新钱包或通过助记词导入已有钱包</li>
              <li><Text strong>余额查询：</Text>查看钱包中各种代币的余额</li>
              <li><Text strong>区块查询：</Text>输入区块高度查看详细的区块信息</li>
              <li><Text strong>交易查询：</Text>输入交易哈希查看交易详情</li>
              <li><Text strong>转账功能：</Text>向其他地址发送代币</li>
            </ul>
            <Alert
              message="安全提醒"
              description="请妥善保管您的助记词，这是恢复钱包的唯一凭证。本应用仅适用于测试环境。"
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          </Card>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        <Text type="secondary">
          Three Cosmos Chain ©2025 Created with ❤️ for Cosmos Ecosystem
        </Text>
      </Footer>
    </Layout>
  )
}

export default App