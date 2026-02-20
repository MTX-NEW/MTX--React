import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Badge, Spinner } from "react-bootstrap";
import DynamicTable from "@/components/DynamicTable";
import UserActions from "@/components/users/allusers/UserActions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { employeeApi, timeOffRequestApi } from "@/api/baseApi";
import AddEmployeeWizard from "./components/AddEmployeeWizard";
import "./HRMain.css";

const HRMain = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeApi.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      setLeaveLoading(true);
      const response = await timeOffRequestApi.getAll({ status: 'pending' });
      setLeaveRequests(response.data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setLeaveLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchLeaveRequests();
  }, []);

  const filteredEmployees = React.useMemo(() => {
    if (!searchQuery) return employees;
    return employees.filter(emp =>
      Object.values(emp).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  const columns = [
    { 
      header: "Name", 
      accessor: "name",
      render: (_, row) => `${row.first_name} ${row.last_name}`
    },
    { header: "EMP ID", accessor: "emp_id" },
    { 
      header: "Contact", 
      accessor: "phone",
      render: (value) => value ? (
        <a href={`tel:${value}`} className="text-primary">{value}</a>
      ) : 'N/A'
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span className={`status-badge ${value?.toLowerCase().replace(' ', '-')}`}>
          {value}
        </span>
      ),
    },
  ];

  const handleDelete = async (item) => {
    try {
      await employeeApi.delete(item.employee_id);
      await fetchEmployees();
      toast.success(`Employee ${item.first_name} deleted!`);
    } catch (error) {
      toast.error("Failed to delete employee");
      console.error("Error deleting employee:", error);
    }
  };

  const handleEdit = (item) => {
    toast.info("Edit functionality coming soon");
  };

  const handleWizardComplete = async (employeeData) => {
    try {
      await employeeApi.create(employeeData);
      await fetchEmployees();
      setShowWizard(false);
      toast.success("Employee added successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add employee");
      throw error;
    }
  };

  const handleApproveLeave = async (requestId) => {
    try {
      await timeOffRequestApi.update(requestId, { status: 'approved' });
      await fetchLeaveRequests();
      toast.success("Leave request approved");
    } catch (error) {
      toast.error("Failed to approve leave request");
    }
  };

  const handleRejectLeave = async (requestId) => {
    try {
      await timeOffRequestApi.update(requestId, { status: 'denied' });
      await fetchLeaveRequests();
      toast.success("Leave request denied");
    } catch (error) {
      toast.error("Failed to deny leave request");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getLeaveTypeBadge = (type) => {
    const variants = {
      'vacation': 'primary',
      'sick': 'danger',
      'personal': 'info',
      'other': 'secondary'
    };
    return <Badge bg={variants[type?.toLowerCase()] || 'secondary'}>{type || 'Time Off'}</Badge>;
  };

  return (
    <div className="hr-main-container p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">MTX HR Management</h5>
            </Card.Header>
            <Card.Body>
              <UserActions
                onSearch={setSearchQuery}
                onAdd={() => setShowWizard(true)}
              />

              {loading ? (
                <p>Loading employees...</p>
              ) : (
                <DynamicTable
                  columns={columns}
                  data={filteredEmployees}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  deleteConfirmMessage={(item) =>
                    `Delete employee ${item.first_name} ${item.last_name}?`
                  }
                />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="application-review-card">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Application Review</h6>
              <Badge bg="warning" text="dark">{leaveRequests.length} Pending</Badge>
            </Card.Header>
            <Card.Body>
              <div className="outstanding-requests">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-semibold">Outstanding Leave Requests</span>
                </div>

                {leaveLoading ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2">Loading...</span>
                  </div>
                ) : leaveRequests.length === 0 ? (
                  <p className="text-muted text-center py-3">No pending leave requests</p>
                ) : (
                  leaveRequests.map((request) => (
                    <div key={request.request_id || request.id} className="leave-request-item mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <strong>{request.User?.first_name} {request.User?.last_name}</strong>
                            {getLeaveTypeBadge(request.type)}
                          </div>
                          <div className="text-muted small mb-1">
                            {formatDate(request.start_date)} - {formatDate(request.end_date)}
                          </div>
                          {request.notes && (
                            <div className="text-muted small fst-italic">
                              "{request.notes.substring(0, 50)}{request.notes.length > 50 ? '...' : ''}"
                            </div>
                          )}
                        </div>
                        <div className="d-flex flex-column gap-1 ms-2">
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleApproveLeave(request.request_id || request.id)}
                            title="Approve"
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleRejectLeave(request.request_id || request.id)}
                            title="Deny"
                          >
                            Deny
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showWizard && (
        <AddEmployeeWizard
          show={showWizard}
          onClose={() => setShowWizard(false)}
          onComplete={handleWizardComplete}
        />
      )}
    </div>
  );
};

export default HRMain;
