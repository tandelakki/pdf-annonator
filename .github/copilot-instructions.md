# Copilot Instructions for annoter Codebase

## Overview
This repository is a full-stack PDF annotation app:
- **backend/**: Node.js/Express REST API, MongoDB, handles authentication, PDF uploads, highlights, and serves static files.
- **frontend/**: React + Vite SPA, interacts with backend via HTTP API, provides PDF viewing and annotation UI.

## Backend Architecture
- **Entry Point**: `backend/server.js` sets up Express, connects to MongoDB, and wires up routes.
- **Routes**: 
  - `routes/auth.js`: User authentication (JWT, login/register logic)
  - `routes/pdfs.js`: PDF upload, retrieval, and static serving
  - `routes/highlights.js`: CRUD for PDF highlights
- **Models**: Mongoose schemas in `models/` for `User`, `Pdf`, and `Highlight`.
- **Middleware**: `middleware/auth.js` for authentication (JWT verification)
- **Uploads**: PDF files stored in `uploads/` (path configurable via `UPLOAD_DIR` env var)

## Frontend Architecture
- **Entry Point**: `frontend/src/main.jsx` sets up React Router and mounts the app.
- **Routing**: Uses React Router for `/login`, `/register`, `/dashboard`, `/view/:fileUuid`.
- **API Layer**: `frontend/src/services/api.js` wraps axios, sets base URL from `VITE_API_URL` env var, and manages JWT auth headers.
- **Components**:
  - `Dashboard.jsx`: Lists PDFs, supports upload, rename, delete.
  - `PdfViewer.jsx`: Renders PDFs, supports text selection and highlight saving.
  - `UploadForm.jsx`, `Login.jsx`, `Register.jsx`: Handle respective UI and API calls.
- **Styling**: Custom CSS in `src/styles.css` (uses `.card`, `.topbar`, `.container`, etc.), Tailwind is installed but not used in code.

## Developer Workflows
- **Start Backend**: `npm run dev` or `node server.js` (from `backend/`)
- **Start Frontend**: `npm run dev` (from `frontend/`)
- **Environment**: Backend needs `.env` with `MONGODB_URI`, optional `PORT` and `UPLOAD_DIR`. Frontend can use `.env` with `VITE_API_URL`.
- **MongoDB**: Expects a running MongoDB instance.
- **Static Files**: PDFs are served at `/uploads/<filename>`.

## Patterns & Conventions
- **API Prefixes**: All backend API routes are under `/api/`.
- **Frontend API Calls**: Use the `API` object from `services/api.js` for all HTTP requests.
- **JWT Auth**: Token stored in localStorage, set in axios headers for authenticated requests.
- **PDF Highlighting**: Highlights are saved as bounding boxes relative to page dimensions, sent to `/api/highlights/:fileUuid`.
- **Error Handling**: Errors are logged and shown via alerts in frontend, backend logs and exits on DB connection failure.
- **Component Structure**: Each major UI feature is a separate React component.

## Integration Points
- **Frontend/Backend**: Communicate via REST API endpoints, with JWT for protected routes.
- **External Dependencies**: Backend uses `express`, `mongoose`, `multer`, `jsonwebtoken`, etc. Frontend uses `react`, `react-pdf`, `axios`, `pdfjs-dist`.
- **PDF Rendering**: Frontend uses `react-pdf` and `pdfjs-dist` for PDF display and annotation.

## Example: Adding a New API Route
1. Backend: Create a new file in `routes/` (e.g., `notes.js`), export an Express router, import and `app.use('/api/notes', require('./routes/notes'))` in `server.js`.
2. Frontend: Add API calls in `services/api.js`, create a new React component, and add a route in `main.jsx` and/or `App.jsx`.

## Tips for AI Agents
- Always check for required environment variables in both backend and frontend.
- Use Mongoose models for DB access and follow existing route/middleware patterns for new backend features.
- Use the `API` object for all frontend HTTP requests and manage JWT via localStorage.
- Serve static files via Express as shown for `/uploads`.
- For PDF annotation, follow the highlight saving pattern in `PdfViewer.jsx`.

---
If any section is unclear or missing details, please provide feedback or specify which workflows/components need deeper documentation.
