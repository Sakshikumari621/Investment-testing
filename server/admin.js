const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const setupAdmin = async (app) => {
  try {
    // Dynamic import to handle pure ESM adminjs packages in CommonJS
    const AdminJSModule = await import('adminjs');
    const AdminJS = AdminJSModule.default;
    const { ComponentLoader } = AdminJSModule;
    const AdminJSExpressModule = await import('@adminjs/express');
    const AdminJSExpress = AdminJSExpressModule.default;
    const AdminJSMongooseModule = await import('@adminjs/mongoose');
    const path = require('path');

    // 2. Register Adapter
    AdminJS.registerAdapter({
      Database: AdminJSMongooseModule.Database,
      Resource: AdminJSMongooseModule.Resource
    });

    const User = require('./models/User');
    const Deposit = require('./models/Deposit');
    const Payout = require('./models/Payout');
    const Growth = require('./models/Growth');

    const { decrypt } = require('./utils/cryptoUtils');

    const adminOptions = {
      databases: [mongoose],
      rootPath: '/admin',
      resources: [
        {
          resource: User,
          options: {
            properties: {
              password: {
                isVisible: { list: false, filter: false, show: false, edit: false, new: true }
              },
              panNumber: {
                type: 'string',
                isVisible: { list: false, filter: true, show: true, edit: false }
              },
              aadhaarNumber: {
                type: 'string',
                isVisible: { list: false, filter: true, show: true, edit: false }
              },
              kycStatus: {
                isVisible: { list: true, filter: true, show: true, edit: true }
              },
              panVerified: {
                isVisible: { list: true, filter: true, show: true, edit: true }
              },
              aadhaarVerified: {
                isVisible: { list: true, filter: true, show: true, edit: true }
              },
              panPhoto: {
                isVisible: { list: false, filter: false, show: true, edit: false }
              },
              aadhaarPhoto: {
                isVisible: { list: false, filter: false, show: true, edit: false }
              }
            },
            actions: {
              // Global decryption hook
              list: {
                after: async (response) => {
                  response.records.forEach(record => {
                    if (record.params.panNumber) record.params.panNumber = decrypt(record.params.panNumber);
                    if (record.params.aadhaarNumber) record.params.aadhaarNumber = decrypt(record.params.aadhaarNumber);
                  });
                  return response;
                }
              },
              show: {
                after: async (response) => {
                  if (response.record && response.record.params) {
                    if (response.record.params.panNumber) response.record.params.panNumber = decrypt(response.record.params.panNumber);
                    if (response.record.params.aadhaarNumber) response.record.params.aadhaarNumber = decrypt(response.record.params.aadhaarNumber);
                  }
                  return response;
                }
              },
              search: {
                after: async (response) => {
                  response.records.forEach(record => {
                    if (record.params.panNumber) record.params.panNumber = decrypt(record.params.panNumber);
                    if (record.params.aadhaarNumber) record.params.aadhaarNumber = decrypt(record.params.aadhaarNumber);
                  });
                  return response;
                }
              },

              edit: {
                before: async (request) => {
                  if (request.method === 'post' && request.payload && request.payload.password === '') {
                    delete request.payload.password;
                  }
                  return request;
                },
                after: async (response) => {
                  if (response.record && response.record.params) {
                    const balance = response.record.params.balance;
                    const baseAmount = Math.floor(balance / 500) * 500;
                    await User.findByIdAndUpdate(response.record.params._id, { baseAmount });
                    response.record.params.baseAmount = baseAmount;
                  }
                  return response;
                }
              }
            }
          }
        },
        { resource: Deposit },
        { resource: Payout },
        { resource: Growth }
      ],
      branding: {
        companyName: 'Investment Portal',
        withMadeWithLove: false
      }
    };

    console.log('--- AdminJS: Creating AdminJS instance ---');
    const admin = new AdminJS(adminOptions);

    // Build routes
    console.log('--- AdminJS: Building authenticated router ---');
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
    });

    app.use(admin.options.rootPath, router);
    console.log(`AdminJS started on http://localhost:${process.env.PORT || 5000}${admin.options.rootPath}`);
  } catch (error) {
    console.error('Failed to setup AdminJS:', error);
  }
};

module.exports = setupAdmin;
