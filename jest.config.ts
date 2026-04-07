// /** @type {import('jest').Config} */
// module.exports = {
 
// };


import type {Config} from 'jest';

const config: Config = {
  verbose: true,
   preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
    setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],  // ✅

};

export default config;