import {defineConfig} from 'cypress'

const env = process.env.NODE_ENV || 'development'
require('dotenv').config({path: `.env.${env}`})

export default defineConfig({
    chromeWebSecurity: false,
    defaultCommandTimeout: 15000,
    env: {
        BASE_URL: process.env.BASE_URL,
        AUTH0_PASSWORD: process.env.AUTH0_PASSWORD,
        NODE_ENV: process.env.NODE_ENV
    },
    e2e: {
        specPattern: 'e2e/**/*.cy.{js,jsx,ts,tsx}',
        supportFile: 'support/e2e.ts'
    },
    component: {
        devServer: {
            framework: 'react',
            bundler: 'webpack',
        },
    },
})
