/**
 * Test batch data with 5 claims for testing batch EDI generation
 * This matches the structure expected by generateBatchEDIFromMTXData()
 */

export const testBatchData = {
  batchInfo: {
    batch_id: 123,
    batch_number: "BATCH_000123_20250824",
    total_claims: 5,
    total_amount: 750.00,
    processing_date: "2025-08-24T10:30:00Z"
  },
  
  ediClientSetting: {
    // ISA Segment Settings
    ISA01: "00",
    ISA02: "          ", // 10 spaces
    ISA03: "01", 
    ISA04: "SECRET    ", // padded to 10
    ISA05: "ZZ",
    ISA06: "MTXPROVIDER    ", // padded to 15
    ISA07: "ZZ",
    ISA08: "AHCCCS         ", // padded to 15
    ISA11: "U",
    ISA12: "00501",
    ISA13: "000000123", // batch control number
    ISA14: "0",
    ISA15: "P",
    ISA16: ":",
    
    // GS Segment Settings
    GS02: "MTXPROVIDER",
    GS03: "AHCCCS",
    GS08: "005010X222A1",
    
    // Submitter/Receiver Info
    sender_id: "MTXPROVIDER",
    receiver_id: "AHCCCS",
    submitter_id: "MTXSUBMITTER",
    submitter_name: "MTX Healthcare Services",
    submitter_contact: "Billing Department",
    receiver_name: "Arizona Health Care Cost Containment System",
    entity_type: "2", // Non-person entity
    phone: "6025551234",
    phone_ext: "100",
    isa13: "000000123"
  },

  claims: [
    // Claim 1: Wheelchair transport
    {
      claimData: {
        claim_id: 1001,
        claim_number: "CLM001001",
        patient_control_number: "PAT001001",
        total_charge_amount: 125.50,
        claim_type: "P", // Primary
        claim_frequency: "1", // Original
        place_of_service: "41", // Ambulance - Land
        relation_code: "18", // Self
        claim_filing_ind: "MC", // Medicaid
        
        // Patient Information
        patient_first_name: "John",
        patient_last_name: "Doe",
        patient_middle_name: "Michael",
        patient_dob: "1985-03-15",
        patient_gender: "M",
        patient_address: "123 Main Street",
        patient_city: "Phoenix",
        patient_state: "AZ",
        patient_zip: "85001",
        
        // Insurance Information
        member_id: "MED123456789",
        group_number: "GRP001",
        group_name: "Arizona Medicaid",
        insurance_name: "Arizona Complete Health",
        insurance_payer_id: "87726",
        
        // Provider Information
        provider_name: "MTX Medical Transport",
        provider_npi: "1234567890",
        provider_taxonomy: "343900000X", // NEMT
        provider_address: "456 Healthcare Blvd",
        provider_city: "Phoenix",
        provider_state: "AZ",
        provider_zip: "85002",
        provider_tax_id: "123456789",
        
        // Service Dates
        service_from_date: "2025-08-20",
        service_to_date: "2025-08-20",
        
        // Diagnosis
        diagnosis_codes: ["Z51.11", "M79.603"]
      },
      
      chargeData: [
        {
          charge_id: 10001,
          cpt_code: "A0130", // Non-emergency transportation; wheelchair van
          charge_amount: 85.50,
          units: 1,
          place_of_service: "41",
          service_from_date: "2025-08-20",
          service_to_date: "2025-08-20",
          diagnosis_pointer: "1",
          modifier_1: "",
          modifier_2: "",
          service_description: "Wheelchair van transport"
        },
        {
          charge_id: 10002,
          cpt_code: "A0425", // Ground mileage
          charge_amount: 40.00,
          units: 10, // 10 miles
          place_of_service: "41",
          service_from_date: "2025-08-20",
          service_to_date: "2025-08-20",
          diagnosis_pointer: "1",
          service_description: "Mileage - 10 miles"
        }
      ]
    },

    // Claim 2: Ambulatory transport
    {
      claimData: {
        claim_id: 1002,
        claim_number: "CLM001002",
        patient_control_number: "PAT001002",
        total_charge_amount: 95.75,
        claim_type: "P",
        claim_frequency: "1",
        place_of_service: "41",
        relation_code: "18", // Self
        claim_filing_ind: "MC",
        
        // Patient Information
        patient_first_name: "Maria",
        patient_last_name: "Garcia",
        patient_middle_name: "Elena",
        patient_dob: "1978-11-22",
        patient_gender: "F",
        patient_address: "789 Oak Avenue",
        patient_city: "Tucson",
        patient_state: "AZ",
        patient_zip: "85701",
        
        // Insurance Information
        member_id: "MED987654321",
        group_number: "GRP002",
        group_name: "Arizona Medicaid",
        insurance_name: "Banner University Family Care",
        insurance_payer_id: "87727",
        
        // Provider Information (same as claim 1)
        provider_name: "MTX Medical Transport",
        provider_npi: "1234567890",
        provider_taxonomy: "343900000X",
        provider_address: "456 Healthcare Blvd",
        provider_city: "Phoenix",
        provider_state: "AZ",
        provider_zip: "85002",
        provider_tax_id: "123456789",
        
        service_from_date: "2025-08-21",
        service_to_date: "2025-08-21",
        
        diagnosis_codes: ["Z51.81", "I25.10"]
      },
      
      chargeData: [
        {
          charge_id: 10003,
          cpt_code: "A0425", // Ground mileage for ambulatory
          charge_amount: 95.75,
          units: 15, // 15 miles roundtrip
          place_of_service: "41",
          service_from_date: "2025-08-21",
          service_to_date: "2025-08-21",
          diagnosis_pointer: "1",
          service_description: "Ambulatory transport - 15 miles"
        }
      ]
    },

    // Claim 3: Stretcher transport (dependent child)
    {
      claimData: {
        claim_id: 1003,
        claim_number: "CLM001003",
        patient_control_number: "PAT001003",
        total_charge_amount: 185.25,
        claim_type: "P",
        claim_frequency: "1",
        place_of_service: "41",
        relation_code: "19", // Child
        claim_filing_ind: "MC",
        
        // Patient Information (child)
        patient_first_name: "Emma",
        patient_last_name: "Johnson",
        patient_middle_name: "Rose",
        patient_dob: "2015-05-10",
        patient_gender: "F",
        patient_address: "321 Pine Street",
        patient_city: "Mesa",
        patient_state: "AZ",
        patient_zip: "85201",
        
        // Subscriber Information (parent)
        subscriber_first_name: "Robert",
        subscriber_last_name: "Johnson",
        subscriber_dob: "1988-02-14",
        subscriber_gender: "M",
        
        // Insurance Information
        member_id: "MED555444333",
        group_number: "GRP003",
        group_name: "Arizona Medicaid",
        insurance_name: "Mercy Care Plan",
        insurance_payer_id: "87728",
        
        // Provider Information
        provider_name: "MTX Medical Transport",
        provider_npi: "1234567890",
        provider_taxonomy: "343900000X",
        provider_address: "456 Healthcare Blvd",
        provider_city: "Phoenix",
        provider_state: "AZ",
        provider_zip: "85002",
        provider_tax_id: "123456789",
        
        service_from_date: "2025-08-22",
        service_to_date: "2025-08-22",
        
        diagnosis_codes: ["G93.1", "Z51.11"]
      },
      
      chargeData: [
        {
          charge_id: 10004,
          cpt_code: "A0140", // Non-emergency transportation; stretcher van
          charge_amount: 145.25,
          units: 1,
          place_of_service: "41",
          service_from_date: "2025-08-22",
          service_to_date: "2025-08-22",
          diagnosis_pointer: "1",
          service_description: "Stretcher van transport"
        },
        {
          charge_id: 10005,
          cpt_code: "A0425", // Mileage
          charge_amount: 40.00,
          units: 8, // 8 miles
          place_of_service: "41",
          service_from_date: "2025-08-22",
          service_to_date: "2025-08-22",
          diagnosis_pointer: "1",
          service_description: "Mileage - 8 miles"
        }
      ]
    },

    // Claim 4: Multiple diagnosis codes
    {
      claimData: {
        claim_id: 1004,
        claim_number: "CLM001004",
        patient_control_number: "PAT001004",
        total_charge_amount: 158.00,
        claim_type: "P",
        claim_frequency: "1",
        place_of_service: "41",
        relation_code: "18", // Self
        claim_filing_ind: "MC",
        
        // Patient Information
        patient_first_name: "William",
        patient_last_name: "Brown",
        patient_middle_name: "James",
        patient_dob: "1965-09-30",
        patient_gender: "M",
        patient_address: "654 Cedar Lane",
        patient_city: "Glendale",
        patient_state: "AZ",
        patient_zip: "85301",
        
        // Insurance Information
        member_id: "MED111222333",
        group_number: "GRP004",
        group_name: "Arizona Medicaid",
        insurance_name: "Health Choice Arizona",
        insurance_payer_id: "87729",
        
        // Provider Information
        provider_name: "MTX Medical Transport",
        provider_npi: "1234567890",
        provider_taxonomy: "343900000X",
        provider_address: "456 Healthcare Blvd",
        provider_city: "Phoenix",
        provider_state: "AZ",
        provider_zip: "85002",
        provider_tax_id: "123456789",
        
        service_from_date: "2025-08-23",
        service_to_date: "2025-08-23",
        
        diagnosis_codes: ["N950", "Z3402"] 
      },
      
      chargeData: [
        {
          charge_id: 10006,
          cpt_code: "A0120", // Non-emergency transportation; mini-bus
          charge_amount: 75.00,
          units: 1,
          place_of_service: "41",
          service_from_date: "2025-08-23",
          service_to_date: "2025-08-23",
          diagnosis_pointer: "1",
          service_description: "Mini-bus transport"
        },
        {
          charge_id: 10007,
          cpt_code: "A0425", // Mileage
          charge_amount: 83.00,
          units: 20, // 20 miles roundtrip
          place_of_service: "41",
          service_from_date: "2025-08-23",
          service_to_date: "2025-08-23",
          diagnosis_pointer: "4",
          service_description: "Mileage - 20 miles"
        }
      ]
    },

    // Claim 5: With modifiers and special circumstances
    {
      claimData: {
        claim_id: 1005,
        claim_number: "CLM001005",
        patient_control_number: "PAT001005",
        total_charge_amount: 185.50,
        claim_type: "P",
        claim_frequency: "1",
        place_of_service: "41",
        relation_code: "01", // Spouse
        claim_filing_ind: "MC",
        
        // Patient Information (spouse)
        patient_first_name: "Linda",
        patient_last_name: "Wilson",
        patient_middle_name: "Ann",
        patient_dob: "1970-12-05",
        patient_gender: "F",
        patient_address: "987 Maple Drive",
        patient_city: "Scottsdale",
        patient_state: "AZ",
        patient_zip: "85251",
        
        // Subscriber Information (primary)
        subscriber_first_name: "David",
        subscriber_last_name: "Wilson",
        subscriber_dob: "1968-08-18",
        subscriber_gender: "M",
        
        // Insurance Information
        member_id: "MED777888999",
        group_number: "GRP005",
        group_name: "Arizona Medicaid",
        insurance_name: "United Healthcare Community Plan",
        insurance_payer_id: "87730",
        
        // Provider Information
        provider_name: "MTX Medical Transport",
        provider_npi: "1234567890",
        provider_taxonomy: "343900000X",
        provider_address: "456 Healthcare Blvd",
        provider_city: "Phoenix",
        provider_state: "AZ",
        provider_zip: "85002",
        provider_tax_id: "123456789",
        
        service_from_date: "2025-08-24",
        service_to_date: "2025-08-24",
        
        diagnosis_codes: ["M54.5", "Z51.89"]
      },
      
      chargeData: [
        {
          charge_id: 10008,
          cpt_code: "A0130", // Wheelchair van
          charge_amount: 110.50,
          units: 1,
          place_of_service: "41",
          service_from_date: "2025-08-24",
          service_to_date: "2025-08-24",
          diagnosis_pointer: "1",
          modifier_1: "QM", // Ambulance service provided under arrangement
          modifier_2: "GM", // Multiple patients on one ambulance trip
          service_description: "Wheelchair van with special arrangements"
        },
        {
          charge_id: 10009,
          cpt_code: "A0425", // Mileage
          charge_amount: 75.00,
          units: 18, // 18 miles
          place_of_service: "41",
          service_from_date: "2025-08-24",
          service_to_date: "2025-08-24",
          diagnosis_pointer: "2",
          modifier_1: "QN", // Ambulance furnished directly by provider
          service_description: "Mileage with direct service"
        }
      ]
    }
  ]
};


export default testBatchData;
