const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const UserGroup = require("./UserGroup");
const UserType = require("./UserType");
const GroupPermission = require("./GroupPermission");
const bcrypt = require("bcrypt");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    emp_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    user_group: {
      type: DataTypes.INTEGER,
      references: {
        model: UserGroup,
        key: 'group_id',
      },
    },
    user_type: {
      type: DataTypes.INTEGER,
      references: {
        model: UserType,
        key: 'type_id',
      },
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'trip_locations',
        key: 'location_id',
      },
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive', 'Suspended', 'Pending'),
      defaultValue: 'Active',
    },
    hiringDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastEmploymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sex: {
      type: DataTypes.ENUM('Male', 'Female'),
      allowNull: true,
    },
    spanishSpeaking: {
      type: DataTypes.ENUM('Yes', 'No'),
      allowNull: true,
    },
    paymentStructure: {
      type: DataTypes.ENUM('Pay per Hour', 'Pay per Mile', 'Pay per Trip'),
      allowNull: true,
    },
    hourly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 15.00,
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 encoded signature image',
    },
    profile_image: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 encoded or file path to profile image',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user) => {
        await validateUserGroupType(user);
        
        // Hash password before saving
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        await validateUserGroupType(user);
        
        // Hash password before updating if it has changed
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  }
);

// Validation function to check if user_type is allowed for user_group
async function validateUserGroupType(user) {
  if (user.user_group && user.user_type) {
    const permission = await GroupPermission.findOne({
      where: {
        group_id: user.user_group,
        type_id: user.user_type
      }
    });

    if (!permission) {
      throw new Error('Selected user type is not allowed for this user group');
    }
  }
}

// Define associations
User.belongsTo(UserGroup, { foreignKey: 'user_group' });
User.belongsTo(UserType, { foreignKey: 'user_type' });

module.exports = User;
