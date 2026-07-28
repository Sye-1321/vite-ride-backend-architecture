/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps'],
  testRegex: '.*\\.e2e-spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@app/auth$': '<rootDir>/libs/auth/index.ts',
    '^@app/auth/(.*)$': '<rootDir>/libs/auth/$1',
    '^@app/([^/]+)$': '<rootDir>/libs/$1/src',
    '^@app/([^/]+)/(.*)$': '<rootDir>/libs/$1/src/$2',
  },
  verbose: true,
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage-e2e',
};
