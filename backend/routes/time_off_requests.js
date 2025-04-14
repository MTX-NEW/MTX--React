const express = require('express');
const router = express.Router();
const { TimeOffRequest, User } = require('../models');
const { Op } = require('sequelize');

// Get all time off requests with optional filtering
router.get('/', async (req, res) => {
  try {
    const { userId, status, startDate, endDate, type } = req.query;
    
    // Build filter conditions
    let whereConditions = {};
    
    if (userId) {
      whereConditions.user_id = userId;
    }
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (type) {
      whereConditions.type = type;
    }
    
    // Handle date range filtering
    if (startDate || endDate) {
      // For time off requests, we need to find any that overlap with the provided date range
      // A time off request overlaps if:
      // - It starts during the range (start_date between startDate and endDate)
      // - It ends during the range (end_date between startDate and endDate)
      // - It spans the entire range (start_date <= startDate and end_date >= endDate)
      
      let dateConditions = [];
      
      if (startDate && endDate) {
        // Case 1: Request start date falls within range
        dateConditions.push({
          start_date: {
            [Op.between]: [startDate, endDate]
          }
        });
        
        // Case 2: Request end date falls within range
        dateConditions.push({
          end_date: {
            [Op.between]: [startDate, endDate]
          }
        });
        
        // Case 3: Request spans the entire range
        dateConditions.push({
          [Op.and]: [
            { start_date: { [Op.lte]: startDate } },
            { end_date: { [Op.gte]: endDate } }
          ]
        });
        
        whereConditions = {
          ...whereConditions,
          [Op.or]: dateConditions
        };
      } else if (startDate) {
        // If only start date provided, find requests that end on or after that date
        whereConditions.end_date = {
          [Op.gte]: startDate
        };
      } else if (endDate) {
        // If only end date provided, find requests that start on or before that date
        whereConditions.start_date = {
          [Op.lte]: endDate
        };
      }
    }
    
    const requests = await TimeOffRequest.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['start_date', 'DESC']]
    });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching time off requests:', error);
    res.status(500).json({ message: 'Failed to fetch time off requests', error: error.message });
  }
});

// Get time off request by ID
router.get('/:id', async (req, res) => {
  try {
    const request = await TimeOffRequest.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    
    if (!request) {
      return res.status(404).json({ message: 'Time off request not found' });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Error fetching time off request:', error);
    res.status(500).json({ message: 'Failed to fetch time off request', error: error.message });
  }
});

// Create new time off request
router.post('/', async (req, res) => {
  try {
    const { 
      user_id, 
      start_date, 
      end_date, 
      type, 
      notes 
    } = req.body;
    
    // Validate required fields
    if (!user_id || !start_date || !end_date || !type) {
      return res.status(400).json({ 
        message: 'User ID, start date, end date, and type are required' 
      });
    }
    
    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate start_date is before or equal to end_date
    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ message: 'Start date must be before or equal to end date' });
    }
    
    // Check for overlapping time off requests for the same user
    const overlappingRequests = await TimeOffRequest.findOne({
      where: {
        user_id,
        [Op.and]: [
          { status: { [Op.ne]: 'denied' } },
          {
            [Op.or]: [
              // New request start date falls within an existing request
              {
                [Op.and]: [
                  { start_date: { [Op.lte]: start_date } },
                  { end_date: { [Op.gte]: start_date } }
                ]
              },
              // New request end date falls within an existing request
              {
                [Op.and]: [
                  { start_date: { [Op.lte]: end_date } },
                  { end_date: { [Op.gte]: end_date } }
                ]
              },
              // New request completely spans an existing request
              {
                [Op.and]: [
                  { start_date: { [Op.gte]: start_date } },
                  { end_date: { [Op.lte]: end_date } }
                ]
              }
            ]
          }
        ]
      }
    });
    
    if (overlappingRequests) {
      return res.status(400).json({ 
        message: 'Request overlaps with existing time off request'
      });
    }
    
    // Create time off request
    const request = await TimeOffRequest.create({
      user_id,
      start_date,
      end_date,
      type,
      status: 'pending',
      notes
    });
    
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating time off request:', error);
    res.status(500).json({ message: 'Failed to create time off request', error: error.message });
  }
});

// Update time off request
router.put('/:id', async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      type, 
      status, 
      notes 
    } = req.body;
    
    // Find request
    const request = await TimeOffRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Time off request not found' });
    }
    
    // Validate start_date is before or equal to end_date if both are provided
    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ message: 'Start date must be before or equal to end date' });
    }
    
    // If modifying dates, check for overlaps (only if not denying the request)
    if ((start_date || end_date) && status !== 'denied') {
      const newStartDate = start_date || request.start_date;
      const newEndDate = end_date || request.end_date;
      
      const overlappingRequests = await TimeOffRequest.findOne({
        where: {
          user_id: request.user_id,
          request_id: {
            [Op.ne]: request.request_id
          },
          [Op.and]: [
            { status: { [Op.ne]: 'denied' } },
            {
              [Op.or]: [
                // Request start date falls within another request
                {
                  [Op.and]: [
                    { start_date: { [Op.lte]: newStartDate } },
                    { end_date: { [Op.gte]: newStartDate } }
                  ]
                },
                // Request end date falls within another request
                {
                  [Op.and]: [
                    { start_date: { [Op.lte]: newEndDate } },
                    { end_date: { [Op.gte]: newEndDate } }
                  ]
                },
                // Request completely spans another request
                {
                  [Op.and]: [
                    { start_date: { [Op.gte]: newStartDate } },
                    { end_date: { [Op.lte]: newEndDate } }
                  ]
                }
              ]
            }
          ]
        }
      });
      
      if (overlappingRequests) {
        return res.status(400).json({ 
          message: 'Request would overlap with existing time off request'
        });
      }
    }
    
    // Update request
    await request.update({
      start_date: start_date || request.start_date,
      end_date: end_date || request.end_date,
      type: type || request.type,
      status: status || request.status,
      notes: notes !== undefined ? notes : request.notes
    });
    
    // Get updated request with user information
    const updatedRequest = await TimeOffRequest.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating time off request:', error);
    res.status(500).json({ message: 'Failed to update time off request', error: error.message });
  }
});

// Delete time off request
router.delete('/:id', async (req, res) => {
  try {
    const request = await TimeOffRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Time off request not found' });
    }
    
    await request.destroy();
    res.json({ message: 'Time off request deleted successfully' });
  } catch (error) {
    console.error('Error deleting time off request:', error);
    res.status(500).json({ message: 'Failed to delete time off request', error: error.message });
  }
});

// Approve or deny time off request
router.put('/:id/respond', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!status || !['approved', 'denied'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (approved or denied) is required' });
    }
    
    const request = await TimeOffRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Time off request not found' });
    }
    
    // Can only respond to pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request has already been ${request.status}` });
    }
    
    // Update status and optional notes
    await request.update({
      status,
      notes: notes ? `${request.notes || ''}\n\nResponse: ${notes}` : request.notes
    });
    
    // Get updated request with user information
    const updatedRequest = await TimeOffRequest.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error responding to time off request:', error);
    res.status(500).json({ message: 'Failed to respond to time off request', error: error.message });
  }
});

module.exports = router; 