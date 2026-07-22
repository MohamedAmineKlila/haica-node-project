# HAICA Internship Project

> A full-stack web application developed during an internship at **HAICA (Haute Autorité Indépendante de la Communication Audiovisuelle)**, featuring a secure REST API backend built with Node.js and Fastify, and a modern Vue 3 frontend with role-based access control.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Internship Context](#internship-context)

---

## About the Project

This application was built to support internal management operations at HAICA. It provides a secure, role-based interface for managing users and system data, with a clean Vue 3 frontend consuming a Fastify-powered REST API backed by a MySQL database.

The project follows a modern full-stack architecture with clear separation between the frontend and backend layers, JWT-based authentication, and a role-based access control system.

---

## Features

- **JWT Authentication** — Secure login and session management using JSON Web Tokens
- **User Management** — Create, update, and delete user accounts
- **Role-Based Access Control** — Different permissions for different user roles
- **RESTful API** — Clean and structured API endpoints built with Fastify
- **Vue 3 Frontend** — Reactive and responsive user interface
- **MySQL Integration** — Persistent data storage with relational database
- **Demo & Docs** — Includes documentation and demo assets

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Fastify | High-performance web framework |
| MySQL | Relational database |
| JWT | Authentication & authorization |
| TypeScript | Type-safe backend code |

### Frontend
| Technology | Purpose |
|---|---|
| Vue 3 | Progressive JavaScript framework |
| TypeScript | Type-safe frontend code |
| CSS | Styling and layout |
| HTML | Markup |

---

## Project Structure

```
haica-node-project/
├── backend/                # Node.js + Fastify REST API
│   ├── src/
│   │   ├── routes/         # API route definitions
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Database models
│   │   └── middleware/     # Auth & role guards
│   └── package.json
├── frontend/               # Vue 3 client application
│   ├── src/
│   │   ├── views/          # Page components
│   │   ├── components/     # Reusable UI components
│   │   ├── router/         # Vue Router config
│   │   └── stores/         # State management
│   └── package.json
├── docs/                   # Project documentation
├── demo/                   # Demo screenshots and assets
├── run.bat                 # Windows one-click launcher
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- MySQL (or XAMPP)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MohamedAmineKlila/haica-node-project.git
   cd haica-node-project
   ```

2. Set up the database — create a MySQL database and import the schema from `docs/`.

3. Configure backend environment variables:
   ```bash
   cd backend
   cp .env.example .env
   # Fill in your DB credentials and JWT secret
   ```

### Running the Application

**Option A — One click (Windows):**
```bash
run.bat
```

**Option B — Manual:**

Start the backend:
```bash
cd backend
npm install
npm run dev
```

Start the frontend (new terminal):
```bash
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## Usage

1. Open the app and **log in** with your credentials
2. Depending on your **role**, you'll have access to different modules
3. Admins can manage users, roles, and system settings
4. All actions are protected by JWT and role-based guards

---

## Internship Context

This project was developed during an internship at **HAICA — Haute Autorité Indépendante de la Communication Audiovisuelle**, the independent regulatory authority for audiovisual communication in Tunisia.

**Role:** Full-Stack Developer Intern
**Duration:** Summer 2026
**Organization:** HAICA, Tunisia

### Skills Gained
- Fastify framework and plugin architecture
- Vue 3 Composition API
- JWT authentication flow
- Role-based access control design
- REST API development and testing
- MySQL schema design
- Full-stack integration

---

## License

This project is licensed under the Apache License 2.0 — see the [LICENSE](LICENSE) file for details.
