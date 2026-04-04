import { portfolioData } from "@/data/portfolioData";
import { logger } from "@/utils/logger";

// ============================================================
// CONFIGURATION
// Set VITE_API_CHAT_URL in your .env to enable backend AI.
// Leave it unset (or empty) to use the local mock AI.
//
// Example .env:
//   VITE_API_CHAT_URL=/api/chat
//
// Your backend /api/chat must accept:
//   POST { message: string }
// And return:
//   { response: string }
//
// API keys (Gemini, OpenAI, etc.) live ONLY on the backend.
// ============================================================

// ============================================================
// CONTEXT BUILDER (sent to backend as system context)
// ============================================================
export const buildPortfolioContext = (): string => {
  const d = portfolioData;

  const projects = (d.projects || [])
    .map(p => `  - ${p.title}: ${p.description} [Tech: ${p.tech?.join(", ")}]${p.live && p.live !== "#" ? ` [Live: ${p.live}]` : ""}`)
    .join("\n");

  const skills = (d.skills?.categories || [])
    .map(c => `  ${c.title}: ${c.items.join(", ")}`)
    .join("\n");

  const experience = (d.experience || [])
    .map(e => `  ${e.title} @ ${e.company} (${e.duration}): ${e.description}`)
    .join("\n");

  const education = (d.education || [])
    .map(e => `  ${e.degree} — ${e.institution} (${e.year})`)
    .join("\n");

  return `
PORTFOLIO OWNER: ${d.personal?.name} | ${d.personal?.title}
LOCATION: ${d.personal?.location}
EMAIL: ${d.personal?.email}

PROJECTS:
${projects}

SKILLS:
${skills}

EXPERIENCE:
${experience}

EDUCATION:
${education}

ABOUT:
${d.about?.description}
`.trim();
};

// ============================================================
// BACKEND CALL  →  POST directly to Google Gemini
// Returns null if the backend is unavailable or errors out.
// ============================================================
const callBackend = async (message: string): Promise<string | null> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn('ChatService', 'No Gemini API key found in VITE_GEMINI_API_KEY. Skipping to fallback API.');
    return null;
  }

  try {
    logger.info('ChatService', 'Initiating call to Gemini API...');
    const fullMessage = `System Context:\n${buildPortfolioContext()}\n\nUser: ${message}`;
    
    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullMessage }] }]
      }),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!res.ok) {
      logger.error('ChatService', `Gemini returned HTTP ${res.status}. Falling back to mock AI.`);
      return null;
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof text !== "string") {
      logger.error('ChatService', "Unexpected Gemini response shape. Could not parse candidates array.", data);
      return null;
    }

    logger.info('ChatService', 'Successfully received response from Gemini API.');
    return text;
  } catch (err) {
    logger.error('ChatService', "Gemini unreachable (timeout or network error). Falling back to mock AI.", err);
    return null;
  }
};

// ============================================================
// MOCK AI  (active when backend is not configured or fails)
// ============================================================
const mockAI = async (message: string): Promise<string> => {
  await new Promise(r => setTimeout(r, 500 + Math.random() * 600));

  const d = portfolioData;
  const msg = message.toLowerCase();

  // ===============================
  // NAME
  // ===============================
  if (msg.match(/your name|who are you|name/)) {
    return `My name is **${d.personal?.name}**.`;
  }

  // ===============================
  // LOCATION
  // ===============================
  if (msg.match(/where.*live|location|from/)) {
    return `I am based in **${d.personal?.location}**.`;
  }

  // ===============================
  // SPECIFIC PROJECT
  // ===============================
  const project = (d.projects || []).find(p =>
    msg.includes(p.title.toLowerCase())
  );

  if (project) {
    return `**${project.title}**

${project.description}

Tech: ${project.tech?.join(", ")}${
      project.live && project.live !== "#"
        ? `

🔗 [Live Demo](${project.live})`
        : ""
    }`;
  }

  // ===============================
  // PROJECT LIST (WITH LIVE LINKS ✅)
  // ===============================
  if (msg.match(/project|work|built|show/)) {
    const list = (d.projects || []).map(p =>
      `• **${p.title}** — ${p.description}${
        p.live && p.live !== "#"
          ? ` → 🔗 [Live Demo](${p.live})`
          : ""
      }`
    ).join("\n");

    return `Here are my projects:

${list}`;
  }

  // ===============================
  // SKILLS
  // ===============================
  if (msg.match(/skill|tech|stack|language/)) {
    const list = (d.skills?.categories || [])
      .map(c => `• ${c.title}: ${c.items.join(", ")}`)
      .join("\n");

    return `My skills:

${list}`;
  }

  // ===============================
  // EXPERIENCE
  // ===============================
  if (msg.match(/experience|intern|job/)) {
    const list = (d.experience || [])
      .map(e => `• ${e.title} at ${e.company} (${e.duration})`)
      .join("\n");

    return `My experience:

${list}`;
  }

  // ===============================
  // EDUCATION
  // ===============================
  if (msg.match(/education|college|degree/)) {
    const list = (d.education || [])
      .map(e => `• ${e.degree} — ${e.institution}`)
      .join("\n");

    return `My education:

${list}`;
  }

  // ===============================
  // CONTACT
  // ===============================
  if (msg.match(/contact|email|hire/)) {
    return `📧 Email: ${d.personal?.email}
🔗 LinkedIn: ${d.personal?.linkedin}`;
  }

  // ===============================
  // GREETING
  // ===============================
  if (msg.match(/hi|hello|hey/)) {
    return `Hi! I'm ${d.personal?.name}'s AI assistant 🤖

You can ask:
• "What is your name?"
• "Show your projects"
• "Tell me about your skills"
• "How can I contact you?"`;
  }

  // ===============================
  // DEFAULT (FIXED SUGGESTIONS ✅)
  // ===============================
  return `I can help you with:

• 👤 Personal info (name, location)
• 📂 Projects (with live demos)
• 🧠 Skills & tech stack
• 💼 Experience
• 🎓 Education
• 📧 Contact info

Try asking:
👉 "👤 Personal info (name, location)"
👉 "Show your projects"
👉 "Tell me about your skills" 🚀`;
};

// ============================================================
// MAIN ENTRY POINT  ← UI calls only this, nothing else changes
// Priority: Backend API → Fallback to Mock AI
// ============================================================
export const getChatResponse = async (message: string): Promise<string> => {
  const backendResponse = await callBackend(message);
  if (backendResponse !== null) return backendResponse;
  return mockAI(message);
};
