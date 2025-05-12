const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Document = sequelize.define("Document", {
  document_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  documentable_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  documentable_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: true,
      isInt: true
    }
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  original_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      isIn: [['image/jpeg', 'image/png', 'application/pdf']]
    }
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 5 * 1024 * 1024 // 5MB limit
    }
  }
}, {
  tableName: 'documents',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Add polymorphic association
Document.addHook('afterDefine', (Document) => {
  Document.associations = {
    documentable: {
      associationType: 'polymorphic',
      options: {
        foreignKey: 'documentable_id',
        constraints: false,
        scope: {
          documentable_type: 'documentable_type'
        }
      }
    }
  };
});

module.exports = { Document }; 