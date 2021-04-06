// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/*.test.[jt]s?(x)'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/public/'
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0
    }
  },
  // setupFilesAfterEnv: ['./jest/jest.setup.js'],
  // setupFiles: ['./jest/global.js'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/public/'],
  verbose: true,
  automock: false
}
