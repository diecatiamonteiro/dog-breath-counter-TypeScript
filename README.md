# Pet Breath Counter

A web application to count and monitor pet breathing rates, built with TypeScript, Next.js, and Express.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [App Overview](#app-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Development Notes](#development-notes)
- [Testing Strategy](#testing-strategy)
- [CI/CD Pipeline](#ci-cd-pipeline)
- [Author](#author)

## Tech Stack

### Frontend

- Next.js 15.3
- React 19
- TypeScript
- TailwindCSS
- React-Toastify
- Google OAuth

### Backend

- Express
- MongoDB with Mongoose
- TypeScript
- JWT Authentication
- Bcrypt

## Features

- Count and log pet breathing rates manually
- View historical breathing data
- Authenticate with Google OAuth
- Responsive design with dark mode
- JWT-based authentication (backend)

## App Overview

| Home Page                                   | Breathing Monitor                                        |
| ------------------------------------------- | -------------------------------------------------------- |
| ![Home](client/public/screenshots/home.png) | ![Monitor](client/public/screenshots/breath-monitor.png) |

## Project Structure

pet-breath-counter-typescript/  
├── **client**/ # Next.js frontend  
│ ├── src/  
│ │ ├── app/ # Next.js app router  
│ │ │ ├── globals.css # Global styles  
│ │ │ ├── layout.tsx # Root layout  
│ │ │ └── page.tsx # Home page  
│ │ └── components/ # React components  
│ ├── public/ # Static assets  
│ ├── postcss.config.js # PostCSS configuration  
│ ├── tailwind.config.js # Tailwind configuration  
│ └── tsconfig.json # TypeScript configuration  
├── **server**/ # Express backend  
│ ├── src/  
│ │ ├── controllers/ # Route controllers  
│ │ ├── models/ # MongoDB models  
│ │ ├── routes/ # API routes  
│ │ └── index.ts # Entry point  
│ └── tsconfig.json # TypeScript configuration  
├── .gitignore # Git ignore rules  
├── package.json # Root workspace configuration  
└── README.md # Project documentation

## Development Notes

### Current Setup

- Monorepo structure using npm workspaces
- TypeScript configuration for both client and server
- TailwindCSS setup with dark mode support
- Basic Express server configuration
- Environment configuration

### TODO

- [ ] Set up MongoDB connection
- [ ] Implement authentication system
- [ ] Create user model
- [ ] Set up testing environment
- [ ] Configure CI/CD pipeline
- [ ] Add API documentation
- [ ] Implement error handling
- [ ] Add logging system

## Testing Strategy

- **Frontend**: Unit tests for components and logic using Vitest + React Testing Library
- **Backend**: Unit and integration tests with Vitest + Supertest (to be decided)
- **E2E**: To be decided (possibly Cypress)
- **CI**: All tests run on pull requests via GitHub Actions

## CI/CD Pipeline

Planned steps:

1. Code linting
2. Type checking
3. Unit tests
4. Integration tests
5. Build process
6. Deployment

## Getting Started

1. Clone the repository
2. From the root directory, install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` files:

   For client:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

   For server:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

4. From the root directory, run the development servers (one single command for both frontend and backend):

   ```bash
   npm run dev
   ```

   This will start:

   - Frontend on http://localhost:3000
   - Backend on http://localhost:5000

## Available Scripts

- Run both frontend and backend: `npm run dev`

- Run frontend only: `npm run client`

- Run backend only: `npm run server`

- Run tests: `npm run test`

## Author

Built with ❤️ by [Cátia Monteiro](https://github.com/diecatiamonteiro)
