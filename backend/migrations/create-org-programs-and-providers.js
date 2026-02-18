module.exports = {
  async up(queryInterface, Sequelize) {
    // Create org_programs table
    await queryInterface.createTable('org_programs', {
      program_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_groups',
          key: 'group_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      program_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      short_name: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive'),
        defaultValue: 'Active',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      }
    });

    // Create providers table
    await queryInterface.createTable('providers', {
      provider_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      program_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'org_programs',
          key: 'program_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      provider_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      short_name: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      street_address: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING(2),
        allowNull: true,
      },
      zip: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive'),
        defaultValue: 'Active',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('org_programs', ['group_id']);
    await queryInterface.addIndex('org_programs', ['status']);
    await queryInterface.addIndex('providers', ['program_id']);
    await queryInterface.addIndex('providers', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('providers');
    await queryInterface.dropTable('org_programs');
  }
};
