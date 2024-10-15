import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync("../cert/cert.key"),
      cert: fs.readFileSync("../cert/cert.crt")
    }
  },
  plugins: [react()],
})
