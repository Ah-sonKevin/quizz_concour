import { defineConfig } from 'vite'

export default defineConfig({
    envDir: './',
    envPrefix: 'VITE_',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: 'index.html',
                courses: 'courses.html',
                quiz: 'quiz.html',
                courseDetail: 'course-detail.html'
            }
        }
    },
    server: {
        port: 5501,
        host: true
    },
    plugins: [{
        name: 'env-check',
        configureServer() {
            console.log('Environment Variables:', {
                SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
                SUPABASE_KEY: !!process.env.VITE_SUPABASE_KEY
            });
        }
    }]
})
