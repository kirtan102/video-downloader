# Video Downloader 🚀

A modern, fast, and responsive video downloader web application. It features a React-based frontend powered by Tailwind CSS and Lucide icons, backed by a Node.js/Express API that utilizes `yt-dlp` to extract metadata and stream downloads.

---

## 🏗️ Architecture

The project is structured as a monorepo-style workspace with separate directories for the frontend and backend:

*   **[frontend](file:///c:/VS%20Code/Development/test/video-downloader/frontend/)**: A React SPA built with Vite, styled using Tailwind CSS (v4) and Lucide React icons.
*   **[backend](file:///c:/VS%20Code/Development/test/video-downloader/backend/)**: A Node.js/Express server that runs `yt-dlp` as a subprocess to extract info and download media streams.

---

## 🛠️ Prerequisites

Before running the application, ensure you have the following installed on your system:

1.  **Node.js** (v18 or higher recommended)
2.  **yt-dlp**: Must be installed and available in your system's `PATH`.
    *   *Windows (Scoop)*: `scoop install yt-dlp`
    *   *Windows (winget)*: `winget install yt-dlp`
    *   *macOS (Homebrew)*: `brew install yt-dlp`
3.  **FFmpeg**: Required by `yt-dlp` for merging high-quality video and audio formats.
    *   *Windows (Scoop)*: `scoop install ffmpeg`
    *   *Windows (winget)*: `winget install Gnu.FFmpeg`
    *   *macOS (Homebrew)*: `brew install ffmpeg`

---

## 🚀 Getting Started

Follow these steps to set up and run the application locally:

### 1. Run the Backend

Navigate to the `backend` directory, install dependencies, and start the development server:

```bash
cd backend
npm install
npm run dev
```

The backend server will start running at `http://localhost:5000` (or the port specified in your environment configuration).

### 2. Run the Frontend

In a new terminal window, navigate to the `frontend` directory, install dependencies, and start the Vite dev server:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed in the console (usually `http://localhost:5173`) in your browser.

---

## 🔌 API Endpoints (Backend)

The backend provides the following REST API endpoints:

### 1. Extract Video Info
*   **Endpoint**: `POST /api/video/extract`
*   **Content-Type**: `application/json`
*   **Request Body**:
    ```json
    {
      "url": "https://www.youtube.com/watch?v=..."
    }
    ```
*   **Response**: Returns video title, thumbnail, duration, channel, and a list of available download formats (resolution, extension, size, etc.).

### 2. Download Video Stream
*   **Endpoint**: `GET /api/video/download`
*   **Query Parameters**:
    *   `url`: The video URL.
    *   `formatId`: The chosen format ID.
*   **Response**: Streams the downloaded file directly to the client as a download attachment, automatically cleaning up temporary files on the backend afterward.

---

## ✨ Features

*   **Resolution Selection**: Allows users to select their preferred video/audio format and quality.
*   **On-the-fly Streaming**: Downloads and merges streams on the backend, then streams them directly to the user's browser.
*   **Auto Cleanup**: Automatically deletes temporary download files from the backend storage once streamed or if the client disconnects.
*   **User Friendly UI**: Responsive, modern user interface with clear layout and loading indicator animations.
