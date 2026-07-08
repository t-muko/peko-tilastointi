import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    define: {
        __BUILD_HASH__: JSON.stringify('test'),
        __BUILD_DATE__: JSON.stringify(new Date(0).toISOString()),
    },
    resolve: {
        alias: {
            '@root': path.resolve(__dirname, '.'),
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@stores': path.resolve(__dirname, './src/stores'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        exclude: ['tests/e2e/**', 'node_modules/**'],
    },
});
