'use strict';

const { v7: uuidv7 } = require('uuid');
const bcrypt = require('bcrypt');
const path = require('path');
const dotenv = require('dotenv');

const environment = process.env.NODE_ENV ?? 'development';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${environment}`) });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const email = process.env.ADMIN_EMAIL;
    const rawPassword = process.env.ADMIN_PASS;
    const name = process.env.ADMIN_NAME || 'Admin';
    const picture = process.env.USER_IMG || 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

    if (!email || !rawPassword) {
      console.warn('⚠️ Seeder skipped: ADMIN_EMAIL or ADMIN_PASS is not defined.');
      return;
    }

    // Idempotent: check if user already exists
    const existingUser = await queryInterface.rawSelect('users', {
      where: { email }
    }, ['id']);

    if (existingUser) {
      console.log(`ℹ️ User with email ${email} already exists. Seeder skipped.`);
      return;
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 12);
    const nickname = email.split('@')[0];
    const now = new Date();

    await queryInterface.bulkInsert('users', [{
      id: uuidv7(),
      email,
      password: hashedPassword,
      nickname,
      name,
      picture,
      role: 'OWNER',
      enabled: true,
      createdAt: now,
      updatedAt: now
    }]);

    console.log(`✅ Admin user (${email}) created successfully via seeder.`);
  },

  async down(queryInterface, Sequelize) {
    const email = process.env.ADMIN_EMAIL;
    if (!email) return;

    await queryInterface.bulkDelete('users', { email });
    console.log(`🗑️ Admin user (${email}) removed via seeder.`);
  }
};

