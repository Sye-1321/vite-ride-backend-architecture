const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleFileExtensions: ["ts", "js", "json"],
  roots: ["<rootDir>/apps", "<rootDir>/libs"],
  testRegex: ".*\\.spec\\.ts$",
  coverageDirectory: "<rootDir>/coverage",
  collectCoverageFrom: [
    "apps/**/*.ts",
    "libs/**/*.ts",
    "!**/node_modules/**",
    "!**/dist/**"
  ],
  moduleNameMapper: {
    "^@app/(.*)$": "<rootDir>/libs/$1/src"
  },
  verbose: true,
};
