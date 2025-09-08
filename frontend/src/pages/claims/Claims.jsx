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
  Input,
  Row,
  Col,
  Statistic,
  Progress,
  Avatar,
  Typography
} from 'antd';
import { 
  FileTextOutlined, 
  DollarOutlined, 
  CalendarOutlined,
  UserOutlined,
  EyeOutlined,
  DownloadOutlined,
  MedicineBoxOutlined,
  IdcardOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SearchOutlined,
  ClearOutlined,
  DatabaseOutlined,
  FilterOutlined,
  PieChartOutlined,
  LineChartOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { claimsApi } from '@/api/claimsApi';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text, Title } = Typography;

const Claims = ({ 
  onSelectionChange, 
  selectedClaimIds = [], 
  onClaimsChange, 
  enableBatchSelection = false,
  batchActionBar = null
}) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [ediGenerating, setEdiGenerating] = useState({});
  const [filters, setFilters] = useState({
    status: null,
    dateRange: null,
    tripId: '',
    patientName: '',
    ahcccsId: '',
    claimNumber: '',
    amountRange: { min: '', max: '' },
    tripType: null,
    vehicleType: null,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, [filters]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+R or F5 for refresh
      if ((event.ctrlKey && event.key === 'r') || event.key === 'F5') {
        event.preventDefault();
        fetchClaims(true);
      }
      // Ctrl+Shift+C for clear filters
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        clearFilters();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchClaims = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.dateRange && filters.dateRange[0]) {
        params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
        params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
      }
      if (filters.tripId) params.tripId = filters.tripId;
      if (filters.patientName) params.patientName = filters.patientName;
      if (filters.ahcccsId) params.ahcccsId = filters.ahcccsId;
      if (filters.claimNumber) params.claimNumber = filters.claimNumber;
      if (filters.amountRange.min) params.minAmount = filters.amountRange.min;
      if (filters.amountRange.max) params.maxAmount = filters.amountRange.max;
      if (filters.tripType) params.tripType = filters.tripType;
      if (filters.vehicleType) params.vehicleType = filters.vehicleType;

      const response = await claimsApi.getAllClaims(params);
      const claimsData = response.data?.data || response.data || [];
      setClaims(claimsData);
      
      // Notify parent component about claims data
      if (onClaimsChange) {
        onClaimsChange(claimsData);
      }
      
      if (isRefresh) {
        toast.success(`Refreshed! Found ${claimsData.length} claims`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load claims data';
      toast.error('Error fetching claims:',errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      status: null,
      dateRange: null,
      tripId: '',
      patientName: '',
      ahcccsId: '',
      claimNumber: '',
      amountRange: { min: '', max: '' },
      tripType: null,
      vehicleType: null,
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'processing', text: 'Pending' },
      generated: { color: 'success', text: 'Generated' },
      submitted: { color: 'warning', text: 'Submitted' },
      paid: { color: 'success', text: 'Paid' },
      denied: { color: 'error', text: 'Denied' },
      cancelled: { color: 'default', text: 'Cancelled' },
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Badge color={config.color} text={config.text} />;
  };

  const viewClaimDetails = async (claim) => {
    setDetailLoading(true);
    try {
      const response = await claimsApi.getClaim(claim.claim_id);
      const claimData = response.data?.data || response.data;
      setSelectedClaim(claimData);
      setDetailModalVisible(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load claim details';
      toast.error('Error fetching claims:',errorMessage);
    } finally {
      setDetailLoading(false);
    }
  };

  const generateEDI = async (claimId) => {
    setEdiGenerating(prev => ({ ...prev, [claimId]: true }));
    
    try {
      await claimsApi.generateEDIFile(claimId);
    
      toast.success('EDI file generated successfully');
      fetchClaims(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to generate EDI file';
      toast.error('Error generating EDI:',errorMessage);
    } finally {
      setEdiGenerating(prev => ({ ...prev, [claimId]: false }));
    }
  };

  const columns = [
    {
      title: 'Claim #',
      dataIndex: 'claim_number',
      key: 'claim_number',
      width: 120,
      render: (claimNumber) => (
        <Tag color="blue" icon={<FileTextOutlined />}>
          {claimNumber}
        </Tag>
      ),
    },
    {
      title: 'Trip ID',
      dataIndex: 'trip_id',
      key: 'trip_id',
      width: 80,
    },
    {
      title: 'Patient',
      key: 'patient',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <div>
            {record.Trip?.TripMember ? 
              `${record.Trip.TripMember.first_name} ${record.Trip.TripMember.last_name}` : 
              'N/A'
            }
            {record.Trip?.TripMember?.ahcccs_id && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                <IdcardOutlined /> {record.Trip.TripMember.ahcccs_id}
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Service Date',
      dataIndex: 'service_from_date',
      key: 'service_from_date',
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format('MM/DD/YYYY')}
        </Space>
      ),
    },
    {
      title: 'Trip Type & Details',
      key: 'trip_details',
      render: (_, record) => {
        const trip = record.Trip;
        const member = trip?.TripMember;
        const vehicleType = member?.notes?.toLowerCase().includes('wheelchair') ? 'wheelchair' : 'ambulatory';
        
        // Use same rural city detection as backend
        const ruralCities = [
          'ahwatukee', 'ajo', 'apache_junction', 'avondale', 'benson', 'bisbee', 'buckeye',
          'bullhead_city', 'carefree', 'casa_grande', 'cave_creek', 'chandler', 'chino_valley',
          'clarkdale', 'clifton', 'colorado_city', 'coolidge', 'cornville', 'cottonwood',
          'dewey', 'douglas', 'eagar', 'el_mirage', 'eloy', 'flagstaff', 'florence',
          'fountain_hills', 'fredonia', 'gila_bend', 'gilbert', 'glendale', 'globe',
          'goodyear', 'green_valley', 'hayden', 'holbrook', 'huachuca_city', 'kearny',
          'kingman', 'lake_havasu_city', 'litchfield_park', 'mammoth', 'marana', 'maricopa',
          'mesa', 'miami', 'nogales', 'oro_valley', 'page', 'paradise_valley', 'parker',
          'patagonia', 'payson', 'peoria', 'phoenix', 'pima', 'prescott', 'prescott_valley',
          'quartzsite', 'queen_creek', 'safford', 'sahuarita', 'san_luis', 'scottsdale',
          'sedona', 'show_low', 'sierra_vista', 'snowflake', 'somerton', 'south_tucson',
          'springerville', 'st_johns', 'star_valley', 'superior', 'surprise', 'taylor',
          'tempe', 'thatcher', 'tolleson', 'tombstone', 'tusayan', 'wickenburg', 'willcox',
          'winkelman', 'winslow', 'youngtown', 'yuma', 'laveen', 'tucson', 'wadell',
          'blackwater', 'anthem'
        ];
        
        const pickupCity = member?.pickupLocation?.city || 'N/A';
        const dropoffCity = member?.dropoffLocation?.city || 'N/A';
        const isRural = ruralCities.includes(pickupCity.toLowerCase().trim()) || 
                       ruralCities.includes(dropoffCity.toLowerCase().trim());
        
        return (
          <Space direction="vertical" size="small">
            <div>
              <Tag color={trip?.trip_type === 'round_trip' ? 'orange' : 'blue'}>
                {trip?.trip_type?.replace('_', ' ').toUpperCase() || 'N/A'}
              </Tag>
              <Tag color={vehicleType === 'wheelchair' ? 'purple' : 'cyan'}>
                {vehicleType.toUpperCase()}
              </Tag>
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <div>
                📍 {pickupCity} → {dropoffCity}
                {isRural && <Tag size="small" color="green">RURAL</Tag>}
              </div>
              {trip?.total_distance && parseFloat(trip.total_distance) > 0 && (
                <div>🚗 {parseFloat(trip.total_distance).toFixed(1)} miles total</div>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'CPT Codes & Area Type',
      key: 'cpt_details',
      render: (_, record) => {
        const member = record.Trip?.TripMember;
        const vehicleType = member?.notes?.toLowerCase().includes('wheelchair') ? 'wheelchair' : 'ambulatory';
        
        // Use rural city detection from backend (matching claimController.js)
        const ruralCities = [
          'ahwatukee', 'ajo', 'apache_junction', 'avondale', 'benson', 'bisbee', 'buckeye',
          'bullhead_city', 'carefree', 'casa_grande', 'cave_creek', 'chandler', 'chino_valley',
          'clarkdale', 'clifton', 'colorado_city', 'coolidge', 'cornville', 'cottonwood',
          'dewey', 'douglas', 'eagar', 'el_mirage', 'eloy', 'flagstaff', 'florence',
          'fountain_hills', 'fredonia', 'gila_bend', 'gilbert', 'glendale', 'globe',
          'goodyear', 'green_valley', 'hayden', 'holbrook', 'huachuca_city', 'kearny',
          'kingman', 'lake_havasu_city', 'litchfield_park', 'mammoth', 'marana', 'maricopa',
          'mesa', 'miami', 'nogales', 'oro_valley', 'page', 'paradise_valley', 'parker',
          'patagonia', 'payson', 'peoria', 'phoenix', 'pima', 'prescott', 'prescott_valley',
          'quartzsite', 'queen_creek', 'safford', 'sahuarita', 'san_luis', 'scottsdale',
          'sedona', 'show_low', 'sierra_vista', 'snowflake', 'somerton', 'south_tucson',
          'springerville', 'st_johns', 'star_valley', 'superior', 'surprise', 'taylor',
          'tempe', 'thatcher', 'tolleson', 'tombstone', 'tusayan', 'wickenburg', 'willcox',
          'winkelman', 'winslow', 'youngtown', 'yuma', 'laveen', 'tucson', 'wadell',
          'blackwater', 'anthem'
        ];
        
        const pickupCity = member?.pickupLocation?.city || '';
        const dropoffCity = member?.dropoffLocation?.city || '';
        const isRural = ruralCities.includes(pickupCity.toLowerCase().trim()) || 
                       ruralCities.includes(dropoffCity.toLowerCase().trim());
        const areaType = isRural ? 'rural' : 'urban';
        
        // Show CPT codes from actual charges if available, otherwise show expected
        const actualCharges = record.charges || [];
        const transportCharge = actualCharges.find(charge => 
          charge.cpt_code === 'A0130' || charge.cpt_code === 'A0120'
        );
        const mileageCharge = actualCharges.find(charge => 
          charge.cpt_code === 'S0209' || charge.cpt_code === 'S0215'
        );
        
        // Fallback to expected CPT codes
        const transportCPT = transportCharge?.cpt_code || (vehicleType === 'wheelchair' ? 'A0130' : 'A0120');
        const mileageCPT = mileageCharge?.cpt_code || (vehicleType === 'wheelchair' ? 'S0209' : 'S0215');
        
        return (
          <Space direction="vertical" size="small">
            <div>
              <Tag color="green" style={{ marginBottom: '2px' }}>
                🚛 {transportCPT}
              </Tag>
              {transportCharge && (
                <span style={{ fontSize: '11px', color: '#666', marginLeft: '4px' }}>
                  ${parseFloat(transportCharge.charge_amount).toFixed(2)}
                </span>
              )}
            </div>
            <div>
              <Tag color="orange" style={{ marginBottom: '2px' }}>
                📏 {mileageCPT}
              </Tag>
              {mileageCharge && (
                <span style={{ fontSize: '11px', color: '#666', marginLeft: '4px' }}>
                  ${parseFloat(mileageCharge.charge_amount).toFixed(2)}
                </span>
              )}
            </div>
            <div style={{ fontSize: '10px', color: '#999' }}>
              {areaType.toUpperCase()} area
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_charge_amount',
      key: 'total_charge_amount',
      render: (amount, record) => {
        // Calculate total from charges if main amount is null/zero
        let totalAmount = parseFloat(amount || 0);
        
        if (totalAmount === 0 && record.charges?.length > 0) {
          totalAmount = record.charges.reduce((sum, charge) => 
            sum + parseFloat(charge.charge_amount || 0), 0
          );
        }
        
        return (
          <Space>
            <DollarOutlined />
            <strong>${totalAmount.toFixed(2)}</strong>
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusBadge(status),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('MM/DD/YYYY HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={detailLoading ? <LoadingOutlined /> : <EyeOutlined />} 
              onClick={() => viewClaimDetails(record)}
              loading={detailLoading}
            />
          </Tooltip>
          <Tooltip title="Generate EDI">
            <Button 
              type="text" 
              icon={ediGenerating[record.claim_id] ? <LoadingOutlined /> : <DownloadOutlined />} 
              onClick={() => generateEDI(record.claim_id)}
              loading={ediGenerating[record.claim_id]}
              disabled={record.status === 'cancelled'}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Row selection configuration for batch processing
  const rowSelection = enableBatchSelection ? {
    selectedRowKeys: selectedClaimIds,
    onChange: (selectedKeys) => {
      if (onSelectionChange) {
        onSelectionChange(selectedKeys);
      }
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      if (selected) {
        // Select all claims
        const allIds = claims.map(claim => claim.claim_id);
        console.log('Select all - all claims:', allIds);
        if (onSelectionChange) {
          onSelectionChange(allIds);
        }
      } else {
        if (onSelectionChange) {
          onSelectionChange([]);
        }
      }
    },
    getCheckboxProps: (record) => ({
      name: record.claim_number,
    }),
  } : undefined;

  // Add custom styles for enhanced UI
  const customStyles = `
    .claims-table-row:hover {
      background-color: #F8FAFC !important;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .ant-table-thead > tr > th {
      background: linear-gradient(to right, #F8FAFC, #F3FAFF) !important;
      color: #005399 !important;
      font-weight: 600 !important;
      border-bottom: 2px solid #E1E1E1 !important;
    }
    .ant-card {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      border: 1px solid #E5E7EB !important;
    }
    .claims-stats-card:hover {
      transform: translateY(-2px);
      transition: all 0.3s ease;
    }
  `;

  // Inject custom styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#F8FAFC',
      minHeight: '100vh',
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
              icon={<MedicineBoxOutlined style={{ fontSize: '28px' }} />} 
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
              Claims Management Center
            </Title>
            <Text style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '16px',
              display: 'block',
              marginTop: '8px'
            }}>
              Comprehensive claims processing, filtering, and batch management system
            </Text>
          </Col>
          <Col>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                {claims.length}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Total Claims
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      {(() => {
        const stats = {
          total: claims.length,
          pending: claims.filter(c => c.status === 'pending').length,
          generated: claims.filter(c => c.status === 'generated').length,
          paid: claims.filter(c => c.status === 'paid').length,
          denied: claims.filter(c => c.status === 'denied').length,
          totalAmount: claims.reduce((sum, claim) => {
            const amount = parseFloat(claim.total_charge_amount || 0);
            if (amount === 0 && claim.charges?.length > 0) {
              return sum + claim.charges.reduce((chargeSum, charge) => 
                chargeSum + parseFloat(charge.charge_amount || 0), 0
              );
            }
            return sum + amount;
          }, 0),
        };

        return (
          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card
                hoverable
                className="claims-stats-card"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500' }}>
                      Total Claims
                    </Text>
                    <div style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginTop: '4px' }}>
                      {stats.total}
                    </div>
                  </div>
                  <Avatar 
                    size={48} 
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }} 
                    icon={<DatabaseOutlined style={{ fontSize: '20px', color: 'white' }} />} 
                  />
                </div>
                <Progress 
                  percent={100} 
                  showInfo={false} 
                  strokeColor="rgba(255,255,255,0.3)"
                  trailColor="rgba(255,255,255,0.1)"
                  size="small"
                  style={{ marginTop: '12px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card
                hoverable
                className="claims-stats-card"
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(240, 147, 251, 0.15)',
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
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }} 
                    icon={<ClockCircleOutlined style={{ fontSize: '20px', color: 'white' }} />} 
                  />
                </div>
                <Progress 
                  percent={stats.total > 0 ? (stats.pending / stats.total) * 100 : 0} 
                  showInfo={false} 
                  strokeColor="rgba(255,255,255,0.3)"
                  trailColor="rgba(255,255,255,0.1)"
                  size="small"
                  style={{ marginTop: '12px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card
                hoverable
                className="claims-stats-card"
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(79, 172, 254, 0.15)',
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500' }}>
                      Generated
                    </Text>
                    <div style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginTop: '4px' }}>
                      {stats.generated}
                    </div>
                  </div>
                  <Avatar 
                    size={48} 
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }} 
                    icon={<SyncOutlined style={{ fontSize: '20px', color: 'white' }} />} 
                  />
                </div>
                <Progress 
                  percent={stats.total > 0 ? (stats.generated / stats.total) * 100 : 0} 
                  showInfo={false} 
                  strokeColor="rgba(255,255,255,0.3)"
                  trailColor="rgba(255,255,255,0.1)"
                  size="small"
                  style={{ marginTop: '12px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card
                hoverable
                className="claims-stats-card"
                style={{
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(67, 233, 123, 0.15)',
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500' }}>
                      Paid
                    </Text>
                    <div style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginTop: '4px' }}>
                      {stats.paid}
                    </div>
                  </div>
                  <Avatar 
                    size={48} 
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }} 
                    icon={<CheckCircleOutlined style={{ fontSize: '20px', color: 'white' }} />} 
                  />
                </div>
                <Progress 
                  percent={stats.total > 0 ? (stats.paid / stats.total) * 100 : 0} 
                  showInfo={false} 
                  strokeColor="rgba(255,255,255,0.3)"
                  trailColor="rgba(255,255,255,0.1)"
                  size="small"
                  style={{ marginTop: '12px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card
                hoverable
                className="claims-stats-card"
                style={{
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(250, 112, 154, 0.15)',
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500' }}>
                      Denied
                    </Text>
                    <div style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginTop: '4px' }}>
                      {stats.denied}
                    </div>
                  </div>
                  <Avatar 
                    size={48} 
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }} 
                    icon={<ExclamationCircleOutlined style={{ fontSize: '20px', color: 'white' }} />} 
                  />
                </div>
                <Progress 
                  percent={stats.total > 0 ? (stats.denied / stats.total) * 100 : 0} 
                  showInfo={false} 
                  strokeColor="rgba(255,255,255,0.3)"
                  trailColor="rgba(255,255,255,0.1)"
                  size="small"
                  style={{ marginTop: '12px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card
                hoverable
                className="claims-stats-card"
                style={{
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(168, 237, 234, 0.15)',
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: '14px', fontWeight: '500' }}>
                      Total Amount
                    </Text>
                    <div style={{ color: '#1a202c', fontSize: '20px', fontWeight: '700', marginTop: '4px' }}>
                      ${stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <Avatar 
                    size={48} 
                    style={{ 
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }} 
                    icon={<DollarOutlined style={{ fontSize: '20px', color: '#1a202c' }} />} 
                  />
                </div>
                
              </Card>
            </Col>
          </Row>
        );
      })()}

      {/* Enhanced Filters */}
      <Card style={{ 
        marginBottom: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          marginBottom: '24px',
          padding: '16px 0',
          borderBottom: '1px solid #F3F4F6'
        }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={4} style={{ 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center',
                color: '#005399',
                fontSize: '18px'
              }}>
                <FilterOutlined style={{ 
                  marginRight: '12px',
                  padding: '6px',
                  backgroundColor: '#F3FAFF',
                  borderRadius: '6px',
                  color: '#005399'
                }} />
                Search & Filter Claims
              </Title>
            </Col>
          </Row>
        </div>
        
        {/* Active Filters Display */}
        {(filters.status || filters.tripId || filters.patientName || filters.ahcccsId || filters.claimNumber || 
          filters.amountRange.min || filters.amountRange.max || filters.tripType || filters.vehicleType || 
          filters.dateRange) && (
          <div style={{ 
            marginBottom: '24px', 
            padding: '16px', 
            backgroundColor: 'linear-gradient(135deg, #F3FAFF 0%, #F8FAFC 100%)', 
            borderRadius: '8px',
            border: '1px solid #E1F5FE'
          }}>
            <div style={{ fontSize: '14px', color: '#005399', marginBottom: '8px', fontWeight: '600' }}>
              <PieChartOutlined style={{ marginRight: '6px' }} />
              Active Filters:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {filters.status && <Tag color="#005399" closable onClose={() => setFilters(prev => ({ ...prev, status: null }))}>Status: {filters.status}</Tag>}
              {filters.tripId && <Tag color="#26BC98" closable onClose={() => setFilters(prev => ({ ...prev, tripId: '' }))}>Trip ID: {filters.tripId}</Tag>}
              {filters.patientName && <Tag color="#667eea" closable onClose={() => setFilters(prev => ({ ...prev, patientName: '' }))}>Patient: {filters.patientName}</Tag>}
              {filters.ahcccsId && <Tag color="#f093fb" closable onClose={() => setFilters(prev => ({ ...prev, ahcccsId: '' }))}>AHCCCS: {filters.ahcccsId}</Tag>}
              {filters.claimNumber && <Tag color="#4facfe" closable onClose={() => setFilters(prev => ({ ...prev, claimNumber: '' }))}>Claim #: {filters.claimNumber}</Tag>}
              {filters.tripType && <Tag color="#43e97b" closable onClose={() => setFilters(prev => ({ ...prev, tripType: null }))}>Trip Type: {filters.tripType}</Tag>}
              {filters.vehicleType && <Tag color="#fa709a" closable onClose={() => setFilters(prev => ({ ...prev, vehicleType: null }))}>Vehicle: {filters.vehicleType}</Tag>}
              {(filters.amountRange.min || filters.amountRange.max) && (
                <Tag color="#764ba2" closable onClose={() => setFilters(prev => ({ ...prev, amountRange: { min: '', max: '' } }))}>
                  Amount: ${filters.amountRange.min || '0'} - ${filters.amountRange.max || '∞'}
                </Tag>
              )}
              {filters.dateRange && (
                <Tag color="#38f9d7" closable onClose={() => setFilters(prev => ({ ...prev, dateRange: null }))}>
                  Date: {filters.dateRange[0].format('MM/DD/YY')} - {filters.dateRange[1].format('MM/DD/YY')}
                </Tag>
              )}
            </div>
          </div>
        )}
        
        {/* Filter Controls */}
        <Row gutter={[16, 16]}>
          {/* First Row - Basic Filters */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong style={{ color: '#374151', fontSize: '14px' }}>Status:</Text>
            </div>
            <Select
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              style={{ width: '100%' }}
              placeholder="All Status"
              allowClear
              size="large"
            >
              <Option value="pending">🟡 Pending</Option>
              <Option value="generated">🔄 Generated</Option>
              <Option value="submitted">📤 Submitted</Option>
              <Option value="paid">✅ Paid</Option>
              <Option value="denied">❌ Denied</Option>
              <Option value="cancelled">⏹️ Cancelled</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong style={{ color: '#374151', fontSize: '14px' }}>Date Range:</Text>
            </div>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
              style={{ width: '100%' }}
              placeholder={['Start Date', 'End Date']}
              size="large"
            />
          </Col>

          <Col xs={24} sm={12} md={5}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong style={{ color: '#374151', fontSize: '14px' }}>Trip ID:</Text>
            </div>
            <Input
              value={filters.tripId}
              onChange={(e) => setFilters(prev => ({ ...prev, tripId: e.target.value }))}
              placeholder="Enter Trip ID"
              allowClear
              size="large"
              prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
            />
          </Col>

          <Col xs={24} sm={12} md={5}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong style={{ color: '#374151', fontSize: '14px' }}>Claim #:</Text>
            </div>
            <Input
              value={filters.claimNumber}
              onChange={(e) => setFilters(prev => ({ ...prev, claimNumber: e.target.value }))}
              placeholder="Enter Claim #"
              allowClear
              size="large"
              prefix={<FileTextOutlined style={{ color: '#9CA3AF' }} />}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          {/* Second Row - Advanced Filters */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong style={{ color: '#374151', fontSize: '14px' }}>Patient Name:</Text>
            </div>
            <Input
              value={filters.patientName}
              onChange={(e) => setFilters(prev => ({ ...prev, patientName: e.target.value }))}
              placeholder="Enter patient name"
              allowClear
              size="large"
              prefix={<UserOutlined style={{ color: '#9CA3AF' }} />}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong style={{ color: '#374151', fontSize: '14px' }}>AHCCCS ID:</Text>
            </div>
            <Input
              value={filters.ahcccsId}
              onChange={(e) => setFilters(prev => ({ ...prev, ahcccsId: e.target.value }))}
              placeholder="Enter AHCCCS ID"
              allowClear
              size="large"
              prefix={<IdcardOutlined style={{ color: '#9CA3AF' }} />}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong style={{ color: '#374151', fontSize: '14px' }}>Trip Type:</Text>
            </div>
            <Select
              value={filters.tripType}
              onChange={(value) => setFilters(prev => ({ ...prev, tripType: value }))}
              style={{ width: '100%' }}
              placeholder="All Types"
              allowClear
              size="large"
            >
              <Option value="one_way">🚗 One Way</Option>
              <Option value="round_trip">🔄 Round Trip</Option>
              <Option value="multiple">🗺️ Multi-Stop</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong style={{ color: '#374151', fontSize: '14px' }}>Vehicle Type:</Text>
            </div>
            <Select
              value={filters.vehicleType}
              onChange={(value) => setFilters(prev => ({ ...prev, vehicleType: value }))}
              style={{ width: '100%' }}
              placeholder="All Vehicles"
              allowClear
              size="large"
            >
              <Option value="ambulatory">🚶 Ambulatory</Option>
              <Option value="wheelchair">♿ Wheelchair</Option>
            </Select>
          </Col>
        </Row>

        {/* Third Row - Amount Range & Actions */}
        {/* <Row gutter={[16, 16]} align="middle" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong style={{ color: '#374151', fontSize: '14px' }}>Amount Range:</Text>
            </div>
            <Input.Group compact>
              <Input
                value={filters.amountRange.min}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  amountRange: { ...prev.amountRange, min: e.target.value }
                }))}
                placeholder="Min $"
                style={{ width: '45%' }}
                type="number"
                min="0"
                step="0.01"
                size="large"
                prefix={<DollarOutlined style={{ color: '#9CA3AF' }} />}
              />
              <Input
                style={{ width: '10%', textAlign: 'center', pointerEvents: 'none' }}
                placeholder="~"
                disabled
                size="large"
              />
              <Input
                value={filters.amountRange.max}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  amountRange: { ...prev.amountRange, max: e.target.value }
                }))}
                placeholder="Max $"
                style={{ width: '45%' }}
                type="number"
                min="0"
                step="0.01"
                size="large"
                prefix={<DollarOutlined style={{ color: '#9CA3AF' }} />}
              />
            </Input.Group>
          </Col>

          <Col xs={24} sm={12} md={16}>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Tooltip title="Clear all active filters (Ctrl+Shift+C)">
                <Button 
                  onClick={clearFilters}
                  icon={<ClearOutlined />}
                  size="large"
                  style={{
                    borderColor: '#E5E7EB',
                    color: '#6B7280'
                  }}
                >
                  Clear Filters
                </Button>
              </Tooltip>
              
              <Tooltip title="Refresh claims data (Ctrl+R)">
                <Button 
                  onClick={() => fetchClaims(true)}
                  loading={refreshing}
                  icon={refreshing ? <LoadingOutlined /> : <ReloadOutlined />}
                  type="primary"
                  size="large"
                  style={{
                    background: 'linear-gradient(135deg, #005399 0%, #26BC98 100%)',
                    border: 'none',
                    borderRadius: '6px'
                  }}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              </Tooltip>
            </div>
          </Col>
        </Row> */}
      </Card>

      {/* Batch Action Bar - positioned right above the table */}
      {batchActionBar}

      {/* Claims Table */}
      <Card title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Generated Claims ({claims.length})</span>
          {(filters.status || filters.tripId || filters.patientName || filters.ahcccsId || filters.claimNumber || 
            filters.amountRange.min || filters.amountRange.max || filters.tripType || filters.vehicleType || 
            filters.dateRange) && (
            <Tag color="blue" style={{ margin: 0 }}>
              <SearchOutlined style={{ marginRight: '4px' }} />
              Filtered Results
            </Tag>
          )}
        </div>
      }>
        <Table
          columns={columns}
          dataSource={claims}
          rowKey="claim_id"
          rowSelection={rowSelection}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} claims`,
          }}
          size="middle"
        />
      </Card>

      {/* Claim Details Modal */}
      <Modal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={1000}
      >
        {selectedClaim && (
          <div>
            {/* Basic Claim Info */}
            <div style={{ marginBottom: '24px' }}>
              <h3>🏥 Claim Overview</h3>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Claim Number">{selectedClaim.claim_number}</Descriptions.Item>
                <Descriptions.Item label="Trip ID">{selectedClaim.trip_id}</Descriptions.Item>
                <Descriptions.Item label="Patient">
                  {selectedClaim.Trip?.TripMember ? 
                    `${selectedClaim.Trip.TripMember.first_name} ${selectedClaim.Trip.TripMember.last_name}` : 
                    'N/A'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="AHCCCS ID">
                  {selectedClaim.Trip?.TripMember?.ahcccs_id || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Service Date">
                  {dayjs(selectedClaim.service_from_date).format('MM/DD/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {getStatusBadge(selectedClaim.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Total Amount">
                  <strong style={{ color: '#1890ff', fontSize: '16px' }}>
                    ${parseFloat(selectedClaim.total_charge_amount || 
                      (selectedClaim.charges?.reduce((sum, charge) => sum + parseFloat(charge.charge_amount || 0), 0)) || 0).toFixed(2)}
                  </strong>
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {dayjs(selectedClaim.created_at).format('MM/DD/YYYY HH:mm')}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Trip Details */}
            {selectedClaim.Trip && (
              <div style={{ marginBottom: '24px' }}>
                <h3>🚐 Trip Information</h3>
                {(() => {
                  const trip = selectedClaim.Trip;
                  const member = trip.TripMember;
                  const vehicleType = member?.notes?.toLowerCase().includes('wheelchair') ? 'wheelchair' : 'ambulatory';
                  const pickupLocation = member?.pickupLocation;
                  const dropoffLocation = member?.dropoffLocation;
                  
                  // Use same rural city detection as backend
                  const ruralCities = [
                    'ahwatukee', 'ajo', 'apache_junction', 'avondale', 'benson', 'bisbee', 'buckeye',
                    'bullhead_city', 'carefree', 'casa_grande', 'cave_creek', 'chandler', 'chino_valley',
                    'clarkdale', 'clifton', 'colorado_city', 'coolidge', 'cornville', 'cottonwood',
                    'dewey', 'douglas', 'eagar', 'el_mirage', 'eloy', 'flagstaff', 'florence',
                    'fountain_hills', 'fredonia', 'gila_bend', 'gilbert', 'glendale', 'globe',
                    'goodyear', 'green_valley', 'hayden', 'holbrook', 'huachuca_city', 'kearny',
                    'kingman', 'lake_havasu_city', 'litchfield_park', 'mammoth', 'marana', 'maricopa',
                    'mesa', 'miami', 'nogales', 'oro_valley', 'page', 'paradise_valley', 'parker',
                    'patagonia', 'payson', 'peoria', 'phoenix', 'pima', 'prescott', 'prescott_valley',
                    'quartzsite', 'queen_creek', 'safford', 'sahuarita', 'san_luis', 'scottsdale',
                    'sedona', 'show_low', 'sierra_vista', 'snowflake', 'somerton', 'south_tucson',
                    'springerville', 'st_johns', 'star_valley', 'superior', 'surprise', 'taylor',
                    'tempe', 'thatcher', 'tolleson', 'tombstone', 'tusayan', 'wickenburg', 'willcox',
                    'winkelman', 'winslow', 'youngtown', 'yuma', 'laveen', 'tucson', 'wadell',
                    'blackwater', 'anthem'
                  ];
                  
                  const pickupCity = pickupLocation?.city || '';
                  const dropoffCity = dropoffLocation?.city || '';
                  const isRural = ruralCities.includes(pickupCity.toLowerCase().trim()) || 
                                 ruralCities.includes(dropoffCity.toLowerCase().trim());
                  const areaType = isRural ? 'rural' : 'urban';
                  const isRoundTrip = trip.trip_type === 'round_trip' || (trip.legs?.length > 1);
                  const totalMiles = trip.total_distance ? parseFloat(trip.total_distance) : 0;
                  
                  // Calculate rate breakdown
                  const rates = {
                    ambulatory: {
                      urban: { base: 6.64, mileage: 1.28 },
                      rural: { base: 7.27, mileage: 1.53 }
                    },
                    wheelchair: {
                      urban: { base: 11.15, mileage: 1.54 },
                      rural: { base: 12.21, mileage: 1.66 }
                    }
                  };
                  
                  return (
                    <Descriptions bordered column={2} size="small">
                      <Descriptions.Item label="Trip Type">
                        <Tag color={trip.trip_type === 'round_trip' ? 'orange' : 'blue'}>
                          {trip.trip_type?.replace('_', ' ').toUpperCase() || 'N/A'}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Vehicle Type">
                        <Tag color={vehicleType === 'wheelchair' ? 'purple' : 'cyan'}>
                          {vehicleType.toUpperCase()}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Service Area">
                        <Tag color={isRural ? 'green' : 'blue'}>
                          {areaType.toUpperCase()}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Total Distance">
                        {totalMiles && totalMiles > 0 ? `${totalMiles.toFixed(2)} miles` : 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Pickup Location" span={2}>
                        {pickupLocation ? 
                          `${pickupLocation.street_address}, ${pickupLocation.city}, ${pickupLocation.state} ${pickupLocation.zip}` : 
                          'N/A'
                        }
                      </Descriptions.Item>
                      <Descriptions.Item label="Dropoff Location" span={2}>
                        {dropoffLocation ? 
                          `${dropoffLocation.street_address}, ${dropoffLocation.city}, ${dropoffLocation.state} ${dropoffLocation.zip}` : 
                          'N/A'
                        }
                      </Descriptions.Item>
                      {member?.notes && (
                        <Descriptions.Item label="Special Requirements" span={2}>
                          <Tag color="orange">{member.notes}</Tag>
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  );
                })()}
              </div>
            )}

            {/* Rate Calculation Breakdown - Show detailed calculations */}
            {selectedClaim.charges?.length > 0 && selectedClaim.Trip && (
              <div style={{ marginBottom: '24px' }}>
                <h3>💰 Billing Charges with Calculation Details</h3>
                {(() => {
                  const trip = selectedClaim.Trip;
                  const member = trip.TripMember;
                  const vehicleType = member?.notes?.toLowerCase().includes('wheelchair') ? 'wheelchair' : 'ambulatory';
                  const pickupLocation = member?.pickupLocation;
                  const dropoffLocation = member?.dropoffLocation;
                  
                  // Use same rural city detection as backend
                  const ruralCities = [
                    'ahwatukee', 'ajo', 'apache_junction', 'avondale', 'benson', 'bisbee', 'buckeye',
                    'bullhead_city', 'carefree', 'casa_grande', 'cave_creek', 'chandler', 'chino_valley',
                    'clarkdale', 'clifton', 'colorado_city', 'coolidge', 'cornville', 'cottonwood',
                    'dewey', 'douglas', 'eagar', 'el_mirage', 'eloy', 'flagstaff', 'florence',
                    'fountain_hills', 'fredonia', 'gila_bend', 'gilbert', 'glendale', 'globe',
                    'goodyear', 'green_valley', 'hayden', 'holbrook', 'huachuca_city', 'kearny',
                    'kingman', 'lake_havasu_city', 'litchfield_park', 'mammoth', 'marana', 'maricopa',
                    'mesa', 'miami', 'nogales', 'oro_valley', 'page', 'paradise_valley', 'parker',
                    'patagonia', 'payson', 'peoria', 'phoenix', 'pima', 'prescott', 'prescott_valley',
                    'quartzsite', 'queen_creek', 'safford', 'sahuarita', 'san_luis', 'scottsdale',
                    'sedona', 'show_low', 'sierra_vista', 'snowflake', 'somerton', 'south_tucson',
                    'springerville', 'st_johns', 'star_valley', 'superior', 'surprise', 'taylor',
                    'tempe', 'thatcher', 'tolleson', 'tombstone', 'tusayan', 'wickenburg', 'willcox',
                    'winkelman', 'winslow', 'youngtown', 'yuma', 'laveen', 'tucson', 'wadell',
                    'blackwater', 'anthem'
                  ];
                  
                  const pickupCity = pickupLocation?.city || '';
                  const dropoffCity = dropoffLocation?.city || '';
                  const isRural = ruralCities.includes(pickupCity.toLowerCase().trim()) || 
                                 ruralCities.includes(dropoffCity.toLowerCase().trim());
                  const areaType = isRural ? 'rural' : 'urban';
                  const isRoundTrip = trip.trip_type === 'round_trip';
                  
                  // MedTrns legacy rates (from backend)
                  const rates = {
                    ambulatory: {
                      urban: { base: 7.21, mileage: 1.32 },
                      rural: { base: 7.90, mileage: 1.53 }
                    },
                    wheelchair: {
                      urban: { base: 12.13, mileage: 1.54 },
                      rural: { base: 9.41, mileage: 1.66 }
                    }
                  };
                  
                  const rateConfig = rates[vehicleType][areaType];
                  const originalMileage = parseFloat(trip.total_distance || 0);
                  
                  // Calculate fudge factor like backend
                  let adjustedMileage = originalMileage;
                  let fudgeFactor = 0;
                  if (originalMileage >= 5.0 && originalMileage < 10.0) {
                    fudgeFactor = 2.0;
                    adjustedMileage = originalMileage + fudgeFactor;
                  } else if (originalMileage >= 10.0) {
                    fudgeFactor = 3.0;
                    adjustedMileage = originalMileage + fudgeFactor;
                  }
                  
                  // Apply minimum mileage for round trips with 0 distance
                  if (originalMileage === 0 && isRoundTrip) {
                    adjustedMileage = 10.0;
                  }
                  
                  // Round up like backend
                  const finalMileage = Math.ceil(adjustedMileage);
                  
                  const transportCharge = selectedClaim.charges.find(c => c.cpt_code === 'A0130' || c.cpt_code === 'A0120');
                  const mileageCharge = selectedClaim.charges.find(c => c.cpt_code === 'S0209' || c.cpt_code === 'S0215');
                  
                  return (
                    <div style={{ backgroundColor: '#f0f8ff', padding: '16px', borderRadius: '6px' }}>
                      {/* Calculation Overview */}
                      <div style={{ marginBottom: '20px', backgroundColor: '#e6f7ff', padding: '12px', borderRadius: '4px' }}>
                        <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>📊 Calculation Summary</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          <div><strong>Vehicle Type:</strong> {vehicleType.toUpperCase()}</div>
                          <div><strong>Area Type:</strong> {areaType.toUpperCase()}</div>
                          <div><strong>Trip Type:</strong> {isRoundTrip ? 'ROUND TRIP' : 'ONE WAY'}</div>
                          <div><strong>Route:</strong> {pickupCity} → {dropoffCity}</div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                        {/* Transport Charge Calculation */}
                        {transportCharge && (
                          <div style={{ 
                            border: '2px solid #1890ff', 
                            padding: '16px', 
                            borderRadius: '8px',
                            backgroundColor: 'white'
                          }}>
                            <h4 style={{ color: '#1890ff', marginBottom: '12px' }}>
                              🚛 Transport Base Charge ({transportCharge.cpt_code})
                            </h4>
                            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                              <div style={{ marginBottom: '8px' }}>
                                <strong>Base Rate ({areaType}):</strong> ${rateConfig.base.toFixed(2)}
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <strong>Multiplier:</strong> ×{transportCharge.units} {isRoundTrip ? '(Round Trip)' : '(One Way)'}
                              </div>
                              <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
                                <strong>Calculation:</strong> ${rateConfig.base.toFixed(2)} × {transportCharge.units} = ${(rateConfig.base * transportCharge.units).toFixed(2)}
                              </div>
                              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a', textAlign: 'center' }}>
                                Total: ${parseFloat(transportCharge.charge_amount).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Mileage Charge Calculation */}
                        {mileageCharge && (
                          <div style={{ 
                            border: '2px solid #fa8c16', 
                            padding: '16px', 
                            borderRadius: '8px',
                            backgroundColor: 'white'
                          }}>
                            <h4 style={{ color: '#fa8c16', marginBottom: '12px' }}>
                              📏 Mileage Charge ({mileageCharge.cpt_code})
                            </h4>
                            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                              <div style={{ marginBottom: '8px' }}>
                                <strong>Mileage Rate ({areaType}):</strong> ${rateConfig.mileage.toFixed(2)}/mile
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <strong>Original Distance:</strong> {originalMileage.toFixed(2)} miles
                              </div>
                              {fudgeFactor > 0 && (
                                <div style={{ marginBottom: '8px', color: '#fa541c' }}>
                                  <strong>Fudge Factor:</strong> +{fudgeFactor.toFixed(1)} miles (MedTrns legacy)
                                </div>
                              )}
                              {originalMileage === 0 && isRoundTrip && (
                                <div style={{ marginBottom: '8px', color: '#fa541c' }}>
                                  <strong>Minimum Round Trip:</strong> 10.0 miles applied
                                </div>
                              )}
                              <div style={{ marginBottom: '8px' }}>
                                <strong>Adjusted Distance:</strong> {adjustedMileage.toFixed(2)} miles
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <strong>Final Miles (rounded up):</strong> {finalMileage} miles
                              </div>
                              <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#fff7e6', borderRadius: '4px' }}>
                                <strong>Calculation:</strong> ${rateConfig.mileage.toFixed(2)} × {mileageCharge.units} = ${(rateConfig.mileage * mileageCharge.units).toFixed(2)}
                              </div>
                              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a', textAlign: 'center' }}>
                                Total: ${parseFloat(mileageCharge.charge_amount).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        )}
                  
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            
            {/* Service Charges Table */}
            {selectedClaim.charges?.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h3>📊 Service Charges</h3>
                <Table
                  size="small"
                  dataSource={selectedClaim.charges}
                  pagination={false}
                  columns={[
                    { 
                      title: 'CPT Code', 
                      dataIndex: 'cpt_code', 
                      key: 'cpt_code',
                      render: (code) => {
                        const cptTypes = {
                          'A0130': { label: 'Wheelchair Transport', color: 'purple' },
                          'A0120': { label: 'Ambulatory Transport', color: 'blue' },
                          'S0209': { label: 'Wheelchair Mileage', color: 'orange' },
                          'S0215': { label: 'Standard Mileage', color: 'gold' },
                          'A0425': { label: 'Ground Ambulance', color: 'red' },
                        };
                        const cptInfo = cptTypes[code] || { label: code, color: 'default' };
                        return (
                          <div>
                            <Tag color={cptInfo.color}>{code}</Tag>
                            <div style={{ fontSize: '11px', color: '#666' }}>
                              {cptInfo.label}
                            </div>
                          </div>
                        );
                      }
                    },
                    { title: 'Units', dataIndex: 'units', key: 'units' },
                    { 
                      title: 'Amount', 
                      dataIndex: 'charge_amount', 
                      key: 'charge_amount', 
                      render: (amount) => <strong>${parseFloat(amount).toFixed(2)}</strong>
                    },
                    { title: 'Description', dataIndex: 'service_description', key: 'service_description' },
                    { 
                      title: 'Service Date', 
                      dataIndex: 'service_from_date', 
                      key: 'service_from_date',
                      render: (date) => dayjs(date).format('MM/DD/YYYY') 
                    },
                  ]}
                  summary={(pageData) => {
                    const total = pageData.reduce((sum, charge) => sum + parseFloat(charge.charge_amount || 0), 0);
                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}><strong>Total Billed</strong></Table.Summary.Cell>
                        <Table.Summary.Cell index={1}></Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                          <strong style={{ color: '#1890ff', fontSize: '16px' }}>${total.toFixed(2)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}></Table.Summary.Cell>
                        <Table.Summary.Cell index={4}></Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Claims;
