import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/

// Local api proxy to run Vercel serverless functions directly in Vite using npm run dev
const localApiProxy = () => ({
  name: 'local-api-proxy',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      const url = req.originalUrl || req.url;
      if (url && url.startsWith('/api/')) {
        try {
          const cleanUrl = url.split('?')[0].replace(/\/$/, ''); // Remove trailing slash
          const modulePath = `.${cleanUrl}.ts`;
          
          const module = await server.ssrLoadModule(modulePath);
          
          let body = '';
          req.on('data', (chunk: any) => { body += chunk.toString(); });
          req.on('end', async () => {
             try {
                if (body) {
                  try { req.body = JSON.parse(body); } catch (e) { req.body = body; }
                } else {
                  req.body = {};
                }

                res.status = (code: number) => { res.statusCode = code; return res; };
                res.json = (data: any) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                };

                await module.default(req, res);
             } catch (error: any) {
                console.error(`[Local API Proxy] Error in ${modulePath}:`, error);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 500;
                res.end(JSON.stringify({ 
                  success: false, 
                  error: "Internal Server Error in Local API Proxy",
                  message: error.message 
                }));
             }
          });
        } catch (e) {
          console.error('[Local API Proxy] Route not found or load error:', e);
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: "API route not found or failed to load" }));
        }
      } else {
        next();
      }
    });
  }
});

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  return {
    server: {
      host: true, // ✅ fix
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(), 
      mode === "development" && componentTagger(),
      mode === "development" && localApiProxy(),
    ].filter(Boolean) as any,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
  };
});