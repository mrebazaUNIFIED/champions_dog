import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import globals from 'globals';

const eslintConfig = tseslint.config(
  { ignores: ['.next/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);

export default eslintConfig;
