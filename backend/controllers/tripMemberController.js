const TripMember = require("../models/TripMember");
const Program = require("../models/Program");
const TripLocation = require("../models/TripLocation");
const { ValidationError } = require("sequelize");
const Trip = require("../models/Trip");
const TripLeg = require("../models/TripLeg");

// Get all trip members
exports.getAllMembers = async (req, res) => {
  try {
    const members = await TripMember.findAll({
      include: [
        { 
          model: Program,
          attributes: ['program_id', 'program_name']
        },
        {
          model: TripLocation,
          as: "memberPickupLocation",
          attributes: ['location_id', 'street_address', 'building', 'building_type', 
                      'city', 'state', 'zip', 'phone', 'location_type', 'recipient_default',
                      'latitude', 'longitude']
        },
        {
          model: TripLocation,
          as: "memberDropoffLocation",
          attributes: ['location_id', 'street_address', 'building', 'building_type', 
                      'city', 'state', 'zip', 'phone', 'location_type', 'recipient_default',
                      'latitude', 'longitude']
        }
      ],
      attributes: [
        'member_id', 'first_name', 'last_name', 'program_id', 
        'ahcccs_id', 'insurance_expiry', 'birth_date', 'phone', 
        'pickup_location', 'dropoff_location',
        'gender', 'notes', 'created_at', 'updated_at'
      ]
    });
    res.json(members);
  } catch (error) {
    console.error("Error fetching trip members:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get a specific trip member by ID
exports.getMemberById = async (req, res) => {
  try {
    const member = await TripMember.findByPk(req.params.id, {
      include: [
        { 
          model: Program,
          attributes: ['program_id', 'program_name']
        },
        {
          model: TripLocation,
          as: "memberPickupLocation",
          attributes: ['location_id', 'street_address', 'building', 'building_type', 
                      'city', 'state', 'zip', 'phone', 'location_type', 'recipient_default',
                      'latitude', 'longitude']
        },
        {
          model: TripLocation,
          as: "memberDropoffLocation",
          attributes: ['location_id', 'street_address', 'building', 'building_type', 
                      'city', 'state', 'zip', 'phone', 'location_type', 'recipient_default',
                      'latitude', 'longitude']
        }
      ],
      attributes: [
        'member_id', 'first_name', 'last_name', 'program_id', 
        'ahcccs_id', 'insurance_expiry', 'birth_date', 'phone', 
        'pickup_location', 'dropoff_location',
        'gender', 'notes', 'created_at', 'updated_at'
      ]
    });
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.json(member);
  } catch (error) {
    console.error("Error fetching trip member:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new trip member
exports.createMember = async (req, res) => {
  try {
    const newMember = await TripMember.create({
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    // Fetch the created member with its relationships
    const memberWithRelations = await TripMember.findByPk(newMember.member_id, {
      include: [
        { 
          model: Program,
          attributes: ['program_id', 'program_name']
        },
        {
          model: TripLocation,
          as: "memberPickupLocation",
          attributes: ['location_id', 'street_address', 'building', 'building_type', 
                      'city', 'state', 'zip', 'phone', 'location_type', 'recipient_default', 'latitude', 'longitude']
        },
        {
          model: TripLocation,
          as: "memberDropoffLocation",
          attributes: ['location_id', 'street_address', 'building', 'building_type', 
                      'city', 'state', 'zip', 'phone', 'location_type', 'recipient_default', 'latitude', 'longitude']
        }
      ],
      attributes: [
        'member_id', 'first_name', 'last_name', 'program_id', 
        'ahcccs_id', 'insurance_expiry', 'birth_date', 'phone', 
        'pickup_location', 'dropoff_location',
        'gender', 'notes', 'created_at', 'updated_at'
      ]
    });
    
    res.status(201).json(memberWithRelations);
  } catch (error) {
    console.error("Error creating trip member:", error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Update a trip member
exports.updateMember = async (req, res) => {
  try {
    const member = await TripMember.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    
    await member.update({
      ...req.body,
      updated_at: new Date(),
    });
    
    // Fetch the updated member with its relationships
    const updatedMember = await TripMember.findByPk(req.params.id, {
      include: [
        { 
          model: Program,
          attributes: ['program_id', 'program_name']
        },
        {
          model: TripLocation,
          as: "memberPickupLocation",
          attributes: ['location_id', 'street_address', 'building', 'building_type', 
                      'city', 'state', 'zip', 'phone', 'location_type', 'recipient_default',
                      'latitude', 'longitude']
        },
        {
          model: TripLocation,
          as: "memberDropoffLocation",
          attributes: ['location_id', 'street_address', 'building', 'building_type', 
                      'city', 'state', 'zip', 'phone', 'location_type', 'recipient_default',
                      'latitude', 'longitude']
        }
      ],
      attributes: [
        'member_id', 'first_name', 'last_name', 'program_id', 
        'ahcccs_id', 'insurance_expiry', 'birth_date', 'phone', 
        'pickup_location', 'dropoff_location',
        'gender', 'notes', 'created_at', 'updated_at'
      ]
    });
    
    res.json(updatedMember);
  } catch (error) {
    console.error("Error updating trip member:", error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Delete a trip member
exports.deleteMember = async (req, res) => {
  try {
    const member = await TripMember.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    
    await member.destroy();
    res.json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting trip member:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get member locations
exports.getMemberLocations = async (req, res) => {
  try {
    const memberId = req.params.id;
    
    // Find the member with their default locations
    const member = await TripMember.findByPk(memberId, {
      include: [
        {
          model: TripLocation,
          as: "memberPickupLocation",
        },
        {
          model: TripLocation,
          as: "memberDropoffLocation",
        }
      ]
    });
    
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    
    // Get member's pickup and dropoff locations
    const memberLocations = [];
    
    // Add pickup location if exists
    if (member.memberPickupLocation) {
      memberLocations.push({
        ...member.memberPickupLocation.get({ plain: true }),
        location_type: 'pickup'
      });
    }
    
    // Add dropoff location if exists and different from pickup
    if (member.memberDropoffLocation && 
        (!member.memberPickupLocation || member.memberDropoffLocation.location_id !== member.memberPickupLocation.location_id)) {
      memberLocations.push({
        ...member.memberDropoffLocation.get({ plain: true }),
        location_type: 'dropoff'
      });
    }
    
    // Fetch all locations used in this member's past trip legs instead of random picks
    const legRecords = await TripLeg.findAll({
      include: [
        { model: Trip, where: { member_id: memberId }, attributes: [] }
      ],
      attributes: ['pickup_location', 'dropoff_location'],
      raw: true
    });

    // Collect unique location IDs (excluding defaults already added)
    const usedLocationIds = new Set();
    legRecords.forEach(({ pickup_location, dropoff_location }) => {
      if (pickup_location) usedLocationIds.add(pickup_location);
      if (dropoff_location) usedLocationIds.add(dropoff_location);
    });
    // Remove the default pickup/dropoff IDs so we don't duplicate them
    memberLocations.forEach(loc => usedLocationIds.delete(loc.location_id));

    if (usedLocationIds.size > 0) {
      const usedLocations = await TripLocation.findAll({
        where: { location_id: Array.from(usedLocationIds) }
      });
      usedLocations.forEach(loc => {
        memberLocations.push({
          ...loc.get({ plain: true }),
          location_type: 'other'
        });
      });
    }
    
    res.json(memberLocations);
  } catch (error) {
    console.error("Error fetching member locations:", error);
    res.status(500).json({ message: error.message });
  }
};

// Search members by name
exports.searchMembers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters" });
    }
    
    // Use Sequelize's Op operators for case-insensitive search
    const { Op, literal, fn, col } = require("sequelize");
    
    // The original query for comparison and ordering
    const originalQuery = query.trim().toLowerCase();
    
    // Split query into parts to handle full name search
    const queryParts = originalQuery.split(/\s+/);
    
    // Build where conditions
    let whereConditions;
    
    if (queryParts.length === 1) {
      // Search by first or last name if only one word is provided
      whereConditions = {
        [Op.or]: [
          { first_name: { [Op.like]: `%${queryParts[0]}%` } },
          { last_name: { [Op.like]: `%${queryParts[0]}%` } }
        ]
      };
    } else {
      // Search by first and last name if multiple words are provided
      whereConditions = {
        [Op.or]: [
          // First part matches first_name, second part matches last_name (exact order)
          {
            [Op.and]: [
              { first_name: { [Op.like]: `%${queryParts[0]}%` } },
              { last_name: { [Op.like]: `%${queryParts[1]}%` } }
            ]
          },
          // First part matches last_name, second part matches first_name (reverse order)
          {
            [Op.and]: [
              { last_name: { [Op.like]: `%${queryParts[0]}%` } },
              { first_name: { [Op.like]: `%${queryParts[1]}%` } }
            ]
          },
          // Either part matches either name field (fallback search)
          {
            [Op.or]: queryParts.flatMap(part => [
              { first_name: { [Op.like]: `%${part}%` } },
              { last_name: { [Op.like]: `%${part}%` } }
            ])
          }
        ]
      };
    }
    
    // Calculate the full name for sorting
    const fullNameExpr = fn('CONCAT', col('first_name'), ' ', col('last_name'));
    
    // Get members, adding a priority field for ordering the results
    const members = await TripMember.findAll({
      where: whereConditions,
      attributes: [
        'member_id', 'first_name', 'last_name', 'program_id', 
        'phone', 'gender',
        // Add virtual columns for sorting
        [
          literal(`
            CASE 
              WHEN LOWER(first_name) = '${originalQuery}' THEN 10
              WHEN LOWER(last_name) = '${originalQuery}' THEN 9
              WHEN LOWER(first_name) LIKE '${originalQuery}%' THEN 8
              WHEN LOWER(last_name) LIKE '${originalQuery}%' THEN 7
              WHEN LOWER(CONCAT(first_name, ' ', last_name)) LIKE '${originalQuery}%' THEN 6
              WHEN LOWER(CONCAT(last_name, ' ', first_name)) LIKE '${originalQuery}%' THEN 5
              WHEN LOWER(first_name) LIKE '%${originalQuery}%' THEN 4
              WHEN LOWER(last_name) LIKE '%${originalQuery}%' THEN 3
              WHEN LOWER(CONCAT(first_name, ' ', last_name)) LIKE '%${originalQuery}%' THEN 2
              ELSE 1
            END
          `),
          'priority'
        ]
      ],
      order: [
        ['priority', 'DESC'],
        ['first_name', 'ASC'],
        ['last_name', 'ASC']
      ],
      limit: 8
    });
    
    // Return members without the priority field
    res.json(members.map(member => {
      const plainMember = member.get({ plain: true });
      delete plainMember.priority;
      return plainMember;
    }));
  } catch (error) {
    console.error("Error searching members:", error);
    res.status(500).json({ message: error.message });
  }
}; 