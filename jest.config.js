module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['.d.ts'],
  collectCoverage: true,
  globals: {
    'ts-jest': {
      packageJson: 'package.json'
    }
  }
}
