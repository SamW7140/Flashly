/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    // Exclude Phase 0 deprecated files
    '!src/commands/scan-poc.ts',
    '!src/parser/simple-parser.ts',
    '!src/scheduler/fsrs-scheduler.ts',
    '!src/ui/review-modal.ts',
    // Exclude UI that requires integration testing
    '!src/ui/settings-tab.ts',
    // Exclude settings (interfaces only)
    '!src/settings.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleNameMapper: {
    '^obsidian$': '<rootDir>/__mocks__/obsidian.ts',
  },
};
