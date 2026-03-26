/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testMatch: ['**/src/**/__tests__/**/*.ts'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.\\.?/.*)\\.js$': '$1',
  },
  transform: {
    '^.+.tsx?$': [
      'ts-jest',
      {tsconfig: {isolatedModules: false}, diagnostics: {ignoreCodes: [151002]}},
    ],
  },
};
