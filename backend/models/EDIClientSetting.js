const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const EDIClientSetting = sequelize.define(
  "EDIClientSetting",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sender_id: {
      type: DataTypes.STRING(15),
      allowNull: false,
      defaultValue: 'MTXPROVIDER'
    },
    receiver_id: {
      type: DataTypes.STRING(15),
      allowNull: false,
      defaultValue: 'AHCCCS'
    },
    receiver_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'ARIZONA HEALTH CARE'
    },
    interchange_control_version: {
      type: DataTypes.STRING(5),
      defaultValue: '00501'
    },
    default_provider_npi: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    default_taxonomy: {
      type: DataTypes.STRING(10),
      defaultValue: '343900000X' // Transportation services
    },
    mileage_rate: {
      type: DataTypes.DECIMAL(6, 2),
      defaultValue: 2.50,
      get() {
        const value = this.getDataValue('mileage_rate');
        return value === null ? null : parseFloat(value);
      }
    },
    base_transport_rate: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 25.00,
      get() {
        const value = this.getDataValue('base_transport_rate');
        return value === null ? null : parseFloat(value);
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    CreatedOn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UpdatedOn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // ISA Segment Fields
    ISA01: {
      type: DataTypes.CHAR(2),
      defaultValue: '00'
    },
    ISA02: {
      type: DataTypes.CHAR(10),
      defaultValue: '          '
    },
    ISA03: {
      type: DataTypes.CHAR(2),
      defaultValue: '00'
    },
    ISA04: {
      type: DataTypes.CHAR(10),
      defaultValue: '          '
    },
    ISA05: {
      type: DataTypes.CHAR(2),
      defaultValue: 'ZZ'
    },
    ISA06: {
      type: DataTypes.STRING(15),
      defaultValue: 'MTXPROVIDER'
    },
    ISA07: {
      type: DataTypes.CHAR(2),
      defaultValue: 'ZZ'
    },
    ISA08: {
      type: DataTypes.STRING(15),
      defaultValue: 'AHCCCS'
    },
    ISA11: {
      type: DataTypes.CHAR(1),
      defaultValue: 'U'
    },
    ISA12: {
      type: DataTypes.CHAR(5),
      defaultValue: '00501'
    },
    ISA13: {
      type: DataTypes.STRING(9),
      defaultValue: '000000001'
    },
    ISA14: {
      type: DataTypes.CHAR(1),
      defaultValue: '0'
    },
    ISA15: {
      type: DataTypes.CHAR(1),
      defaultValue: 'P'
    },
    ISA16: {
      type: DataTypes.CHAR(1),
      defaultValue: ':'
    },
    // GS Segment Fields
    GS02: {
      type: DataTypes.STRING(15),
      defaultValue: 'MTXPROVIDER'
    },
    GS03: {
      type: DataTypes.STRING(12),
      defaultValue: 'AHCCCS'
    },
    GS08: {
      type: DataTypes.STRING(12),
      defaultValue: '005010X222A1'
    },
    // Submitter Information
    SubmitterEntityTypeID: {
      type: DataTypes.CHAR(1),
      defaultValue: '2'
    },
    SubmitterLastName: {
      type: DataTypes.STRING(50),
      defaultValue: 'MTX Medical Transport'
    },
    SubmitterFirstName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    SubmitterID: {
      type: DataTypes.STRING(15),
      defaultValue: 'MTXPROVIDER'
    },
    SubmitterContact: {
      type: DataTypes.STRING(20),
      defaultValue: 'MTX Support'
    },
    SubmitterPhone: {
      type: DataTypes.STRING(20),
      defaultValue: '6025551234'
    },
    SubmitterPhoneExt: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    SubmitterEmail: {
      type: DataTypes.STRING(50),
      defaultValue: 'support@mtxtransport.com'
    },
    // Receiver Information
    ReceiverName: {
      type: DataTypes.STRING(50),
      defaultValue: 'ARIZONA HEALTH CARE'
    },
    ReceiverID: {
      type: DataTypes.STRING(15),
      defaultValue: 'AHCCCS'
    },
    // Login Credentials
    UserName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    UserPassword: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    // Enterprise Fields
    clearing_house_client_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    enterprise_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    edi_type: {
      type: DataTypes.STRING(255),
      defaultValue: '837P'
    },
    // Audit Fields
    CreatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    UpdatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: "edi_client_settings",
    timestamps: false,  // This tells Sequelize not to expect created_at/updated_at columns
  }
);

module.exports = EDIClientSetting;
