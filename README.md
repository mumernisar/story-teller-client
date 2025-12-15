# StoryFlow Frontend

React + TypeScript frontend for StoryFlow interactive story generation.

## Setup

### Prerequisites

- Node.js 18+ (or 16+)
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The frontend will be available at http://localhost:5173

### Build for Production

```bash
npm run build
```

## Features

- Create quick stories
- Load existing stories by ID
- Select from 11 emotions
- Toggle recap on/off
- Set optional seed for reproducibility
- View chapter history
- See ending vector visualization
- Generate story endings

## API Connection

The frontend connects to the backend at `http://localhost:8000`.
Make sure the backend is running before using the frontend.

## Tech Stack

- Vite
- React 18
- TypeScript
- CSS (no external frameworks)
