module.exports = {
  up: async (queryInterface, Sequelize) => {
    const skipIfExists = async (fn) => {
      try {
        await fn();
      } catch (err) {
        if (err.message && (err.message.includes('already exists') || err.message.includes('Duplicate'))) return;
        throw err;
      }
    };

    // Remove the old address column if it exists
    try {
      await queryInterface.removeColumn('user_groups', 'address');
    } catch (e) {
      // Column might not exist, ignore
      console.log('address column does not exist, skipping removal');
    }

    // Add street_address column
    await skipIfExists(() => queryInterface.addColumn('user_groups', 'street_address', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'website'
    }));

    // Add city column
    await skipIfExists(() => queryInterface.addColumn('user_groups', 'city', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'street_address'
    }));

    // Add state column
    await skipIfExists(() => queryInterface.addColumn('user_groups', 'state', {
      type: Sequelize.STRING(2),
      allowNull: true,
      after: 'city'
    }));

    // Add zip column
    await skipIfExists(() => queryInterface.addColumn('user_groups', 'zip', {
      type: Sequelize.STRING(10),
      allowNull: true,
      after: 'state'
    }));
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the new columns
    await queryInterface.removeColumn('user_groups', 'street_address');
    await queryInterface.removeColumn('user_groups', 'city');
    await queryInterface.removeColumn('user_groups', 'state');
    await queryInterface.removeColumn('user_groups', 'zip');

    // Add back the old address column
    await queryInterface.addColumn('user_groups', 'address', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'website'
    });
  }
};
