module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: {
    browser: true,
    es2022: true
  },
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
  }
};
