import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'baseline-api',
      configureServer(server) {
        server.middlewares.use('/api/report', (req, res) => {
          const reportPath = path.resolve(__dirname, '../../core/baseline-report.json');
          if (!fs.existsSync(reportPath)) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Report not found' }));
          }
          const data = fs.readFileSync(reportPath, 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.end(data);
        });
      },
    },
  ],
  server: {
    port: 5173,
    watch: {
      ignored: ['!**/baseline-report.json'],
    },
  },
});
