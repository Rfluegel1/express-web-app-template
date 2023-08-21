module.exports = {
    displayName: 'backend',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/tests/backend/**/*.spec.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    globalSetup: '<rootDir>/tests/backend/globalSetup.ts',
    globalTeardown: '<rootDir>/tests/backend/globalTeardown.ts',
    transform: {
        '^.+\\.jsx?$': 'babel-jest', '^.+\\.tsx?$': 'ts-jest'
    }
};
