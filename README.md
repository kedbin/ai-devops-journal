# AI-Powered OCR Journaling Application 📝✨

      
**Status:** Day 3 - Image Capture & Client-Side Optimization Implemented 📸⚡


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

*   **Day 0 (2025-06-07):** Announced the project and #BuildingInPublic challenge on [LinkedIn](https://www.linkedin.com/posts/kedbin_devops-firebase-react-activity-7337235733562257408-_Unp?utm_source=share&utm_medium=member_desktop&rcm=ACoAADWdGnQB43otM8dW-BAKktayOd_uRPLEB7c)!
*   **Day 1 (2025-06-08):**
    *   Successfully set up the public GitHub monorepo.
    *   Initialized the frontend (React/Vite/TypeScript) and backend (Node.js/Express) project shells.
    *   Established the foundational monorepo directory structure (`frontend/`, `backend/`, `.github/workflows/`).
    *   Implemented the critical first security step: `.env.example` files for environment variable management and ensured `.env` is in `.gitignore`.
    *   Created a basic placeholder CI workflow in GitHub Actions (`.github/workflows/ci.yml`) to verify pipeline functionality.
    *   Updated this README to reflect the project's vision and current status.
    *   [LinkedIn Day 1 Post](https://www.linkedin.com/posts/kedbin_aidevops-devsecops-aidevops-activity-7337573588096512001-lflS?utm_source=share&utm_medium=member_desktop&rcm=ACoAADWdGnQB43otM8dW-BAKktayOd_uRPLEB7c)
*   **Day 2 (2025-06-09):**
    *   Implemented the full end-to-end authentication flow using **Firebase Authentication (Google Sign-In)**.
    *   Built a secure backend "gatekeeper" middleware to validate Firebase ID tokens on protected API routes.
    *   Created a React UI to manage login/logout state and test the secure endpoint.
    *   Introduced **Docker Compose** to manage the multi-container (frontend, backend) local development environment, simplifying setup and ensuring consistent networking.
    *   Debugged and resolved **CORS** and Docker networking issues, establishing a robust local development workflow.
    *   [LinkedIn Day 2 Post](https://www.linkedin.com/posts/kedbin_aidevops-devsecops-docker-activity-7338063201248391168-rPrL?utm_source=share&utm_medium=member_desktop&rcm=ACoAADWdGnQB43otM8dW-BAKktayOd_uRPLEB7c)
*   **Day 3 ([TODAY'S DATE]):**
    *   Implemented the core image capture feature using the `react-webcam` library on the frontend.
    *   Created a new secure backend endpoint (`/api/v1/process`) to receive the image data for future processing.
    *   **SRE/DevOps Focus:** Implemented **client-side image optimization** before uploading. The captured image is resized and compressed using an HTML canvas, drastically reducing the payload size to improve performance and lower future cloud costs.
    *   Resolved a `413 Payload Too Large` error by correctly configuring the Express.js middleware body size limits, a key infrastructure-level fix.
*   **Day 4 (Planned):** Integrate **Azure AI Vision (OCR)** service on the backend to process the received image and extract handwritten text.
*   *(...more days will be added here as the project progresses...)*
## Architecture Diagram
*(Coming Soon - A visual representation of the system components and data flow will be added here.)*

## CI/CD Pipeline
*(Coming Soon - Details of the automated build, test, and deployment pipeline using GitHub Actions will be documented here.)*

## Getting Started / How to Run (Locally)
This project uses Docker and Docker Compose to streamline the local development setup.

### Prerequisites
*   [Docker](https://docs.docker.com/get-docker/) installed and running on your machine.
*   [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) for cloning the repository.
*   A Google account for testing the authentication flow.

### Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/kedbin/ai-devops-journal.git
    cd ai-devops-journal
    ```

2.  **Set up Backend Environment Variables:**
    *   Navigate to the Firebase Console, create a project, and enable Google Authentication.
    *   Go to **Project settings > Service accounts** and click **"Generate new private key"**.
    *   Rename the downloaded file to `service-account-key.json` and place it inside the `backend/` directory.
    *   **This file is crucial and is correctly ignored by `.gitignore`.**

3.  **Set up Frontend Environment Variables:**
    *   In the Firebase Console, go to **Project settings > General**.
    *   Under "Your apps", register a new Web app.
    *   Create a file named `.env` inside the `frontend/` directory (`frontend/.env`).
    *   Copy the `firebaseConfig` values from the Firebase Console into your `frontend/.env` file. Use the `frontend/.env.example` file as a template. The `VITE_BACKEND_API_URL` should be `http://localhost:8081/api/v1` for the Docker Compose setup.

4.  **Build and Run with Docker Compose:**
    *   From the root directory of the project (where `docker-compose.yml` is located), run the following command:
    ```bash
    docker-compose up --build
    ```
    *   This will build the Docker images for both the frontend and backend, install their dependencies, and start the services.

5.  **Access the Application:**
    *   **Frontend:** Open your browser and navigate to `http://localhost:8080`.
    *   **Backend Health Check:** You can check if the backend is running by visiting `http://localhost:8081/api/v1/health`.

### Stopping the Application
To stop the services, press `Ctrl+C` in the terminal where Docker Compose is running. To remove the containers, you can run `docker-compose down`.*(Coming Soon - Instructions for cloning, setting up environment variables, and running the project locally will be provided here.)*

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---