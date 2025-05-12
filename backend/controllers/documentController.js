const Vehicle = require("../models/Vehicle");
const { Document } = require("../models/Document");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Define uploads directory path
const uploadsDir = path.join(__dirname, '../public/uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { documentable_type, documentable_id } = req.body;
    if (!documentable_type || !documentable_id) {
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const relativePath = path.relative(
      path.join(__dirname, '../public'), 
      req.file.path
    ).replace(/\\/g, '/'); // Convert to forward slashes

    const document = await Document.create({
      documentable_type,
      documentable_id,
      filename: req.file.filename,
      original_name: req.file.originalname,
      path: relativePath, // Store relative path from public directory
      mime_type: req.file.mimetype,
      size: req.file.size
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error("Upload error:", error);
    // Clean up the uploaded file if database operation fails
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      message: "Document upload failed",
      error: error.message
    });
  }
};

// Get documents by type and ID
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { 
        documentable_type: req.params.type,
        documentable_id: req.params.id
      }
    });
    res.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ message: error.message });
  }
}; 