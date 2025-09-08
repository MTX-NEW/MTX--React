const Claim = require("../models/Claim");
const ClaimCharge = require("../models/ClaimCharge");
const Trip = require("../models/Trip");
const TripLeg = require("../models/TripLeg");
const TripMember = require("../models/TripMember");
const TripLocation = require("../models/TripLocation");
const Program = require("../models/Program");
const User = require("../models/User");
const EDIClientSetting = require("../models/EDIClientSetting");
const { Op } = require("sequelize");
const sequelize = require("../db");



// Get all claims with filters
exports.getAllClaims = async (req, res) => {
  try {
    const { 
      status, 
      startDate, 
      endDate, 
      search, 
      tripId, 
      patientName, 
      ahcccsId, 
      claimNumber, 
      minAmount, 
      maxAmount, 
      tripType, 
      vehicleType 
    } = req.query;
    
    const whereClause = {};
    const tripWhereClause = {};
    const memberWhereClause = {};
    
    // Status filter
    if (status) {
      whereClause.status = status;
    }
    
    // Date range filter
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) {
        whereClause.created_at[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.created_at[Op.lte] = new Date(endDate + ' 23:59:59');
      }
    }
    
    // Trip ID filter
    if (tripId) {
      tripWhereClause.trip_id = tripId;
    }
    
    // Claim Number filter
    if (claimNumber) {
      whereClause.claim_number = { [Op.like]: `%${claimNumber}%` };
    }
    
    // Amount range filter
    if (minAmount || maxAmount) {
      whereClause.total_charge_amount = {};
      if (minAmount) {
        whereClause.total_charge_amount[Op.gte] = parseFloat(minAmount);
      }
      if (maxAmount) {
        whereClause.total_charge_amount[Op.lte] = parseFloat(maxAmount);
      }
    }
    
    // Trip type filter
    if (tripType) {
      tripWhereClause.trip_type = tripType;
    }
    
    // Patient name filter
    if (patientName) {
      const nameSearch = patientName.toLowerCase();
      memberWhereClause[Op.or] = [
        sequelize.where(
          sequelize.fn('LOWER', sequelize.fn('CONCAT', sequelize.col('Trip.TripMember.first_name'), ' ', sequelize.col('Trip.TripMember.last_name'))),
          { [Op.like]: `%${nameSearch}%` }
        ),
        sequelize.where(
          sequelize.fn('LOWER', sequelize.col('Trip.TripMember.first_name')),
          { [Op.like]: `%${nameSearch}%` }
        ),
        sequelize.where(
          sequelize.fn('LOWER', sequelize.col('Trip.TripMember.last_name')),
          { [Op.like]: `%${nameSearch}%` }
        )
      ];
    }
    
    // AHCCCS ID filter
    if (ahcccsId) {
      memberWhereClause.ahcccs_id = { [Op.like]: `%${ahcccsId}%` };
    }
    
    // Vehicle type filter (based on member notes)
    if (vehicleType) {
      if (vehicleType === 'wheelchair') {
        memberWhereClause.notes = { [Op.like]: '%wheelchair%' };
      } else if (vehicleType === 'ambulatory') {
        memberWhereClause[Op.or] = [
          { notes: { [Op.not]: { [Op.like]: '%wheelchair%' } } },
          { notes: { [Op.is]: null } },
          { notes: '' }
        ];
      }
    }
    
    // Legacy search filter (for backward compatibility)
    if (search) {
      const searchWhere = {
        [Op.or]: [
          { '$Trip.TripMember.first_name$': { [Op.like]: `%${search}%` } },
          { '$Trip.TripMember.last_name$': { [Op.like]: `%${search}%` } },
          { '$Trip.TripMember.ahcccs_id$': { [Op.like]: `%${search}%` } },
          { claim_number: { [Op.like]: `%${search}%` } },
          { '$Trip.trip_id$': search.toString() }
        ]
      };
      Object.assign(whereClause, searchWhere);
    }

    const claims = await Claim.findAll({
      where: whereClause,
      include: [
        {
          model: Trip,
          where: Object.keys(tripWhereClause).length > 0 ? tripWhereClause : undefined,
          include: [
            {
              model: TripMember,
              where: Object.keys(memberWhereClause).length > 0 ? memberWhereClause : undefined,
              include: [
                { model: Program },
                {
                  model: TripLocation,
                  as: 'memberPickupLocation'
                },
                {
                  model: TripLocation,
                  as: 'memberDropoffLocation'
                }
              ]
            },
            {
              model: TripLeg,
              as: 'legs',
              include: [
                { model: TripLocation, as: 'pickupLocation' },
                { model: TripLocation, as: 'dropoffLocation' }
              ]
            }
          ]
        },
        {
          model: ClaimCharge,
          as: 'charges'
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: claims,
      count: claims.length,
      filters: {
        status, startDate, endDate, tripId, patientName, ahcccsId, 
        claimNumber, minAmount, maxAmount, tripType, vehicleType
      }
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch claims',
      message: error.message 
    });
  }
};

// Get claim by ID
exports.getClaimById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const claim = await Claim.findByPk(id, {
      include: [
        {
          model: Trip,
          include: [
            {
              model: TripMember,
              include: [{ model: Program }]
            },
            {
              model: TripLeg,
              as: 'legs',
              include: [
                { model: TripLocation, as: 'pickupLocation' },
                { model: TripLocation, as: 'dropoffLocation' }
              ]
            }
          ]
        },
        {
          model: ClaimCharge,
          as: 'charges'
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ]
    });

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    res.json({
      success: true,
      data: claim
    });
  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch claim',
      message: error.message 
    });
  }
};

// Generate claim for a trip
exports.generateClaimForTrip = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { tripId } = req.params;
    const userId = req.user?.id ; // Default for testing
    
    console.log(`[generateClaimForTrip] Starting claim generation for trip ${tripId}`);
    
    // Check if claim already exists - if it does, update it instead of failing
    const existingClaim = await Claim.findOne({ 
      where: { trip_id: tripId },
      include: [{ model: ClaimCharge, as: 'charges' }],
      transaction 
    });

    let claim;
    let isUpdate = false;

    if (existingClaim) {
      // Update existing claim
      isUpdate = true;
      claim = existingClaim;
      
      // Don't delete all charges - we'll update them by charge_number to maintain IDs
      // await ClaimCharge.destroy({
      //   where: { claim_id: existingClaim.claim_id },
      //   transaction
      // });
    }

    // Fetch trip with all related data
    const trip = await Trip.findByPk(tripId, {
      include: [
        {
          model: TripMember,
          include: [
            { model: Program }
            // Note: TripMember location associations are commented out in associations.js
            // We get location data from TripLeg instead
          ]
        },
        {
          model: TripLeg,
          as: 'legs',
          include: [
            { model: TripLocation, as: 'pickupLocation' },
            { model: TripLocation, as: 'dropoffLocation' }
          ]
        }
      ],
      transaction
    });

    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Validate trip data
    const validationResult = await validateTripForBilling(trip);
    if (!validationResult.isValid) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Trip validation failed', 
        details: validationResult.errors 
      });
    }

    // Calculate total charges
    const charges = await calculateCharges(trip);
    const totalAmount = charges.reduce((sum, charge) => sum + parseFloat(charge.charge_amount), 0);

    if (isUpdate) {
      // Update existing claim
      await claim.update({
        service_from_date: trip.start_date,
        service_to_date: trip.end_date || trip.start_date,
        total_charge_amount: totalAmount,
        status: 'pending',
        updated_at: new Date()
      }, { transaction });
    } else {
      // Generate claim number for new claims
      const claimNumber = await generateClaimNumber();
      const patientControlNumber = `${trip.trip_id}-${Date.now()}`;

      // Create new claim
      claim = await Claim.create({
        trip_id: tripId,
        claim_number: claimNumber,
        patient_control_number: patientControlNumber,
        total_charge_amount: totalAmount,
        service_from_date: trip.start_date,
        service_to_date: trip.end_date || trip.start_date,
        created_by: userId,
        status: 'pending'
      }, { transaction });
    }

    // Create/Update charges using charge_number for consistency
    for (const chargeData of charges) {
      // Try to find existing charge by charge_number
      const existingCharge = await ClaimCharge.findOne({
        where: { 
          claim_id: claim.claim_id,
          charge_number: chargeData.charge_number 
        },
        transaction
      });

      if (existingCharge) {
        // Update existing charge (maintains same charge_id)
        await existingCharge.update({
          cpt_code: chargeData.cpt_code,
          units: chargeData.units,
          charge_amount: chargeData.charge_amount,
          service_from_date: chargeData.service_from_date,
          service_to_date: chargeData.service_to_date,
          service_description: chargeData.service_description,
          updated_at: new Date()
        }, { transaction });
      } else {
        // Create new charge
        await ClaimCharge.create({
          claim_id: claim.claim_id,
          ...chargeData
        }, { transaction });
      }
    }

    // Update trip billing status
    await Trip.update({
      billing_status: 'pending',
      claim_generated: true
    }, {
      where: { trip_id: tripId },
      transaction
    });

    await transaction.commit();

    // Fetch the complete claim with charges
    const completeClaim = await Claim.findByPk(claim.claim_id, {
      include: [
        { model: Trip },
        { model: ClaimCharge, as: 'charges' }
      ]
    });

    res.status(isUpdate ? 200 : 201).json({
      message: isUpdate ? 'Claim updated successfully' : 'Claim generated successfully',
      claim: completeClaim,
      action: isUpdate ? 'updated' : 'created'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error generating claim for trip', tripId, ':', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to generate claim' });
  }
};

// Generate EDI file for a claim
exports.generateEDIFile = async (req, res) => {
  try {
    const { claimId } = req.params;
    
    console.log(`Generating EDI file for claim ${claimId}`);
    
    // Use the batch EDI generation for single claim
    req.body = { claimIds: [parseInt(claimId)] };
    
    // Call the batch EDI generation function
    return exports.generateBatchEDI(req, res);

  } catch (error) {
    console.error('Error generating EDI file:', error);
    res.status(500).json({ error: 'Failed to generate EDI file' });
  }
};

// Generate EDI for existing trip (legacy support)
exports.generateClaimEDI = async (req, res) => {
  try {
    const { tripId } = req.body;
    
    if (!tripId) {
      return res.status(400).json({ error: 'Trip ID is required' });
    }
    
    // First generate claim, then EDI
    const transaction = await sequelize.transaction();
    
    try {
      // Generate claim for the trip
      const userId = req.user?.id || 1;
      
      // Check if claim already exists
      let claim = await Claim.findOne({ 
        where: { trip_id: tripId },
        transaction 
      });
      
      if (!claim) {
        // Create claim first
        const trip = await Trip.findByPk(tripId, {
          include: [
            { 
              model: TripMember, 
              include: [
                { model: Program }
                // Note: TripMember location associations are commented out
              ]
            },
            { 
              model: TripLeg, 
              as: 'legs',
              include: [
                { model: TripLocation, as: 'pickupLocation' },
                { model: TripLocation, as: 'dropoffLocation' }
              ]
            }
          ],
          transaction
        });

        if (!trip) {
          await transaction.rollback();
          return res.status(404).json({ error: 'Trip not found' });
        }

        const charges = await calculateCharges(trip);
        const totalAmount = charges.reduce((sum, charge) => sum + parseFloat(charge.charge_amount), 0);
        const claimNumber = await generateClaimNumber();

        claim = await Claim.create({
          trip_id: tripId,
          claim_number: claimNumber,
          patient_control_number: `${trip.trip_id}-${Date.now()}`,
          total_charge_amount: totalAmount,
          service_from_date: trip.start_date,
          service_to_date: trip.end_date || trip.start_date,
          created_by: userId,
          status: 'pending'
        }, { transaction });

        // Create charges
        for (const chargeData of charges) {
          await ClaimCharge.create({
            claim_id: claim.claim_id,
            ...chargeData
          }, { transaction });
        }
      }

      await transaction.commit();

      // Now generate EDI
      req.params = { claimId: claim.claim_id };
      await exports.generateEDIFile(req, res);
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Error in legacy claim EDI generation:', error);
    res.status(500).json({ error: 'Failed to generate claim EDI' });
  }
};

// Helper Functions

async function validateTripForBilling(trip) {
  const errors = [];
  
  if (!trip.TripMember) {
    errors.push('Trip member information is missing');
  } else {
    if (!trip.TripMember.first_name || !trip.TripMember.last_name) {
      errors.push('Patient name is required');
    }
    if (!trip.TripMember.birth_date) {
      errors.push('Patient birth date is required');
    }
    if (!trip.TripMember.ahcccs_id) {
      errors.push('AHCCCS ID is required');
    }
  }

  if (!trip.legs || trip.legs.length === 0) {
    errors.push('Trip must have at least one leg');
  }

  if (!trip.TripMember?.Program) {
    errors.push('Program information is missing');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

async function generateClaimNumber() {
  const count = await Claim.count();
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `CLM${dateStr}${(count + 1).toString().padStart(4, '0')}`;
}
// NEMT Billing Logic:
// Each trip generates TWO separate charges in claim_charges table:
// 1. Transportation Charge: Base rate $25.00 with CPT code based on transport type:
// Helper function to check if location is rural (based on MedTrns legacy logic)
function checkIfRural(city) {
  if (!city) return false;
  
  // MedTrns legacy rural cities list (exact match from their system)
  const ruralCities = [
    'coolidge',
    'san tan valley',
    'arizona city', 
    'case grande',
    'casa grande',
    'maricopa',
    'apatche junction',
    'superior',
    'miami',
    'globe',
    'eloy',
    'buckeye',
    'tonopah',
    'gila bend',
    'sacaton',
    'laveen',
    'tucson',
    'wadell',
    'blackwater',
    'anthem'
  ];
  
  const cityLower = city.toLowerCase().trim();
  return ruralCities.includes(cityLower);
}

// Helper function to get transport description
function getTransportDescription(vehicleType, areaType, isRoundTrip = false) {
  const base = vehicleType === 'wheelchair' ? 'Wheelchair Van' : 'Ambulatory Transport';
  const tripType = isRoundTrip ? ' (Round Trip)' : '';
  return `${base} (${areaType})${tripType}`;
}

// NEMT Billing Logic - Based on MedTrns-Express Legacy System:
// Each trip generates TWO separate charges in claim_charges table:
// 1. Transportation Base Charge: Base rate per vehicle type and rural/urban classification
// 2. Mileage Charge: Per-mile rate based on vehicle type and rural/urban classification
// CPT Codes: A0130 (wheelchair), A0120 (ambulatory), S0209 (wheelchair mileage), S0215 (standard mileage)
// Rate Structure (from MedTrns legacy):
// - Standard: $6.64 urban, $7.27 rural (base) + $1.28/$1.53 per mile
// - Wheelchair: $11.15 urban, $12.21 rural (base) + $1.54/$1.66 per mile
// Round Trip Logic: Base charge applied per leg, mileage calculated separately

async function calculateCharges(trip) {
  const charges = [];
  let totalMileage = 0;
  let legCount = 0;
  
  // console.log(`[calculateCharges] Starting calculation for trip ${trip.trip_id}`);
  // console.log(`[calculateCharges] trip.legs:`, trip.legs ? trip.legs.length : 'null/undefined');
  // console.log(`[calculateCharges] trip.total_distance:`, trip.total_distance);
  
  // Calculate total mileage and leg count from all legs OR use pre-calculated total_distance
  if (trip.legs && trip.legs.length > 0) {
    // console.log(`[calculateCharges] Using legs data (${trip.legs.length} legs)`);
    totalMileage = trip.legs.reduce((total, leg) => {
      const legDistance = leg.leg_distance || 0;
      // console.log(`[calculateCharges] Leg ${leg.sequence || 'unknown'}: ${legDistance} miles`);
      return total + legDistance;
    }, 0);
    legCount = trip.legs.length;
    
    // FALLBACK: If legs exist but have no distance data, use total_distance
    if (totalMileage === 0 && trip.total_distance && parseFloat(trip.total_distance) > 0) {
      // console.log(`[calculateCharges] Legs have no distance data, falling back to total_distance: ${trip.total_distance}`);
      totalMileage = parseFloat(trip.total_distance);
    }
  } else if (trip.total_distance) {
    // console.log(`[calculateCharges] Using total_distance fallback`);
    // Fallback: use pre-calculated total_distance from Trip model
    totalMileage = parseFloat(trip.total_distance || 0);
    legCount = 1;
  }
  
  // HEALTHCARE BILLING FIX: For round trips with no mileage data, apply minimum billable mileage
  // This prevents billing errors where transport is charged but no mileage
  if (totalMileage === 0 && (trip.trip_type === 'round_trip' || legCount > 1)) {
    // console.log(`[calculateCharges] APPLYING MINIMUM MILEAGE: Round trip with 0 distance, using default 10 miles`);
    totalMileage = 10.0; // Minimum billable mileage for round trips
  }
  
  // Apply MedTrns legacy "fudge factor" to mileage (from their claim_model.php)
  let originalMileage = totalMileage;
  if (totalMileage >= 5.0 && totalMileage < 10.0) {
    // console.log(`[calculateCharges] APPLYING FUDGE FACTOR: Adding 2 miles to ${totalMileage}`);
    totalMileage += 2.0;
  } else if (totalMileage >= 10.0) {
    // console.log(`[calculateCharges] APPLYING FUDGE FACTOR: Adding 3 miles to ${totalMileage}`);
    totalMileage += 3.0;
  } else {
    // console.log(`[calculateCharges] NO FUDGE FACTOR: ${totalMileage} miles is less than 5.0`);
  }
  
  // Round up mileage (MedTrns uses ceiling)
  totalMileage = Math.ceil(totalMileage);
  
  console.log(`[calculateCharges] Final totalMileage: ${totalMileage}`);
  console.log(`[calculateCharges] Final legCount: ${legCount}`);

  // Rate structure based on MedTrns legacy system (CORRECTED RATES)
  const rates = {
    ambulatory: {
      urban: { base: 7.21, mileage: 1.32 },      // Updated from MedTrns actual rates
      rural: { base: 7.90, mileage: 1.53 }       // Updated from MedTrns actual rates
    },
    wheelchair: {
      urban: { base: 12.13, mileage: 1.54 },     // Updated from MedTrns actual rates  
      rural: { base: 9.41, mileage: 1.66 }       // Updated from MedTrns actual rates (rural WC is LESS than urban!)
    }
  };
  
  // Get location characteristics from TripLeg associations (since TripMember associations are commented out)
  let pickupCity = '';
  let dropoffCity = '';
  
  if (trip.legs && trip.legs.length > 0) {
    // Get cities from first leg (pickup) and last leg (dropoff)
    const firstLeg = trip.legs.find(leg => leg.sequence === 1) || trip.legs[0];
    const lastLeg = trip.legs.find(leg => leg.sequence === trip.legs.length) || trip.legs[trip.legs.length - 1];
    
    if (firstLeg?.pickupLocation?.city) {
      pickupCity = firstLeg.pickupLocation.city;
    }
    if (lastLeg?.dropoffLocation?.city) {
      dropoffCity = lastLeg.dropoffLocation.city;
    }
  }
  
  const isRural = checkIfRural(pickupCity) || checkIfRural(dropoffCity);
  const areaType = isRural ? 'rural' : 'urban';
  
  // Determine vehicle type from trip member notes
  let vehicleType = 'ambulatory';
  let transportCPT = 'A0120'; // Ambulatory transport
  let mileageCPT = 'S0215';   // Standard mileage
  
  if (trip.TripMember?.notes) {
    const notes = trip.TripMember.notes.toLowerCase();
    if (notes.includes('wheelchair')) {
      vehicleType = 'wheelchair';
      transportCPT = 'A0130';   // Wheelchair transport
      mileageCPT = 'S0209';     // Wheelchair mileage
    }
  }
  
  // Get applicable rates based on vehicle type and area
  const rateConfig = rates[vehicleType][areaType];
  const baseRate = rateConfig.base;
  const mileageRatePerMile = rateConfig.mileage;
  
  // Calculate charges following MedTrns pattern
  // For round trips, apply base charge per leg (following MedTrns RT logic)
  const isRoundTrip = trip.trip_type === 'round_trip' || legCount > 1;
  const baseChargeMultiplier = isRoundTrip ? 2 : 1; // Double base for round trips
  
  const transportCharge = baseRate * baseChargeMultiplier;
  const mileageCharge = totalMileage * mileageRatePerMile;
  
  // 1. ALWAYS create base transport charge (multiplied for round trips)
  // Use consistent charge_number to maintain same ID on updates
  charges.push({
    charge_number: `${trip.trip_id}-TRANSPORT`, // Unique but consistent ID
    cpt_code: transportCPT,
    units: baseChargeMultiplier,
    charge_amount: parseFloat(transportCharge.toFixed(2)),
    service_from_date: trip.start_date,
    service_to_date: trip.end_date || trip.start_date,
    service_description: getTransportDescription(vehicleType, areaType, isRoundTrip)
  });

  // 2. ALWAYS create mileage charge if there's mileage (separate CPT row)
  console.log(`[calculateCharges] Checking mileage charge: totalMileage = ${totalMileage}, condition = ${totalMileage > 0}`);
  if (totalMileage > 0) {
    console.log(`[calculateCharges] Creating mileage charge with CPT ${mileageCPT}`);
    charges.push({
      charge_number: `${trip.trip_id}-MILEAGE`, // Unique but consistent ID
      cpt_code: mileageCPT,
      units: Math.ceil(totalMileage),
      charge_amount: parseFloat(mileageCharge.toFixed(2)),
      service_from_date: trip.start_date,
      service_to_date: trip.end_date || trip.start_date,
      service_description: `${vehicleType} mileage (${areaType}) - ${totalMileage.toFixed(2)} miles${isRoundTrip ? ' (round trip)' : ''}`
    });
  } else {
    console.log(`[calculateCharges] NO mileage charge created: totalMileage is ${totalMileage}`);
  }

  console.log(`[calculateCharges] Trip ${trip.trip_id}: ${vehicleType} ${areaType} ${isRoundTrip ? 'round trip' : 'one way'}, ${totalMileage} miles, Cities: ${pickupCity} -> ${dropoffCity}, Total: $${(transportCharge + mileageCharge).toFixed(2)}`);
  console.log(`[calculateCharges] Generated ${charges.length} charges:`);
  charges.forEach((charge, index) => {
    console.log(`  ${index + 1}. ${charge.charge_number} - ${charge.cpt_code} - $${charge.charge_amount}`);
  });

  return charges;
}

// Generate claims for multiple trips in batch
exports.generateBatch = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { tripIds } = req.body;
    
    if (!tripIds || !Array.isArray(tripIds) || tripIds.length === 0) {
      return res.status(400).json({ error: 'tripIds array is required' });
    }

    // Get a valid user ID for created_by field
    let userId = req.user?.id;
    if (!userId) {
      // Try to find the first available user
      const firstUser = await User.findOne({ attributes: ['id'] });
      if (firstUser) {
        userId = firstUser.id;
      } else {
        await transaction.rollback();
        return res.status(500).json({ error: 'No valid user found for claim creation' });
      }
    }

    const results = {
      successful: [],
      failed: []
    };

    // Process each trip
    for (const tripId of tripIds) {
      try {
        // Check if trip exists and is eligible for billing
        const trip = await Trip.findByPk(tripId, {
          include: [
            {
              model: TripMember,
              include: [
                { model: Program }
                // Note: TripMember location associations are commented out
              ]
            },
            {
              model: TripLeg,
              as: 'legs',
              include: [
                { model: TripLocation, as: 'pickupLocation' },
                { model: TripLocation, as: 'dropoffLocation' }
              ]
            }
          ],
          transaction
        });

        if (!trip) {
          results.failed.push({ tripId, error: 'Trip not found' });
          continue;
        }

        // Check if trip is eligible for billing
        // Since we don't have a trip status field, we'll check if the trip has basic required data
        if (!trip.start_date) {
          results.failed.push({ tripId, error: 'Trip start date is missing' });
          continue;
        }

        // Basic validation for claim generation
        if (!trip.TripMember) {
          results.failed.push({ tripId, error: 'Trip member information is missing' });
          continue;
        }

        if (!trip.TripMember.first_name || !trip.TripMember.last_name) {
          results.failed.push({ tripId, error: 'Patient name is required for claim generation' });
          continue;
        }

        // if (trip.billing_status === 'claim_generated' || trip.billing_status === 'billed') {
        //   results.failed.push({ tripId, error: 'Trip already has a claim generated' });
        //   continue;
        // }

        // Check if claim already exists - if it does, update it instead of failing
        const existingClaim = await Claim.findOne({
          where: { trip_id: tripId },
          include: [{ model: ClaimCharge, as: 'charges' }],
          transaction
        });

        let claim;
        let isUpdate = false;

        if (existingClaim) {
          // Update existing claim
          isUpdate = true;
          claim = existingClaim;
          
          // Don't delete all charges - we'll update them by charge_number to maintain IDs
          // await ClaimCharge.destroy({
          //   where: { claim_id: existingClaim.claim_id },
          //   transaction
          // });

          // Update claim with new service dates
          await claim.update({
            service_from_date: trip.start_date,
            service_to_date: trip.end_date || trip.start_date,
            status: 'generated',
            updated_at: new Date()
          }, { transaction });
        } else {
          // Generate claim number for new claims only
          const claimCount = await Claim.count({ transaction });
          const claimNumber = `CLM${String(claimCount + 1).padStart(6, '0')}`;
          const patientControlNumber = `${trip.trip_id}-${Date.now()}`;

          // Create new claim
          claim = await Claim.create({
            trip_id: tripId,
            claim_number: claimNumber,
            patient_control_number: patientControlNumber,
            status: 'generated',
            total_charge_amount: 0, // Will be calculated from charges
            service_from_date: trip.start_date,
            service_to_date: trip.end_date || trip.start_date,
            created_by: userId,
            created_at: new Date(),
            updated_at: new Date()
          }, { transaction });
        }

        // Generate charges based on trip data
        const charges = await calculateCharges(trip);
        let totalAmount = 0;

        // Create/Update claim charges using charge_number for consistency
        for (const chargeData of charges) {
          // Try to find existing charge by charge_number
          const existingCharge = await ClaimCharge.findOne({
            where: { 
              claim_id: claim.claim_id,
              charge_number: chargeData.charge_number 
            },
            transaction
          });

          if (existingCharge) {
            // Update existing charge (maintains same charge_id)
            await existingCharge.update({
              cpt_code: chargeData.cpt_code,
              units: chargeData.units,
              charge_amount: chargeData.charge_amount,
              service_from_date: chargeData.service_from_date,
              service_to_date: chargeData.service_to_date,
              service_description: chargeData.service_description,
              updated_at: new Date()
            }, { transaction });
          } else {
            // Create new charge
            await ClaimCharge.create({
              claim_id: claim.claim_id,
              ...chargeData,
              created_at: new Date(),
              updated_at: new Date()
            }, { transaction });
          }
          
          totalAmount += parseFloat(chargeData.charge_amount);
        }

        // Update claim with total amount
        await claim.update({ total_charge_amount: totalAmount.toFixed(2) }, { transaction });

        // Update trip billing status
        await trip.update({ billing_status: 'claim_generated' }, { transaction });

        results.successful.push({
          tripId,
          claimId: claim.claim_id,
          claimNumber: claim.claim_number,
          totalAmount: totalAmount.toFixed(2),
          isUpdate,
          action: isUpdate ? 'updated' : 'created'
        });

      } catch (error) {
        console.error(`Error processing trip ${tripId}:`, error);
        results.failed.push({ tripId, error: error.message });
      }
    }

    await transaction.commit();

    const createdCount = results.successful.filter(r => !r.isUpdate).length;
    const updatedCount = results.successful.filter(r => r.isUpdate).length;
    
    let message = `Batch processing completed. `;
    if (createdCount > 0) message += `${createdCount} claims created`;
    if (updatedCount > 0) {
      if (createdCount > 0) message += `, `;
      message += `${updatedCount} claims updated`;
    }
    if (results.failed.length > 0) message += `, ${results.failed.length} failed.`;

    res.json({
      message,
      successful: results.successful,
      failed: results.failed,
      summary: {
        total: tripIds.length,
        created: createdCount,
        updated: updatedCount,
        failed: results.failed.length
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error in batch claim generation:', error);
    res.status(500).json({ error: 'Failed to generate batch claims' });
  }
};

// Generate batch EDI file for selected claims
exports.generateBatchEDI = async (req, res) => {
  try {
    const { claimIds } = req.body;
    
    if (!claimIds || !Array.isArray(claimIds) || claimIds.length === 0) {
      return res.status(400).json({ error: 'claimIds array is required' });
    }

    // console.log(`Starting batch EDI generation for ${claimIds.length} claims`);

    // Fetch all claims with their related data
    const claims = await Claim.findAll({
      where: { claim_id: claimIds },
      include: [
        {
          model: ClaimCharge,
          as: 'charges',
          required: false
        },
        {
          model: Trip,
          include: [
            {
              model: TripMember,
              include: [{ model: Program }]
            }
          ]
        }
      ]
    });

    if (claims.length === 0) {
      return res.status(404).json({ error: 'No claims found' });
    }

    // Get EDI client settings
    const ediSettings = await EDIClientSetting.findOne({ 
      where: { is_active: true } 
    });

    if (!ediSettings) {
      return res.status(500).json({ error: 'EDI client settings not configured' });
    }

    // Transform claims data to batch format
    const batchData = {
      batchInfo: {
        batch_id: Date.now(),
        batch_number: `BATCH_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${Date.now()}`,
        total_claims: claims.length,
        total_amount: claims.reduce((sum, claim) => sum + parseFloat(claim.total_charge_amount || 0), 0),
        processing_date: new Date().toISOString()
      },
      
      ediClientSetting: {
        // ISA Segment Settings from database
        ISA01: ediSettings.ISA01 || "00",
        ISA02: ediSettings.ISA02 || "          ",
        ISA03: ediSettings.ISA03 || "00",
        ISA04: ediSettings.ISA04 || "          ",
        ISA05: ediSettings.ISA05 || "ZZ",
        ISA06: ediSettings.ISA06 || ediSettings.sender_id,
        ISA07: ediSettings.ISA07 || "ZZ",
        ISA08: ediSettings.ISA08 || ediSettings.receiver_id,
        ISA11: ediSettings.ISA11 || "U",
        ISA12: ediSettings.ISA12 || ediSettings.interchange_control_version || "00501",
        ISA13: ediSettings.ISA13 || Date.now().toString().slice(-9).padStart(9, '0'),
        ISA14: ediSettings.ISA14 || "0",
        ISA15: ediSettings.ISA15 || "P",
        ISA16: ediSettings.ISA16 || ":",
        
        // GS Segment Settings from database
        GS02: ediSettings.GS02 || ediSettings.sender_id,
        GS03: ediSettings.GS03 || ediSettings.receiver_id,
        GS08: ediSettings.GS08 || "005010X222A1",
        
        // Submitter Information from database
        SubmitterEntityTypeID: ediSettings.SubmitterEntityTypeID || "2",
        SubmitterLastName: ediSettings.SubmitterLastName || "MTX Medical Transport",
        SubmitterFirstName: ediSettings.SubmitterFirstName,
        SubmitterID: ediSettings.SubmitterID || ediSettings.sender_id,
        SubmitterContact: ediSettings.SubmitterContact || "MTX Support",
        SubmitterPhone: ediSettings.SubmitterPhone || "6025551234",
        SubmitterPhoneExt: ediSettings.SubmitterPhoneExt,
        SubmitterEmail: ediSettings.SubmitterEmail || "support@mtxtransport.com",
        
        // Receiver Information from database  
        ReceiverName: ediSettings.ReceiverName || ediSettings.receiver_name,
        ReceiverID: ediSettings.ReceiverID || ediSettings.receiver_id,
        
        // Legacy compatibility fields
        sender_id: ediSettings.sender_id,
        receiver_id: ediSettings.receiver_id,
        submitter_id: ediSettings.SubmitterID || ediSettings.sender_id,
        submitter_name: ediSettings.SubmitterLastName || "MTX Medical Transport",
        submitter_contact: ediSettings.SubmitterContact || "MTX Support",
        receiver_name: ediSettings.receiver_name,
        entity_type: ediSettings.entity_type || "2",
        phone: ediSettings.phone,
        phone_ext: ediSettings.phone_ext || "",
        isa13: Date.now().toString().slice(-9).padStart(9, '0')
      },

      claims: claims.map(claim => ({
        claimData: transformClaimData(claim, ediSettings),
        chargeData: claim.charges ? claim.charges.map(charge => transformChargeData(charge)) : []
      }))
    };

    // Call the EDI Builder batch generation
    const path = require('path');
    const { pathToFileURL } = require('url');
    const ediBuilderPath = path.resolve(__dirname, '../EDI Builder/index.js');
    const { generateBatchEDIFromMTXData } = await import(pathToFileURL(ediBuilderPath));
    const ediResult = await generateBatchEDIFromMTXData(batchData);

    if (ediResult.success) {
      // Update all claims with batch info
      await Claim.update({
        edi_file_path: ediResult.filePath,
        generated_at: new Date(),
        status: 'generated'
      }, {
        where: { claim_id: claimIds }
      });

      console.log(`Batch EDI generated successfully for ${claims.length} claims`);

      res.json({
        success: true,
        message: 'Batch EDI file generated successfully',
        filePath: ediResult.filePath,
        batchInfo: batchData.batchInfo,
        claimsProcessed: claims.length,
        totalAmount: batchData.batchInfo.total_amount
      });
    } else {
      console.error('Batch EDI generation failed:', ediResult.error);
      res.status(500).json({ 
        success: false,
        error: 'Batch EDI generation failed',
        details: ediResult.error 
      });
    }

  } catch (error) {
    console.error('Error generating batch EDI file:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate batch EDI file',
      details: error.message 
    });
  }
};

/**
 * Transform claim data to EDI format
 */
function transformClaimData(claim, ediSettings) {
  const tripMember = claim.Trip?.TripMember;
  const program = tripMember?.Program;

  return {
    claim_id: claim.claim_id,
    claim_number: claim.claim_number,
    patient_control_number: claim.patient_control_number,
    total_charge_amount: parseFloat(claim.total_charge_amount || 0),
    claim_type: "P", // Primary
    claim_frequency: claim.claim_frequency || "1", // Original
    place_of_service: claim.place_of_service || "41", // Ambulance - Land
    relation_code: tripMember?.relationship_to_insured || "18", // Self
    claim_filing_ind: "MC", // Medicaid
    
    // Patient Information
    patient_first_name: tripMember?.first_name || "",
    patient_last_name: tripMember?.last_name || "",
    patient_middle_name: tripMember?.middle_name || "",
    patient_dob: tripMember?.date_of_birth ? formatDateForEDI(tripMember.date_of_birth) : "",
    patient_gender: tripMember?.gender || "",
    patient_address: tripMember?.address || "",
    patient_city: tripMember?.city || "",
    patient_state: tripMember?.state || "",
    patient_zip: tripMember?.zip_code || "",
    
    // Insurance Information  
    member_id: tripMember?.member_id || tripMember?.medicaid_id || "",
    group_number: program?.group_number || "GRP001",
    group_name: program?.group_name || "Arizona Medicaid",
    insurance_name: program?.insurance_name || tripMember?.insurance_name || "Arizona Complete Health",
    insurance_payer_id: program?.payer_id || "87726",
    
    // Provider Information
    provider_name: ediSettings.provider_name || "MTX Medical Transport",
    provider_npi: ediSettings.default_provider_npi || "1234567890",
    provider_taxonomy: ediSettings.provider_taxonomy || "343900000X", // NEMT
    provider_address: ediSettings.provider_address || "",
    provider_city: ediSettings.provider_city || "",
    provider_state: ediSettings.provider_state || "",
    provider_zip: ediSettings.provider_zip || "",
    provider_tax_id: ediSettings.provider_tax_id || "",
    
    // Service Dates
    service_from_date: formatDateForEDI(claim.service_from_date),
    service_to_date: formatDateForEDI(claim.service_to_date || claim.service_from_date),
    
    // Diagnosis (default NEMT codes)
    diagnosis_codes: claim.diagnosis_codes ? JSON.parse(claim.diagnosis_codes) : ["Z51.11", "M79.603"]
  };
}

/**
 * Transform charge data to EDI format
 */
function transformChargeData(charge) {
  return {
    charge_id: charge.charge_id,
    cpt_code: charge.cpt_code,
    charge_amount: parseFloat(charge.charge_amount || 0),
    units: parseInt(charge.units || 1),
    place_of_service: charge.place_of_service || "41",
    service_from_date: formatDateForEDI(charge.service_from_date),
    service_to_date: formatDateForEDI(charge.service_to_date || charge.service_from_date),
    diagnosis_pointer: charge.diagnosis_pointer || "1",
    modifier_1: charge.modifier_1 || "",
    modifier_2: charge.modifier_2 || "",
    modifier_3: charge.modifier_3 || "",
    modifier_4: charge.modifier_4 || "",
    service_description: charge.service_description || ""
  };
}

/**
 * Format date for EDI (YYYY-MM-DD)
 */
function formatDateForEDI(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}
