import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Descriptions,
  Spin,
  Row,
  Col,
  Statistic,
  Tabs,
  Collapse,
  Divider,
  Typography,
  Progress,
  Badge,
  Avatar,
  Tooltip,
  Timeline,
  Alert
} from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FileTextOutlined,
  CalendarOutlined,
  DollarOutlined,
  PlayCircleOutlined,
  RedoOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  EnvironmentOutlined,
  DatabaseOutlined,
  CloudDownloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  TrophyOutlined,
  PieChartOutlined,
  LineChartOutlined,
  FolderOpenOutlined,
  SendOutlined,
  FileDoneOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { batchApi } from '../../api/batchApi';
import { toast } from 'react-toastify';

const { Panel } = Collapse;
const { Text, Title } = Typography;

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchDetailsLoading, setBatchDetailsLoading] = useState(false);
  const [batchDetailsData, setBatchDetailsData] = useState(null);
  const [processingBatches, setProcessingBatches] = useState({});

  // Add custom styles
  const customStyles = `
    .table-row-light:hover {
      background-color: #F8FAFC !important;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .table-row-dark:hover {
      background-color: #F3FAFF !important;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .ant-table-thead > tr > th {
      background: linear-gradient(to right, #F8FAFC, #F3FAFF) !important;
      color: #005399 !important;
      font-weight: 600 !important;
      border-bottom: 2px solid #E1E1E1 !important;
      font-size: 14px !important;
    }
    .ant-card-head {
      border-bottom: 1px solid #E1E1E1;
    }
    .ant-descriptions-item-label {
      font-weight: 600 !important;
      color: #005399 !important;
    }
    .ant-collapse-ghost > .ant-collapse-item {
      border: none !important;
      margin-bottom: 16px !important;
    }
    .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
      padding: 16px 0 !important;
    }
  `;

  // Inject styles
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await batchApi.getAllBatches();
      console.log('Batches response:', response.data);
      if (response.data.success) {
        setBatches(response.data.data.batches);
      } else {
        message.error('Failed to fetch batches');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      message.error('Error fetching batches: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadEDI = async (batch) => {
    try {
      const response = await batchApi.downloadEDI(batch.batch_id);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch_${batch.batch_number}.edi`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success(`Downloaded batch_${batch.batch_number}.edi`);
    } catch (error) {
      console.error('Error downloading file:', error);
      message.error('Error downloading file: ' + error.message);
    }
  };

  const processBatch = async (batch) => {
    setProcessingBatches(prev => ({ ...prev, [batch.batch_id]: true }));
    
    try {
      message.loading(`Processing batch ${batch.batch_number}...`, 0);
      const response = await batchApi.processBatch(batch.batch_id);
      
      if (response.data.success) {
        message.destroy(); // Clear loading message
        message.success(`Batch ${batch.batch_number} processed successfully`);
        
        // Update the batch status in local state to reflect the change
        setBatches(prev => prev.map(b => 
          b.batch_id === batch.batch_id 
            ? { ...b, status: 'processing', updated_at: new Date().toISOString() }
            : b
        ));
        toast.success(`Batch ${batch.batch_number} processed successfully`);
        // Refresh batches after a short delay to get updated status
        setTimeout(() => {
          fetchBatches();
        }, 2000);
      } else {
        toast.error(`Failed to process batch: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error processing batch:', error);
      toast.error(`Error processing batch: ${error.response?.data?.message || error.message}`);
    } finally {
      setProcessingBatches(prev => ({ ...prev, [batch.batch_id]: false }));
    }
  };

  const viewBatchDetails = async (batch) => {
    setSelectedBatch(batch);
    setDetailModalVisible(true);
    setBatchDetailsLoading(true);
    
    try {
      const response = await batchApi.getBatchDetails(batch.batch_id);
      if (response.data.success) {
        setBatchDetailsData(response.data.data.batch);
      } else {
        message.error('Failed to load batch details');
      }
    } catch (error) {
      console.error('Error loading batch details:', error);
      message.error('Error loading batch details: ' + error.message);
    } finally {
      setBatchDetailsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': 
        return { 
          color: '#fa8c16', 
          background: '#fff7e6', 
          borderColor: '#ffd591',
          icon: <ClockCircleOutlined />
        };
      case 'processing': 
        return { 
          color: '#1890ff', 
          background: '#e6f7ff', 
          borderColor: '#91d5ff',
          icon: <SyncOutlined spin />
        };
      case 'completed': 
        return { 
          color: '#52c41a', 
          background: '#f6ffed', 
          borderColor: '#b7eb8f',
          icon: <CheckCircleOutlined />
        };
      case 'failed': 
        return { 
          color: '#f5222d', 
          background: '#fff2f0', 
          borderColor: '#ffccc7',
          icon: <ExclamationCircleOutlined />
        };
      default: 
        return { 
          color: '#8c8c8c', 
          background: '#f5f5f5', 
          borderColor: '#d9d9d9',
          icon: <FileTextOutlined />
        };
    }
  };

  const columns = [
    {
      title: 'Batch Information',
      dataIndex: 'batch_number',
      key: 'batch_number',
      width: 200,
      render: (text, record) => {
        const statusConfig = getStatusColor(record.status);
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              size={40}
              style={{ 
                backgroundColor: statusConfig.background,
                color: statusConfig.color,
                border: `1px solid ${statusConfig.borderColor}`,
                marginRight: '12px'
              }}
              icon={statusConfig.icon}
            />
            <div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#005399',
                marginBottom: '2px'
              }}>
                {text}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#666' 
              }}>
                ID: {record.batch_id}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusConfig = getStatusColor(status);
        return (
          <Tag 
            style={{
              color: statusConfig.color,
              backgroundColor: statusConfig.background,
              border: `1px solid ${statusConfig.borderColor}`,
              borderRadius: '16px',
              padding: '4px 12px',
              fontWeight: '500',
              fontSize: '12px'
            }}
            icon={statusConfig.icon}
          >
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Claims & Amount',
      key: 'claims_amount',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <MedicineBoxOutlined style={{ 
              color: '#26BC98', 
              marginRight: '8px',
              fontSize: '14px'
            }} />
            <Text strong style={{ color: '#005399', fontSize: '14px' }}>
              {record.total_claims} Claims
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DollarOutlined style={{ 
              color: '#52c41a', 
              marginRight: '8px',
              fontSize: '14px'
            }} />
            <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
              ${parseFloat(record.total_amount || 0).toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Timeline',
      key: 'timeline',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <CalendarOutlined style={{ 
              color: '#1890ff', 
              marginRight: '8px',
              fontSize: '12px'
            }} />
            <Text style={{ fontSize: '12px', color: '#666' }}>
              Created: {dayjs(record.created_at).format('MM/DD/YY HH:mm')}
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SyncOutlined style={{ 
              color: '#fa8c16', 
              marginRight: '8px',
              fontSize: '12px'
            }} />
            <Text style={{ fontSize: '12px', color: '#666' }}>
              Updated: {dayjs(record.updated_at).format('MM/DD/YY HH:mm')}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 300,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View batch details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => viewBatchDetails(record)}
              style={{
                color: '#005399',
                border: '1px solid #E1E1E1',
                borderRadius: '6px'
              }}
            >
              Details
            </Button>
          </Tooltip>
          
          {/* Process/Reprocess buttons for pending and failed batches */}
          {(record.status === 'pending' || record.status === 'failed') && (
            <Tooltip title={record.status === 'pending' ? 'Process batch' : 'Reprocess failed batch'}>
              <Button
                type="primary"
                size="small"
                icon={record.status === 'pending' ? <PlayCircleOutlined /> : <RedoOutlined />}
                onClick={() => processBatch(record)}
                loading={processingBatches[record.batch_id]}
                style={{
                  backgroundColor: record.status === 'pending' ? '#26BC98' : '#fa8c16',
                  borderColor: record.status === 'pending' ? '#26BC98' : '#fa8c16',
                  borderRadius: '6px',
                  boxShadow: `0 2px 4px ${record.status === 'pending' ? 'rgba(38, 188, 152, 0.3)' : 'rgba(250, 140, 22, 0.3)'}`
                }}
              >
                {record.status === 'pending' ? 'Process' : 'Retry'}
              </Button>
            </Tooltip>
          )}
          
          {/* Download button for completed batches with EDI files */}
          {record.status === 'completed' && record.edi_file_path && (
            <Tooltip title="Download EDI file">
              <Button
                type="primary"
                size="small"
                icon={<CloudDownloadOutlined />}
                onClick={() => downloadEDI(record)}
                style={{
                  backgroundColor: '#005399',
                  borderColor: '#005399',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0, 83, 153, 0.3)'
                }}
              >
                Download
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const stats = {
    total: batches.length,
    pending: batches.filter(b => b.status === 'pending').length,
    processing: batches.filter(b => b.status === 'processing').length,
    completed: batches.filter(b => b.status === 'completed').length,
    failed: batches.filter(b => b.status === 'failed').length,
    totalAmount: batches.reduce((sum, batch) => sum + parseFloat(batch.total_amount || 0), 0),
  };

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#F8FAFC',
      minHeight: '100vh'
    }}>
      {/* Enhanced Header Section */}
      <div style={{ 
        marginBottom: '32px',
        background: 'linear-gradient(135deg, #005399 0%, #26BC98 100%)',
        borderRadius: '16px',
        padding: '32px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(0, 83, 153, 0.15)'
      }}>
        <Row align="middle" gutter={24}>
          <Col>
            <Avatar 
              size={64} 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }} 
              icon={<DatabaseOutlined style={{ fontSize: '28px' }} />} 
            />
          </Col>
          <Col flex="auto">
            <Title level={2} style={{ 
              color: 'white', 
              margin: 0,
              fontSize: '32px',
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Batch Management Center
            </Title>
            <Text style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '16px',
              fontWeight: '400',
              display: 'block',
              marginTop: '8px'
            }}>
              Monitor, process, and manage your EDI batch operations with comprehensive insights
            </Text>
          </Col>
          <Col>
            <Space direction="vertical" align="end">
              <Text style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                fontSize: '12px' 
              }}>
                Last updated: {dayjs().format('MMM DD, YYYY HH:mm')}
              </Text>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Enhanced Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            hoverable
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500' }}>
                  Total Batches
                </Text>
                <div style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginTop: '4px' }}>
                  {stats.total}
                </div>
              </div>
              <Avatar 
                size={48} 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }} 
                icon={<FolderOpenOutlined style={{ fontSize: '20px', color: 'white' }} />} 
              />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            hoverable
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(240, 147, 251, 0.15)',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500' }}>
                  Pending
                </Text>
                <div style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginTop: '4px' }}>
                  {stats.pending}
                </div>
              </div>
              <Avatar 
                size={48} 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }} 
                icon={<ClockCircleOutlined style={{ fontSize: '20px', color: 'white' }} />} 
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            hoverable
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(79, 172, 254, 0.15)',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500' }}>
                  Processing
                </Text>
                <div style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginTop: '4px' }}>
                  {stats.processing}
                </div>
              </div>
              <Avatar 
                size={48} 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }} 
                icon={<SyncOutlined spin style={{ fontSize: '20px', color: 'white' }} />} 
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            hoverable
            style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              border: 'none',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(67, 233, 123, 0.15)',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500' }}>
                  Completed
                </Text>
                <div style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginTop: '4px' }}>
                  {stats.completed}
                </div>
              </div>
              <Avatar 
                size={48} 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }} 
                icon={<CheckCircleOutlined style={{ fontSize: '20px', color: 'white' }} />} 
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            hoverable
            style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              border: 'none',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(250, 112, 154, 0.15)',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500' }}>
                  Failed
                </Text>
                <div style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginTop: '4px' }}>
                  {stats.failed}
                </div>
              </div>
              <Avatar 
                size={48} 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }} 
                icon={<ExclamationCircleOutlined style={{ fontSize: '20px', color: 'white' }} />} 
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            hoverable
            style={{
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              border: 'none',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(168, 237, 234, 0.15)',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ color: 'rgba(0,0,0,0.7)', fontSize: '14px', fontWeight: '500' }}>
                  Total Value
                </Text>
                <div style={{ color: '#005399', fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>
                  ${stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <Avatar 
                size={48} 
                style={{ 
                  backgroundColor: 'rgba(0, 83, 153, 0.1)',
                  border: '2px solid rgba(0, 83, 153, 0.2)'
                }} 
                icon={<TrophyOutlined style={{ fontSize: '20px', color: '#005399' }} />} 
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Enhanced Actions Bar */}
      <Card 
        style={{ 
          marginBottom: '24px',
          borderRadius: '12px',
          border: '1px solid #E1E1E1',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          background: 'linear-gradient(to right, #F3FAFF, #ffffff)'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LineChartOutlined style={{ 
                  fontSize: '20px', 
                  color: '#005399', 
                  marginRight: '8px' 
                }} />
                <Text strong style={{ color: '#005399', fontSize: '16px' }}>
                  Batch Operations
                </Text>
              </div>
              
              
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title="Refresh data (Ctrl+R)">
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={fetchBatches}
                  loading={loading}
                  style={{
                    backgroundColor: '#005399',
                    borderColor: '#005399',
                    borderRadius: '8px',
                    height: '40px',
                    boxShadow: '0 2px 8px rgba(0, 83, 153, 0.3)'
                  }}
                >
                  Refresh
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Enhanced Batches Table */}
      <Card 
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            padding: '8px 0'
          }}>
            <Avatar 
              size={36}
              style={{ 
                backgroundColor: '#F3FAFF',
                border: '2px solid #005399',
                marginRight: '12px'
              }}
              icon={<FileDoneOutlined style={{ color: '#005399', fontSize: '16px' }} />}
            />
            <div>
              <Text strong style={{ 
                color: '#005399', 
                fontSize: '18px',
                display: 'block'
              }}>
                Batch Registry ({batches.length})
              </Text>
              <Text style={{ 
                color: '#666', 
                fontSize: '12px' 
              }}>
                Complete overview of all batch operations
              </Text>
            </div>
          </div>
        }
        // extra={
        //   <Space>
        //     <Badge 
        //       count={batches.filter(b => b.status === 'pending').length} 
        //       style={{ backgroundColor: '#fa8c16' }}
        //     >
        //       <Button type="text" size="small" style={{ color: '#666' }}>
        //         Pending
        //       </Button>
        //     </Badge>
        //     <Badge 
        //       count={batches.filter(b => b.status === 'failed').length} 
        //       style={{ backgroundColor: '#f5222d' }}
        //     >
        //       <Button type="text" size="small" style={{ color: '#666' }}>
        //         Failed
        //       </Button>
        //     </Badge>
        //   </Space>
        // }
        style={{
          borderRadius: '12px',
          border: '1px solid #E1E1E1',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}
        headStyle={{
          background: 'linear-gradient(to right, #F3FAFF, #ffffff)',
          borderBottom: '2px solid #E1E1E1'
        }}
      >
        <Table
          columns={columns}
          dataSource={batches}
          rowKey="batch_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => (
              <Text style={{ color: '#666', fontSize: '14px' }}>
                <strong>{range[0]}-{range[1]}</strong> of <strong>{total}</strong> batches
              </Text>
            ),
            style: { paddingTop: '16px' }
          }}
          scroll={{ x: 1000 }}
          rowClassName={(record, index) => 
            index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
          }
          style={{
            '.ant-table-thead > tr > th': {
              backgroundColor: '#F8FAFC',
              color: '#005399',
              fontWeight: '600',
              borderBottom: '2px solid #E1E1E1'
            }
          }}
        />
      </Card>

      {/* Enhanced Batch Details Modal */}
      <Modal
        title={
          <div style={{
            background: 'linear-gradient(135deg, #005399 0%, #26BC98 100%)',
            margin: '-24px -24px 24px -24px',
            padding: '24px',
            color: 'white',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Avatar 
              size={48}
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                marginRight: '16px'
              }}
              icon={<DatabaseOutlined style={{ fontSize: '20px' }} />}
            />
            <div>
              <Title level={3} style={{ 
                color: 'white', 
                margin: 0,
                fontSize: '20px'
              }}>
                Batch Details - {selectedBatch?.batch_number || ''}
              </Title>
              <Text style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px'
              }}>
                Complete batch information and claim details
              </Text>
            </div>
            {selectedBatch && (
              <div style={{ marginLeft: 'auto' }}>
                {(() => {
                  const statusConfig = getStatusColor(selectedBatch.status);
                  return (
                    <Tag 
                      style={{
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '16px',
                        padding: '4px 12px',
                        fontWeight: '500',
                        fontSize: '12px'
                      }}
                      icon={statusConfig.icon}
                    >
                      {selectedBatch.status.toUpperCase()}
                    </Tag>
                  );
                })()}
              </div>
            )}
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setBatchDetailsData(null);
        }}
        footer={null}
        width={1400}
        style={{ top: 20 }}
        styles={{
          body: { padding: 0 }
        }}
      >
        {selectedBatch && (
          <div style={{ padding: '0 24px 24px 24px' }}>
            {batchDetailsLoading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '80px',
                background: 'linear-gradient(145deg, #F8FAFC, #ffffff)',
                borderRadius: '12px'
              }}>
                <Spin size="large" />
                <Title level={4} style={{ 
                  marginTop: '24px', 
                  color: '#005399' 
                }}>
                  Loading batch details...
                </Title>
                <Text style={{ color: '#666' }}>
                  Please wait while we fetch the complete batch information
                </Text>
              </div>
            ) : (
              <Tabs 
                defaultActiveKey="overview" 
                type="card"
                size="large"
                tabBarStyle={{
                  marginBottom: '24px',
                  borderBottom: '2px solid #F0F0F0'
                }}
                items={[
                  {
                    key: 'overview',
                    label: (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <PieChartOutlined style={{ marginRight: '8px' }} />
                        Overview
                      </div>
                    ),
                    children: (
                      <Row gutter={24}>
                        <Col span={14}>
                          <Card 
                            title={
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <DatabaseOutlined style={{ 
                                  color: '#005399', 
                                  marginRight: '12px',
                                  fontSize: '18px'
                                }} />
                                <Text strong style={{ color: '#005399', fontSize: '16px' }}>
                                  Batch Information
                                </Text>
                              </div>
                            }
                            style={{
                              borderRadius: '12px',
                              border: '1px solid #E1E1E1',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                            }}
                            headStyle={{
                              background: 'linear-gradient(to right, #F3FAFF, #ffffff)',
                              borderBottom: '1px solid #E1E1E1'
                            }}
                          >
                            <Descriptions column={1} size="small" style={{ marginBottom: '20px' }}>
                              <Descriptions.Item 
                                label={<Text strong style={{ color: '#005399' }}>Batch Number</Text>}
                              >
                                <Tag 
                                  style={{
                                    backgroundColor: '#F3FAFF',
                                    color: '#005399',
                                    border: '1px solid #26BC98',
                                    borderRadius: '16px',
                                    padding: '4px 12px',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  {selectedBatch.batch_number}
                                </Tag>
                              </Descriptions.Item>
                              <Descriptions.Item 
                                label={<Text strong style={{ color: '#005399' }}>Status</Text>}
                              >
                                {(() => {
                                  const statusConfig = getStatusColor(selectedBatch.status);
                                  return (
                                    <Tag 
                                      style={{
                                        color: statusConfig.color,
                                        backgroundColor: statusConfig.background,
                                        border: `1px solid ${statusConfig.borderColor}`,
                                        borderRadius: '16px',
                                        padding: '6px 16px',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                      }}
                                      icon={statusConfig.icon}
                                    >
                                      {selectedBatch.status.toUpperCase()}
                                    </Tag>
                                  );
                                })()}
                              </Descriptions.Item>
                              <Descriptions.Item 
                                label={<Text strong style={{ color: '#005399' }}>Total Claims</Text>}
                              >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <MedicineBoxOutlined style={{ 
                                    color: '#26BC98', 
                                    marginRight: '8px',
                                    fontSize: '16px'
                                  }} />
                                  <Text strong style={{ fontSize: '18px', color: '#26BC98' }}>
                                    {selectedBatch.total_claims}
                                  </Text>
                                </div>
                              </Descriptions.Item>
                              <Descriptions.Item 
                                label={<Text strong style={{ color: '#005399' }}>Total Amount</Text>}
                              >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <DollarOutlined style={{ 
                                    color: '#52c41a', 
                                    marginRight: '8px',
                                    fontSize: '16px'
                                  }} />
                                  <Text strong style={{ fontSize: '20px', color: '#52c41a' }}>
                                    ${parseFloat(selectedBatch.total_amount || 0).toLocaleString(undefined, { 
                                      minimumFractionDigits: 2, 
                                      maximumFractionDigits: 2 
                                    })}
                                  </Text>
                                </div>
                              </Descriptions.Item>
                              <Descriptions.Item 
                                label={<Text strong style={{ color: '#005399' }}>Created At</Text>}
                              >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <CalendarOutlined style={{ 
                                    color: '#1890ff', 
                                    marginRight: '8px',
                                    fontSize: '14px'
                                  }} />
                                  <Text style={{ fontSize: '14px' }}>
                                    {dayjs(selectedBatch.created_at).format('MMMM DD, YYYY at HH:mm:ss')}
                                  </Text>
                                </div>
                              </Descriptions.Item>
                              <Descriptions.Item 
                                label={<Text strong style={{ color: '#005399' }}>Last Updated</Text>}
                              >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <SyncOutlined style={{ 
                                    color: '#fa8c16', 
                                    marginRight: '8px',
                                    fontSize: '14px'
                                  }} />
                                  <Text style={{ fontSize: '14px' }}>
                                    {dayjs(selectedBatch.updated_at).format('MMMM DD, YYYY at HH:mm:ss')}
                                  </Text>
                                </div>
                              </Descriptions.Item>
                            </Descriptions>
                          </Card>
                        </Col>
                        <Col span={10}>
                          <Card 
                            title={
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <SendOutlined style={{ 
                                  color: '#005399', 
                                  marginRight: '12px',
                                  fontSize: '18px'
                                }} />
                                <Text strong style={{ color: '#005399', fontSize: '16px' }}>
                                  Quick Actions
                                </Text>
                              </div>
                            }
                            style={{
                              borderRadius: '12px',
                              border: '1px solid #E1E1E1',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                            }}
                            headStyle={{
                              background: 'linear-gradient(to right, #F3FAFF, #ffffff)',
                              borderBottom: '1px solid #E1E1E1'
                            }}
                          >
                            <Space direction="vertical" style={{ width: '100%' }}>
                              {(selectedBatch.status === 'pending' || selectedBatch.status === 'failed') && (
                                <Button
                                  type="primary"
                                  size="large"
                                  icon={selectedBatch.status === 'pending' ? <PlayCircleOutlined /> : <RedoOutlined />}
                                  onClick={() => processBatch(selectedBatch)}
                                  loading={processingBatches[selectedBatch.batch_id]}
                                  block
                                  style={{
                                    height: '48px',
                                    borderRadius: '8px',
                                    backgroundColor: selectedBatch.status === 'pending' ? '#26BC98' : '#fa8c16',
                                    borderColor: selectedBatch.status === 'pending' ? '#26BC98' : '#fa8c16',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    boxShadow: `0 4px 12px ${
                                      selectedBatch.status === 'pending' 
                                        ? 'rgba(38, 188, 152, 0.3)' 
                                        : 'rgba(250, 140, 22, 0.3)'
                                    }`
                                  }}
                                >
                                  {selectedBatch.status === 'pending' ? 'Process Batch Now' : 'Reprocess Batch'}
                                </Button>
                              )}
                              
                              {selectedBatch.status === 'completed' && selectedBatch.edi_file_path && (
                                <Button
                                  type="primary"
                                  size="large"
                                  icon={<CloudDownloadOutlined />}
                                  onClick={() => downloadEDI(selectedBatch)}
                                  block
                                  style={{
                                    height: '48px',
                                    borderRadius: '8px',
                                    backgroundColor: '#005399',
                                    borderColor: '#005399',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 12px rgba(0, 83, 153, 0.3)'
                                  }}
                                >
                                  Download EDI File
                                </Button>
                              )}
                              
                              {selectedBatch.status === 'processing' && (
                                <Alert
                                  message="Batch Processing"
                                  description="This batch is currently being processed. Please wait for completion."
                                  type="info"
                                  icon={<SyncOutlined spin />}
                                  style={{
                                    borderRadius: '8px',
                                    border: '1px solid #1890ff'
                                  }}
                                />
                              )}
                            </Space>
                          </Card>
                        </Col>
                      </Row>
                    )
                  },
                  {
                    key: 'claims',
                    label: (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <MedicineBoxOutlined style={{ marginRight: '8px' }} />
                        Claims Details ({batchDetailsData?.batchDetails?.length || 0})
                      </div>
                    ),
                    children: (
                      batchDetailsData?.batchDetails && batchDetailsData.batchDetails.length > 0 ? (
                        <div style={{ 
                          maxHeight: '600px', 
                          overflowY: 'auto',
                          paddingRight: '8px'
                        }}>
                          <Collapse 
                            size="small"
                            ghost
                            expandIcon={({ isActive }) => (
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: isActive ? '#005399' : '#F0F0F0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease'
                              }}>
                                <FileTextOutlined 
                                  style={{ 
                                    color: isActive ? 'white' : '#666',
                                    fontSize: '12px'
                                  }} 
                                />
                              </div>
                            )}
                          >
                            {batchDetailsData.batchDetails.map((detail, index) => {
                              const claim = detail.Claim || {};
                              const trip = claim.Trip || {};
                              const patient = trip.TripMember || {};
                              const charges = claim.charges || [];
                              const locations = trip.legs || [];
                              
                              return (
                                <Panel 
                                  header={
                                    <div style={{
                                      background: 'linear-gradient(135deg, #F8FAFC 0%, #E8F4FD 100%)',
                                      padding: '16px',
                                      borderRadius: '12px',
                                      border: '1px solid #E1E1E1',
                                      margin: '8px 0'
                                    }}>
                                      <Row justify="space-between" align="middle">
                                        <Col>
                                          <Space wrap>
                                            <Tag 
                                              style={{
                                                backgroundColor: '#F3FAFF',
                                                color: '#005399',
                                                border: '1px solid #26BC98',
                                                borderRadius: '16px',
                                                padding: '4px 12px',
                                                fontSize: '13px',
                                                fontWeight: '600'
                                              }}
                                            >
                                              #{claim.claim_number || claim.claim_id}
                                            </Tag>
                                            {claim.service_from_date && (
                                              <Tag 
                                                style={{
                                                  backgroundColor: '#fff7e6',
                                                  color: '#fa8c16',
                                                  border: '1px solid #ffd591',
                                                  borderRadius: '16px',
                                                  padding: '4px 12px',
                                                  fontSize: '12px',
                                                  fontWeight: '500'
                                                }}
                                                icon={<CalendarOutlined />}
                                              >
                                                {dayjs(claim.service_from_date).format('MMM DD, YYYY')}
                                              </Tag>
                                            )}
                                            {patient.first_name && (
                                              <Tag 
                                                style={{
                                                  backgroundColor: '#f6ffed',
                                                  color: '#52c41a',
                                                  border: '1px solid #b7eb8f',
                                                  borderRadius: '16px',
                                                  padding: '4px 12px',
                                                  fontSize: '12px',
                                                  fontWeight: '500'
                                                }}
                                                icon={<UserOutlined />}
                                              >
                                                {patient.first_name} {patient.last_name}
                                              </Tag>
                                            )}
                                          </Space>
                                        </Col>
                                        <Col>
                                          <div style={{
                                            background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                                            color: 'white',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)'
                                          }}>
                                            ${parseFloat(detail.claim_amount || 0).toFixed(2)}
                                          </div>
                                        </Col>
                                      </Row>
                                    </div>
                                  } 
                                  key={index}
                                >
                                  <Row gutter={24} style={{ marginTop: '16px' }}>
                                    <Col span={8}>
                                      <Card 
                                        title={
                                          <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <FileTextOutlined style={{ 
                                              color: '#005399', 
                                              marginRight: '8px',
                                              fontSize: '16px'
                                            }} />
                                            <Text strong style={{ color: '#005399' }}>
                                              Claim Information
                                            </Text>
                                          </div>
                                        }
                                        size="small" 
                                        type="inner"
                                        style={{
                                          borderRadius: '8px',
                                          border: '1px solid #E1E1E1'
                                        }}
                                        headStyle={{
                                          background: 'linear-gradient(to right, #F3FAFF, #ffffff)',
                                          borderBottom: '1px solid #E1E1E1',
                                          minHeight: '48px'
                                        }}
                                      >
                                        <Descriptions column={1} size="small">
                                          <Descriptions.Item 
                                            label={<Text strong style={{ color: '#005399', fontSize: '12px' }}>Claim ID</Text>}
                                          >
                                            <Text code style={{ fontSize: '12px' }}>
                                              {claim.claim_id}
                                            </Text>
                                          </Descriptions.Item>
                                          <Descriptions.Item 
                                            label={<Text strong style={{ color: '#005399', fontSize: '12px' }}>Claim Number</Text>}
                                          >
                                            <Text style={{ fontSize: '12px' }}>
                                              {claim.claim_number || 'N/A'}
                                            </Text>
                                          </Descriptions.Item>
                                          <Descriptions.Item 
                                            label={<Text strong style={{ color: '#005399', fontSize: '12px' }}>Trip ID</Text>}
                                          >
                                            <Text code style={{ fontSize: '12px' }}>
                                              {trip.trip_id || 'N/A'}
                                            </Text>
                                          </Descriptions.Item>
                                          <Descriptions.Item 
                                            label={<Text strong style={{ color: '#005399', fontSize: '12px' }}>Service Date</Text>}
                                          >
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                              <CalendarOutlined style={{ 
                                                color: '#1890ff', 
                                                marginRight: '4px',
                                                fontSize: '12px'
                                              }} />
                                              <Text style={{ fontSize: '12px' }}>
                                                {trip.trip_date ? dayjs(trip.trip_date).format('MM/DD/YYYY') : 'N/A'}
                                              </Text>
                                            </div>
                                          </Descriptions.Item>
                                          <Descriptions.Item 
                                            label={<Text strong style={{ color: '#005399', fontSize: '12px' }}>Status</Text>}
                                          >
                                            <Tag 
                                              color={detail.status === 'processed' ? 'success' : 'processing'}
                                              style={{ fontSize: '11px' }}
                                            >
                                              {detail.status?.toUpperCase() || 'PENDING'}
                                            </Tag>
                                          </Descriptions.Item>
                                        </Descriptions>
                                      </Card>
                                    </Col>
                                    
                                    <Col span={8}>
                                      <Card 
                                        title={
                                          <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <UserOutlined style={{ 
                                              color: '#26BC98', 
                                              marginRight: '8px',
                                              fontSize: '16px'
                                            }} />
                                            <Text strong style={{ color: '#005399' }}>
                                              Patient Information
                                            </Text>
                                          </div>
                                        }
                                        size="small" 
                                        type="inner"
                                        style={{
                                          borderRadius: '8px',
                                          border: '1px solid #E1E1E1'
                                        }}
                                        headStyle={{
                                          background: 'linear-gradient(to right, #F3FAFF, #ffffff)',
                                          borderBottom: '1px solid #E1E1E1',
                                          minHeight: '48px'
                                        }}
                                      >
                                        <Descriptions column={1} size="small">
                                          <Descriptions.Item 
                                            label={<Text strong style={{ color: '#005399', fontSize: '12px' }}>Name</Text>}
                                          >
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                              <Avatar 
                                                size={20}
                                                style={{ 
                                                  backgroundColor: '#F3FAFF',
                                                  color: '#26BC98',
                                                  marginRight: '6px'
                                                }}
                                                icon={<UserOutlined style={{ fontSize: '10px' }} />}
                                              />
                                              <Text style={{ fontSize: '12px', fontWeight: '500' }}>
                                                {patient.first_name || 'N/A'} {patient.last_name || ''}
                                              </Text>
                                            </div>
                                          </Descriptions.Item>
                                          <Descriptions.Item 
                                            label={<Text strong style={{ color: '#005399', fontSize: '12px' }}>AHCCCS ID</Text>}
                                          >
                                            <Text code style={{ fontSize: '12px' }}>
                                              {patient.ahcccs_id || 'N/A'}
                                            </Text>
                                          </Descriptions.Item>
                                          <Descriptions.Item 
                                            label={<Text strong style={{ color: '#005399', fontSize: '12px' }}>DOB</Text>}
                                          >
                                            <Text style={{ fontSize: '12px' }}>
                                              {patient.dob ? dayjs(patient.dob).format('MM/DD/YYYY') : 'N/A'}
                                            </Text>
                                          </Descriptions.Item>
                                          <Descriptions.Item 
                                            label={<Text strong style={{ color: '#005399', fontSize: '12px' }}>Phone</Text>}
                                          >
                                            <Text style={{ fontSize: '12px' }}>
                                              {patient.phone_number || 'N/A'}
                                            </Text>
                                          </Descriptions.Item>
                                        </Descriptions>
                                      </Card>
                                    </Col>
                                    
                                    <Col span={8}>
                                      <Card 
                                        title={
                                          <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <MedicineBoxOutlined style={{ 
                                              color: '#52c41a', 
                                              marginRight: '8px',
                                              fontSize: '16px'
                                            }} />
                                            <Text strong style={{ color: '#005399' }}>
                                              Service Details
                                            </Text>
                                          </div>
                                        }
                                        size="small" 
                                        type="inner"
                                        style={{
                                          borderRadius: '8px',
                                          border: '1px solid #E1E1E1'
                                        }}
                                        headStyle={{
                                          background: 'linear-gradient(to right, #F3FAFF, #ffffff)',
                                          borderBottom: '1px solid #E1E1E1',
                                          minHeight: '48px'
                                        }}
                                      >
                                        <Descriptions column={1} size="small">
                                          <Descriptions.Item 
                                            label={<Text strong style={{ color: '#005399', fontSize: '12px' }}>Trip Type</Text>}
                                          >
                                            <Tag 
                                              color="blue"
                                              style={{ fontSize: '11px' }}
                                            >
                                              {trip.trip_type || 'N/A'}
                                            </Tag>
                                          </Descriptions.Item>
                                          <Descriptions.Item 
                                            label={<Text strong style={{ color: '#005399', fontSize: '12px' }}>Miles</Text>}
                                          >
                                            <Text style={{ fontSize: '12px' }}>
                                              {trip.total_miles || 'N/A'}
                                            </Text>
                                          </Descriptions.Item>
                                          <Descriptions.Item 
                                            label={<Text strong style={{ color: '#005399', fontSize: '12px' }}>Vehicle</Text>}
                                          >
                                            <Text style={{ fontSize: '12px' }}>
                                              {trip.vehicle_type || 'N/A'}
                                            </Text>
                                          </Descriptions.Item>
                                        </Descriptions>
                                        
                                        {charges.length > 0 && (
                                          <>
                                            <Divider style={{ margin: '12px 0' }} />
                                            <div style={{ marginBottom: '8px' }}>
                                              <Text strong style={{ color: '#005399', fontSize: '13px' }}>
                                                <MedicineBoxOutlined style={{ marginRight: '4px' }} />
                                                Charges
                                              </Text>
                                            </div>
                                            {charges.map((charge, chargeIndex) => (
                                              <div 
                                                key={chargeIndex} 
                                                style={{ 
                                                  marginBottom: '8px',
                                                  padding: '8px',
                                                  backgroundColor: '#F8FAFC',
                                                  borderRadius: '6px',
                                                  border: '1px solid #E1E1E1'
                                                }}
                                              >
                                                <div style={{ 
                                                  display: 'flex', 
                                                  justifyContent: 'space-between',
                                                  alignItems: 'center',
                                                  marginBottom: '4px'
                                                }}>
                                                  <Tag 
                                                    color="cyan"
                                                    style={{ 
                                                      fontSize: '11px',
                                                      margin: 0
                                                    }}
                                                  >
                                                    {charge.cpt_code || 'No CPT'}
                                                  </Tag>
                                                  <Text 
                                                    strong 
                                                    style={{ 
                                                      color: '#52c41a',
                                                      fontSize: '13px'
                                                    }}
                                                  >
                                                    ${parseFloat(charge.charge_amount || 0).toFixed(2)}
                                                  </Text>
                                                </div>
                                                {charge.description && (
                                                  <Text style={{ 
                                                    fontSize: '11px', 
                                                    color: '#666',
                                                    display: 'block',
                                                    marginTop: '2px'
                                                  }}>
                                                    {charge.description}
                                                  </Text>
                                                )}
                                              </div>
                                            ))}
                                          </>
                                        )}
                                      </Card>
                                    </Col>
                                  </Row>
                                  
                                  {locations && locations.length > 0 && (
                                    <>
                                      <Divider style={{ margin: '20px 0' }} />
                                      <Card 
                                        title={
                                          <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <EnvironmentOutlined style={{ 
                                              color: '#fa8c16', 
                                              marginRight: '8px',
                                              fontSize: '16px'
                                            }} />
                                            <Text strong style={{ color: '#005399' }}>
                                              Trip Locations
                                            </Text>
                                          </div>
                                        }
                                        size="small" 
                                        type="inner"
                                        style={{
                                          borderRadius: '8px',
                                          border: '1px solid #E1E1E1'
                                        }}
                                        headStyle={{
                                          background: 'linear-gradient(to right, #F3FAFF, #ffffff)',
                                          borderBottom: '1px solid #E1E1E1'
                                        }}
                                      >
                                        <Row gutter={16}>
                                          {locations.map((leg, locIndex) => (
                                            <React.Fragment key={locIndex}>
                                              {leg.pickupLocation && (
                                                <Col span={12}>
                                                  <Card 
                                                    size="small" 
                                                    style={{
                                                      backgroundColor: '#e6f7ff',
                                                      border: '1px solid #91d5ff',
                                                      borderRadius: '8px'
                                                    }}
                                                  >
                                                    <div style={{ 
                                                      display: 'flex', 
                                                      alignItems: 'center',
                                                      marginBottom: '8px'
                                                    }}>
                                                      <div style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#1890ff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginRight: '8px'
                                                      }}>
                                                        <EnvironmentOutlined 
                                                          style={{ 
                                                            color: 'white',
                                                            fontSize: '12px'
                                                          }} 
                                                        />
                                                      </div>
                                                      <Text strong style={{ 
                                                        color: '#1890ff',
                                                        fontSize: '13px'
                                                      }}>
                                                        PICKUP
                                                      </Text>
                                                    </div>
                                                    <Text style={{ 
                                                      fontSize: '12px',
                                                      display: 'block',
                                                      marginBottom: '4px'
                                                    }}>
                                                      {leg.pickupLocation.address || 'No address'}
                                                    </Text>
                                                    <Text 
                                                      type="secondary" 
                                                      style={{ fontSize: '11px' }}
                                                    >
                                                      {leg.pickupLocation.city || ''} {leg.pickupLocation.state || ''} {leg.pickupLocation.zip_code || ''}
                                                    </Text>
                                                  </Card>
                                                </Col>
                                              )}
                                              {leg.dropoffLocation && (
                                                <Col span={12}>
                                                  <Card 
                                                    size="small"
                                                    style={{
                                                      backgroundColor: '#f6ffed',
                                                      border: '1px solid #b7eb8f',
                                                      borderRadius: '8px'
                                                    }}
                                                  >
                                                    <div style={{ 
                                                      display: 'flex', 
                                                      alignItems: 'center',
                                                      marginBottom: '8px'
                                                    }}>
                                                      <div style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#52c41a',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginRight: '8px'
                                                      }}>
                                                        <EnvironmentOutlined 
                                                          style={{ 
                                                            color: 'white',
                                                            fontSize: '12px'
                                                          }} 
                                                        />
                                                      </div>
                                                      <Text strong style={{ 
                                                        color: '#52c41a',
                                                        fontSize: '13px'
                                                      }}>
                                                        DROPOFF
                                                      </Text>
                                                    </div>
                                                    <Text style={{ 
                                                      fontSize: '12px',
                                                      display: 'block',
                                                      marginBottom: '4px'
                                                    }}>
                                                      {leg.dropoffLocation.address || 'No address'}
                                                    </Text>
                                                    <Text 
                                                      type="secondary" 
                                                      style={{ fontSize: '11px' }}
                                                    >
                                                      {leg.dropoffLocation.city || ''} {leg.dropoffLocation.state || ''} {leg.dropoffLocation.zip_code || ''}
                                                    </Text>
                                                  </Card>
                                                </Col>
                                              )}
                                            </React.Fragment>
                                          ))}
                                        </Row>
                                      </Card>
                                    </>
                                  )}
                                </Panel>
                              );
                            })}
                          </Collapse>
                        </div>
                      ) : (
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '80px',
                          background: 'linear-gradient(145deg, #F8FAFC, #ffffff)',
                          borderRadius: '12px'
                        }}>
                          <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            backgroundColor: '#F3FAFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px auto',
                            border: '2px solid #E1E1E1'
                          }}>
                            <FileTextOutlined style={{ 
                              fontSize: '24px', 
                              color: '#666' 
                            }} />
                          </div>
                          <Title level={4} style={{ color: '#005399', marginBottom: '8px' }}>
                            No Claim Details Available
                          </Title>
                          <Text style={{ color: '#666', fontSize: '14px' }}>
                            This batch doesn't have detailed claim information to display.
                          </Text>
                        </div>
                      )
                    )
                  }
                ]}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BatchManagement;
