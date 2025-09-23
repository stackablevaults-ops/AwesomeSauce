# AwesomeSauce: AI Agent Training Hub

## Overview

AwesomeSauce is a comprehensive platform for monitoring, training, and managing AI agents. It features a React + Vite frontend and an Express + TypeScript backend, supporting multiple AI providers including Kolossus and OpenAI. Users can create tasks, monitor agent performance, manage training scenarios, and access an AI marketplace for specialized agents.

## Features
- Agent management and monitoring
- Training scenario management
- AI marketplace for agent deployment
- Real-time dashboard updates (WebSocket)
- RESTful API backend

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Wouter
- **Backend:** Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL, WebSocket
- **Shared:** Types and schema via Drizzle ORM

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the backend server:
   ```bash
   npm run dev
   ```
3. Start the frontend dev server:
   ```bash
   npm run build && npm run start
   ```

## Project Structure
- `client/` - Frontend React app
- `server/` - Backend Express API
- `shared/` - Shared types and schema

## Contributing
Pull requests and issues are welcome!

## License
MIT
