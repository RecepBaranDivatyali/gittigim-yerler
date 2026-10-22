import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'android/**', 'ios/**', 'node_modules/**', 'scratch/**', 'public/**', '.agents/**', '*.cjs', 'collected.js', 'scripts/**', 'api/**']
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser }
    },
    rules: {
      // Only real runtime-breaking errors fail the check.
      'no-undef': 'error',
      'no-dupe-keys': 'error',
      'no-unreachable': 'error',
      'no-const-assign': 'error',
      'no-redeclare': 'error',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      'no-self-assign': 'error'
    }
  }
];
