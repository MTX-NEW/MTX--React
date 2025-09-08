const Batch = require('../models/Batch');
const BatchDetail = require('../models/BatchDetail');
const Claim = require('../models/Claim');
const ClaimCharge = require('../models/ClaimCharge');
const Trip = require('../models/Trip');
const TripMember = require('../models/TripMember');
const TripLocation = require('../models/TripLocation');
const TripLeg = require('../models/TripLeg');
const Program = require('../models/Program');
const EDIClientSetting = require('../models/EDIClientSetting');
const path = require('path');
const fs = require('fs').promises;
const { Op } = require('sequelize');

// Load associations
require('../models/associations');

class BatchController {
  // Create a new batch
  async createBatch(req, res) {
    try {
      const { claim_ids, created_by } = req.body;

      if (!claim_ids || !Array.isArray(claim_ids) || claim_ids.length === 0) {
        return res.status(400).json({ error: 'claim_ids array is required' });
      }

      if (!created_by) {
        return res.status(400).json({ error: 'created_by is required' });
      }

      // Validate claims exist
      const claims = await Claim.findAll({
        where: { claim_id: { [Op.in]: claim_ids } },
        include: [
          {
            model: ClaimCharge,
            as: 'charges'
          }
        ]
      });

      if (claims.length !== claim_ids.length) {
        return res.status(400).json({ error: 'Some claim IDs are invalid' });
      }

      // Calculate total amount
      const totalAmount = claims.reduce((sum, claim) => {
        const claimAmount = claim.charges?.reduce((chargeSum, charge) => {
          return chargeSum + parseFloat(charge.charge_amount || 0);
        }, 0) || 0;
        return sum + claimAmount;
      }, 0);

      // Generate batch number
      const batchNumber = this.generateBatchNumber();

      // Create batch
      const batch = await Batch.create({
        batch_number: batchNumber,
        total_claims: claim_ids.length,
        total_amount: totalAmount,
        created_by: created_by
      });

      // Create batch details
      const batchDetails = await Promise.all(
        claims.map(claim => {
          const claimAmount = claim.charges?.reduce((sum, charge) => {
            return sum + parseFloat(charge.charge_amount || 0);
          }, 0) || 0;

          return BatchDetail.create({
            batch_id: batch.batch_id,
            claim_id: claim.claim_id,
            claim_number: claim.claim_number,
            claim_amount: claimAmount
          });
        })
      );

      res.json({
        success: true,
        data: {
          batch,
          batch_details: batchDetails
        }
      });

    } catch (error) {
      console.error('Error creating batch:', error);
      res.status(500).json({ error: 'Failed to create batch: ' + error.message });
    }
  }

  // Get all batches
  async getBatches(req, res) {
    try {
      const batches = await Batch.findAll({
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          batches
        }
      });

    } catch (error) {
      console.error('Error fetching batches:', error);
      res.status(500).json({ error: 'Failed to fetch batches' });
    }
  }

  // Get detailed batch information with claims
  async getBatchDetails(req, res) {
    try {
      const { batch_id } = req.params;

      const batch = await Batch.findByPk(batch_id, {
        include: [
          {
            model: BatchDetail,
            as: 'batchDetails',
            include: [
              {
                model: Claim,
                include: [
                  {
                    model: Trip,
                    include: [
                      {
                        model: TripMember
                      },
                      {
                        model: TripLeg,
                        as: 'legs',
                        include: [
                          {
                            model: TripLocation,
                            as: 'pickupLocation'
                          },
                          {
                            model: TripLocation,
                            as: 'dropoffLocation'
                          }
                        ]
                      }
                    ]
                  },
                  {
                    model: ClaimCharge,
                    as: 'charges'
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!batch) {
        return res.status(404).json({ 
          success: false, 
          message: 'Batch not found' 
        });
      }

      res.json({
        success: true,
        data: { batch }
      });

    } catch (error) {
      console.error('Error fetching batch details:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch batch details: ' + error.message 
      });
    }
  }

  // Process batch and generate EDI file
  async processBatch(req, res) {
    try {
      const { batch_id } = req.params;

      const batch = await Batch.findByPk(batch_id);
      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      // Allow processing for pending and failed batches
      if (!['pending', 'failed'].includes(batch.status)) {
        return res.status(400).json({ 
          error: `Cannot process batch with status '${batch.status}'. Only pending and failed batches can be processed.` 
        });
      }

      console.log(`Processing batch ${batch_id} with status '${batch.status}'`);

      // Update batch status to processing
      await batch.update({ status: 'processing' });

      try {
        // Get batch details
        const batchDetails = await BatchDetail.findAll({
          where: { batch_id: batch_id }
        });

        if (!batchDetails || batchDetails.length === 0) {
          throw new Error('No batch details found for this batch');
        }

        console.log(`Found ${batchDetails.length} batch details for batch ${batch_id}`);

        const claimIds = batchDetails.map(detail => detail.claim_id);

        // Fetch claims data with all required associations
        const claimsData = await Claim.findAll({
          where: { claim_id: { [Op.in]: claimIds } },
          include: [
            {
              model: ClaimCharge,
              as: 'charges'
            },
            {
              model: Trip,
              include: [
                {
                  model: TripMember,
                  include: [
                    {
                      model: Program
                    },
                    {
                      model: TripLocation,
                      as: 'memberPickupLocation'
                    },
                    {
                      model: TripLocation,
                      as: 'memberDropoffLocation'
                    }
                  ]
                }
              ]
            }
          ]
        });

        if (!claimsData || claimsData.length === 0) {
          throw new Error('No claims data found for this batch');
        }

        console.log(`Found ${claimsData.length} claims for processing`);

        // Get EDI client settings
        const ediClientSetting = await EDIClientSetting.findOne();
        if (!ediClientSetting) {
          throw new Error('EDI client settings not found');
        }

        // Transform data for EDI generation
        const transformedData = this.transformClaimsForEDI(claimsData, ediClientSetting, batch);

        // Import EDI Builder dynamically
        const ediBuilderPath = path.join(__dirname, '../EDI Builder/index.js');
        const { generateBatchEDIFromMTXData } = await import(`file://${ediBuilderPath.replace(/\\/g, '/')}`);

        // Generate EDI file
        const ediResult = generateBatchEDIFromMTXData(transformedData);
        
        if (!ediResult.success) {
          throw new Error(ediResult.error || 'Failed to generate EDI content');
        }

        // Save EDI file
        const ediFileName = `batch_${batch.batch_number}_${Date.now()}.edi`;
        const ediFilePath = path.join(__dirname, '../output', ediFileName);
        
        // Ensure directory exists
        await fs.mkdir(path.dirname(ediFilePath), { recursive: true });
        await fs.writeFile(ediFilePath, ediResult.ediContent);

        // Update batch status
        await batch.update({
          status: 'completed',
          edi_file_path: ediFilePath
        });

        // Update claim statuses to generated
        await Claim.update(
          { status: 'generated' },
          { where: { claim_id: { [Op.in]: claimIds } } }
        );

        res.json({
          success: true,
          data: {
            batch_id: batch.batch_id,
            status: 'completed',
            edi_file_path: ediFilePath,
            edi_file_name: ediFileName
          }
        });

      } catch (processingError) {
        console.error('Processing error details:', processingError);
        // Update batch status to failed
        await batch.update({ status: 'failed' });
        throw processingError;
      }

    } catch (error) {
      console.error('Error processing batch:', error);
      
      // Determine the appropriate status code
      let statusCode = 500;
      let errorMessage = error.message || 'Unknown error occurred';
      
      if (error.message.includes('not found') || error.message.includes('No batch details')) {
        statusCode = 404;
      } else if (error.message.includes('Cannot process batch')) {
        statusCode = 400;
      }
      
      res.status(statusCode).json({ 
        success: false,
        error: 'Failed to process batch: ' + errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Download EDI file
  async downloadEDIFile(req, res) {
    try {
      const { batch_id } = req.params;

      const batch = await Batch.findByPk(batch_id);
      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      if (!batch.edi_file_path) {
        return res.status(404).json({ error: 'EDI file not found' });
      }

      // Check if file exists
      try {
        await fs.access(batch.edi_file_path);
        res.download(batch.edi_file_path, `batch_${batch.batch_number}.edi`);
      } catch (fileError) {
        return res.status(404).json({ error: 'EDI file not found on disk' });
      }

    } catch (error) {
      console.error('Error downloading EDI file:', error);
      res.status(500).json({ error: 'Failed to download EDI file' });
    }
  }

  // Get all batches
  async getBatches(req, res) {
    try {
      const batches = await Batch.findAll({
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          batches
        }
      });
    } catch (error) {
      console.error('Error fetching batches:', error);
      res.status(500).json({ error: 'Failed to fetch batches: ' + error.message });
    }
  }

  // Download EDI file
  async downloadEDIFile(req, res) {
    try {
      const { batch_id } = req.params;

      const batch = await Batch.findByPk(batch_id);
      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      if (!batch.edi_file_path) {
        return res.status(404).json({ error: 'EDI file not found' });
      }

      // Check if file exists
      const fs = require('fs');
      if (!fs.existsSync(batch.edi_file_path)) {
        return res.status(404).json({ error: 'EDI file not found on disk' });
      }

      res.download(batch.edi_file_path, `batch_${batch.batch_number}.edi`);
    } catch (error) {
      console.error('Error downloading EDI file:', error);
      res.status(500).json({ error: 'Failed to download EDI file: ' + error.message });
    }
  }

  // Helper method to generate batch number
  generateBatchNumber() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    return `BTH${dateStr}${timeStr}`;
  }

  // Helper method to transform claims data for EDI generation
  transformClaimsForEDI(claimsData, ediClientSetting, batch) {
    const transformedClaims = claimsData.map(claim => {
      // Get trip member (patient) and location data
      const tripMember = claim.Trip?.TripMember;
      const program = tripMember?.Program;
      const pickupLocation = tripMember?.memberPickupLocation;
      const dropoffLocation = tripMember?.memberDropoffLocation;

      console.log('Processing claim:', claim.claim_number);
      console.log('Trip data:', claim.Trip ? 'exists' : 'missing');
      console.log('TripMember data:', tripMember ? 'exists' : 'missing');
      console.log('Patient name:', tripMember ? `${tripMember.first_name} ${tripMember.last_name}` : 'N/A');
      console.log('Patient AHCCCS ID:', tripMember?.ahcccs_id || 'N/A');
      console.log('Pickup location:', pickupLocation ? `${pickupLocation.city}, ${pickupLocation.state}` : 'N/A');

      // Transform claim data
      const claimData = {
        // Basic claim info
        claim_id: claim.claim_id,
        claim_number: claim.claim_number,
        patient_control_number: claim.patient_control_number,
        total_charge_amount: parseFloat(claim.total_charge_amount || 0),
        claim_type: "P", // Primary
        claim_frequency: claim.claim_frequency || "1", // Original
        place_of_service: claim.place_of_service || "41", // Ambulance - Land
        relation_code: "18", // Self
        claim_filing_ind: "MC", // Medicaid
        
        // Patient Information (separate fields as expected by EDI builder)
        patient_first_name: tripMember?.first_name || '',
        patient_last_name: tripMember?.last_name || '',
        patient_middle_name: tripMember?.middle_name || '',
        patient_dob: tripMember?.birth_date, // Correct field name
        patient_gender: tripMember?.gender === 'Male' ? 'M' : tripMember?.gender === 'Female' ? 'F' : 'U',
        patient_address: pickupLocation?.street_address || '',
        patient_city: pickupLocation?.city || '',
        patient_state: pickupLocation?.state || '',
        patient_zip: pickupLocation?.zip || '',
        
        // Insurance Information
        member_id: tripMember?.ahcccs_id,
        group_number: program?.program_code || program?.name || '',
        group_name: program?.name || "Arizona Medicaid",
        insurance_name: "Arizona Health Care",
        insurance_payer_id: "87726",
        
        // Provider Information
        provider_name: ediClientSetting.provider_name || "MTX Medical Transport",
        provider_npi: ediClientSetting.default_provider_npi,
        provider_taxonomy: ediClientSetting.default_taxonomy || "343900000X",
        provider_address: ediClientSetting.provider_address,
        provider_city: ediClientSetting.provider_city,
        provider_state: ediClientSetting.provider_state,
        provider_zip: ediClientSetting.provider_zip,
        provider_tax_id: ediClientSetting.provider_tax_id,
        
        // Service Dates
        service_from_date: claim.service_from_date,
        service_to_date: claim.service_to_date,
        
        // Diagnosis codes
        diagnosis_codes: ["Z51.11", "M79.603"] // Transportation diagnosis codes
      };

      // Transform charge data
      const chargeData = claim.charges?.map(charge => {
        console.log('Processing charge:', charge.charge_id, 'CPT:', charge.cpt_code, 'Amount:', charge.charge_amount);
        return {
          id: charge.charge_id,
          cpt_code: charge.cpt_code,
          charge_amount: parseFloat(charge.charge_amount || 0),
          units: parseInt(charge.units || 1),
          description: charge.service_description || 'Medical Transportation',
          place_of_service: charge.place_of_service || '99'
        };
      }) || [];

      return { claimData, chargeData };
    });

    const finalTransformedData = {
      batchInfo: {
        batch_id: batch.batch_id,
        batch_number: batch.batch_number,
        total_claims: batch.total_claims,
        total_amount: parseFloat(batch.total_amount)
      },
      ediClientSetting: {
        // Basic legacy fields
        sender_id: ediClientSetting.sender_id,
        receiver_id: ediClientSetting.receiver_id,
        default_provider_npi: ediClientSetting.default_provider_npi,
        provider_name: ediClientSetting.provider_name,
        provider_address: ediClientSetting.provider_address,
        provider_city: ediClientSetting.provider_city,
        provider_state: ediClientSetting.provider_state,
        provider_zip: ediClientSetting.provider_zip,
        default_taxonomy: ediClientSetting.default_taxonomy,
        
        // ISA segment fields from database
        ISA01: ediClientSetting.ISA01 || '00',
        ISA02: ediClientSetting.ISA02 || '          ',
        ISA03: ediClientSetting.ISA03 || '00',
        ISA04: ediClientSetting.ISA04 || '          ',
        ISA05: ediClientSetting.ISA05 || 'ZZ',
        ISA06: ediClientSetting.ISA06 || ediClientSetting.sender_id,
        ISA07: ediClientSetting.ISA07 || 'ZZ',
        ISA08: ediClientSetting.ISA08 || ediClientSetting.receiver_id,
        ISA11: ediClientSetting.ISA11 || 'U',
        ISA12: ediClientSetting.ISA12 || ediClientSetting.interchange_control_version || '00501',
        ISA13: ediClientSetting.ISA13 || batch.batch_id?.toString().padStart(9, '0') || '000000001',
        ISA14: ediClientSetting.ISA14 || '0',
        ISA15: ediClientSetting.ISA15 || 'P',
        ISA16: ediClientSetting.ISA16 || ':',
        
        // GS segment fields from database
        GS02: ediClientSetting.GS02 || ediClientSetting.sender_id,
        GS03: ediClientSetting.GS03 || ediClientSetting.receiver_id,
        GS08: ediClientSetting.GS08 || '005010X222A1',
        
        // Submitter information from database
        SubmitterEntityTypeID: ediClientSetting.SubmitterEntityTypeID || '2',
        SubmitterLastName: ediClientSetting.SubmitterLastName || 'MTX Medical Transport',
        SubmitterFirstName: ediClientSetting.SubmitterFirstName,
        SubmitterID: ediClientSetting.SubmitterID || ediClientSetting.sender_id,
        SubmitterContact: ediClientSetting.SubmitterContact || 'MTX Support',
        SubmitterPhone: ediClientSetting.SubmitterPhone || '6025551234',
        SubmitterPhoneExt: ediClientSetting.SubmitterPhoneExt,
        SubmitterEmail: ediClientSetting.SubmitterEmail || 'support@mtxtransport.com',
        
        // Receiver information from database
        ReceiverName: ediClientSetting.ReceiverName || ediClientSetting.receiver_name,
        ReceiverID: ediClientSetting.ReceiverID || ediClientSetting.receiver_id,
        
        // Legacy compatibility fields
        submitter_id: ediClientSetting.SubmitterID || ediClientSetting.sender_id,
        submitter_name: ediClientSetting.SubmitterLastName || 'MTX Medical Transport',
        submitter_contact: ediClientSetting.SubmitterContact || 'MTX Support',
        receiver_name: ediClientSetting.ReceiverName || ediClientSetting.receiver_name,
        entity_type: ediClientSetting.SubmitterEntityTypeID || '2',
        phone: ediClientSetting.SubmitterPhone || '6025551234',
        phone_ext: ediClientSetting.SubmitterPhoneExt || '',
        
        // Control number for batch
        isa13: ediClientSetting.ISA13 || batch.batch_id?.toString().padStart(9, '0') || '000000001'
      },
      claims: transformedClaims
    };

    // console.log('=== FINAL DATA BEING SENT TO EDI BUILDER ===');
    // console.log('Batch Info:', JSON.stringify(finalTransformedData.batchInfo, null, 2));
    // console.log('EDI Settings:', JSON.stringify(finalTransformedData.ediClientSetting, null, 2));
    // console.log('First Claim Sample:', JSON.stringify(finalTransformedData.claims[0], null, 2));
    // console.log('Total Claims:', finalTransformedData.claims.length);

    return finalTransformedData;
  }
}

module.exports = new BatchController();
