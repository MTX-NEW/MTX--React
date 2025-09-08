import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Space, 
  Badge, 
  Select, 
  DatePicker, 
  message, 
  Button, 
  Tooltip, 
  Modal, 
  Tag, 
  Descriptions, 
  Spin, 
  Alert,
  Row,
  Col,
  Statistic
} from 'antd';
import { PlusOutlined, SendOutlined, LoadingOutlined } from '@ant-design/icons';
import Claims from './Claims';
import { batchApi } from '@/api/batchApi';
import { toast } from 'react-toastify';

// Enhanced Claims Management component with batch selection functionality
const ClaimsManagement = () => {
  const [selectedClaimIds, setSelectedClaimIds] = useState([]);
  const [batchCreating, setBatchCreating] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [claims, setClaims] = useState([]);

  const createBatch = async () => {
    if (selectedClaimIds.length === 0) {
      toast.warning('Please select at least one claim to create a batch');
      return;
    }

    setBatchCreating(true);
    try {
      const response = await batchApi.createBatch({
        claim_ids: selectedClaimIds,
        created_by: 1 // Replace with actual user ID from context
      });

      if (response.data.success) {
        toast.success(`Batch created successfully! Batch #${response.data.data.batch.batch_number}`);
        setSelectedClaimIds([]);
        setBatchModalVisible(false);
        
        // Process the batch immediately
        await processBatch(response.data.data.batch.batch_id);
      } else {
        toast.error(response.data.error || 'Error creating batch');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('Failed to create batch');
    } finally {
      setBatchCreating(false);
    }
  };

  const processBatch = async (batchId) => {
    try {
      const response = await batchApi.processBatch(batchId);
      
      if (response.data.success) {
        toast.success('EDI file generated successfully!');
      } else {
        toast.error(response.data.error || 'Error processing batch');
      }
    } catch (error) {
      console.error('Error processing batch:', error);
      toast.error('Failed to process batch');
    }
  };

  const handleBatchGeneration = () => {
    if (selectedClaimIds.length === 0) {
      toast.warning('Please select at least one claim to create a batch');
      return;
    }
    setBatchModalVisible(true);
  };

  const selectedAmount = claims
    .filter(claim => selectedClaimIds.includes(claim.claim_id))
    .reduce((sum, claim) => sum + parseFloat(claim.total_charge_amount || 0), 0);

  // Create batch action bar component to pass to Claims
  const batchActionBar = selectedClaimIds.length > 0 ? (
    <Card style={{ marginBottom: '16px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
      <Row gutter={16} align="middle">
        <Col flex="auto">
          <Space>
            <Statistic 
              title="Selected Claims" 
              value={selectedClaimIds.length}
              valueStyle={{ color: '#3f8600', fontSize: '18px' }}
            />
            <Statistic 
              title="Total Amount" 
              value={selectedAmount} 
              prefix="$" 
              precision={2}
              valueStyle={{ color: '#3f8600', fontSize: '18px' }}
            />
          </Space>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleBatchGeneration}
              size="large"
            >
              Generate Batch EDI
            </Button>
            <Button
              onClick={() => setSelectedClaimIds([])}
              size="large"
            >
              Clear Selection
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  ) : null;

  return (
    <div>
      {/* Claims Component with Selection and Batch Action Bar */}
      <Claims 
        onSelectionChange={setSelectedClaimIds}
        selectedClaimIds={selectedClaimIds}
        onClaimsChange={setClaims}
        enableBatchSelection={true}
        batchActionBar={batchActionBar}
      />
   

      {/* Batch Confirmation Modal */}
      <Modal
        title="Create Batch for EDI Generation"
        open={batchModalVisible}
        onOk={createBatch}
        onCancel={() => setBatchModalVisible(false)}
        confirmLoading={batchCreating}
        okText={batchCreating ? "Creating..." : "Create & Generate EDI"}
      >
        <div>
          <p>You are about to create a batch with {selectedClaimIds.length} selected claims.</p>
          <p><strong>Total Amount:</strong> ${selectedAmount.toFixed(2)}</p>
          <p>Do you want to continue?</p>
        </div>
      </Modal>
    </div>
  );
};

export default ClaimsManagement;
