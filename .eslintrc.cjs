module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-debugger': 'error',
    'eqeqeq': ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 'error'
  },
  overrides: [
    {
      files: ['js/**/*.js'],
      parserOptions: {
        sourceType: 'module'
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-var': 'off'
      }
    }
  ]
};
