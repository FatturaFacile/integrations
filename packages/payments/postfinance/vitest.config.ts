import { defineConfig, mergeConfig } from 'vitest/config';
import { baseVitestConfig } from '../../../tools/vitest/vitest.base';

export default mergeConfig(
  baseVitestConfig,
  defineConfig({
    test: {
      name: 'postfinance-integration'
    }
  })
);
