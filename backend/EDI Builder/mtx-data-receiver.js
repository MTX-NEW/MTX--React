// EDI Builder Data Receiver
// This file receives data from MTX backend and populates the EDI Builder models

import { ediClientSetting } from './models/ediClientSetting.js';
import { claimModel } from './models/claimModel.js';
import { chargeModel } from './models/chargeModel.js';

/**
 * Update EDI Builder models with data received from MTX backend
 * @param {Object} mtxData - Data sent from MTX backend
 */
export function updateEDIModelsFromMTX(mtxData) {
  console.log('Updating EDI Builder models with MTX data...');
  
  // Update EDI Client Settings
  if (mtxData.ediClientSetting) {
    updateEDIClientSetting(mtxData.ediClientSetting);
  }
  
  // Update Claim Model
  if (mtxData.claimData) {
    updateClaimModel(mtxData.claimData);
  }
  
  // Update Charge Model
  if (mtxData.chargeData) {
    updateChargeModel(mtxData.chargeData);
  }
  
  console.log('EDI Builder models updated successfully');
}

/**
 * Update EDI client settings with MTX data
 */
function updateEDIClientSetting(mtxSettings) {
  // Update submitter information
  ediClientSetting.ISA06 = mtxSettings.sender_id || ediClientSetting.ISA06;
  ediClientSetting.ISA08 = mtxSettings.receiver_id || ediClientSetting.ISA08;
  ediClientSetting.GS02 = mtxSettings.sender_id || ediClientSetting.GS02;
  ediClientSetting.GS03 = mtxSettings.receiver_id || ediClientSetting.GS03;
  
  ediClientSetting.SubmitterID = mtxSettings.submitter_id || ediClientSetting.SubmitterID;
  ediClientSetting.SubmitterLastName = mtxSettings.submitter_name || ediClientSetting.SubmitterLastName;
  ediClientSetting.SubmitterEntityTypeID = mtxSettings.entity_type || ediClientSetting.SubmitterEntityTypeID;
  ediClientSetting.SubmitterPhone = mtxSettings.phone || ediClientSetting.SubmitterPhone;
  
  // Receiver information
  ediClientSetting.ReceiverName = mtxSettings.receiver_name || ediClientSetting.ReceiverName;
  ediClientSetting.ReceiverID = mtxSettings.receiver_id || ediClientSetting.ReceiverID;
  
  console.log('EDI Client Settings updated');
}

/**
 * Update claim model with MTX data
 */
function updateClaimModel(mtxClaim) {
  // Claim identifiers
  claimModel.claim_id = mtxClaim.claim_id || claimModel.claim_id;
  claimModel.claim_number = mtxClaim.claim_number || claimModel.claim_number;
  claimModel.patient_account_number = mtxClaim.patient_control_number || claimModel.patient_account_number;
  claimModel.claim_frequency = mtxClaim.claim_frequency || claimModel.claim_frequency;
  claimModel.total_charge_amount = mtxClaim.total_charge_amount || claimModel.total_charge_amount;
  claimModel.place_of_service = mtxClaim.place_of_service || claimModel.place_of_service;
  
  // Dates
  claimModel.service_from = mtxClaim.service_from_date || claimModel.service_from;
  claimModel.service_to = mtxClaim.service_to_date || claimModel.service_to;
  claimModel.billing_date = mtxClaim.billing_date || claimModel.billing_date;
  
  // Billing Provider
  claimModel.billing_provider_npi = mtxClaim.provider_npi || claimModel.billing_provider_npi;
  claimModel.billing_provider_name = mtxClaim.provider_name || claimModel.billing_provider_name;
  claimModel.billing_provider_taxonomy = mtxClaim.provider_taxonomy || claimModel.billing_provider_taxonomy;
  claimModel.billing_provider_address1 = mtxClaim.provider_address || claimModel.billing_provider_address1;
  claimModel.billing_provider_city = mtxClaim.provider_city || claimModel.billing_provider_city;
  claimModel.billing_provider_state = mtxClaim.provider_state || claimModel.billing_provider_state;
  claimModel.billing_provider_zip = mtxClaim.provider_zip || claimModel.billing_provider_zip;
  claimModel.billing_provider_phone = mtxClaim.provider_phone || claimModel.billing_provider_phone;
  
  // Patient Information
  claimModel.patient_first_name = mtxClaim.patient_first_name || claimModel.patient_first_name;
  claimModel.patient_last_name = mtxClaim.patient_last_name || claimModel.patient_last_name;
  claimModel.patient_dob = mtxClaim.patient_dob || claimModel.patient_dob;
  claimModel.patient_gender = mtxClaim.patient_gender || claimModel.patient_gender;
  claimModel.patient_address1 = mtxClaim.patient_address || claimModel.patient_address1;
  claimModel.patient_city = mtxClaim.patient_city || claimModel.patient_city;
  claimModel.patient_state = mtxClaim.patient_state || claimModel.patient_state;
  claimModel.patient_zip = mtxClaim.patient_zip || claimModel.patient_zip;
  
  // Insurance Information
  claimModel.insurance_member_id = mtxClaim.member_id || claimModel.insurance_member_id;
  claimModel.insurance_group_number = mtxClaim.group_number || claimModel.insurance_group_number;
  claimModel.insurance_name = mtxClaim.insurance_name || claimModel.insurance_name;
  
  // Additional fields
  claimModel.benefits_assignment_certification_indicator = mtxClaim.assignment_indicator || claimModel.benefits_assignment_certification_indicator;
  claimModel.release_of_information_code = mtxClaim.release_info_code || claimModel.release_of_information_code;
  
  console.log('Claim Model updated');
}

/**
 * Update charge model with MTX data
 */
function updateChargeModel(mtxCharges) {
  // Clear existing charges and add new ones from MTX
  chargeModel.length = 0;
  
  mtxCharges.forEach((mtxCharge, index) => {
    const charge = {
      charge_id: mtxCharge.charge_id || (index + 1),
      claim_id: mtxCharge.claim_id || claimModel.claim_id,
      charge_number: mtxCharge.charge_number || `CH${String(index + 1).padStart(3, '0')}`,
      claim_number: mtxCharge.claim_number || claimModel.claim_number,
      
      // Procedure + Service Line Info
      cpt: mtxCharge.cpt_code || 'A0130', // Default NEMT code
      charge_pos: mtxCharge.place_of_service || '41', // Ambulance - land
      diagnosis_pointer: mtxCharge.diagnosis_pointer || 'A',
      from_dos: mtxCharge.service_from_date || claimModel.service_from,
      to_dos: mtxCharge.service_to_date || claimModel.service_to,
      mod1: mtxCharge.modifier_1 || '',
      mod2: mtxCharge.modifier_2 || '',
      mod3: mtxCharge.modifier_3 || '',
      mod4: mtxCharge.modifier_4 || '',
      fee: mtxCharge.charge_amount || '0.00',
      units: mtxCharge.units || 1,
      service_description: mtxCharge.description || 'Non-emergency medical transportation',
      
      // NDC (if applicable)
      ndc_number: mtxCharge.ndc_number || '',
      ndc_unit: mtxCharge.ndc_unit || null,
      ndc_qualifier_code: mtxCharge.ndc_qualifier || '',
      
      // CAS Adjustments (empty for new claims)
      adj: []
    };
    
    chargeModel.push(charge);
  });
  
  console.log(`Charge Model updated with ${chargeModel.length} charges`);
}

/**
 * Get current state of all EDI models (for debugging)
 */
export function getCurrentEDIModels() {
  return {
    ediClientSetting: { ...ediClientSetting },
    claimModel: { ...claimModel },
    chargeModel: [...chargeModel]
  };
}
