# Pet Breath Counter

A web application to count and monitor pet breathing rates, built with TypeScript, Next.js, and Express.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [App Overview](#app-overview)
- [User Stories](#user-stories)
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

## User Stories

- As a user, I want to scroll through the homepage and see the app's purpose and learn more about breathing rate monitoring.
- As a user, I want to be able to create an account and login.
- As a user, I want to be redirected to My Dogs page after logging in.
- As a user, I want to be able to view my dog(s) in **My Dogs** page.
- As a user, I want to be able to click on the + icon and add a new dog in the **My Dogs** page. From here, user is redirected to **Add Dog** page, where they can add their dog's data. After this, user saves new dog and is redirected back to the **My Dogs** page. Dog's data:
  - Photo
  - Name
  - Breed
  - Age
  - Gender
  - Veterinarian's data (name, clinic name, phone number, email and address)
  - Maximum breathing rate (30 BPM, breaths per minute, is the default value)
- As a user, I want to be able to click on a dog's card on **My Dogs** page and be redirected to the **Dog Profile** page.
- As a user, I want to see the dog's breathing data on the **Dog Profile** page:
  - **Name**
  - **Photo**
  - **Resting respiratory rate**:
    - Maximum breath rate, eg 30 BPM - the one set by the user under the **Add Dog** page
    - Average breath rate, eg 28 BPM - the average of all the breaths logged by the user
  - **Veterinarian** (if a veterinarian was added under the **Add Dog** page, display the veterinarian's data; if not, display a button to add a veterinarian and user is redirected to the **Add Dog** page)
  - **Share data**: The date range selected in the **Breathing Logs** section is the one being shared here.
    - Display a button to share the data via email. When clicked, an email modal is displayed with name of the dog, graph and list of logs as body of the email.
    - Display a button to download the data as a PDF file. When clicked, a PDF file is downloaded with name of the dog, graph and list of logs.
  - **Breathing Logs**: User has the option to select a date range to display the data on the graph and the list of logs: modal with options 'Last 7' logs, 'Last 15' logs, 'Last 30' logs or 'All logs'. This selection is the one being sent by email or downloaded as a PDF file.
    - Show a graph with the breathing rate history of the dog.
    - Show a list of all the logs, with the date, time and breathing rate. Each log has a button to delete the log.
- As a user, I want to click on button 'Add Breathing Rate' at the bottom of the **Dog Profile** page and be redirected to the **Breathing Monitor** page.
- As a user, I want to be able to select a length measurement on the **Breathing Monitor** page: modal with options 15 Seconds, 30 Seconds, 60 Seconds.
- As a user, I want to be able to log a breathing rate manually on the **Breathing Monitor** page, by tapping on the heart icon; one breath is logged per tap. The seconds are decreasing as the user taps, and the the Breath Count is increasing on every tap.
- As a user, I can activate the sound of the heart beat by clicking on the sound icon on the top right corner of the **Breathing Monitor** page.
- As a user, I can see a modal with the Breath Count, the Seconds and the BPM, as well as a field to enter a comment:
  - When confirmed, the log is saved and the user is redirected back to the **Breathing Monitor** page.
  - When cancelled, the log is not saved and the user is redirected back to the **Breathing Monitor** page.
- As a user, I can stop the log by clicking on the left arrow icon on the top left corner of the **Breathing Monitor** page. This will take the user back to the **Dog Profile** page.
- As a user, I am redirected to a **Not Found** page when I try to access a page that does not exist.

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
│ │ ├── config/ # Configuration  
│ │ │ ├── tests/ # Configuration tests  
│ │ ├── controllers/ # Route controllers  
│ │ │ ├── tests/ # Controller tests  
│ │ ├── middleware/ # Middleware  
│ │ │ ├── tests/ # Middleware tests  
│ │ ├── models/ # MongoDB models  
│ │ │ ├── tests/ # Model tests  
│ │ ├── routes/ # API routes  
│ │ │ ├── tests/ # Route tests  
│ │ ├── seeds/ # Seed data  
│ │ │ ├── tests/ # Seed tests  
│ │ ├── types/ # TypeScript types  
│ │ └── index.ts # Entry point  
│ ├── .env-example # Environment variables example  
│ ├── package-lock.json # Dependency lock file  
│ ├── package.json # Server package configuration  
│ ├── tsconfig.json # TypeScript configuration  
│ └── vitest.config.ts # Vitest configuration  
├── .gitignore # Git ignore rules  
├── package-lock.json # Dependency lock file  
├── package.json # Root workspace configuration  
└── README.md # Project documentation

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

## Author

Built with ❤️ by [Cátia Monteiro](https://github.com/diecatiamonteiro)
