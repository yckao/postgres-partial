module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  setupFiles: ['core-js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ]
}
