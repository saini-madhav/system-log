# System Log Project

A full-stack application for managing and viewing system logs with a React frontend and Node.js/Express backend.

## Project Structure

```
├── backend/              # Node.js/Express server
│   ├── src/
│   │   ├── App.ts        # Main application file
│   │   ├── router.ts     # Route definitions
│   │   ├── controller/   # Request controllers
│   │   ├── features/     # Business logic
│   │   ├── routes/       # API routes
│   │   └── utils/        # Utility functions
│   ├── logs/             # Log files
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/             # React application
    └── algoza-frontend/
        ├── src/
        │   ├── components/  # React components
        │   ├── services/    # API services
        │   ├── interface/   # TypeScript interfaces
        │   ├── App.tsx
        │   └── main.tsx
        ├── package.json
        ├── vite.config.ts
        └── tsconfig.json
```

## Prerequisites

- Node.js (v22 or higher)
- npm or yarn package manager

## Backend Setup

### Installation

Navigate to the backend directory:

```bash
cd backend
npm install
```

### Configuration

The backend uses TypeScript. Make sure you have the required dependencies installed.

### Running the Backend

To start the development server:

```bash
npm run dev
```

To build the project:

```bash
npm run build
```

## Frontend Setup

### Installation

Navigate to the frontend directory:

```bash
cd frontend/algoza-frontend
npm install
```

### Configuration

The frontend is built with Vite and React. Bootstrap and React Bootstrap are included for UI components.

### Running the Frontend

To start the development server:

```bash
npm run dev
```

To build for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Full Project Setup (From Root)

### 1. Clone or Extract the Project

```bash
cd assisment
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 3. Install Frontend Dependencies

```bash
cd frontend/algoza-frontend
npm install
cd ../..
```

### 4. Start Both Servers

In separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend/algoza-frontend
npm run dev
```

The application will be available at `http://localhost:5173` (frontend) and the backend API will run on a configured port (typically `http://localhost:3000`).

## Features

- View system logs
- System monitoring capabilities
- RESTful API backend
- React-based responsive UI
- TypeScript for type safety

## Technologies Used

### Backend
- Node.js
- Express.js
- TypeScript

### Frontend
- React
- TypeScript
- Vite
- React Bootstrap
- Bootstrap

## Gitignore

The following are excluded from version control:
- `node_modules/`
- Build artifacts
- Log files

## Project Status

Active Development
