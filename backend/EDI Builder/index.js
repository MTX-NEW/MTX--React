import { Interchange } from './core/Interchange.js';
import { TypedLoopNM1 } from './loops/TypedLoopNM1.js';



import { SegmentPER } from './segments/SegmentPER.js';
import { SegmentPRV } from './segments/SegmentPRV.js';
import { SegmentN3 } from './segments/SegmentN3.js';
import { SegmentN4 } from './segments/SegmentN4.js';
import { SegmentREF } from './segments/SegmentREF.js';
import { SegmentSBR } from './segments/SegmentSBR.js';
import { SegmentPAT } from './segments/SegmentPAT.js';
import { SegmentDMG } from './segments/SegmentDMG.js';



import { ediClientSetting } from './models/ediClientSetting.js';
import { claimModel } from './models/claimModel.js';
import { chargeModel } from './models/chargeModel.js';

import { updateEDIModelsFromMTX, getCurrentEDIModels } from './mtx-data-receiver.js';
import { EdiPrettier } from './utils/EDIPretier.js';
import { TypedLoopCLM } from './loops/TypedLoopCLM.js';
import { SegmentHI } from './segments/SegmentHI.js';

import FileStorage from './utils/FileStorage.js';
import { TypedLoopLX } from './loops/TypedLoopLX.js';
import { SegmentSV1 } from './segments/SegmentSV1.js';
import { SegmentDTP } from './segments/SegmentDTP.js';
import {buildDateTimePeriod} from './utils/DateFormatter.js'
const fileStorage = new FileStorage('./output');



function isNullOrEmpty(str) {
  return str == null || str === '';
}

const interchange = new Interchange(new Date(), 1);
const group = interchange.addFunctionGroup('HC', 1, '005010X222A1');
const transaction = group.addTransaction(1);


// BHT Segment
transaction.bht.BHT01_HierarchicalStructureCode = '0019';
transaction.bht.BHT02_TransactionSetPurposeCode = '00';
transaction.bht.BHT03_ReferenceIdentification = '244579';
transaction.bht.BHT04_Date = new Date();
transaction.bht.BHT05_Time = new Date();
transaction.bht.BHT06_TransactionTypeCode = 'CH';

// Submitter NM1 Loop (1000A)
const submitterLoop = transaction.addLoop(new TypedLoopNM1("41"));
submitterLoop.NM102_EntityTypeQualifier = ediClientSetting.SubmitterEntityTypeID;
submitterLoop.NM103_NameLastOrOrganizationName = ediClientSetting.SubmitterLastName;

if (ediClientSetting.SubmitterEntityTypeID === "1") {
  submitterLoop.NM104_NameFirst = ediClientSetting.SubmitterFirstName;
}

submitterLoop.NM108_IdCodeQualifier = "46";
submitterLoop.NM109_IdCode = ediClientSetting.SubmitterID;

const perSegment = submitterLoop.addSegment(new SegmentPER());
perSegment.PER01_ContactFunctionCode = 'IC';
perSegment.PER02_Name = 'John Doe';

if (!isNullOrEmpty(ediClientSetting.SubmitterPhone)) {
  perSegment.PER03_CommunicationNumberQualifier1 = 'TE';
  perSegment.PER04_CommunicationNumber1 = ediClientSetting.SubmitterPhone;
}

if (!isNullOrEmpty(ediClientSetting.PER06_CommunicationNumber2)) {
  perSegment.PER05_CommunicationNumberQualifier2 = 'FX';
  perSegment.PER06_CommunicationNumber2 = ediClientSetting.SubmitterFax;
}

// Receiver NM1 Loop (1000B)
const receiverLoop = transaction.addLoop(new TypedLoopNM1("40"));

receiverLoop.NM102_EntityTypeQualifier = "2";
receiverLoop.NM103_NameLastOrOrganizationName = ediClientSetting.ReceiverName;
receiverLoop.NM108_IdCodeQualifier = "46";
receiverLoop.NM109_IdCode = ediClientSetting.ReceiverID;

// Use the main transaction building logic
buildMainTransactionLogic(transaction);



/**
 * Generate batch EDI file from MTX backend data 
 * @param {Object} batchData - Batch data with multiple claims
 * @returns {Object} - Result with success status and file info
 */
export function generateBatchEDIFromMTXData(batchData) {
  try {
    console.log('Generating batch EDI file from MTX data...');
    console.log(`Processing batch with ${batchData.claims?.length || 0} claims`);
    
    // Validate input similar to .NET
    if (!batchData.claims || !Array.isArray(batchData.claims) || batchData.claims.length === 0) {
      throw new Error('No valid claims provided for batch processing');
    }

    if (!batchData.ediClientSetting) {
      throw new Error('EDI client settings are required for batch processing');
    }

    // Extract settings and batch info
    const settings = batchData.ediClientSetting;
    const batchInfo = batchData.batchInfo || {};
    
    // Create ISA control number (similar to .NET ISA13 logic)
    const isa13Value = settings.isa13 || batchInfo.batch_id?.toString().padStart(9, '0') || "000000001";
    
    // Create interchange (similar to .NET Interchange creation)
    const interchange = new Interchange(new Date(), parseInt(isa13Value));
    
    // Set ISA segment properties (matching .NET BuildISASegment logic)
    interchange.isa.ISA01_AuthorizationInformationQualifier = settings.ISA01 || "00";
    interchange.isa.ISA02_AuthorizationInformation = (settings.ISA02 || "").padEnd(10);
    interchange.isa.ISA03_SecurityInformationQualifier = settings.ISA03 || "00";
    interchange.isa.ISA04_SecurityInformation = (settings.ISA04 || "").padEnd(10);
    interchange.isa.ISA05_InterchangeIdQualifier = settings.ISA05 || "ZZ";
    interchange.isa.ISA06_InterchangeSenderId = (settings.ISA06 || settings.sender_id || settings.submitter_id || "").padEnd(15);
    interchange.isa.ISA07_InterchangeIdQualifier = settings.ISA07 || "ZZ";
    interchange.isa.ISA08_InterchangeReceiverId = (settings.ISA08 || settings.receiver_id || "").padEnd(15);
    interchange.isa.ISA11_RepetitionSeparator = settings.ISA11 || "U";
    interchange.isa.ISA12_InterchangeControlVersionNumber = settings.ISA12 || "00501";
    interchange.isa.ISA14_AcknowledgmentRequested = settings.ISA14 || "0";
    interchange.isa.ISA15_UsageIndicator = settings.ISA15 || "P";
    interchange.isa.ISA16_ComponentElementSeparator = settings.ISA16 || ":";

    // Create functional group (similar to .NET AddFunctionGroup logic)
    const group = interchange.addFunctionGroup('HC', parseInt(isa13Value), settings.GS08 || '005010X222A1');
    
    // Set GS segment properties (matching .NET BuildGSSegment logic)
    group.gs.GS02_ApplicationSendersCode = settings.GS02 || settings.sender_id || settings.submitter_id;
    group.gs.GS03_ApplicationReceiversCode = settings.GS03 || settings.receiver_id;
    group.gs.GS06_GroupControlNumber = batchInfo.batch_id?.toString() || "1";
    group.gs.GS07_ResponsibleAgencyCode = "X";
    group.gs.GS08_VersionReleaseIndustryIdCode = settings.GS08 || "005010X222A1";

    let transactionCount = 0;
    const usedHierarchicalNumbers = new Set(['1']); // Track hierarchical numbers like .NET
    let hierarchicalCounter = 2;

    // Group claims by provider (similar to .NET logic that processes by provider)
    const claimsByProvider = groupClaimsByProvider(batchData.claims);

    // Process each provider's claims
    for (const [providerKey, providerClaims] of claimsByProvider) {
      transactionCount++;
      const controlNumber = transactionCount.toString().padStart(4, '0');
      
      // Create transaction for this provider's claims (similar to .NET AddTransaction)
      const transaction = group.addTransaction(transactionCount);
      
      // Build batch claim transaction (matching .NET BuildBatchClaimTransaction logic)
      buildBatchClaimTransaction(
        transaction, 
        providerClaims, 
        settings, 
        batchInfo.batch_id,
        usedHierarchicalNumbers,
        hierarchicalCounter
      );
      
      // Update hierarchical counter for next provider
      hierarchicalCounter += (providerClaims.length * 3); // Rough estimate for provider + subscriber + patient levels
    }

    // Generate EDI content
    const ediContent = EdiPrettier.format(interchange);
    
    // Create filename (similar to .NET file naming pattern)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, -5);
    const fileName = `BATCH_${batchInfo.batch_number || batchInfo.batch_id || timestamp}_${timestamp}.edi`;
    
    // Save the batch EDI file
    fileStorage.saveFile(fileName, ediContent);
    
    console.log(`Batch EDI file generated successfully: ${fileName}`);
    console.log(`Total transactions: ${transactionCount}`);
    console.log(`Total claims processed: ${batchData.claims.length}`);
    
    return {
      success: true,
      fileName: fileName,
      filePath: `./output/${fileName}`,
      ediContent: ediContent,
      batchId: batchInfo.batch_id,
      claimCount: batchData.claims.length,
      transactionCount: transactionCount,
      message: `Batch EDI file generated successfully with ${batchData.claims.length} claims`
    };
    
  } catch (error) {
    console.error('Error generating batch EDI from MTX data:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to generate batch EDI file from MTX data'
    };
  }
}

/**
 * Group claims by provider 
 */
function groupClaimsByProvider(claims) {
  const grouped = new Map();
  
  for (const claim of claims) {
    const claimData = claim.claimData;
    const providerKey = `${claimData.provider_npi || 'UNKNOWN'}_${claimData.provider_name || 'UNKNOWN'}`;
    
    if (!grouped.has(providerKey)) {
      grouped.set(providerKey, []);
    }
    grouped.get(providerKey).push(claim);
  }
  
  return grouped;
}

/**
 * Build batch claim transaction 
 */
function buildBatchClaimTransaction(transaction, providerClaims, settings, batchId, usedHierarchicalNumbers, hierarchicalCounter) {
  const firstClaim = providerClaims[0].claimData;

  // BHT Segment (matching .NET BHT segment logic)
  transaction.bht.BHT01_HierarchicalStructureCode = "0019";
  transaction.bht.BHT02_TransactionSetPurposeCode = "00";
  transaction.bht.BHT03_ReferenceIdentification = batchId ? batchId.toString() : (settings.ISA13 || "00001");
  transaction.bht.BHT04_Date = new Date();
  transaction.bht.BHT05_Time = new Date();
  transaction.bht.BHT06_TransactionTypeCode = "CH";

  // Loop 1000A - Submitter Name (matching .NET submitter loop logic)
  const submitterLoop = transaction.addLoop(new TypedLoopNM1("41"));
  submitterLoop.NM102_EntityTypeQualifier = settings.entity_type || "2";
  submitterLoop.NM103_NameLastOrOrganizationName = settings.submitter_name || "MTX Medical Transport";
  
  if (settings.entity_type === "1") {
    // Split name if it's a person
    const nameParts = settings.submitter_name?.split(' ') || [];
    submitterLoop.NM104_NameFirst = nameParts[0] || "";
    if (nameParts.length > 1) {
      submitterLoop.NM103_NameLastOrOrganizationName = nameParts[nameParts.length - 1];
    }
  }

  submitterLoop.NM108_IdCodeQualifier = "46";
  submitterLoop.NM109_IdCode = settings.submitter_id || settings.sender_id;

  // PER segment for submitter contact (matching .NET PER logic)
  if (settings.phone || settings.submitter_contact || settings.submitter_name) {
    const perSegment = submitterLoop.addSegment(new SegmentPER());
    perSegment.PER01_ContactFunctionCode = "IC";
    perSegment.PER02_Name = settings.submitter_contact || settings.submitter_name || "MTX Support";
    
    if (settings.phone) {
      perSegment.PER03_CommunicationNumberQualifier1 = "TE";
      perSegment.PER04_CommunicationNumber1 = settings.phone;
      
      if (settings.phone_ext) {
        perSegment.PER05_CommunicationNumberQualifier2 = "EX";
        perSegment.PER06_CommunicationNumber2 = settings.phone_ext;
      }
    }
  }

  // Loop 1000B - Receiver Name (matching .NET receiver loop logic)
  const receiverLoop = transaction.addLoop(new TypedLoopNM1("40"));
  receiverLoop.NM102_EntityTypeQualifier = "2";
  receiverLoop.NM103_NameLastOrOrganizationName = settings.receiver_name || "ARIZONA HEALTH CARE";
  receiverLoop.NM108_IdCodeQualifier = "46";
  receiverLoop.NM109_IdCode = settings.receiver_id;
  receiverLoop.NM109_IdCode = settings.receiver_id;

  // Loop 2000A - Billing Provider (matching .NET provider hierarchy logic)
  const provider2000AHLoop = transaction.AddHLoop("1", "20", true);

  // PRV segment for provider taxonomy (matching .NET taxonomy logic)
  if (firstClaim.provider_taxonomy) {
    const prvSegment = provider2000AHLoop.addSegment(new SegmentPRV());
    prvSegment.PRV01_ProviderCode = "BI";
    prvSegment.PRV02_ReferenceIdQualifier = "PXC";
    prvSegment.PRV03_ProviderTaxonomyCode = firstClaim.provider_taxonomy;
  }

  // Loop 2010AA - Billing Provider Name (matching .NET provider NM1 logic)
  const provider2010AALoop = provider2000AHLoop.addLoop(new TypedLoopNM1("85"));
  provider2010AALoop.NM102_EntityTypeQualifier = "2"; // Non-person entity
  provider2010AALoop.NM103_NameLastOrOrganizationName = firstClaim.provider_name;
  provider2010AALoop.NM108_IdCodeQualifier = "XX";
  provider2010AALoop.NM109_IdCode = firstClaim.provider_npi;

  // Provider address (matching .NET address logic)
  if (firstClaim.provider_address) {
    const providerN3Segment = provider2010AALoop.addSegment(new SegmentN3());
    providerN3Segment.N301_AddressLine1 = firstClaim.provider_address;
    
    if (firstClaim.provider_city || firstClaim.provider_state || firstClaim.provider_zip) {
      const providerN4Segment = provider2010AALoop.addSegment(new SegmentN4());
      providerN4Segment.N401_CityName = firstClaim.provider_city || "";
      providerN4Segment.N402_StateOrProvinceCode = firstClaim.provider_state || "";
      providerN4Segment.N403_PostalCode = firstClaim.provider_zip || "";
    }
  }

  // Provider tax ID reference (matching .NET REF logic)
  if (firstClaim.provider_tax_id) {
    const providerREFSegment = provider2010AALoop.addSegment(new SegmentREF());
    providerREFSegment.REF01_ReferenceIdQualifier = "EI";
    providerREFSegment.REF02_ReferenceId = firstClaim.provider_tax_id;
  }

  // Process each claim for this provider (matching .NET foreach claim logic)
  let currentHierarchicalCounter = hierarchicalCounter;
  
  for (const claim of providerClaims) {
    // Generate unique hierarchical numbers (matching .NET hierarchical number logic)
    let subscriberHierarchicalNumber;
    do {
      subscriberHierarchicalNumber = currentHierarchicalCounter.toString();
      currentHierarchicalCounter++;
    } while (usedHierarchicalNumbers.has(subscriberHierarchicalNumber));
    
    usedHierarchicalNumbers.add(subscriberHierarchicalNumber);

    let patientHierarchicalNumber = null;
    if (claim.claimData.relation_code !== "18") { // Not self
      do {
        patientHierarchicalNumber = currentHierarchicalCounter.toString();
        currentHierarchicalCounter++;
      } while (usedHierarchicalNumbers.has(patientHierarchicalNumber));
      
      usedHierarchicalNumbers.add(patientHierarchicalNumber);
    }

    // Build single claim structure (matching .NET BuildSingleClaimStructure)
    buildSingleClaimStructure(
      provider2000AHLoop, 
      claim.claimData, 
      claim.chargeData || [], 
      subscriberHierarchicalNumber, 
      patientHierarchicalNumber
    );
  }

  console.log(`Built transaction for provider ${firstClaim.provider_name} with ${providerClaims.length} claims`);
}

/**
 * Build single claim structure 
 */
function buildSingleClaimStructure(provider2000AHLoop, claim, charges, subscriberHierarchicalNumber, patientHierarchicalNumber) {
  // Loop 2000B - Subscriber Hierarchical Level 
  const isSelf = claim.relation_code === "18";
  const subscriber2000BHLoop = provider2000AHLoop.AddHLoop(
    subscriberHierarchicalNumber, 
    "22", 
    !isSelf,
    "1"
  );

  // SBR segment (matching .NET SBR segment logic)
  const sbrSegment = subscriber2000BHLoop.addSegment(new SegmentSBR());
  sbrSegment.SBR01_PayerResponsibilitySequenceNumberCode = claim.claim_type || "P";
  if (isSelf) {
    sbrSegment.SBR02_IndividualRelationshipCode = "18";
  }
  sbrSegment.SBR03_PolicyOrGroupNumber = claim.group_number || "";
  sbrSegment.SBR04_GroupName = claim.group_name || "";
  sbrSegment.SBR09_ClaimFilingIndicatorCode = claim.claim_filing_ind || "MC";

  // Loop 2010BA - Subscriber Name (matching .NET subscriber NM1 logic)
  const subscriberNM1Loop = subscriber2000BHLoop.addLoop(new TypedLoopNM1("IL"));
  subscriberNM1Loop.NM102_EntityTypeQualifier = "1";
  
  // Use subscriber data if not self, otherwise use patient data
  if (isSelf) {
    if (!isNullOrEmpty(claim.patient_last_name)) {
      subscriberNM1Loop.NM103_NameLastOrOrganizationName = claim.patient_last_name;
    }
    if (!isNullOrEmpty(claim.patient_first_name)) {
      subscriberNM1Loop.NM104_NameFirst = claim.patient_first_name;
    }
    if (!isNullOrEmpty(claim.patient_middle_name)) {
      subscriberNM1Loop.NM105_NameMiddle = claim.patient_middle_name;
    }
  } else {
    // Use subscriber data when patient is not self
    if (!isNullOrEmpty(claim.subscriber_last_name)) {
      subscriberNM1Loop.NM103_NameLastOrOrganizationName = claim.subscriber_last_name;
    }
    if (!isNullOrEmpty(claim.subscriber_first_name)) {
      subscriberNM1Loop.NM104_NameFirst = claim.subscriber_first_name;
    }
    if (!isNullOrEmpty(claim.subscriber_middle_name)) {
      subscriberNM1Loop.NM105_NameMiddle = claim.subscriber_middle_name;
    }
  }
  
  if (!isNullOrEmpty(claim.member_id)) {
    subscriberNM1Loop.NM108_IdCodeQualifier = "MI";
    subscriberNM1Loop.NM109_IdCode = claim.member_id;
  }

  // Subscriber address (use patient address for self, subscriber address for dependents)
  const addressSource = isSelf ? claim : claim;
  if (!isNullOrEmpty(addressSource.patient_address)) {
    const subscriberN3Segment = subscriberNM1Loop.addSegment(new SegmentN3());
    subscriberN3Segment.N301_AddressLine1 = addressSource.patient_address;
    if (!isNullOrEmpty(addressSource.patient_address2)) {
      subscriberN3Segment.N302_AddressLine2 = addressSource.patient_address2;
    }
  }
  
  if (!isNullOrEmpty(addressSource.patient_city) || !isNullOrEmpty(addressSource.patient_state) || !isNullOrEmpty(addressSource.patient_zip)) {
    const subscriberN4Segment = subscriberNM1Loop.addSegment(new SegmentN4());
    if (!isNullOrEmpty(addressSource.patient_city)) {
      subscriberN4Segment.N401_CityName = addressSource.patient_city;
    }
    if (!isNullOrEmpty(addressSource.patient_state)) {
      subscriberN4Segment.N402_StateOrProvinceCode = addressSource.patient_state;
    }
    if (!isNullOrEmpty(addressSource.patient_zip)) {
      subscriberN4Segment.N403_PostalCode = addressSource.patient_zip;
    }
  }

  // Subscriber demographic information (use appropriate source based on self vs dependent)
  const dobSource = isSelf ? claim.patient_dob : (claim.subscriber_dob || claim.patient_dob);
  const genderSource = isSelf ? claim.patient_gender : (claim.subscriber_gender || claim.patient_gender);
  
  if (!isNullOrEmpty(dobSource) || !isNullOrEmpty(genderSource)) {
    const dmgSegment = subscriberNM1Loop.addSegment(new SegmentDMG());
    dmgSegment.DMG01_DateTimePeriodFormatQualifier = "D8";
    if (!isNullOrEmpty(dobSource)) {
      dmgSegment.DMG02_DateOfBirth = buildDateTimePeriod(new Date(dobSource));
    }
    if (!isNullOrEmpty(genderSource)) {
      dmgSegment.DMG03_Gender = genderSource.toUpperCase();
    }
  }

  // Loop 2010BB - Payer Name (matching .NET payer loop logic)
  const payerNM1Loop = subscriber2000BHLoop.addLoop(new TypedLoopNM1("PR"));
  payerNM1Loop.NM102_EntityTypeQualifier = "2";
  if (!isNullOrEmpty(claim.insurance_name)) {
    payerNM1Loop.NM103_NameLastOrOrganizationName = claim.insurance_name;
  }
  if (!isNullOrEmpty(claim.insurance_payer_id)) {
    payerNM1Loop.NM108_IdCodeQualifier = "PI";
    payerNM1Loop.NM109_IdCode = claim.insurance_payer_id;
  }

  // Patient hierarchy (if not self - matching .NET patient logic)
  let claimLoop;
  if (!isSelf && patientHierarchicalNumber) {
    const patient2000CHLoop = subscriber2000BHLoop.AddHLoop(
      patientHierarchicalNumber, 
      "23", 
      false,
      subscriberHierarchicalNumber
    );

    // PAT segment for patient relationship
    const patSegment = patient2000CHLoop.addSegment(new SegmentPAT());
    patSegment.PAT01_RelationshipCode = claim.relation_code || "01";

    // Patient name (Loop 2010CA)
    const patientNM1Loop = patient2000CHLoop.addLoop(new TypedLoopNM1("QC"));
    patientNM1Loop.NM102_EntityTypeQualifier = "1";
    if (!isNullOrEmpty(claim.patient_last_name)) {
      patientNM1Loop.NM103_NameLastOrOrganizationName = claim.patient_last_name;
    }
    if (!isNullOrEmpty(claim.patient_first_name)) {
      patientNM1Loop.NM104_NameFirst = claim.patient_first_name;
    }
    if (!isNullOrEmpty(claim.patient_middle_name)) {
      patientNM1Loop.NM105_NameMiddle = claim.patient_middle_name;
    }

    // Patient address (N3/N4 segments)
    if (!isNullOrEmpty(claim.patient_address)) {
      const patientN3Segment = patientNM1Loop.addSegment(new SegmentN3());
      patientN3Segment.N301_AddressLine1 = claim.patient_address;
      if (!isNullOrEmpty(claim.patient_address2)) {
        patientN3Segment.N302_AddressLine2 = claim.patient_address2;
      }
    }

    if (!isNullOrEmpty(claim.patient_city) || !isNullOrEmpty(claim.patient_state) || !isNullOrEmpty(claim.patient_zip)) {
      const patientN4Segment = patientNM1Loop.addSegment(new SegmentN4());
      if (!isNullOrEmpty(claim.patient_city)) {
        patientN4Segment.N401_CityName = claim.patient_city;
      }
      if (!isNullOrEmpty(claim.patient_state)) {
        patientN4Segment.N402_StateOrProvinceCode = claim.patient_state;
      }
      if (!isNullOrEmpty(claim.patient_zip)) {
        patientN4Segment.N403_PostalCode = claim.patient_zip;
      }
    }

    // Patient demographic information (DMG segment)
    if (!isNullOrEmpty(claim.patient_dob) || !isNullOrEmpty(claim.patient_gender)) {
      const patientDMGSegment = patientNM1Loop.addSegment(new SegmentDMG());
      patientDMGSegment.DMG01_DateTimePeriodFormatQualifier = "D8";
      if (!isNullOrEmpty(claim.patient_dob)) {
        patientDMGSegment.DMG02_DateOfBirth = buildDateTimePeriod(new Date(claim.patient_dob));
      }
      if (!isNullOrEmpty(claim.patient_gender)) {
        patientDMGSegment.DMG03_Gender = claim.patient_gender.toUpperCase();
      }
    }

    claimLoop = patient2000CHLoop.addLoop(new TypedLoopCLM());
  } else {
    claimLoop = subscriber2000BHLoop.addLoop(new TypedLoopCLM());
  }

  // CLM segment
  if (!isNullOrEmpty(claim.patient_control_number)) {
    claimLoop.CLM01_PatientControlNumber = claim.patient_control_number;
  } else if (!isNullOrEmpty(claim.claim_number)) {
    claimLoop.CLM01_PatientControlNumber = claim.claim_number;
  } else if (claim.claim_id) {
    claimLoop.CLM01_PatientControlNumber = claim.claim_id.toString();
  }
  
  if (claim.total_charge_amount) {
    claimLoop.CLM02_TotalClaimChargeAmount = claim.total_charge_amount;
  }
  
  claimLoop.CLM05._1_FacilityCodeValue = claim.place_of_service || "11";
  claimLoop.CLM05._2_FacilityCodeQualifier = "B";
  claimLoop.CLM05._3_ClaimFrequencyTypeCode = claim.claim_frequency || "1";
  claimLoop.CLM06_ProviderOrSupplierSignatureIndicator = "Y";
  claimLoop.CLM07_ProviderAcceptAssignmentCode = "A";
  claimLoop.CLM08_BenefitsAssignmentCertificationIndicator = "Y";
  claimLoop.CLM09_ReleaseOfInformationCode = "Y";

  // Diagnosis codes (matching .NET HI segment logic)
  if (claim.diagnosis_codes && claim.diagnosis_codes.length > 0) {
    const hiSegment = claimLoop.addSegment(new SegmentHI());
    const validDiagnosisCodes = claim.diagnosis_codes.filter(code => code && code.trim());
    
    const primaryICD = "ABK";
    const otherICD = "ABF";
    
    if (validDiagnosisCodes.length > 0 && !isNullOrEmpty(validDiagnosisCodes[0])) {
      hiSegment.HI01_HealthCareCodeInformation = `${primaryICD}:${validDiagnosisCodes[0]}`;
      if (validDiagnosisCodes.length > 1 && !isNullOrEmpty(validDiagnosisCodes[1])) hiSegment.HI02_HealthCareCodeInformation = `${otherICD}:${validDiagnosisCodes[1]}`;
      if (validDiagnosisCodes.length > 2 && !isNullOrEmpty(validDiagnosisCodes[2])) hiSegment.HI03_HealthCareCodeInformation = `${otherICD}:${validDiagnosisCodes[2]}`;
      if (validDiagnosisCodes.length > 3 && !isNullOrEmpty(validDiagnosisCodes[3])) hiSegment.HI04_HealthCareCodeInformation = `${otherICD}:${validDiagnosisCodes[3]}`;
      if (validDiagnosisCodes.length > 4 && !isNullOrEmpty(validDiagnosisCodes[4])) hiSegment.HI05_HealthCareCodeInformation = `${otherICD}:${validDiagnosisCodes[4]}`;
      if (validDiagnosisCodes.length > 5 && !isNullOrEmpty(validDiagnosisCodes[5])) hiSegment.HI06_HealthCareCodeInformation = `${otherICD}:${validDiagnosisCodes[5]}`;
      if (validDiagnosisCodes.length > 6 && !isNullOrEmpty(validDiagnosisCodes[6])) hiSegment.HI07_HealthCareCodeInformation = `${otherICD}:${validDiagnosisCodes[6]}`;
      if (validDiagnosisCodes.length > 7 && !isNullOrEmpty(validDiagnosisCodes[7])) hiSegment.HI08_HealthCareCodeInformation = `${otherICD}:${validDiagnosisCodes[7]}`;
      if (validDiagnosisCodes.length > 8 && !isNullOrEmpty(validDiagnosisCodes[8])) hiSegment.HI09_HealthCareCodeInformation = `${otherICD}:${validDiagnosisCodes[8]}`;
      if (validDiagnosisCodes.length > 9 && !isNullOrEmpty(validDiagnosisCodes[9])) hiSegment.HI10_HealthCareCodeInformation = `${otherICD}:${validDiagnosisCodes[9]}`;
      if (validDiagnosisCodes.length > 10 && !isNullOrEmpty(validDiagnosisCodes[10])) hiSegment.HI11_HealthCareCodeInformation = `${otherICD}:${validDiagnosisCodes[10]}`;
      if (validDiagnosisCodes.length > 11 && !isNullOrEmpty(validDiagnosisCodes[11])) hiSegment.HI12_HealthCareCodeInformation = `${otherICD}:${validDiagnosisCodes[11]}`;
    }
  }

  // Service lines (matching .NET Loop 2400 logic)
  if (charges && charges.length > 0) {
    charges.forEach((charge, index) => {
      const lxLoop = claimLoop.addLoop(new TypedLoopLX());
      lxLoop.LX01_AssignedNumber = (index + 1).toString();
      
      const sv1Segment = lxLoop.addSegment(new SegmentSV1());
      
      // SV101 - Composite Medical Procedure (HC:CPT_CODE:modifiers)
      let compositeProcedure = `HC:${charge.cpt_code}`;
      const modifiers = [charge.modifier_1, charge.modifier_2, charge.modifier_3, charge.modifier_4]
        .filter(mod => mod && mod.trim());
      if (modifiers.length > 0) {
        compositeProcedure += `:${modifiers.join(':')}`;
      }
      sv1Segment.SV101_CompositeMedicalProcedure = compositeProcedure;
      
      sv1Segment.SV102_MonetaryAmount = parseFloat(charge.charge_amount).toFixed(2);
      sv1Segment.SV103_UnitBasisMeasCode = "UN";
      sv1Segment.SV104_Quantity = charge.units?.toString() || "1";
      sv1Segment.SV105_FacilityCode = charge.place_of_service || claim.place_of_service || "11";
      sv1Segment.SV107_CompDiagCodePointer = charge.diagnosis_pointer || "1";

      // Service line dates (matching .NET charge date logic)
      if (charge.service_from_date) {
        const chargeDTPSegment = lxLoop.addSegment(new SegmentDTP());
        chargeDTPSegment.DTP01_DateTimeQualifier = "472";
        chargeDTPSegment.DTP02_DateTimePeriodFormatQualifier = "D8";
        chargeDTPSegment.DTP03_DateTimePeriod = buildDateTimePeriod(new Date(charge.service_from_date));
      }
    });
  }

  console.log(`Built claim structure for claim ${claim.claim_number || claim.claim_id} with ${charges?.length || 0} charges`);
}

/**
 * Generate EDI file from MTX backend data
 * @param {Object} mtxData - Data sent from MTX backend
 * @returns {Object} - Result with success status and file info
 */
export function generateEDIFromMTXData(mtxData) {
  try {
    console.log('Generating EDI file from MTX data...');
    
    // Step 1: Update EDI Builder models with MTX data
    updateEDIModelsFromMTX(mtxData);
    
    // Step 2: Generate EDI using updated models (same as existing logic)
    const interchange = new Interchange(new Date(), 1);
    const group = interchange.addFunctionGroup('HC', 1, '005010X222A1');
    const transaction = group.addTransaction(1);

    // Build the transaction using the updated models
    buildTransactionWithCurrentModels(transaction);
    
    // Step 3: Format and save the EDI file
    const ediString = EdiPrettier.format(interchange);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, -5);
    const fileName = `MTX_EDI_${timestamp}_claim_${claimModel.claim_id}.txt`;
    
    fileStorage.saveFile(fileName, ediString);
    
    console.log(`EDI file generated successfully: ${fileName}`);
    
    return {
      success: true,
      fileName: fileName,
      filePath: `./output/${fileName}`,
      ediContent: ediString,
      claimId: claimModel.claim_id,
      message: 'EDI file generated successfully from MTX data'
    };
    
  } catch (error) {
    console.error('Error generating EDI from MTX data:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to generate EDI file from MTX data'
    };
  }
}

/**
 * Build transaction using current EDI models (reuses existing logic)
 */
function buildTransactionWithCurrentModels(transaction) {
  // BHT Segment
  transaction.bht.BHT01_HierarchicalStructureCode = '0019';
  transaction.bht.BHT02_TransactionSetPurposeCode = '00';
  transaction.bht.BHT03_ReferenceIdentification = claimModel.claim_number || '244579';
  transaction.bht.BHT04_Date = new Date();
  transaction.bht.BHT05_Time = new Date();
  transaction.bht.BHT06_TransactionTypeCode = 'CH';

  // Submitter NM1 Loop (1000A)
  const submitterLoop = transaction.addLoop(new TypedLoopNM1("41"));
  submitterLoop.NM102_EntityTypeQualifier = ediClientSetting.SubmitterEntityTypeID;
  submitterLoop.NM103_NameLastOrOrganizationName = ediClientSetting.SubmitterLastName;

  if (ediClientSetting.SubmitterEntityTypeID === "1") {
    submitterLoop.NM104_NameFirst = ediClientSetting.SubmitterFirstName;
  }

  submitterLoop.NM108_IdCodeQualifier = "46";
  submitterLoop.NM109_IdCode = ediClientSetting.SubmitterID;

  const perSegment = submitterLoop.addSegment(new SegmentPER());
  perSegment.PER01_ContactFunctionCode = 'IC';
  perSegment.PER02_Name = ediClientSetting.SubmitterContact || 'Billing Department';

  if (!isNullOrEmpty(ediClientSetting.SubmitterPhone)) {
    perSegment.PER03_CommunicationNumberQualifier1 = 'TE';
    perSegment.PER04_CommunicationNumber1 = ediClientSetting.SubmitterPhone;
  }

  if (!isNullOrEmpty(ediClientSetting.SubmitterFax)) {
    perSegment.PER05_CommunicationNumberQualifier2 = 'FX';
    perSegment.PER06_CommunicationNumber2 = ediClientSetting.SubmitterFax;
  }

  // Receiver NM1 Loop (1000B)
  const receiverLoop = transaction.addLoop(new TypedLoopNM1("40"));
  receiverLoop.NM102_EntityTypeQualifier = "2";
  receiverLoop.NM103_NameLastOrOrganizationName = ediClientSetting.ReceiverName;
  receiverLoop.NM108_IdCodeQualifier = "46";
  receiverLoop.NM109_IdCode = ediClientSetting.ReceiverID;

  // Use the same logic as the main transaction building - call the existing function
  buildMainTransactionLogic(transaction);

  console.log('Transaction built using existing EDI logic with current models');
}

/**
 * Extract the main transaction building logic into a reusable function
 */
function buildMainTransactionLogic(transaction) {
  // Provider 2000A Loop
  const provider2000ALoop = transaction.AddHLoop("1", "20", true);

  if (!isNullOrEmpty(claimModel.billing_provider_taxonomy)) {
    const prvSegment = provider2000ALoop.addSegment(new SegmentPRV());
    prvSegment.PRV01_ProviderCode = "BI";
    prvSegment.PRV02_ReferenceIdQualifier = "PXC";
    prvSegment.PRV03_ProviderTaxonomyCode = claimModel.billing_provider_taxonomy;
  }

  var billingProviderNM1 = provider2000ALoop.addLoop(new TypedLoopNM1("85"));
  billingProviderNM1.NM102_EntityTypeQualifier = "2";
  billingProviderNM1.NM103_NameLastOrOrganizationName = claimModel.billing_provider_name;

  if (claimModel.billing_provider_npi) {
    billingProviderNM1.NM108_IdCodeQualifier = "XX";
    billingProviderNM1.NM109_IdCode = claimModel.billing_provider_npi;
  }

  var billingProviderN3 = billingProviderNM1.addSegment(new SegmentN3());
  billingProviderN3.N301_AddressLine1 = claimModel.billing_provider_address1;
  billingProviderN3.N302_AddressLine2 = claimModel.billing_provider_address2 ?? '';

  var billingProviderN4 = billingProviderNM1.addSegment(new SegmentN4());
  billingProviderN4.N401_CityName = claimModel.billing_provider_city;
  billingProviderN4.N402_StateOrProvinceCode = claimModel.billing_provider_state;
  billingProviderN4.N403_PostalCode = claimModel.billing_provider_zip;

  var billingProviderRef = billingProviderNM1.addSegment(new SegmentREF());
  billingProviderRef.REF01_ReferenceIdQualifier = "EI";
  billingProviderRef.REF02_ReferenceId = claimModel.billing_provider_tax_id;

  if (!isNullOrEmpty(claimModel.billing_provider_name)) {
    var billingProviderPER = billingProviderNM1.addSegment(new SegmentPER());
    billingProviderPER.PER01_ContactFunctionCode = 'IC';
    billingProviderPER.PER02_Name = claimModel.billing_provider_name;

    if (!isNullOrEmpty(claimModel.billing_provider_phone)) {
      billingProviderPER.PER03_CommunicationNumberQualifier1 = 'TE';
      billingProviderPER.PER04_CommunicationNumber1 = claimModel.billing_provider_phone;
    }

    if (!isNullOrEmpty(claimModel.billing_provider_phone_ext)) {
      billingProviderPER.PER05_CommunicationNumberQualifier2 = 'EX';
      billingProviderPER.PER06_CommunicationNumber2 = claimModel.billing_provider_phone_ext;
    }
  }

  if (!isNullOrEmpty(claimModel.pay_to_provider_address1)) {
    var paytoaddressloop2010AB = provider2000ALoop.addLoop(new TypedLoopNM1("87"));
    paytoaddressloop2010AB.NM102_EntityTypeQualifier = "2";

    var paytoaddressN3 = paytoaddressloop2010AB.addSegment(new SegmentN3());
    paytoaddressN3.N301_AddressLine1 = claimModel.pay_to_provider_address1;
    paytoaddressN3.N302_AddressLine2 = claimModel.pay_to_provider_address2 ?? '';

    if (!isNullOrEmpty(claimModel.pay_to_provider_city)) {
      var paytoaddressN4 = paytoaddressloop2010AB.addSegment(new SegmentN4());
      paytoaddressN4.N401_CityName = claimModel.pay_to_provider_city;
      paytoaddressN4.N402_StateOrProvinceCode = claimModel.pay_to_provider_state;
      paytoaddressN4.N403_PostalCode = claimModel.pay_to_provider_zip;
    }
  }

  // 2000B — SUBSCRIBER HIERARCHICAL LEVEL
  const subscriber2000BHLoop = provider2000ALoop.AddHLoop("2", "22", true, "1");

  // SBR - Subscriber Info
  const sbrSegment2000B = subscriber2000BHLoop.addSegment(new SegmentSBR());
  sbrSegment2000B.SBR01_PayerResponsibilitySequenceNumberCode = claimModel.claim_type;

  if (claimModel.relation_code == '18') {
    sbrSegment2000B.SBR02_IndividualRelationshipCode = claimModel.relation_code;
  }

  sbrSegment2000B.SBR03_PolicyOrGroupNumber = claimModel.sub_group_number;
  sbrSegment2000B.SBR04_GroupName = claimModel.sub_group_name;
  sbrSegment2000B.SBR09_ClaimFilingIndicatorCode = claimModel.claim_filing_indicator;

  const subscriberName2010BALoop = subscriber2000BHLoop.addLoop(new TypedLoopNM1("IL"));
  subscriberName2010BALoop.NM102_EntityTypeQualifier = "1"
  subscriberName2010BALoop.NM103_NameLastOrOrganizationName = claimModel.subscriber_last_name;
  subscriberName2010BALoop.NM104_NameFirst = claimModel.subscriber_first_name ?? "";
  subscriberName2010BALoop.NM105_NameMiddle = claimModel.subscriber_middle_name ?? "";
  if (!isNullOrEmpty(claimModel.subscriber_id)) {
    subscriberName2010BALoop.NM108_IdCodeQualifier = "MI";
    subscriberName2010BALoop.NM109_IdCode = claimModel.subscriber_id;
  }
  if (!isNullOrEmpty(claimModel.subscriber_address1)) {
    const subscriberN3 = subscriberName2010BALoop.addSegment(new SegmentN3());
    subscriberN3.N301_AddressLine1 = claimModel.subscriber_address1;
    subscriberN3.N302_AddressLine2 = claimModel.subscriber_address2 ?? '';
  }
  if (!isNullOrEmpty(claimModel.subscriber_city)) {
    const subscriberN4 = subscriberName2010BALoop.addSegment(new SegmentN4());
    subscriberN4.N401_CityName = claimModel.subscriber_city;
    subscriberN4.N402_StateOrProvinceCode = claimModel.subscriber_state;
    subscriberN4.N403_PostalCode = claimModel.subscriber_zip;
  }

  if (!isNullOrEmpty(claimModel.subscriber_dob) && !isNullOrEmpty(claimModel.subscriber_gender)) {
    var subscriberDMG2010BALoop = subscriberName2010BALoop.addSegment(new SegmentDMG());
    subscriberDMG2010BALoop.DMG01_DateTimePeriodFormatQualifier = "D8";
    subscriberDMG2010BALoop.DMG02_DateOfBirth = claimModel.subscriber_dob;
    subscriberDMG2010BALoop.DMG03_Gender = claimModel.subscriber_gender;
  }

  const payerName2010BBLoop = subscriber2000BHLoop.addLoop(new TypedLoopNM1("PR"));
  payerName2010BBLoop.NM102_EntityTypeQualifier = "2";
  payerName2010BBLoop.NM103_NameLastOrOrganizationName = claimModel.payer_last_name;
  payerName2010BBLoop.NM104_NameFirst = claimModel.payer_first_name ?? "";
  payerName2010BBLoop.NM105_NameMiddle = claimModel.payer_middle_name ?? "";

  if (!isNullOrEmpty(claimModel.payer_id)) {
    payerName2010BBLoop.NM108_IdCodeQualifier = "PI";
    payerName2010BBLoop.NM109_IdCode = claimModel.payer_id;
  }

  if (!isNullOrEmpty(claimModel.payer_address1)) {
    const payerN3 = payerName2010BBLoop.addSegment(new SegmentN3());
    payerN3.N301_AddressLine1 = claimModel.payer_address1;
    payerN3.N302_AddressLine2 = claimModel.payer_address2 ?? '';

    if (!isNullOrEmpty(claimModel.payer_city)) {
      const payerN4 = payerName2010BBLoop.addSegment(new SegmentN4());
      payerN4.N401_CityName = claimModel.payer_city;
      payerN4.N402_StateOrProvinceCode = claimModel.payer_state;
      payerN4.N403_PostalCode = claimModel.payer_zip;
    }
  }

  let claim2300Loop;
  if (claimModel.relation_code != "18") {
    var patientLoop = subscriber2000BHLoop.AddHLoop("3", "23", false, "2");

    if (!isNullOrEmpty(claimModel.patient_first_name)) {
      var segmentPAT = patientLoop.addSegment(new SegmentPAT());
      segmentPAT.PAT01_RelationshipCode = claimModel.relation_code;

      var patientNM1Segment = patientLoop.addLoop(new TypedLoopNM1("QC"));
      patientNM1Segment.NM102_EntityTypeQualifier = "1";
      patientNM1Segment.NM103_NameLastOrOrganizationName = claimModel.patient_last_name;
      patientNM1Segment.NM104_NameFirst = claimModel.patient_first_name ?? "";
      patientNM1Segment.NM105_NameMiddle = claimModel.patient_middle_name ?? "";

      if (!isNullOrEmpty(claimModel.patient_address1)) {
        const patientN3 = patientNM1Segment.addSegment(new SegmentN3());
        patientN3.N301_AddressLine1 = claimModel.patient_address1;
        patientN3.N302_AddressLine2 = claimModel.patient_address2 ?? '';
      }

      if (!isNullOrEmpty(claimModel.patient_city)) {
        const patientN4 = patientNM1Segment.addSegment(new SegmentN4());
        patientN4.N401_CityName = claimModel.patient_city;
        patientN4.N402_StateOrProvinceCode = claimModel.patient_state;
        patientN4.N403_PostalCode = claimModel.patient_zip;
      }

      if (!isNullOrEmpty(claimModel.patient_dob) && !isNullOrEmpty(claimModel.patient_gender)) {
        var patientDMGSegment = patientNM1Segment.addSegment(new SegmentDMG());
        patientDMGSegment.DMG01_DateTimePeriodFormatQualifier = "D8";
        patientDMGSegment.DMG02_DateOfBirth = claimModel.patient_dob;
        patientDMGSegment.DMG03_Gender = claimModel.patient_gender;
      }
    }

    claim2300Loop = patientLoop.addLoop(new TypedLoopCLM());
  }
  else {
    claim2300Loop = subscriber2000BHLoop.addLoop(new TypedLoopCLM());
  }

  claim2300Loop.CLM01_PatientControlNumber = claimModel.patient_control_number;
  claim2300Loop.CLM02_TotalClaimChargeAmount = claimModel.total_charge_amount ?? 0;
  claim2300Loop.CLM05._1_FacilityCodeValue = claimModel.facility_code_value;
  claim2300Loop.CLM05._2_FacilityCodeQualifier = claimModel.facility_code_qualifier;
  claim2300Loop.CLM05._3_ClaimFrequencyTypeCode = claimModel.claim_frequency_type_code;
  claim2300Loop.CLM06_ProviderOrSupplierSignatureIndicator = claimModel.provider_signature_indicator;
  claim2300Loop.CLM07_ProviderAcceptAssignmentCode = claimModel.provider_accept_assignment_code;
  claim2300Loop.CLM08_BenefitsAssignmentCertificationIndicator = claimModel.benefits_assignment_certification_indicator;
  claim2300Loop.CLM09_ReleaseOfInformationCode = claimModel.release_of_information_code;

  if (!isNullOrEmpty(claimModel.accident_date)) {
    claim2300Loop.CLM11._1_RelatedCausesCode = claimModel.related_causes_type_code;
    if (claimModel.related_causes_type_code == "AA") {
      claim2300Loop.CLM11._4_StateOrProvinceCode = claimModel.accident_state;
    }
  }

  claim2300Loop.CLM12_SpecialProgramCode = claimModel.special_program_indicator ?? "";
  claim2300Loop.CLM20_DelayReasonCode = claimModel.delay_reason_code ?? "";

  const hiSegment = claim2300Loop.addSegment(new SegmentHI());
  const primaryICD = 'ABK';
  const otherICD = 'ABF';

  if (claimModel.diagnosis_codes && claimModel.diagnosis_codes.length > 0) {
    claimModel.diagnosis_codes.forEach((code, index) => {
      if (!code) return;

      const prefix = index === 0 ? primaryICD : otherICD;
      const fieldIndex = index; 

      hiSegment.set(fieldIndex, `${prefix}:${code}`);
    });
  }

  if (!isNullOrEmpty(claimModel.referring_provider_last_name)) {
    var refferingNM1Segment2310Loop = claim2300Loop.addLoop(new TypedLoopNM1("DN"));
    refferingNM1Segment2310Loop.NM102_EntityTypeQualifier = "1";
    refferingNM1Segment2310Loop.NM103_NameLastOrOrganizationName = claimModel.referring_provider_last_name;
    refferingNM1Segment2310Loop.NM104_NameFirst = claimModel.referring_provider_first_name ?? "";
    refferingNM1Segment2310Loop.NM105_NameMiddle = claimModel.referring_provider_middle_name ?? "";
    refferingNM1Segment2310Loop.NM108_IdCodeQualifier = "XX";
    refferingNM1Segment2310Loop.NM109_IdCode = claimModel.referring_provider_npi ?? "";
  }

  if (!isNullOrEmpty(claimModel.rendering_provider_last_name)) {
    var renderingNM1Segment2310ALoop = claim2300Loop.addLoop(new TypedLoopNM1("82"));
    renderingNM1Segment2310ALoop.NM102_EntityTypeQualifier = "1";
    renderingNM1Segment2310ALoop.NM103_NameLastOrOrganizationName = claimModel.rendering_provider_last_name;
    renderingNM1Segment2310ALoop.NM104_NameFirst = claimModel.rendering_provider_first_name ?? "";
    renderingNM1Segment2310ALoop.NM105_NameMiddle = claimModel.rendering_provider_middle_name ?? "";
    renderingNM1Segment2310ALoop.NM108_IdCodeQualifier = "XX";
    renderingNM1Segment2310ALoop.NM109_IdCode = claimModel.rendering_provider_npi;

    if (!isNullOrEmpty(claimModel.rendering_provider_taxonomy)) {
      var renderingPRVSegment2310BLoop = renderingNM1Segment2310ALoop.addSegment(new SegmentPRV());
      renderingPRVSegment2310BLoop.PRV01_ProviderCode = "PE";
      renderingPRVSegment2310BLoop.PRV02_ReferenceIdQualifier = "PXC";
      renderingPRVSegment2310BLoop.PRV03_ProviderTaxonomyCode = claimModel.rendering_provider_taxonomy;
    }
  }

  if (!isNullOrEmpty(claimModel.location_name)) {
    var facilityLocationNM1Segment2310CLoop = claim2300Loop.addLoop(new TypedLoopNM1("77"));
    facilityLocationNM1Segment2310CLoop.NM102_EntityTypeQualifier = "2";
    facilityLocationNM1Segment2310CLoop.NM103_NameLastOrOrganizationName = claimModel.location_name;
    if (!isNullOrEmpty(claimModel.location_npi)) {
      facilityLocationNM1Segment2310CLoop.NM108_IdCodeQualifier = "XX";
      facilityLocationNM1Segment2310CLoop.NM109_IdCode = claimModel.location_npi;
    }
    if (!isNullOrEmpty(claimModel.location_address1)) {
      var facilityLocationNM3Segment2310CALoop = facilityLocationNM1Segment2310CLoop.addSegment(new TypedSegmentN3());
      facilityLocationNM3Segment2310CALoop.N301_AddressInformation = claimModel.location_address1;
      facilityLocationNM3Segment2310CALoop.N302_AddressInformation = claimModel.location_address2 ?? "";
      if (!isNullOrEmpty(claimModel.location_city)) {
        var facilityLocationN4Segment2310CBLoop = facilityLocationNM1Segment2310CLoop.addSegment(new TypedSegmentN4());
        facilityLocationN4Segment2310CBLoop.N401_CityName = claimModel.location_city;
        facilityLocationN4Segment2310CBLoop.N402_StateOrProvinceCode = claimModel.location_state ?? "";
        facilityLocationN4Segment2310CBLoop.N403_PostalCode = claimModel.location_full_zip ?? "";
      }
    }
  }

  // Service Lines (2400 Loop)
  let counter = 0;
  for (const charge of chargeModel) {
    counter++;

    const lxLoop = claim2300Loop.addLoop(new TypedLoopLX());
    lxLoop.LX01_AssignedNumber = counter.toString();

    const sv1Segment = lxLoop.addSegment(new SegmentSV1());
    let components = [
      "HC",        
      charge.cpt   
    ];

    [charge.mod1, charge.mod2, charge.mod3, charge.mod4]
      .forEach(mod => { if (mod) components.push(mod); });

    if (charge.ProcedureDescription) {
      while (components.length < 6) components.push("");
      components.push(charge.ProcedureDescription);
    }

    sv1Segment.SV101_CompositeMedicalProcedure = components.join(":");
    sv1Segment.SV102_MonetaryAmount = charge.fee;
    sv1Segment.SV103_UnitBasisMeasCode = "UN";
    sv1Segment.SV104_Quantity = charge.units?.toString();
    sv1Segment.SV105_FacilityCode = charge.charge_pos;
    sv1Segment.SV107_CompDiagCodePointer = charge.diagnosis_pointer;

    const dtpSegment = lxLoop.addSegment(new SegmentDTP());
    dtpSegment.DTP01_DateTimeQualifier = "472";
    dtpSegment.DTP02_DateTimePeriodFormatQualifier = "RD8";
    dtpSegment.DTP03_DateTimePeriod = buildDateTimePeriod(charge.from_dos, charge.to_dos);
  }
}

