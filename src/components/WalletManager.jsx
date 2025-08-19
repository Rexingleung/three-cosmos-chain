import React, { useState } from 'react'
import { Card, Button, Space, Input, Modal, message, Alert, Typography, Divider } from 'antd'
import { WalletOutlined, PlusOutlined, ImportOutlined, CopyOutlined, EyeOutlined, DisconnectOutlined } from '@ant-design/icons'
import { generateWallet, importWalletFromMnemonic, copyToClipboard, formatAddress } from '../utils/wallet.js'
import { cosmosService } from '../services/cosmosService.js'

const { TextArea } = Input
const { Text, Paragraph } = Typography

function WalletManager({ onWalletChange }) {
  const [currentWallet, setCurrentWallet] = useState(null)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isImportModalVisible, setIsImportModalVisible] = useState(false)
  const [importMnemonic, setImportMnemonic] = useState('')
  const [newWalletInfo, setNewWalletInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showMnemonic, setShowMnemonic] = useState(false)

  // 创建新钱包
  const handleCreateWallet = async () => {
    setLoading(true)
    try {
      const walletInfo = await generateWallet()
      setNewWalletInfo(walletInfo)
      setIsCreateModalVisible(true)
      message.success('钱包创建成功！')
    } catch (error) {
      message.error('创建钱包失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 导入钱包
  const handleImportWallet = async () => {
    if (!importMnemonic.trim()) {
      message.error('请输入助记词')
      return
    }

    setLoading(true)
    try {
      const walletInfo = await importWalletFromMnemonic(importMnemonic)
      
      // 设置签名客户端
      await cosmosService.setSigningClient(walletInfo.wallet)
      
      setCurrentWallet(walletInfo)
      onWalletChange(walletInfo)
      setIsImportModalVisible(false)
      setImportMnemonic('')
      message.success('钱包导入成功！')
    } catch (error) {
      message.error('导入钱包失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 确认使用新创建的钱包
  const handleConfirmNewWallet = async () => {
    try {
      // 设置签名客户端
      await cosmosService.setSigningClient(newWalletInfo.wallet)
      
      setCurrentWallet(newWalletInfo)
      onWalletChange(newWalletInfo)
      setIsCreateModalVisible(false)
      setNewWalletInfo(null)
      message.success('钱包设置成功！')
    } catch (error) {
      message.error('设置钱包失败: ' + error.message)
    }
  }

  // 复制地址
  const handleCopyAddress = async () => {
    if (currentWallet?.address) {
      const success = await copyToClipboard(currentWallet.address)
      if (success) {
        message.success('地址已复制到剪贴板')
      } else {
        message.error('复制失败')
      }
    }
  }

  // 复制助记词
  const handleCopyMnemonic = async (mnemonic) => {
    const success = await copyToClipboard(mnemonic)
    if (success) {
      message.success('助记词已复制到剪贴板')
    } else {
      message.error('复制失败')
    }
  }

  // 断开钱包
  const handleDisconnectWallet = () => {
    setCurrentWallet(null)
    onWalletChange(null)
    message.info('钱包已断开连接')
  }

  return (
    <div>
      {!currentWallet ? (
        // 未连接钱包状态
        <div style={{ textAlign: 'center' }}>
          <WalletOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <div style={{ marginBottom: '24px' }}>
            <Text type="secondary">请创建新钱包或导入已有钱包</Text>
          </div>
          <Space size="large">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleCreateWallet}
              loading={loading}
              size="large"
            >
              创建钱包
            </Button>
            <Button 
              icon={<ImportOutlined />} 
              onClick={() => setIsImportModalVisible(true)}
              size="large"
            >
              导入钱包
            </Button>
          </Space>
        </div>
      ) : (
        // 已连接钱包状态
        <div>
          <Alert
            message="钱包已连接"
            description={`地址: ${currentWallet.address}`}
            type="success"
            showIcon
            style={{ marginBottom: '16px' }}
            action={
              <Space>
                <Button size="small" icon={<CopyOutlined />} onClick={handleCopyAddress}>
                  复制地址
                </Button>
                <Button size="small" icon={<DisconnectOutlined />} onClick={handleDisconnectWallet}>
                  断开连接
                </Button>
              </Space>
            }
          />
          
          <div className="address-display">
            <Text strong>钱包地址：</Text>
            <br />
            <Text code>{currentWallet.address}</Text>
          </div>
        </div>
      )}

      {/* 创建钱包模态框 */}
      <Modal
        title="🎉 钱包创建成功"
        open={isCreateModalVisible}
        onOk={handleConfirmNewWallet}
        onCancel={() => {
          setIsCreateModalVisible(false)
          setNewWalletInfo(null)
        }}
        okText="确认使用此钱包"
        cancelText="取消"
        width={600}
      >
        {newWalletInfo && (
          <div>
            <Alert
              message="重要提醒"
              description="请务必安全保存以下助记词，这是恢复钱包的唯一凭证！"
              type="warning"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            
            <div style={{ marginBottom: '16px' }}>
              <Text strong>钱包地址：</Text>
              <div className="address-display" style={{ marginTop: '8px' }}>
                {newWalletInfo.address}
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <Text strong>助记词：</Text>
                <Space>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => setShowMnemonic(!showMnemonic)}
                  >
                    {showMnemonic ? '隐藏' : '显示'}
                  </Button>
                  {showMnemonic && (
                    <Button
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopyMnemonic(newWalletInfo.mnemonic)}
                    >
                      复制
                    </Button>
                  )}
                </Space>
              </div>
              {showMnemonic && (
                <div className="mnemonic-display">
                  {newWalletInfo.mnemonic}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 导入钱包模态框 */}
      <Modal
        title="📥 导入钱包"
        open={isImportModalVisible}
        onOk={handleImportWallet}
        onCancel={() => {
          setIsImportModalVisible(false)
          setImportMnemonic('')
        }}
        okText="导入钱包"
        cancelText="取消"
        confirmLoading={loading}
      >
        <div>
          <Paragraph>
            请输入您的助记词来恢复钱包（12或24个单词，用空格分隔）：
          </Paragraph>
          <TextArea
            rows={4}
            value={importMnemonic}
            onChange={(e) => setImportMnemonic(e.target.value)}
            placeholder="请输入助记词，例如：word1 word2 word3 ..."
            style={{ marginBottom: '16px' }}
          />
          <Alert
            message="安全提醒"
            description="请确保在安全的环境中输入助记词，避免被他人看到或记录。"
            type="info"
            showIcon
          />
        </div>
      </Modal>
    </div>
  )
}

export default WalletManager