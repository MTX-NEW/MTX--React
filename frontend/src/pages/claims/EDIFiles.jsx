import React, { useState, useEffect } from 'react';
import { Card, Table, Button, message, Space, Tag, Modal, Tooltip, Spin, Alert } from 'antd';
import { 
  DownloadOutlined, 
  FileTextOutlined, 
  CalendarOutlined,
  EyeOutlined,
  CloudUploadOutlined,
  LoadingOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { claimsApi } from '@/api/claimsApi';
import dayjs from 'dayjs';
import { batchApi } from '../../api/batchApi';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('EDIFiles Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          message="Something went wrong"
          description="An error occurred while loading the EDI files. Please refresh the page."
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

const EDIFiles = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [ediGenerating, setEdiGenerating] = useState({});
  const [ediFiles, setEdiFiles] = useState([]);

  useEffect(() => {
    fetchClaims();
    fetchEdiFiles();
  }, []);

  const fetchClaims = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await claimsApi.getAllClaims({ status: 'generated' });
      // Handle the new response structure
      const claimsData = response.data?.data || response.data || [];
      setClaims(claimsData);
      
      if (isRefresh) {
        message.success(`Refreshed! Found ${claimsData.length} claims ready for EDI`);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load claims data';
      message.error(errorMessage);
      setClaims([]); // Set empty array on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEdiFiles = async () => {
    try {
      const response = await batchApi.getAllBatches();
      console.log('Batch API response:', response.data); // Debug log
      
      if (response.data && response.data.success && response.data.data) {
        const batches = response.data.data.batches || response.data.data || [];
        const batchFiles = batches
          .filter(batch => batch && batch.status === 'completed' && batch.edi_file_path)
          .map(batch => ({
            id: batch.batch_id || batch.id,
            filename: `batch_${batch.batch_number || batch.id}.edi`,
            batch_number: batch.batch_number,
            created_at: batch.created_at,
            updated_at: batch.updated_at,
            claim_count: batch.total_claims || 0,
            total_amount: batch.total_amount || 0,
            status: 'ready',
            file_path: batch.edi_file_path,
            type: 'batch'
          }));
        
        console.log('Processed batch files:', batchFiles); // Debug log
        setEdiFiles(batchFiles);
      } else {
        console.log('No batch data found or unsuccessful response');
        setEdiFiles([]);
      }
    } catch (error) {
      console.error('Error fetching EDI files:', error);
      setEdiFiles([]);
    }
  };

  const generateEDI = async (claimId) => {
    if (!claimId) {
      message.error('Invalid claim ID');
      return;
    }

    setEdiGenerating(prev => ({ ...prev, [claimId]: true }));
    
    try {
      message.loading('Generating EDI file...', 0.5);
      await claimsApi.generateEDIFile(claimId);
      message.success('EDI file generated successfully');
      fetchClaims(true);
      fetchEdiFiles();
    } catch (error) {
      console.error('Error generating EDI:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate EDI file';
      message.error(`Generation failed: ${errorMessage}`);
    } finally {
      setEdiGenerating(prev => ({ ...prev, [claimId]: false }));
    }
  };

  const downloadEDI = async (file) => {
    if (!file || !file.id) {
      message.error('Invalid file information');
      return;
    }

    try {
      if (file.type === 'batch') {
        // Download batch EDI file using the batchApi
        const response = await batchApi.downloadEDI(file.id);
        
        if (!response.data) {
          throw new Error('No file data received');
        }
        
        const blob = new Blob([response.data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.filename || `batch_${file.id}.edi`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        message.success(`Downloaded ${file.filename || 'EDI file'}`);
      } else {
        // Fallback for single claim EDI files
        message.info(`Downloading ${file.filename || 'EDI file'}...`);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to download file';
      message.error(`Download failed: ${errorMessage}`);
    }
  };

  const claimsColumns = [
    {
      title: 'Claim #',
      dataIndex: 'claim_number',
      key: 'claim_number',
      width: 120,
      render: (claimNumber) => (
        <Tag color="blue" icon={<FileTextOutlined />}>
          {claimNumber || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Trip ID',
      dataIndex: 'trip_id',
      key: 'trip_id',
      width: 80,
      render: (tripId) => tripId || 'N/A',
    },
    {
      title: 'Patient',
      key: 'patient',
      render: (_, record) => {
        const member = record?.Trip?.TripMember;
        if (member && member.first_name && member.last_name) {
          return `${member.first_name} ${member.last_name}`;
        }
        return 'N/A';
      },
    },
    {
      title: 'Amount',
      dataIndex: 'total_charge_amount',
      key: 'total_charge_amount',
      render: (amount) => `$${parseFloat(amount || 0).toFixed(2)}`,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? dayjs(date).format('MM/DD/YYYY HH:mm') : 'N/A',
    },
    {
      title: 'EDI Status',
      key: 'edi_status',
      render: (_, record) => (
        <Tag color={record?.edi_file_path ? 'success' : 'default'}>
          {record?.edi_file_path ? 'Generated' : 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Generate EDI">
            <Button 
              type="text" 
              icon={ediGenerating[record?.claim_id] ? <LoadingOutlined /> : <CloudUploadOutlined />} 
              onClick={() => generateEDI(record?.claim_id)}
              loading={ediGenerating[record?.claim_id]}
              disabled={!!record?.edi_file_path || !record?.claim_id}
            />
          </Tooltip>
          {record?.edi_file_path && (
            <Tooltip title="Download EDI">
              <Button 
                type="text" 
                icon={<DownloadOutlined />} 
                onClick={() => downloadEDI(record.edi_file_path)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const ediFilesColumns = [
    {
      title: 'File Name',
      dataIndex: 'filename',
      key: 'filename',
      render: (filename, record) => (
        <Space>
          <FileTextOutlined />
          <div>
            <div>{filename || 'N/A'}</div>
            {record?.batch_number && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                Batch: {record.batch_number}
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Claims Count',
      dataIndex: 'claim_count',
      key: 'claim_count',
      render: (count) => count || 0,
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => amount ? `$${parseFloat(amount).toFixed(2)}` : 'N/A',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'batch' ? 'blue' : 'green'}>
          {type === 'batch' ? 'Batch File' : 'Single Claim'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          ready: { color: 'success', text: 'Ready' },
          submitted: { color: 'processing', text: 'Submitted' },
          error: { color: 'error', text: 'Error' }
        };
        const config = statusConfig[status] || { color: 'default', text: status || 'Unknown' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? dayjs(date).format('MM/DD/YYYY HH:mm') : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (!record?.id) {
          return <span>N/A</span>;
        }
        
        return (
          <Space>
            <Tooltip title="Download">
              <Button 
                type="text" 
                icon={<DownloadOutlined />} 
                onClick={() => downloadEDI(record)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <ErrorBoundary>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2><FileTextOutlined /> EDI Files Management</h2>
          <p>Generate and manage EDI files for claim submissions</p>
        </div>

        {/* Action Bar */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div></div>
          <Button 
            onClick={() => {
              fetchClaims(true);
              fetchEdiFiles();
            }}
            loading={refreshing}
            icon={refreshing ? <LoadingOutlined /> : <ReloadOutlined />}
          >
            {refreshing ? 'Refreshing...' : 'Refresh All'}
          </Button>
        </div>

        {/* Claims Ready for EDI Generation */}
        <Card 
          title={`Claims Ready for EDI Generation (${claims?.length || 0})`} 
          style={{ marginBottom: '24px' }}
          extra={
            loading && (
              <Spin size="small" />
            )
          }
        >
          {claims && claims.length === 0 && !loading ? (
            <Alert 
              message="No claims found" 
              description="There are currently no claims with 'generated' status ready for EDI generation." 
              type="info" 
              showIcon 
            />
          ) : (
            <Table
              columns={claimsColumns}
              dataSource={claims || []}
              rowKey={(record) => record?.claim_id || record?.id || Math.random()}
              loading={loading || refreshing}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} claims`,
              }}
              size="middle"
              locale={{
                emptyText: loading ? 'Loading...' : 'No data available'
              }}
            />
          )}
        </Card>

        {/* Generated EDI Files */}
        <Card title={`Generated EDI Files (${ediFiles?.length || 0})`}>
          {ediFiles && ediFiles.length === 0 ? (
            <Alert 
              message="No EDI files found" 
              description="No completed batch files are available for download yet. Generate some batches first." 
              type="info" 
              showIcon 
            />
          ) : (
            <Table
              columns={ediFilesColumns}
              dataSource={ediFiles || []}
              rowKey={(record) => record?.id || record?.batch_id || Math.random()}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} files`,
              }}
              size="middle"
              locale={{
                emptyText: 'No EDI files available'
              }}
            />
          )}
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default EDIFiles;
