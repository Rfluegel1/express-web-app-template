module.exports = {
    projects: [
        {
            displayName: 'backend',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/tests/backend/**/*.spec.ts'],
            moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
            globalSetup: '<rootDir>/tests/backend/globalSetup.ts',
            globalTeardown: '<rootDir>/tests/backend/globalTeardown.ts',
            transform: {
                '^.+\\.jsx?$': 'babel-jest', '^.+\\.tsx?$': 'ts-jest'
            },
        },
        {
            displayName: 'frontend',
            testEnvironment: 'jsdom',
            testMatch: ['<rootDir>/tests/frontend/**/*.spec.tsx'],
            moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
            transform: {
                '^.+\\.jsx?$': 'babel-jest', '^.+\\.tsx?$': 'ts-jest'
            },
            setupFilesAfterEnv: ['<rootDir>/tests/frontend/jest.setup.ts'],
        },
    ],
};
