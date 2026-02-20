import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { userTypeApi, groupApi } from "@/api/baseApi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AddEmployeeWizard.css";

const steps = [
  { id: 1, title: "Personal Information" },
  { id: 2, title: "Business Information" },
  { id: 3, title: "Certifications" },
  { id: 4, title: "Finish" }
];

// US phone: 10 digits, optional formatting (spaces, dashes, parentheses, +1 or 1 prefix)
const isValidUsPhone = (value) => {
  if (!value || typeof value !== "string") return false;
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
};
const formatPhoneDisplay = (value) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};
const US_PHONE_MSG = "Enter a valid US phone number (e.g., (123) 456-7890)";

const fullSchema = yup.object().shape({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").nullable(),
  phone: yup.string()
    .required("Phone number is required")
    .test("us-phone", US_PHONE_MSG, isValidUsPhone),
  username: yup.string().required("Username is required").min(3, "Username must be at least 3 characters"),
  password: yup.string().required("Password is required").min(5, "Password must be at least 5 characters"),
  confirm_password: yup.string()
    .oneOf([yup.ref('password')], "Passwords must match")
    .required("Confirm password is required"),
  user_type_id: yup.number().typeError("User type is required").required("User type is required"),
  user_group_id: yup.number().typeError("User group is required").required("User group is required"),
  ssn: yup.string().nullable(),
  business_phone: yup.string()
    .nullable()
    .test("us-phone", US_PHONE_MSG, (value) => !value || isValidUsPhone(value)),
  hire_date: yup.date().typeError("Hire date is required").required("Hire date is required"),
  last_employment_date: yup.date().nullable(),
  employee_type: yup.string().required("Employee type is required")
});

const getStepFields = (step) => {
  switch(step) {
    case 1:
      return ['first_name', 'last_name', 'email', 'phone', 'username', 'password', 'confirm_password', 'user_type_id', 'user_group_id', 'ssn'];
    case 2:
      return ['business_phone', 'hire_date', 'last_employment_date', 'employee_type'];
    default:
      return [];
  }
};

const AddEmployeeWizard = ({ show, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userTypes, setUserTypes] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState(null);

  const methods = useForm({
    resolver: yupResolver(fullSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      confirm_password: "",
      user_type_id: "",
      user_group_id: "",
      ssn: "",
      business_phone: "",
      hire_date: null,
      last_employment_date: null,
      employee_type: "Salary",
      certifications: [],
      create_user_account: true
    },
    mode: "onChange"
  });

  const { register, handleSubmit, watch, control, formState: { errors }, getValues, reset, trigger } = methods;
  const selectedUserType = watch("user_type_id");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, groupsRes] = await Promise.all([
          userTypeApi.getAll(),
          groupApi.getAll()
        ]);
        setUserTypes(typesRes.data.filter(t => t.status === 'Active'));
        setUserGroups(groupsRes.data.filter(g => g.status === 'Active'));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (show) {
      fetchData();
    }
  }, [show]);

  const needsCertifications = () => {
    const typeId = selectedUserType;
    if (!typeId) return false;
    const type = userTypes.find(t => t.type_id === parseInt(typeId));
    return type?.display_name?.toLowerCase().includes('driver');
  };

  const handleNext = async () => {
    const fieldsToValidate = getStepFields(currentStep);
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const data = getValues();
      const { confirm_password, ...employeeData } = data;
      
      if (employeeData.hire_date) {
        employeeData.hire_date = employeeData.hire_date.toISOString().split('T')[0];
      }
      if (employeeData.last_employment_date) {
        employeeData.last_employment_date = employeeData.last_employment_date.toISOString().split('T')[0];
      }
      
      await onComplete(employeeData);
      setCreatedEmployee({
        username: data.username,
        password: data.password
      });
      setCurrentStep(4);
    } catch (error) {
      console.error("Error creating employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setCurrentStep(1);
    setCreatedEmployee(null);
    onClose();
  };

  const renderStepIndicator = () => (
    <div className="wizard-steps">
      {steps.map((step, index) => (
        <div key={step.id} className="step-item">
          <div className={`step-circle ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}>
            {step.id}
          </div>
          <div className="step-title">{step.title}</div>
          {index < steps.length - 1 && (
            <div className={`step-connector ${currentStep > step.id ? 'completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="wizard-form">
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              {...register("first_name")}
              isInvalid={!!errors.first_name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.first_name?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              {...register("last_name")}
              isInvalid={!!errors.last_name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.last_name?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              {...register("email")}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
            <Controller
              name="phone"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value, ref } }) => (
                <Form.Control
                  type="tel"
                  ref={ref}
                  value={formatPhoneDisplay(value)}
                  onChange={(e) => onChange(formatPhoneDisplay(e.target.value))}
                  isInvalid={!!errors.phone}
                  placeholder="e.g., (123) 456-7890"
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.phone?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Username <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          autoComplete="off"
          {...register("username")}
          isInvalid={!!errors.username}
        />
        <Form.Control.Feedback type="invalid">
          {errors.username?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Password <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="password"
              autoComplete="new-password"
              {...register("password")}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="password"
              autoComplete="new-password"
              {...register("confirm_password")}
              isInvalid={!!errors.confirm_password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.confirm_password?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>User Type <span className="text-danger">*</span></Form.Label>
            <Form.Select
              {...register("user_type_id")}
              isInvalid={!!errors.user_type_id}
            >
              <option value="">Select Type</option>
              {userTypes.map(type => (
                <option key={type.type_id} value={type.type_id}>
                  {type.display_name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.user_type_id?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>User Group <span className="text-danger">*</span></Form.Label>
            <Form.Select
              {...register("user_group_id")}
              isInvalid={!!errors.user_group_id}
            >
              <option value="">Select Group</option>
              {userGroups.map(group => (
                <option key={group.group_id} value={group.group_id}>
                  {group.common_name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.user_group_id?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>SSN</Form.Label>
        <Form.Control
          type="text"
          {...register("ssn")}
          placeholder="XXX-XX-XXXX"
        />
      </Form.Group>
    </div>
  );

  const renderStep2 = () => (
    <div className="wizard-form">
      <Form.Group className="mb-3">
        <Form.Label>Business Phone</Form.Label>
        <Controller
          name="business_phone"
          control={control}
          defaultValue=""
          render={({ field: { onChange, value, ref } }) => (
            <Form.Control
              type="tel"
              ref={ref}
              value={formatPhoneDisplay(value)}
              onChange={(e) => onChange(formatPhoneDisplay(e.target.value))}
              isInvalid={!!errors.business_phone}
              placeholder="e.g., (123) 456-7890"
            />
          )}
        />
        <Form.Control.Feedback type="invalid">
          {errors.business_phone?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Hire Date <span className="text-danger">*</span></Form.Label>
        <Controller
          control={control}
          name="hire_date"
          render={({ field }) => (
            <DatePicker
              selected={field.value}
              onChange={field.onChange}
              dateFormat="MM/dd/yyyy"
              className={`form-control ${errors.hire_date ? 'is-invalid' : ''}`}
              placeholderText="Select hire date"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              isClearable
              wrapperClassName="w-100"
            />
          )}
        />
        {errors.hire_date && (
          <div className="invalid-feedback d-block">
            {errors.hire_date?.message}
          </div>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Last Employment Date</Form.Label>
        <Controller
          control={control}
          name="last_employment_date"
          render={({ field }) => (
            <DatePicker
              selected={field.value}
              onChange={field.onChange}
              dateFormat="MM/dd/yyyy"
              className="form-control"
              placeholderText="Select date (optional)"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              isClearable
              wrapperClassName="w-100"
            />
          )}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Employee Type <span className="text-danger">*</span></Form.Label>
        <Form.Select
          {...register("employee_type")}
          isInvalid={!!errors.employee_type}
        >
          <option value="">Select Type</option>
          <option value="Salary">Salary</option>
          <option value="Hourly">Hourly</option>
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.employee_type?.message}
        </Form.Control.Feedback>
      </Form.Group>
    </div>
  );

  const renderStep3 = () => (
    <div className="wizard-form">
      {needsCertifications() ? (
        <div>
          <p className="text-muted mb-4">Add certifications for this employee:</p>
          <Form.Group className="mb-3">
            <Form.Label>Driver's License Number</Form.Label>
            <Form.Control type="text" placeholder="Enter license number" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>License Expiry Date</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Additional Certifications</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Enter any additional certifications" />
          </Form.Group>
        </div>
      ) : (
        <p className="text-muted">Certification info not needed for this user type.</p>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="wizard-form wizard-finish">
      <h5 className="mb-4">User Account Information</h5>
      <Button variant="primary" size="sm" className="mb-3">
        Print
      </Button>
      
      <div className="account-info">
        <Row className="mb-2">
          <Col sm={4}><strong>Username:</strong></Col>
          <Col sm={8}>{createdEmployee?.username || getValues("username")}</Col>
        </Row>
        <Row>
          <Col sm={4}><strong>Password:</strong></Col>
          <Col sm={8}>{createdEmployee?.password || getValues("password")}</Col>
        </Row>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered className="employee-wizard-modal">
      <Modal.Header closeButton>
        <Modal.Title>Add User Wizard</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {renderStepIndicator()}
        <FormProvider {...methods}>
          <Form onSubmit={handleSubmit(currentStep === 3 ? handleFinish : handleNext)}>
            {renderCurrentStep()}
          </Form>
        </FormProvider>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        {currentStep < 3 && (
          <Button variant="primary" onClick={handleNext}>
            Next
          </Button>
        )}
        {currentStep === 3 && (
          <Button 
            variant="primary" 
            onClick={handleFinish}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Next"}
          </Button>
        )}
        {currentStep === 4 && (
          <Button variant="success" onClick={handleClose}>
            Finish
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default AddEmployeeWizard;
