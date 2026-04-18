# 🚀 Shivansh Portfolio — Unified CMS Matrix

A production-grade, fully autonomous **React + Vite portfolio** backed by a **Unified Matrix CMS** running on both **Vercel** and **Netlify**. This system features an environment-aware synchronization layer that manages local and cloud deployments with full audit logging.

---

## ✨ Advanced Features

| Feature | Description |
|---|---|
| 🗂 **Unified Matrix CMS** | A single, powerful dashboard to manage Portfolio sections and Project entries from a central interface. |
| 🛡️ **Audit Logging System** | Real-time tracking of every action (Fetch, Save, Delete) with a dedicated "Logs" tab for performance and security monitoring. |
| 🏠 **Local-First Sync** | Intelligently detects local development environments and saves directly to the filesystem, bypassing the network for zero-latency editing. |
| ☁️ **Cloud Commit Layer** | Production edits are committed directly to GitHub via the Octokit pipeline with SHA-collision protection. |
| 📐 **Dynamic Workspace** | Fully resizable and maximizable dashboard with persistent layouts stored in your local session. |
| 🚦 **Environment Awareness** | Automatically switches between Local and Cloud modes based on hostname detection, with a manual override toggle. |
| 🎭 **Aesthetic Engine** | Site-wide fluid text hover interactions and animated gradients, fully orchestrated via `portfolio.yaml`. |
| 🎬 **Auto-Scroll Reveal** | Global performance-optimized Intersection Observer system for directional text reveal animations. |
| 🧶 **Edge Rope Lights** | Premium viewport-framing animated lighting effect with theme-aware color shifting and glow. |

---

## 📁 Project Structure

```
📦 shivansh-ai-forge
┣ 📂 api/                          # Platform-agnostic serverless API routes
┃ ┣ 📜 cms-load.ts                 → Fetches YAML (Local FS or GitHub)
┃ ┣ 📜 cms-save.ts                 → Persists YAML (Filesystem rename or Git Commit)
┃ ┣ 📜 cms-history.ts              → Retrieves Git commit logs
┃ ┣ 📜 auth.ts                     → Role-based session management
┣ 📂 src/
┃ ┣ 📂 components/
┃ ┃ ┗ 📂 cms/                      → The Unified Admin Dashboard & Schema forms
┃ ┣ 📂 data/
┃ ┃ ┣ 📜 portfolio.yaml            → Core portfolio content
┃ ┃ ┗ 📜 projects.yaml             → Project entries
┃ ┣ 📂 context/
┃ ┃ ┗ 📜 CMSContext.tsx            → Central state: Environment, Mode, and Audit Logs
┃ ┣ 📂 lib/
┃ ┃ ┣ 📜 cms-core.ts               → The "Backend Core": Logic for safe file writes & Git sync
┃ ┃ ┗ 📜 logger.ts                 → Stateful Audit Logger with subscription support
```

---

## 🎨 Aesthetic & Interaction Control

The entire visual feel of the portfolio is managed via `src/data/portfolio.yaml` (Global Settings section).

### Text Hover Interaction
- `textHoverColors`: List of colors for hover state (supports animated gradients).
- `textTransitionSpeed`: Global enter/exit transition timing.
- `textAnimationSpeed`: Cycle speed for multi-color gradients.
- `textGlowIntensity`: Strength of the neon glow on hover.

### Edge Rope Lights
- `ropeLightColors`: Primary colors for the viewport frame lights.
- `ropeLightSpeed`: Speed of the light flow animation.
- `ropeLightThickness`: Thickness of the light strip.
- `ropeLightGlowIntensity`: Atmosphere glow intensity.

---

## ⚙️ Setup & Configuration

### 1. Environment Variables
Create a `.env` file in the project root with the following keys:

```bash
# === CMS & PRODUCTION AUTH ===
GITHUB_TOKEN=github_pat_...        # Required for production commits (GitHub Mode)
ADMIN_PASSWORD=your_password       # Master admin toggle for Unified Dashboard
EDITOR_PASSWORD=your_password      # Access to YAML content editing
BLOG_PASSWORD=your_password        # Access to Blog CMS
SECRET_PASSWORD=your_password      # Access to restricted resources

# === COMMUNICATIONS (EmailJS) ===
EMAILJS_SERVICE_ID=your_id         # Service ID from EmailJS dashboard
EMAILJS_TEMPLATE_ID=your_template  # Template ID for contact forms
EMAIL_API_KEY=your_public_key      # Public Key from EmailJS account
```

### 2. Local Development
Run the Vite development server. The CMS will automatically detect `localhost` and enable **Local Mode**.

```bash
npm run dev
```

### 3. Production Deployment (Vercel)
Ensure `GITHUB_TOKEN` is set in your Vercel project settings. The CMS will use **Cloud Mode** to commit changes directly to your repository.

---

## 🛠 Troubleshooting

### "Update Section" Not Persisting
- **Check Audit Logs**: Open the "Logs" tab in the CMS. It will show the exact failure (e.g., "Conflict Detected" or "Path Access Denied").
- **Local Mode**: Ensure you are running on `localhost:8080` (or your configured port). Writing to the local filesystem only works when the development server is active.
- **GitHub Mode**: Verify your `GITHUB_TOKEN` has `Contents: Read/Write` permissions for the repository.

### Hydration Mismatch Warnings
- The CMS uses a hydration-safe initialization pattern in `CMSContext.tsx`. If you see warnings, ensure you haven't manually modified state initialization outside of `useEffect`.

---

## 🔒 Security Posture
- **Path Isolation**: The CMS is strictly locked to `src/data/`. Any attempt to write outside this directory is blocked by the backend core.
- **Atomic Writes**: Local saves use a `.tmp` and `.bak` rotation logic to prevent data corruption during power loss or server resets.
- **SHA Verification**: Every GitHub commit verifies the latest SHA to prevent overwriting changes made by other team members.
