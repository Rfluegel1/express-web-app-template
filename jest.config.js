module.exports = {
    testEnvironment: 'node',
    testRegex: '/tests/.*\\.(tests|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    globalSetup: '<rootDir>/tests/backend/globalSetup.ts',
    globalTeardown: '<rootDir>/tests/backend/globalTeardown.ts'
};