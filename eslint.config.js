import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  {ignores: ['dist', 'build', 'coverage', 'node_modules', 'drizzle']},
  {
    name: 'app.server',
    files: ['server/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    extends: [ 
      js.configs.recommended,
      ...tseslint.configs.recommended
    ],
    rules:{
      semi:['error', 'never'],
      quotes: ['error', 'single', {avoidEscape: true}],
      'comma-dangle': ['error', 'never'],
      '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
      '@typescript-eslint/consistent-type-imports': ['error', {prefer: 'type-imports'}],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'indent': ['error', 2],
      'space-before-function-paren': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'arrow-spacing': ['error', {before: true, after: true}]
    }
  },
  {
    name: 'app:tests',
    files: ['test/**/*.ts', 'tests/**/*.ts', '**/*.{test,spec}.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.vitest
      }
    },
    extends: [ 
      js.configs.recommended,
      ...tseslint.configs.recommended
    ],
    rules:{
      '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off'
    }
  }
)
