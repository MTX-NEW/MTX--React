const MemberLocation = require('../models/MemberLocation');
const TripMember = require('../models/TripMember');
const TripLocation = require('../models/TripLocation');
const { Op } = require('sequelize');

// Get all locations for a specific member
exports.getMemberLocations = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    // Verify member exists
    const member = await TripMember.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Get locations with details
    const memberLocations = await MemberLocation.findAll({
      where: { member_id: memberId },
      include: [
        {
          model: TripLocation,
          attributes: ['location_id', 'street_address', 'building', 'city', 'state', 'zip', 'location_type']
        }
      ]
    });

    res.status(200).json(memberLocations);
  } catch (error) {
    console.error('Error fetching member locations:', error);
    res.status(500).json({ message: 'Error fetching member locations', error: error.message });
  }
};

// Add a location to a member
exports.addLocationToMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { 
      location_id, 
      is_primary_pickup, 
      is_primary_dropoff,
      location_name 
    } = req.body;

    // Validate inputs
    if (!location_id) {
      return res.status(400).json({ message: 'Location ID is required' });
    }

    // Verify member exists
    const member = await TripMember.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Verify location exists
    const location = await TripLocation.findByPk(location_id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // If this is being set as primary pickup or dropoff, 
    // update any existing primary locations for this member
    if (is_primary_pickup) {
      await MemberLocation.update(
        { is_primary_pickup: false },
        { where: { member_id: memberId, is_primary_pickup: true } }
      );
    }

    if (is_primary_dropoff) {
      await MemberLocation.update(
        { is_primary_dropoff: false },
        { where: { member_id: memberId, is_primary_dropoff: true } }
      );
    }

    // Check if this location is already associated with the member
    const existingLocation = await MemberLocation.findOne({
      where: {
        member_id: memberId,
        location_id: location_id
      }
    });

    if (existingLocation) {
      // Update the existing association
      await existingLocation.update({
        is_primary_pickup: is_primary_pickup || existingLocation.is_primary_pickup,
        is_primary_dropoff: is_primary_dropoff || existingLocation.is_primary_dropoff,
        location_name: location_name || existingLocation.location_name
      });

      return res.status(200).json({ 
        message: 'Member location updated successfully', 
        memberLocation: existingLocation 
      });
    }

    // Create new association
    const memberLocation = await MemberLocation.create({
      member_id: memberId,
      location_id,
      is_primary_pickup: is_primary_pickup || false,
      is_primary_dropoff: is_primary_dropoff || false,
      location_name
    });

    // Update the member's default locations if this is a primary location
    const updateData = {};
    if (is_primary_pickup) {
      updateData.pickup_location = location_id;
    }
    if (is_primary_dropoff) {
      updateData.dropoff_location = location_id;
    }

    if (Object.keys(updateData).length > 0) {
      await TripMember.update(updateData, { where: { member_id: memberId } });
    }

    res.status(201).json({ 
      message: 'Location added to member successfully', 
      memberLocation 
    });
  } catch (error) {
    console.error('Error adding location to member:', error);
    res.status(500).json({ message: 'Error adding location to member', error: error.message });
  }
};

// Update a member location
exports.updateMemberLocation = async (req, res) => {
  try {
    const { memberLocationId } = req.params;
    const { 
      is_primary_pickup, 
      is_primary_dropoff,
      location_name 
    } = req.body;

    // Find the member location
    const memberLocation = await MemberLocation.findByPk(memberLocationId);
    if (!memberLocation) {
      return res.status(404).json({ message: 'Member location not found' });
    }

    // If this is being set as primary pickup or dropoff, 
    // update any existing primary locations for this member
    if (is_primary_pickup) {
      await MemberLocation.update(
        { is_primary_pickup: false },
        { 
          where: { 
            member_id: memberLocation.member_id, 
            is_primary_pickup: true,
            id: { [Op.ne]: memberLocationId }
          } 
        }
      );
    }

    if (is_primary_dropoff) {
      await MemberLocation.update(
        { is_primary_dropoff: false },
        { 
          where: { 
            member_id: memberLocation.member_id, 
            is_primary_dropoff: true,
            id: { [Op.ne]: memberLocationId }
          } 
        }
      );
    }

    // Update the member location
    await memberLocation.update({
      is_primary_pickup: is_primary_pickup !== undefined ? is_primary_pickup : memberLocation.is_primary_pickup,
      is_primary_dropoff: is_primary_dropoff !== undefined ? is_primary_dropoff : memberLocation.is_primary_dropoff,
      location_name: location_name !== undefined ? location_name : memberLocation.location_name
    });

    // Update the member's default locations if this is a primary location
    const updateData = {};
    if (is_primary_pickup) {
      updateData.pickup_location = memberLocation.location_id;
    }
    if (is_primary_dropoff) {
      updateData.dropoff_location = memberLocation.location_id;
    }

    if (Object.keys(updateData).length > 0) {
      await TripMember.update(updateData, { where: { member_id: memberLocation.member_id } });
    }

    res.status(200).json({ 
      message: 'Member location updated successfully', 
      memberLocation 
    });
  } catch (error) {
    console.error('Error updating member location:', error);
    res.status(500).json({ message: 'Error updating member location', error: error.message });
  }
};

// Remove a location from a member
exports.removeLocationFromMember = async (req, res) => {
  try {
    const { memberLocationId } = req.params;
    
    // Find the member location
    const memberLocation = await MemberLocation.findByPk(memberLocationId);
    if (!memberLocation) {
      return res.status(404).json({ message: 'Member location not found' });
    }

    // Check if this is a primary location, we need to handle updates to the member record
    const memberId = memberLocation.member_id;
    const locationId = memberLocation.location_id;
    const isPrimaryPickup = memberLocation.is_primary_pickup;
    const isPrimaryDropoff = memberLocation.is_primary_dropoff;

    // Delete the member location
    await memberLocation.destroy();

    // If this was a primary location, we need to update the member's default location
    if (isPrimaryPickup || isPrimaryDropoff) {
      const member = await TripMember.findByPk(memberId);
      const updateData = {};

      // Find new primary locations if they exist
      if (isPrimaryPickup) {
        const newPrimary = await MemberLocation.findOne({
          where: { member_id: memberId, is_primary_pickup: true }
        });
        updateData.pickup_location = newPrimary ? newPrimary.location_id : null;
      }

      if (isPrimaryDropoff) {
        const newPrimary = await MemberLocation.findOne({
          where: { member_id: memberId, is_primary_dropoff: true }
        });
        updateData.dropoff_location = newPrimary ? newPrimary.location_id : null;
      }

      if (Object.keys(updateData).length > 0) {
        await member.update(updateData);
      }
    }

    res.status(200).json({ message: 'Location removed from member successfully' });
  } catch (error) {
    console.error('Error removing location from member:', error);
    res.status(500).json({ message: 'Error removing location from member', error: error.message });
  }
}; 