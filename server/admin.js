const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const setupAdmin = async (app) => {
  try {
    // Dynamic import to handle pure ESM adminjs packages in CommonJS
    const AdminJSModule = await import('adminjs');
    const AdminJS = AdminJSModule.default;
    const AdminJSExpressModule = await import('@adminjs/express');
    const AdminJSExpress = AdminJSExpressModule.default;
    const AdminJSMongooseModule = await import('@adminjs/mongoose');

    AdminJS.registerAdapter({
      Database: AdminJSMongooseModule.Database,
      Resource: AdminJSMongooseModule.Resource
    });

    const User = require('./models/User');
    const Deposit = require('./models/Deposit');
    const Payout = require('./models/Payout');
    const Growth = require('./models/Growth');

    const adminOptions = {
      databases: [mongoose],
      rootPath: '/admin',
      resources: [
        {
          resource: User,
          options: {
            properties: {
              password: {
                isVisible: { list: false, filter: false, show: false, edit: true }
              }
            }
          }
        },
        Deposit,
        Payout,
        Growth
      ],
      branding: {
        companyName: 'Investment Portal',
        withMadeWithLove: false
      }
    };

    const admin = new AdminJS(adminOptions);

    // Secure the admin dashboard
    const router = AdminJSExpress.buildAuthenticatedRouter(admin, {
      authenticate: async (email, password) => {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        if (email === adminEmail && password === adminPassword) {
          return { email, role: 'admin' };
        }
        return false;
      },
      cookieName: 'adminjs_cookie',
      cookiePassword: process.env.JWT_SECRET || 'some_secret_password_for_cookies_123456789',
    }, null, {
      resave: false,
      saveUninitialized: true
    });

    app.use(admin.options.rootPath, router);
    console.log(`AdminJS started on http://localhost:${process.env.PORT || 5000}${admin.options.rootPath}`);
  } catch (error) {
    console.error('Failed to setup AdminJS:', error);
  }
};

module.exports = setupAdmin;
