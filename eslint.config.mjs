import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = [
  ...nextCoreWebVitals,
  prettierRecommended,
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['coverage/**/*', 'node_modules/**/*', '.next/**/*'],
    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
];

export default eslintConfig;
