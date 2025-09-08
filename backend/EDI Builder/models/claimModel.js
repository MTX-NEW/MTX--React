export const claimModel = {
  // ==== Claim-Level Identifiers ====
  claim_id: 101,
  claim_number: 'CLM12345',
  patient_account_number: 'PCN00112233',
  claim_frequency: '1', // 1 = original, 7 = replacement, 8 = void
  total_charge_amount: 150.00,
  place_of_service: '11', // Office
  claim_type: 'P', 

  // ==== Dates ====
  service_from: '2025-08-01',
  service_to: '2025-08-01',
  billing_date: '2025-08-02',
  date_of_current_illness: '2025-07-15',
  admission_date: null,
  discharge_date: null,

  // ==== Billing Provider (2010AA) ====
  billing_provider_npi: '1234567893',
  billing_provider_name: 'HEALTH CLINIC',
  billing_provider_taxonomy: '207Q00000X',
  billing_provider_address1: '123 Main St',
  billing_provider_address2: null,
  billing_provider_city: 'New York',
  billing_provider_state: 'NY',
  billing_provider_zip: '10001',
  billing_provider_tax_id: '987654321',
  billing_provider_phone: '1234567890',
  billing_provider_phone_ext: '123',

  // ==== Pay-To Provider (2010AB) ====
  

  pay_to_provider_address1: '123 Main St',
  pay_to_provider_address2: null,
  pay_to_provider_city: 'New York',
  pay_to_provider_state: 'NY',
  pay_to_provider_zip: '10001',
  

  // ==== Referring Provider (2310A) ====
  referring_provider_npi: '1122334455',
  referring_provider_first_name: 'Jane',
  referring_provider_last_name: 'Doe',

  // ==== Rendering Provider (2310B) ====
  rendering_provider_npi: '9988776655',
  rendering_provider_first_name: 'John',
  rendering_provider_last_name: 'Smith',

  // ==== Patient Info (2000B, 2010BA) ====
  patient_first_name: 'Emily',
  patient_last_name: 'Johnson',
  patient_middle_name: 'A',
  patient_dob: '1990-05-15',
  patient_gender: 'F',
  patient_address1: '789 Elm St',
  patient_city: 'Brooklyn',
  patient_state: 'NY',
  patient_zip: '11201',
  relation_code: '20', 

  // ==== Subscriber Info (if different from patient) ====
  subscriber_id: 'SUB112233',
  subscriber_first_name: 'Emily',
  subscriber_last_name: 'Johnson',
  subscriber_middle_name: 'A',
  subscriber_dob: '1990-05-15',
  subscriber_city: 'Brooklyn',
  subscriber_gender: 'F',
  subscriber_state: 'NY',
  subscriber_zip: '112019089',
  sub_group_number: 'SG12345',
  sub_group_name: 'Group Health Plan',
  sub_group_name_qualifier: 'G', 
  msp_type_code: '01', 
  subscriber_address1: '789 Elm St',
  subscriber_address2: null,

  // ==== Diagnosis Codes (2300 HI segment) ====
  diagnosis_codes: ['M542', 'R521'],

  // ==== Insurance/Payer Info (2010BB) ====
  payer_last_name: 'Aetna',
  payer_first_name: 'John',
  payer_middle_name: 'Q',
  payer_id: '60054',
  payer_address1: '456 Insurance Ave',
  payer_address2: null,
  payer_city: 'Chicago',
  payer_state: 'IL',
  payer_zip: '60601',
  claim_filing_indicator: 'CI',

  // ==== Control & Tracking ====
  payer_claim_control_number: '',
  prior_authorization_number: 'AUTH12345',
  control_number: '0001', 

  //CLM Segment Elements
  patient_control_number: '1-14425200',
  total_charge_amount: 1040.00,
  facility_code_value: '81',
  facility_code_qualifier: 'B',
  claim_frequency_type_code: '1',
  provider_signature_indicator: 'Y',
  provider_accept_assignment_code: 'A',
  benefits_assignment_certification_indicator: 'Y',
  release_of_information_code: 'Y',

  accident_date: '2025-07-15',
  related_causes_type_code: null,
  accident_state: 'NY',
  special_program_indicator:null,
  delay_reason_code: null,







};
