// validations/userValidation.js
import * as Yup from "yup";

export const userValidationSchema = Yup.object().shape({
  first_name: Yup.string()
    .required("First name is required")
    .max(50, "First name cannot exceed 50 characters"),
  last_name: Yup.string()
    .required("Last name is required")
    .max(50, "Last name cannot exceed 50 characters"),
  username: Yup.string()
    .required("Username is required")
    .max(50, "Username cannot exceed 50 characters"),
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email address"),
  password: Yup.string()
    .when('$isEditing', {
      is: true,
      then: () => Yup.string()
        .notRequired()
        .test('password-length', 'Password must be at least 5 characters', value => 
          value === undefined || value === '' || value.length >= 5
        ),
      otherwise: () => Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number'),
    }),
  confirm_password: Yup.string()
    .when('password', {
      is: (val) => val && val.length > 0,
      then: () => Yup.string()
        .required('Confirm password is required')
        .oneOf([Yup.ref('password')], 'Passwords must match'),
    }),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^\d{10,15}$/, "Phone number must be between 10-15 digits"),
  emp_code: Yup.string()
    .strip() // This will remove the field from the data before validation
    .nullable(),
  user_group: Yup.number().integer().required("User group is required"),
  user_type: Yup.number().integer().required("User type is required"),
  hiringDate: Yup.date()
    .nullable()
    .required("Hiring date is required"),
  lastEmploymentDate: Yup.date().nullable(),
  sex: Yup.string()
    .required("Sex is required")
    .oneOf(["Male", "Female"], "Invalid value for sex"),
  spanishSpeaking: Yup.string()
    .required("Spanish Speaking field is required")
    .oneOf(["Yes", "No"], "Invalid value for Spanish Speaking"),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["Active", "Inactive", "Suspended"], "Invalid value for status"),
  paymentStructure: Yup.string()
    .required("Payment Structure is required")
    .oneOf(
      ["Pay per Hour", "Pay per Mile", "Pay per Trip"],
      "Invalid value for Payment Structure"
    ),
  hourly_rate: Yup.number()
    .required("Hourly rate is required")
    .min(0, "Hourly rate cannot be negative")
    .transform((value) => (isNaN(value) ? 0 : value))
    .when('paymentStructure', {
      is: 'Pay per Hour',
      then: (schema) => schema.min(1, "Hourly rate must be at least $1.00 for hourly employees"),
    }),
});




// Update your validation schema (inputValidation.js)
export const groupValidationSchema = Yup.object().shape({
  full_name: Yup.string().required("Full name is required"),
  common_name: Yup.string().required("Common name is required"),
  short_name: Yup.string().required("Short name is required"),
  phone: Yup.string()
    .required("Phone is required")
    .matches(/^[0-9]{10,15}$/, "Invalid phone number"),
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email address"),
  parent_group_id: Yup.string().nullable(),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["Active", "Inactive"], "Invalid status"),
  send_pdf: Yup.boolean().required("Send PDF selection is required"),
  auto_routing: Yup.boolean().required("Auto Routing selection is required"),
});

export const userTypeValidationSchema = Yup.object().shape({
  type_name: Yup.string()
    .required("Type name is required")
    .max(50, "Type name cannot exceed 50 characters")
    .matches(/^[a-zA-Z0-9-_ ]+$/, "Type name can only contain letters, numbers, spaces, hyphens and underscores"),
  display_name: Yup.string()
    .required("Display name is required")
    .max(50, "Display name cannot exceed 50 characters"),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["Active", "Inactive"], "Invalid status value"),
});

export const programValidationSchema = Yup.object().shape({
  program_name: Yup.string()
    .required("Program Name is required")
    .max(100, "Program Name cannot exceed 100 characters"),
  company_name: Yup.string()
    .nullable()
    .max(100, "Company Name cannot exceed 100 characters"),
  address: Yup.string()
    .nullable(),
  city: Yup.string()
    .nullable()
    .max(50, "City cannot exceed 50 characters"),
  state: Yup.string()
    .nullable()
    .max(50, "State cannot exceed 50 characters")
    .matches(/^[A-Z]{2}$/, { message: "State must be a 2-letter code (e.g., NY, CA)", excludeEmptyString: true }),
  postal_code: Yup.string()
    .nullable()
    .max(20, "Postal Code cannot exceed 20 characters")
    .matches(/^\d{5}(-\d{4})?$/, { message: "Invalid postal code format (e.g., 12345 or 12345-6789)", excludeEmptyString: true }),
  phone: Yup.string()
    .nullable()
    .max(15, "Phone number cannot exceed 15 characters")
    .matches(/^\d{15}$/, { message: "Phone number must be exactly 10 digits", excludeEmptyString: true }),
  plans: Yup.array().of(
    Yup.object().shape({
      plan_id: Yup.number().nullable(),
      plan_name: Yup.string()
        .required("Plan name is required")
        .max(100, "Plan name cannot exceed 100 characters")
    })
  )
});

export const vehicleValidationSchema = Yup.object().shape({
  status: Yup.string()  // <-- Missing in your form data
    .required("Status is required")
    .oneOf(["Active", "Inactive", "Maintenance"], "Invalid status"),
  mtx_unit: Yup.string()
    .required("MTX Unit is required")
    .max(20, "MTX Unit cannot exceed 20 characters"),
  make: Yup.string()
    .required("Make is required")
    .max(50, "Make cannot exceed 50 characters"),
  model: Yup.string()
    .required("Model is required")
    .max(50, "Model cannot exceed 50 characters"),
  color: Yup.string()
    .required("Color is required")
    .max(30, "Color cannot exceed 30 characters"),
  capacity: Yup.number()
    .required("Capacity is required")
    .min(1, "Capacity must be at least 1"),
  type: Yup.string()
    .required("Type is required")
    .oneOf(["Ambulatory", "Wheelchair"], "Invalid vehicle type"),
  vehicle_type: Yup.string()
    .required("Vehicle Type is required")
    .oneOf(["Sedan", "Van", "SUV"], "Invalid vehicle type"),
  plate_number: Yup.string()
    .required("Plate Number is required")
    .max(20, "Plate number cannot exceed 20 characters"),
  tyre_size: Yup.string()
    .required("Tyre Size is required")
    .max(20, "Tyre size cannot exceed 20 characters"),
  vin: Yup.string()
    .required("VIN is required")
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/, "Invalid VIN format"),
  purchase_date: Yup.date().required("Purchase Date is required"),
  registration_due: Yup.date().required("Registration Due is required"),
  last_registered: Yup.date().required("Last Registered date is required"),
  assigned_ts: Yup.number()
    .nullable()
    .required("Assigned TS is required"),
  date_assigned: Yup.date().required("Date Assigned is required"),
  insured_from: Yup.date().required("Insured From date is required"),
  insured_to: Yup.date().required("Insured To date is required"),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["Active", "Inactive", "Maintenance"], "Invalid status"),
});

export const maintenanceValidationSchema = Yup.object().shape({
  vehicle_id: Yup.number().required('Vehicle is required'),
  mechanic: Yup.string().required('Mechanic is required'),
  service_date: Yup.date().required('Service date is required'),
  odometer: Yup.number().required('Odometer reading is required'),
  notes: Yup.string(),
  services: Yup.array().of(
    Yup.object().shape({
      service_id: Yup.number().required('Service is required'),
      actual_hours: Yup.number().required('Actual hours is required'),
      actual_cost: Yup.number().required('Actual cost is required')
    })
  ),
  parts: Yup.array().of(
    Yup.object().shape({
      part_id: Yup.number().required('Part is required'),
      quantity: Yup.number().min(1).required('Quantity is required'),
      purchase_date: Yup.date().required('Purchase date is required'),
      actual_price: Yup.number().required('Actual price is required'),
      warranty_applied: Yup.boolean()
    })
  )
});

export const vehiclePartValidationSchema = Yup.object().shape({
  part_number: Yup.string()
    .required('Part number is required')
    .max(255, 'Part number too long'),
  part_name: Yup.string()
    .required('Part name is required')
    .max(255, 'Part name too long'),
  type: Yup.string()
    .required('Type is required')
    .oneOf(['OEM', 'Aftermarket', 'Refurbished'], 'Invalid part type'),
  brand: Yup.string()
    .required('Brand is required')
    .max(50, 'Brand name too long'),
  unit_price: Yup.number()
    .required('Unit price is required')
    .min(0, 'Price cannot be negative'),
  supplier_id: Yup.number()
    .required('Supplier is required')
    .integer()
    .positive(),
  warranty: Yup.boolean(),
  warranty_type: Yup.string()
    .when('warranty', {
      is: true,
      then: Yup.string()
        .required('Warranty type is required')
        .oneOf(['Time', 'Mileage', 'Both'], 'Invalid warranty type'),
    }),
  warranty_mileage: Yup.number()
    .when('warranty', {
      is: true,
      then: Yup.number().min(0, 'Mileage cannot be negative'),
    }),
  warranty_time_unit: Yup.string()
    .when('warranty', {
      is: true,
      then: Yup.string()
        .oneOf(['Days', 'Months', 'Years', 'Lifetime'], 'Invalid time unit'),
    }),
});


export const supplierValidationSchema = Yup.object().shape({
  company_name: Yup.string().required().max(100),
  street_address: Yup.string().required().max(255),
  city: Yup.string().required().max(50),
  state: Yup.string().required().length(2),
  zip: Yup.string().required().matches(/^\d{5}(-\d{4})?$/),
  phone: Yup.string().required().matches(/^\+?1?\d{10}$/),
  //fax: Yup.string().matches(/^\+?1?\d{10}$/),
  notes: Yup.string().max(500)
});

// Add member validation schema
export const memberValidationSchema = Yup.object().shape({
  first_name: Yup.string()
    .required("First name is required")
    .max(50, "First name cannot exceed 50 characters"),
  last_name: Yup.string()
    .required("Last name is required")
    .max(50, "Last name cannot exceed 50 characters"),
  program_id: Yup.number().nullable(),
  ahcccs_id: Yup.string()
    .nullable()
    .max(50, "AHCCCS ID cannot exceed 50 characters"),
  insurance_expiry: Yup.date().nullable(),
  birth_date: Yup.date().nullable(),
  phone: Yup.string()
    .nullable()
    .max(15, "Phone number cannot exceed 15 characters")
    
    .matches(/^[\d-]+$/, { 
      message: "Phone number must be exactly 10 digits",
      excludeEmptyString: true
    }),
  gender: Yup.string()
    .required("Gender is required")
    .oneOf(["Male", "Female", "Other"], "Invalid gender value"),
  notes: Yup.string().nullable().max(500, "Notes cannot exceed 500 characters"),
});

// Add location validation schema
export const locationValidationSchema = Yup.object().shape({
  street_address: Yup.string()
    .required("Street address is required")
    .max(255, "Street address cannot exceed 255 characters"),
  building: Yup.string()
    .nullable()
    .max(255, "Building cannot exceed 255 characters"),
  building_type: Yup.string()
    .required("Building type is required")
    .oneOf(['Apartment', 'House', 'Lot', 'Other', 'Room', 'Suite', 'Unit'], "Invalid building type"),
  city: Yup.string()
    .required("City is required")
    .max(100, "City cannot exceed 100 characters")
    .transform((value) => {
      if (!value) return value;
      // Capitalize first letter of each word
      return value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }),
  state: Yup.string()
    .required("State is required")
    .matches(/^[A-Z]{2}$/, "State must be 2 uppercase letters (e.g., AZ)")
    .transform((value) => value ? value.toUpperCase() : value),
  zip: Yup.string()
    .required("ZIP code is required")
    .matches(/^\d{5}(-\d{4})?$/, "ZIP code must be in format 12345 or 12345-6789")
    .max(10, "ZIP code cannot exceed 10 characters"),
  location_type: Yup.string()
    .required("Location type is required")
    .oneOf(['Urban', 'Rural'], "Invalid location type"),
  recipient_default: Yup.boolean().default(true)
});