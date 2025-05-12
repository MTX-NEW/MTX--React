const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Define uploads directory path
const uploadsDir = path.join(__dirname, '../public/uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage with error handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      // Get document info from request
      const { documentable_type, documentable_id } = req.body;
      
      if (!documentable_type || !documentable_id) {
        console.error('Missing fields:', { documentable_type, documentable_id });
        return cb(new Error('Missing documentable type or ID'));
      }

      const dir = path.join(
        uploadsDir,
        documentable_type.toLowerCase(),
        documentable_id.toString()
      );
      
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } catch (error) {
      console.error('Storage error:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    try {
      const uniqueSuffix = Date.now() + '-' + uuidv4();
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    } catch (error) {
      cb(error);
    }
  }
});

// Configure multer with limits and file filter
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow 1 file per request
  },
  fileFilter: (req, file, cb) => {
    try {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
      }
    } catch (error) {
      cb(error);
    }
  }
});

// Update the route to use the handleUpload middleware and controller
router.post("/", (req, res) => {
  upload.single('document')(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        message: 'Upload error',
        error: err.message
      });
    }
    
    documentController.uploadDocument(req, res);
  });
});

// Get documents by type and ID
router.get("/:type/:id", documentController.getDocuments);

module.exports = router;