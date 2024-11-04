import { fileURLToPath, URL } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

dotenv.config({ path: '../../.env' });

export default defineConfig({
    build: {
        emptyOutDir: true,
        rollupOptions: {
            external: ['@dfinity/identity'],
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: "globalThis",
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true,
                }),
                NodeModulesPolyfillPlugin(),
            ],
        },
    },
    server: {
        proxy: {
            "/api": {
                target: "http://127.0.0.1:4943",
                changeOrigin: true,
            },
        },
    },
    plugins: [
        react(),
        environment("all", { prefix: "CANISTER_" }),
        environment("all", { prefix: "DFX_" }),
    ],
    resolve: {
        alias: [{
                find: "declarations",
                replacement: fileURLToPath(
                    new URL("../declarations",
                        import.meta.url)
                ),
            },
            {
                find: "util",
                replacement: "rollup-plugin-node-polyfills/polyfills/util",
            },
            {
                find: "sys",
                replacement: "util",
            },
            {
                find: "events",
                replacement: "rollup-plugin-node-polyfills/polyfills/events",
            },
            {
                find: "stream",
                replacement: "rollup-plugin-node-polyfills/polyfills/stream",
            },
            {
                find: "path",
                replacement: "rollup-plugin-node-polyfills/polyfills/path",
            },
            {
                find: "querystring",
                replacement: "rollup-plugin-node-polyfills/polyfills/qs",
            },
            {
                find: "punycode",
                replacement: "rollup-plugin-node-polyfills/polyfills/punycode",
            },
            {
                find: "url",
                replacement: "rollup-plugin-node-polyfills/polyfills/url",
            },
            {
                find: "string_decoder",
                replacement: "rollup-plugin-node-polyfills/polyfills/string-decoder",
            },
            {
                find: "http",
                replacement: "rollup-plugin-node-polyfills/polyfills/http",
            },
            {
                find: "https",
                replacement: "rollup-plugin-node-polyfills/polyfills/http",
            },
            {
                find: "os",
                replacement: "rollup-plugin-node-polyfills/polyfills/os",
            },
            {
                find: "assert",
                replacement: "rollup-plugin-node-polyfills/polyfills/assert",
            },
        ],
    },
});
