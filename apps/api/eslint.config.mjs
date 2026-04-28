// @ts-check
import { nestJsConfig } from '@repo/eslint-config/nestjs';
import tseslint from 'typescript-eslint';

export default tseslint.config(nestJsConfig, {
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
