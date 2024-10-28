import { defineConfig } from 'vite'

export default defineConfig({
    envDir: './',
    envPrefix: 'VITE_',
    server: {
        port: 5501,
        host: true
    }
})
