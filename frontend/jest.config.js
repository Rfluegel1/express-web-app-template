module.exports = {
    displayName: 'frontend',
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/tests/**/*.spec.tsx'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '^.+\\.jsx?$': 'babel-jest', '^.+\\.tsx?$': 'ts-jest'
    },
    setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
};
