import {defineConfig} from 'cypress'

const env = process.env.NODE_ENV || 'development'
require('dotenv').config({path: `.env.${env}`})

export default defineConfig({
    env: {
        BASE_URL: process.env.CYPRESS_BASE_URL
    },
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
})
