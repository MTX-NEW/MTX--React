import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Form, Row, Col } from "react-bootstrap";
import DynamicTable from "@/components/DynamicTable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { timeOffRequestApi } from "@/api/baseApi";
import "./EmployeeLeave.css";

const EmployeeLeave = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await timeOffRequestApi.getAll();
      setLeaveRequests(response.data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      toast.error("Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const filteredRequests = React.useMemo(() => {
    if (statusFilter === "all") return leaveRequests;
    return leaveRequests.filter(req => req.status === statusFilter);
  }, [leaveRequests, statusFilter]);

  const getStatusBadge = (status) => {
    const variants = {
      'Pending': 'warning',
      'Approved': 'success',
      'Rejected': 'danger',
      'Cancelled': 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const columns = [
    { 
      header: "Employee", 
      accessor: "User",
      render: (value) => value ? `${value.first_name} ${value.last_name}` : 'N/A'
    },
    { 
      header: "Leave Type", 
      accessor: "leave_type",
      render: (value) => value || 'Time Off'
    },
    { 
      header: "Start Date", 
      accessor: "start_date",
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    { 
      header: "End Date", 
      accessor: "end_date",
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    { 
      header: "Days", 
      accessor: "days",
      render: (_, row) => {
        if (!row.start_date || !row.end_date) return 'N/A';
        const start = new Date(row.start_date);
        const end = new Date(row.end_date);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return diff;
      }
    },
    { 
      header: "Reason", 
      accessor: "reason",
      render: (value) => value || '-'
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => getStatusBadge(value)
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (_, row) => (
        <div className="d-flex gap-2">
          {row.status === 'Pending' && (
            <>
              <Button 
                variant="success" 
                size="sm"
                onClick={() => handleStatusChange(row.id, 'Approved')}
              >
                Approve
              </Button>
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => handleStatusChange(row.id, 'Rejected')}
              >
                Reject
              </Button>
            </>
          )}
          {row.status !== 'Pending' && (
            <Button variant="outline-secondary" size="sm" disabled>
              {row.status}
            </Button>
          )}
        </div>
      )
    }
  ];

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await timeOffRequestApi.update(requestId, { status: newStatus });
      await fetchLeaveRequests();
      toast.success(`Leave request ${newStatus.toLowerCase()}`);
    } catch (error) {
      toast.error("Failed to update leave request");
      console.error("Error updating leave request:", error);
    }
  };

  const statusCounts = React.useMemo(() => {
    return {
      all: leaveRequests.length,
      Pending: leaveRequests.filter(r => r.status === 'Pending').length,
      Approved: leaveRequests.filter(r => r.status === 'Approved').length,
      Rejected: leaveRequests.filter(r => r.status === 'Rejected').length
    };
  }, [leaveRequests]);

  return (
    <div className="employee-leave-container p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">Employee Leave Management</h5>
            </Col>
            <Col xs="auto">
              <Form.Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: '200px' }}
              >
                <option value="all">All Requests ({statusCounts.all})</option>
                <option value="Pending">Pending ({statusCounts.Pending})</option>
                <option value="Approved">Approved ({statusCounts.Approved})</option>
                <option value="Rejected">Rejected ({statusCounts.Rejected})</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <p>Loading leave requests...</p>
          ) : filteredRequests.length === 0 ? (
            <p className="text-muted text-center py-4">No leave requests found</p>
          ) : (
            <DynamicTable
              columns={columns}
              data={filteredRequests}
              showActions={false}
            />
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default EmployeeLeave;
