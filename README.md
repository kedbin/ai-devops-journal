# AI-Powered OCR Journaling Application 📝✨

**Status:** Day 1 - Foundation Laid & Scaffolding Complete 🚀

Welcome! This is a 2-week sprint project focused on building a secure, AI-enhanced Progressive Web App (PWA) for journaling. More importantly, this project aims to showcase and train skills in **AI DevOps**, emphasizing **Shift Left** principles (Security, Testing, Observability from the start) and a robust **CI/CD Pipeline**.

## Project Overview

### Purpose
A secure Progressive Web App (PWA) where only you (authenticated via Google) can:
*   Open the camera (rear-facing).
*   Take high-quality pictures of handwritten notes (cursive).
*   Send them to your backend for OCR.
*   Create PDFs and Markdown files for personal storage.
*   Optionally, automatically publish entries to a HUGO CMS blog with search capabilities.

### Why This Project?
Journaling on paper is a joy, especially for those who appreciate the tactile feel of pen and paper. However, as journals accumulate, searching for specific subjects becomes a daunting task. This application aims to bridge that gap by digitizing handwritten notes, making them searchable, linkable, and easily accessible.

### 🔄 Core Application Flow
1.  **User visits app (PWA)** → Can be installed on mobile or used via browser.
2.  **User signs in via Google (Firebase Auth)** → Only authenticated users can proceed.
3.  **Camera opens (rear-facing by default)** → Or optionally choose image from gallery.
4.  **User captures picture** → High-res image drawn to canvas → base64 image string.
5.  **App sends image to backend (via secure POST)** → With Firebase token included.
6.  **Backend validates token, stores image, runs OCR via Microsoft Azure Vision AI.**
7.  **Backend calls Google LLM to clean up the OCR text while retaining meaning.**
8.  **Backend generates a PDF and Markdown file** for user storage.
9.  **User has an option to publish to a HUGO CMS.**
10. **Backend calls Google LLM to automatically create a title, date, and tags.**
11. **User gets a preview and, if approved, publishes to the HUGO CMS.**

## Key Goals for this 2-Week Sprint
*   Deliver a functional Minimum Viable Product (MVP) demonstrating the core flow.
*   Integrate AI for OCR (Azure AI Vision) and text enhancement/metadata generation (Google Gemini).
*   Implement "Shift Left" DevOps principles:
    *   **Security:** Baked in from the start (authentication, secret management).
    *   **Testing:** Unit tests and automated checks.
    *   **Observability:** Structured logging.
*   Establish a robust CI/CD pipeline using GitHub Actions for automated builds, tests, and deployments.
*   Showcase all work publicly via GitHub and LinkedIn updates.

## Tech Stack
*   **Frontend:** React (with Vite & TypeScript), PWA features, Firebase SDK for Auth.
*   **Backend:** Node.js (with Express.js).
*   **Authentication:** Firebase Authentication (Google Sign-In).
*   **OCR:** Microsoft Azure AI Vision (Read API).
*   **LLM:** Google Gemini API.
*   **Storage:** Google Cloud Storage (for images, PDFs, Markdown).
*   **DevOps & CI/CD:** GitHub Actions, Docker.
*   **Deployment:** Vercel (Frontend), Render (Backend).

## Current Progress & Project Journal (Building in Public)

*   **Day 0 (YYYY-MM-DD):** Announced the project and #BuildingInPublic challenge on LinkedIn! [Link to your LinkedIn post for Day 0]
*   **Day 1 ([TODAY'S DATE]):**
    *   Successfully set up the public GitHub monorepo.
    *   Initialized the frontend (React/Vite/TypeScript) and backend (Node.js/Express) project shells.
    *   Established the foundational monorepo directory structure (`frontend/`, `backend/`, `.github/workflows/`).
    *   Implemented the critical first security step: `.env.example` files for environment variable management and ensured `.env` is in `.gitignore`.
    *   Created a basic placeholder CI workflow in GitHub Actions (`.github/workflows/ci.yml`) to verify pipeline functionality.
    *   Updated this README to reflect the project's vision and current status.
    *   [Link to your LinkedIn post for Day 1]
*   **Day 2 (Planned):** Implement Google Authentication (Firebase) on the frontend and secure backend API endpoints.
*   *(...more days will be added here as the project progresses...)*

## Architecture Diagram
*(Coming Soon - A visual representation of the system components and data flow will be added here.)*

## CI/CD Pipeline
*(Coming Soon - Details of the automated build, test, and deployment pipeline using GitHub Actions will be documented here.)*

## Getting Started / How to Run (Locally)
*(Coming Soon - Instructions for cloning, setting up environment variables, and running the project locally will be provided here.)*

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---