import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
    appType: "custom",
    build: {
        manifest: "true",
        outDir: "dist",
        rollupOptions: {
            input: [
                resolve(__dirname, 'src/main.jsx'),
                resolve(__dirname, 'src/stream.jsx'),
            ]
        }
    },
    server: {
      https: {
        key: fs.readFileSync("../cert/cert.key"),
        cert: fs.readFileSync("../cert/cert.crt")
      }
    },
    plugins: [react()],
})