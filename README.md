# 🚀 AI Portfolio Project

Welcome to My **AI & Data Science Portfolio Project**
This project is fully **YAML-driven**, allowing you to manage and update all content from a single file.

---

## 📁 Getting Started

### Option 1: Clone the Repository

```bash
git clone https://github.com/Shivanshvyas1729/Portfolio-Hope-it-help-likeit..git
cd Portfolio-Hope-it-help-likeit..
```

### Option 2: Download ZIP

* Click **Download ZIP** from GitHub
* Extract the folder on your system

---

## ⚙️ Setup & Run Locally

1. Open terminal inside the project folder

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

---

## ✏️ Edit Your Portfolio

All portfolio content is controlled from:

```bash
src/data/portfolio.yaml
```

Update this file to modify:

* Personal information
* Projects
* Skills
* Services
* Contact details

No need to edit other files.

---

## 🌐 Deployment (Netlify)

This project is pre-configured for Netlify.

### Steps:

1. Go to Netlify
2. Import your repository
3. Set the publish directory:

```bash
dist
```

4. Deploy the project

---

## 🔑 API Configuration (EmailJS Setup)

To enable the **contact form**, integrate EmailJS.

---

### 1️⃣ Create EmailJS Account

* Sign up on EmailJS

---

### 2️⃣ Create Email Service

* Go to **Email Services**
* Click **Add New Service**
* Select **Gmail**
* Connect your account
* Create the service

---

### 3️⃣ Create Email Template

* Go to **Email Templates**
* Click **Create New Template**
* Use **Design Editor**
* Add fields:

  * Name
  * Email
  * Message
* Save the template

---

### 4️⃣ Add Credentials

Copy the following from your EmailJS dashboard:

* Public Key
* Service ID
* Template ID

Add them to:

```yaml
src/data/portfolio.yaml
```

Example:

```yaml
emailjs:
  serviceId: "your_service_id"
  templateId: "your_template_id"
  publicKey: "your_public_key"
```

---

## 🤖 Future Updates

* Gemini API integration will be added
* Star the repository to stay updated

---

## 💡 Note

Keep your portfolio updated with your latest projects, skills, and achievements.

---

🔥 Built for developers, students, and AI enthusiasts.
