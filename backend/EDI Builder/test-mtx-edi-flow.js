// Test file demonstrating MTX to EDI Builder data flow
// Run with: node test-mtx-edi-flow.js

import { updateEDIModelsFromMTX, getCurrentEDIModels } from './mtx-data-receiver.js';
import { generateEDIFromMTXData } from './index.js';

console.log('=== MTX to EDI Builder Data Flow Test ===\n');

// Sample data from MTX backend
const mtxData = {
  // This would come from MTX backend's ediIntegrationService.transformClaimToEDIFormat()
  ediClientSetting: {
    sender_id: "MTXSENDER",
    receiver_id: "MEDICAID",
    receiver_name: "State Medicaid Program",
    submitter_id: "87654321",
    submitter_name: "Medical Transport Express",
    entity_type: "2",
    phone: "5551234567"
  },
  
  claimData: {
    claim_id: "MTX001",
    claim_number: "MTX20241201001",
    patient_control_number: "PCN123456",
    claim_frequency: "1",
    total_charge_amount: 125.50,
    place_of_service: "41",
    
    service_from_date: "2024-12-01",
    service_to_date: "2024-12-01",
    billing_date: "2024-12-01",
    
    // Provider info
    provider_npi: "1234567890",
    provider_name: "Medical Transport Express",
    provider_taxonomy: "343900000X",
    provider_address: "123 Transport Blvd",
    provider_city: "Phoenix",
    provider_state: "AZ",
    provider_zip: "85001",
    provider_phone: "5551234567",
    
    // Patient info
    patient_first_name: "John",
    patient_last_name: "Doe",
    patient_dob: "1985-06-15",
    patient_gender: "M",
    patient_address: "456 Patient St",
    patient_city: "Phoenix",
    patient_state: "AZ",
    patient_zip: "85002",
    
    // Insurance
    member_id: "MED123456789",
    group_number: "GRP001",
    insurance_name: "Arizona Medicaid",
    assignment_indicator: "Y",
    release_info_code: "Y"
  },
  
  chargeData: [
    {
      charge_id: "CHG001",
      claim_id: "MTX001",
      charge_number: "1",
      claim_number: "MTX20241201001",
      
      cpt_code: "A0130",
      place_of_service: "41",
      diagnosis_pointer: "A",
      service_from_date: "2024-12-01",
      service_to_date: "2024-12-01",
      
      modifier_1: "",
      modifier_2: "",
      modifier_3: "",
      modifier_4: "",
      
      charge_amount: "125.50",
      units: 1,
      description: "Wheelchair van transportation",
      
      ndc_number: "",
      ndc_unit: null,
      ndc_qualifier: ""
    }
  ]
};

console.log('🔄 Step 1: MTX Backend sends data to EDI Builder');
console.log('   Data structure prepared by MTX backend...\n');

console.log('🔄 Step 2: EDI Builder receives data and updates models');
updateEDIModelsFromMTX(mtxData);
console.log('   EDI models updated with MTX data...\n');

console.log('🔄 Step 3: Check updated EDI models');
const currentModels = getCurrentEDIModels();
console.log('   EDI Client Setting - Submitter:', currentModels.ediClientSetting.SubmitterLastName);
console.log('   Claim Model - Patient:', currentModels.claimModel.patient_first_name, currentModels.claimModel.patient_last_name);
console.log('   Charge Model - Charges:', currentModels.chargeModel.length, 'charge(s)\n');

console.log('🔄 Step 4: Generate EDI file using updated models');
const result = generateEDIFromMTXData(mtxData);

if (result.success) {
  console.log('✅ SUCCESS: EDI file generated!');
  console.log(`   File: ${result.fileName}`);
  console.log(`   Claim ID: ${result.claimId}`);
  console.log(`   Message: ${result.message}\n`);
  
  // Show first 300 characters of EDI content
  if (result.ediContent) {
    console.log('📄 EDI File Preview:');
    console.log('   ' + '─'.repeat(50));
    const preview = result.ediContent.substring(0, 300);
    console.log('   ' + preview.replace(/~/g, '~\n   '));
    console.log('   ' + '─'.repeat(50));
    console.log('   (Preview truncated)\n');
  }
} else {
  console.log('❌ FAILED: EDI generation failed');
  console.log(`   Error: ${result.error}\n`);
}

console.log('=== Data Flow Complete ===');
console.log('Summary:');
console.log('1. MTX Backend → Formats data for EDI Builder');
console.log('2. EDI Builder → Updates internal models with MTX data');
console.log('3. EDI Builder → Uses updated models to generate X12 file');
console.log('4. Result → X12 837P file ready for submission');
