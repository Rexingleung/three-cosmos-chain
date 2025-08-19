import React, { useState } from 'react'
import { Card, Form, Input, Button, Alert, Modal, message, Space, Typography, Divider } from 'antd'
import { SendOutlined, WalletOutlined, CalculatorOutlined } from '@ant-design/icons'
import { cosmosService } from '../services/cosmosService.js'
import { validateCosmosAddress, formatBalance, parseAmount } from '../utils/wallet.js'
import { CHAIN_CONFIG } from '../config/chain.js'

const { Text } = Typography

function Transfer({ wallet }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [estimatedFee, setEstimatedFee] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [transferData, setTransferData] = useState(null)

  // 估算转账费用
  const handleEstimateFee = async () => {
    try {
      const values = await form.validateFields(['toAddress', 'amount'])
      
      if (!validateCosmosAddress(values.toAddress)) {
        message.error('无效的接收地址')
        return
      }

      const amountInMinimalDenom = parseAmount(values.amount, CHAIN_CONFIG.coinDecimals)
      
      const sendMsg = {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: {
          fromAddress: wallet.address,
          toAddress: values.toAddress,
          amount: [{
            denom: CHAIN_CONFIG.coinMinimalDenom,
            amount: amountInMinimalDenom
          }]
        }
      }

      const feeEstimation = await cosmosService.estimateGas(wallet.address, [sendMsg])
      setEstimatedFee(feeEstimation)
      message.success('费用估算完成')
    } catch (error) {
      console.error('估算费用失败:', error)
      message.error('估算费用失败: ' + error.message)
    }
  }

  // 处理转账表单提交
  const handleSubmit = async (values) => {
    if (!validateCosmosAddress(values.toAddress)) {
      message.error('无效的接收地址')
      return
    }

    // 准备转账数据
    const data = {
      toAddress: values.toAddress,
      amount: values.amount,
      memo: values.memo || '',
      amountInMinimalDenom: parseAmount(values.amount, CHAIN_CONFIG.coinDecimals)
    }

    setTransferData(data)
    setShowConfirmModal(true)
  }

  // 确认并执行转账
  const handleConfirmTransfer = async () => {
    setLoading(true)
    try {
      const result = await cosmosService.sendTokens(
        wallet.address,
        transferData.toAddress,
        transferData.amountInMinimalDenom,
        CHAIN_CONFIG.coinMinimalDenom,
        transferData.memo
      )

      message.success('转账成功！')
      Modal.success({
        title: '转账成功',
        content: (
          <div>
            <p>交易已成功提交到区块链</p>
            <p><strong>交易哈希:</strong></p>
            <Text code style={{ wordBreak: 'break-all' }}>
              {result.hash}
            </Text>
            <p><strong>区块高度:</strong> {result.height}</p>
          </div>
        )
      })

      // 重置表单
      form.resetFields()
      setEstimatedFee(null)
      setShowConfirmModal(false)
      setTransferData(null)
    } catch (error) {
      console.error('转账失败:', error)
      message.error('转账失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!wallet) {
    return (
      <Alert
        message="请先连接钱包"
        description="转账功能需要连接钱包后才能使用"
        type="warning"
        showIcon
      />
    )
  }

  return (
    <div>
      {/* 当前钱包信息 */}
      <Card size="small" style={{ marginBottom: '16px' }}>
        <div>
          <WalletOutlined style={{ marginRight: '8px' }} />
          <Text strong>当前钱包: </Text>
          <Text code style={{ fontSize: '12px' }}>{wallet.address}</Text>
        </div>
      </Card>

      {/* 转账表单 */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="接收地址"
          name="toAddress"
          rules={[
            { required: true, message: '请输入接收地址' },
            {
              validator: (_, value) => {
                if (value && !validateCosmosAddress(value)) {
                  return Promise.reject(new Error('无效的地址格式'))
                }
                if (value && value === wallet.address) {
                  return Promise.reject(new Error('不能转账给自己'))
                }
                return Promise.resolve()
              }
            }
          ]}
        >
          <Input
            placeholder={`请输入以 ${CHAIN_CONFIG.addressPrefix} 开头的地址`}
            prefix={<WalletOutlined />}
          />
        </Form.Item>

        <Form.Item
          label={`转账金额 (${CHAIN_CONFIG.coinDenom})`}
          name="amount"
          rules={[
            { required: true, message: '请输入转账金额' },
            {
              validator: (_, value) => {
                if (value && (isNaN(value) || parseFloat(value) <= 0)) {
                  return Promise.reject(new Error('请输入有效的金额'))
                }
                return Promise.resolve()
              }
            }
          ]}
        >
          <Input
            type="number"
            placeholder="请输入转账金额"
            min="0"
            step="0.000001"
            addonAfter={CHAIN_CONFIG.coinDenom}
          />
        </Form.Item>

        <Form.Item
          label="备注 (可选)"
          name="memo"
        >
          <Input.TextArea
            rows={2}
            placeholder="转账备注信息"
            maxLength={200}
            showCount
          />
        </Form.Item>

        {/* 操作按钮 */}
        <Form.Item>
          <Space>
            <Button
              icon={<CalculatorOutlined />}
              onClick={handleEstimateFee}
            >
              估算费用
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              disabled={loading}
            >
              发送交易
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 费用估算结果 */}
      {estimatedFee && (
        <Card title="费用估算" size="small" style={{ marginTop: '16px' }}>
          <div>
            <Text>Gas 限制: </Text>
            <Text strong>{estimatedFee.gasLimit.toLocaleString()}</Text>
          </div>
          <div>
            <Text>Gas 价格: </Text>
            <Text strong>{estimatedFee.gasPrice} {CHAIN_CONFIG.coinMinimalDenom}</Text>
          </div>
          <div>
            <Text>预估手续费: </Text>
            <Text strong style={{ color: '#1890ff' }}>
              {formatBalance(estimatedFee.fee.amount, CHAIN_CONFIG.coinDecimals)} {CHAIN_CONFIG.coinDenom}
            </Text>
          </div>
        </Card>
      )}

      {/* 转账确认模态框 */}
      <Modal
        title="确认转账"
        open={showConfirmModal}
        onOk={handleConfirmTransfer}
        onCancel={() => {
          setShowConfirmModal(false)
          setTransferData(null)
        }}
        okText="确认转账"
        cancelText="取消"
        confirmLoading={loading}
        width={500}
      >
        {transferData && (
          <div>
            <Alert
              message="请仔细核对转账信息"
              description="转账一旦完成将无法撤销"
              type="warning"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            
            <div style={{ background: '#fafafa', padding: '16px', borderRadius: '6px' }}>
              <div style={{ marginBottom: '8px' }}>
                <Text strong>发送方: </Text>
                <Text code style={{ fontSize: '12px' }}>{wallet.address}</Text>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <Text strong>接收方: </Text>
                <Text code style={{ fontSize: '12px' }}>{transferData.toAddress}</Text>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <Text strong>转账金额: </Text>
                <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                  {transferData.amount} {CHAIN_CONFIG.coinDenom}
                </Text>
              </div>
              
              {transferData.memo && (
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>备注: </Text>
                  <Text>{transferData.memo}</Text>
                </div>
              )}
            </div>
            
            {estimatedFee && (
              <div style={{ marginTop: '16px' }}>
                <Divider />
                <Text type="secondary">预估手续费: </Text>
                <Text strong>
                  {formatBalance(estimatedFee.fee.amount, CHAIN_CONFIG.coinDecimals)} {CHAIN_CONFIG.coinDenom}
                </Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Transfer