const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create edi_client_settings table
    await queryInterface.createTable('edi_client_settings', {
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
        defaultValue: 2.50
      },
      base_transport_rate: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 25.00
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // Create claims table
    await queryInterface.createTable('claims', {
      claim_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      trip_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'trips',
          key: 'trip_id'
        },
        onDelete: 'CASCADE'
      },
      claim_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      patient_control_number: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'generated', 'submitted', 'accepted', 'rejected', 'paid'),
        defaultValue: 'pending'
      },
      claim_frequency: {
        type: DataTypes.STRING(1),
        defaultValue: '1' // 1 = original
      },
      total_charge_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      place_of_service: {
        type: DataTypes.STRING(2),
        defaultValue: '41' // Ambulance - Land
      },
      facility_code_value: {
        type: DataTypes.STRING(2),
        defaultValue: '81'
      },
      service_from_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      service_to_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      billing_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      edi_file_path: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      generated_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // Create claims_charges table
    await queryInterface.createTable('claims_charges', {
      charge_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      claim_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'claims',
          key: 'claim_id'
        },
        onDelete: 'CASCADE'
      },
      trip_leg_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'trip_legs',
          key: 'leg_id'
        }
      },
      charge_number: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      cpt_code: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      modifier_1: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      modifier_2: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      modifier_3: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      modifier_4: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      units: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      charge_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      diagnosis_pointer: {
        type: DataTypes.STRING(4),
        defaultValue: '1'
      },
      service_from_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      service_to_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      service_description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      place_of_service: {
        type: DataTypes.STRING(2),
        defaultValue: '41' // Ambulance - Land
      },
      ndc_number: {
        type: DataTypes.STRING(11),
        allowNull: true
      },
      ndc_unit: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true
      },
      ndc_qualifier_code: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('claims', ['trip_id']);
    await queryInterface.addIndex('claims', ['claim_number']);
    await queryInterface.addIndex('claims', ['status']);
    await queryInterface.addIndex('claims_charges', ['claim_id']);
    await queryInterface.addIndex('claims_charges', ['cpt_code']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('claims_charges');
    await queryInterface.dropTable('claims');
    await queryInterface.dropTable('edi_client_settings');
  }
};
