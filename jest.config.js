/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testMatch: ['**/src/**/__tests__/**/*.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {tsconfig: 'tsconfig.test.json'}],
  },
};
