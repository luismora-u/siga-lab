'use strict';

const js = require('@eslint/js');

// Configuracion minima: reglas recomendadas de ESLint sobre codigo Node/CommonJS.
// Cierra DT-7 (Unidad 1): el proyecto no tenia verificacion estatica.
module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'writable',
        process: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        __dirname: 'readonly',
        URL: 'readonly',
      },
    },
  },
  {
    ignores: ['node_modules/**'],
  },
];
