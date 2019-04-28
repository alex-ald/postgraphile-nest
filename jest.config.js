module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    "<rootDir>/tests"
  ],
  collectCoverageFrom: [
    "<rootDir>/lib/**/*.ts",
    "!<rootDir>/tests/helpers/**/*.ts",
  ]
};
