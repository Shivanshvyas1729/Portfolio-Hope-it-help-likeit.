import type { ViteDevServer } from 'vite';

// In standard Vercel serverless functions, we use standard request/response
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { type, username, password } = req.body;

  // Type can be 'blog', 'secret', or 'admin'
  let role = null;

  if (type === 'admin') {
    if (process.env.ADMIN_USERNAME) {
      if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        role = 'admin';
      }
    } else {
      if (password === process.env.ADMIN_PASSWORD) {
        role = 'admin';
      }
    }
  } else if (type === 'blog') {
    if (password === process.env.BLOG_PASSWORD || password === process.env.ADMIN_PASSWORD) {
      role = 'blog';
    }
  } else if (type === 'editor') {
    if (password === process.env.EDITOR_PASSWORD || password === process.env.ADMIN_PASSWORD) {
      role = 'editor';
    }
  } else if (type === 'secret') {
    if (password === process.env.SECRET_PASSWORD || password === process.env.ADMIN_PASSWORD) {
      role = 'secret';
    }
  }

  if (role) {
    // Generate a simple token (a basic base64 encoded JSON for this simple usecase, 
    // ideally signed with a standard JWT in heavy production, 
    // but the actual protection is in the frontend gate keeping)
    const token = Buffer.from(JSON.stringify({ role, exp: Date.now() + 86400000 })).toString('base64');
    
    return res.status(200).json({ success: true, role, token });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
}
