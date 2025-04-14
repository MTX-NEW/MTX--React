const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Vehicle = require("./Vehicle");

// Main Maintenance Model
const Maintenance = sequelize.define(
  "Maintenance",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vehicles',
        key: 'vehicle_id'
      }
    },
    mechanic: DataTypes.STRING(255),
    service_date: DataTypes.DATEONLY,
    odometer: DataTypes.INTEGER,
    notes: DataTypes.TEXT,
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'maintenance',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false
  }
);

// Vehicle Parts Catalog Model
const VehiclePart = sequelize.define(
  "VehiclePart",
  {
    part_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    part_number: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false
    },
    part_name: DataTypes.STRING(255),
    type: DataTypes.ENUM('OEM', 'Aftermarket', 'Refurbished'),
    brand: DataTypes.STRING(50),
    unit_price: DataTypes.DECIMAL(10, 2),
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'parts_supplier',
        key: 'supplier_id'
      }
    },
    warranty: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    warranty_type: DataTypes.ENUM('Time', 'Mileage', 'Both'),
    warranty_mileage: DataTypes.INTEGER,
    warranty_time_unit: DataTypes.ENUM('Days', 'Months', 'Years', 'Lifetime')
  },
  {
    tableName: 'vehicle_parts',
    timestamps: false
  }
);

// Vehicle Services Catalog Model
const VehicleService = sequelize.define(
  "VehicleService",
  {
    service_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    service_code: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    service_name: DataTypes.STRING(255),
    standard_hours: DataTypes.DECIMAL(4, 2),
    standard_cost: DataTypes.DECIMAL(10, 2)
  },
  {
    tableName: 'vehicle_services',
    timestamps: false
  }
);

// Maintenance Parts Junction Model
const MaintenancePart = sequelize.define(
  "MaintenancePart",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    maintenance_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    part_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    purchase_date: DataTypes.DATEONLY,
    actual_price: DataTypes.DECIMAL(10, 2),
    warranty_applied: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    tableName: 'maintenance_parts',
    timestamps: false
  }
);

// Maintenance Services Junction Model
const MaintenanceService = sequelize.define(
  "MaintenanceService",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    maintenance_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    actual_hours: DataTypes.DECIMAL(4, 2),
    actual_cost: DataTypes.DECIMAL(10, 2)
  },
  {
    tableName: 'maintenance_services',
    timestamps: false
  }
);

// Parts Supplier Model
const PartsSupplier = sequelize.define(
  "PartsSupplier",
  {
    supplier_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_name: DataTypes.STRING(100),
    street_address: DataTypes.STRING(255),
    city: DataTypes.STRING(50),
    state: DataTypes.STRING(2),
    zip: DataTypes.STRING(10),
    phone: DataTypes.STRING(15),
    fax: DataTypes.STRING(15),
    notes: DataTypes.TEXT
  },
  {
    tableName: 'parts_supplier',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Define associations
Maintenance.belongsTo(Vehicle, {
  foreignKey: 'vehicle_id',
  as: 'vehicle'
});

Maintenance.hasMany(MaintenanceService, {
  foreignKey: 'maintenance_id',
  as: 'services',
  onDelete: 'CASCADE'
});

MaintenanceService.belongsTo(VehicleService, {
  foreignKey: 'service_id',
  as: 'service'
});

Maintenance.hasMany(MaintenancePart, {
  foreignKey: 'maintenance_id',
  as: 'parts',
  onDelete: 'CASCADE'
});

MaintenancePart.belongsTo(VehiclePart, {
  foreignKey: 'part_id',
  as: 'part'
});

VehiclePart.belongsTo(PartsSupplier, {
  foreignKey: 'supplier_id',
  as: 'supplier'
});

module.exports = {
  Maintenance,
  VehiclePart,
  VehicleService,
  MaintenancePart,
  MaintenanceService,
  PartsSupplier
};