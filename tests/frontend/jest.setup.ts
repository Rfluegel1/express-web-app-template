import '@testing-library/jest-dom'

const env = process.env.NODE_ENV || 'development'
require('dotenv').config({path: `.env.${env}`})