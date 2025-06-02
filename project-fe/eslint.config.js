// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Pastikan plugin React diimpor jika Anda menggunakan React

export default defineConfig({
  plugins: [react()], // Pastikan plugin React ditambahkan di sini
  server: {
    port: 3001, // <--- Tempatkan pengaturan port di sini
  },
  // Anda juga bisa menambahkan konfigurasi Vite lainnya di sini jika diperlukan
});