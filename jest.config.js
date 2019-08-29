module.exports = {
  displayName: 'web-app',
  collectCoverage: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testRegex: 'src/.*(/__tests__/.*|(.|/)(test|spec)).(ts|js)x?$',
  moduleNameMapper: {
    '^.+\\.(css|less|scss|svg)$': 'babel-jest',
  },
  setupFilesAfterEnv: ["<rootDir>enzyme.setup.ts"],
  testURL: 'http://localhost/',
};
