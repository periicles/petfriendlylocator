import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  { ignores: ['coverage/**/*', 'node_modules/**/*', '.next/**/*'] },
  ...nextCoreWebVitals,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    // CLI scripts (seed, migrations helpers) legitimately log to stdout.
    files: ['prisma/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
];

export default eslintConfig;
