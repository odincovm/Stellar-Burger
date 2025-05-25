// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4000', // ваш фронтенд
    chromeWebSecurity: false, // ← отключаем CORS-проверки
    specPattern: 'cypress/e2e/**/*.cy.{js,ts,jsx,tsx}',
    setupNodeEvents(on, config) {
      return config;
    }
  }
});
