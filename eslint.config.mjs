import js from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactNative from 'eslint-plugin-react-native';
import pluginImport from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {
      js,
      react: pluginReact,
      'react-native': pluginReactNative,
      import: pluginImport,
    },
    rules: {
      // Example rules – adjust to your taste
      'react/react-in-jsx-scope': 'off', // Not needed in React Native
      'react-native/no-inline-styles': 'warn',
      'prettier/prettier': 'warn',
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react-native/all',
      'plugin:import/errors',
      'plugin:import/warnings',
      'plugin:import/react',
      'prettier', // Disables conflicting ESLint rules
    ],
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);
