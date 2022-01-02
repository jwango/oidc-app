const { i18n } = require('./next-i18next.config');

module.exports = {
  i18n,
  publicRuntimeConfig: {
    gatewayUrl: process.env.GW_URL || 'http://localhost:8080'
  }
};