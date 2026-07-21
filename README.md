# ALUMNET

> A role-based alumni–student engagement platform for mentorship, professional networking, and university events.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**[Open the live ALUMNET application](https://alumnetconnect.vercel.app/)** · [View the project website](https://cepdnaclk.github.io/e23-co2060-Alumnet/)

> **Note:** The GitHub Pages link is the project documentation website. The Vercel link above opens the actual ALUMNET web application.

## Overview

Universities often rely on disconnected email lists, social media groups, and personal contacts to engage alumni. ALUMNET brings these interactions into one secure platform where students can find suitable alumni mentors, alumni can share their experience, and the university can coordinate events and monitor engagement.

## Key Features

- Secure registration, email verification, login, and password recovery
- Role-based access for students, alumni, and administrators
- Searchable alumni directory with professional and academic filters
- Student-to-alumni mentorship requests and request tracking
- Direct chat between connected mentors and mentees
- Professional profile and account management
- Event creation, administrator approval, registration, and reminders
- In-app and configurable email notifications
- Administrator dashboards for user verification and event moderation

## User Roles

| Role | Main capabilities |
| --- | --- |
| **Student** | Discover alumni, request mentorship, chat with mentors, and register for events |
| **Alumni** | Maintain a professional profile, manage mentees, chat, and create events |
| **Administrator** | Verify users, approve or reject events, and monitor platform activity |

## Application Screenshots

The screenshot blocks below are ready for images to be added manually. Save each image using the indicated path, then uncomment its Markdown image line.

### Landing Page

> Screenshot placeholder: `docs/images/screenshots/landing-page.png`

<!-- ![ALUMNET landing page](./docs/images/screenshots/landing-page.png) -->

### Login and Registration

> Screenshot placeholder: `docs/images/screenshots/login-page.png`

<!-- ![ALUMNET login page](./docs/images/screenshots/login-page.png) -->

> Screenshot placeholder: `docs/images/screenshots/registration-page.png`

<!-- ![ALUMNET registration page](./docs/images/screenshots/registration-page.png) -->

### Student Dashboard

> Screenshot placeholder: `docs/images/screenshots/student-dashboard.png`

<!-- ![ALUMNET student dashboard](./docs/images/screenshots/student-dashboard.png) -->

### Alumni Directory and Profile

> Screenshot placeholder: `docs/images/screenshots/alumni-directory.png`

<!-- ![ALUMNET alumni directory](./docs/images/screenshots/alumni-directory.png) -->

> Screenshot placeholder: `docs/images/screenshots/alumni-profile.png`

<!-- ![ALUMNET alumni profile](./docs/images/screenshots/alumni-profile.png) -->

### Mentorship and Chat

> Screenshot placeholder: `docs/images/screenshots/mentorship-requests.png`

<!-- ![ALUMNET mentorship requests](./docs/images/screenshots/mentorship-requests.png) -->

> Screenshot placeholder: `docs/images/screenshots/chat-page.png`

<!-- ![ALUMNET mentor and mentee chat](./docs/images/screenshots/chat-page.png) -->

### Events

> Screenshot placeholder: `docs/images/screenshots/events-page.png`

<!-- ![ALUMNET events page](./docs/images/screenshots/events-page.png) -->

> Screenshot placeholder: `docs/images/screenshots/event-details.png`

<!-- ![ALUMNET event details](./docs/images/screenshots/event-details.png) -->

### Administrator Dashboard

> Screenshot placeholder: `docs/images/screenshots/admin-dashboard.png`

<!-- ![ALUMNET administrator dashboard](./docs/images/screenshots/admin-dashboard.png) -->

## Architecture

ALUMNET uses a three-tier web architecture:

1. **Frontend:** React 19 and Vite provide the user interface and client-side routing.
2. **Backend:** Node.js and Express expose REST APIs and enforce business rules and role-based access.
3. **Data layer:** PostgreSQL stores accounts, profiles, mentorships, messages, events, registrations, and notifications. Supabase Storage is used for uploaded media.

JWT authentication protects private API routes. Nodemailer supports verification, password recovery, and notification emails.

> Diagram placeholder: `docs/images/screenshots/system-architecture.png`

<!-- ![ALUMNET system architecture](./docs/images/screenshots/system-architecture.png) -->

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, React Router, Axios, Lucide React |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Authentication | JWT, bcrypt |
| Media storage | Supabase Storage |
| Email | Nodemailer |
| Deployment | Vercel (frontend), hosted Node.js API and PostgreSQL |

## Repository Structure

```text
e23-co2060-Alumnet/
├── code/
│   ├── client/          # React and Vite frontend
│   └── server/          # Express API, SQL schema, and migrations
├── docs/                # GitHub Pages project website
│   └── images/          # Documentation images and screenshots
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL
- A Supabase project if image uploads are required

### 1. Clone the repository

```bash
git clone https://github.com/cepdnaclk/e23-co2060-Alumnet.git
cd e23-co2060-Alumnet
```

### 2. Configure the backend

Create `code/server/.env` and provide the values required for your environment:

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
JWT_SECRET=replace_with_a_secure_secret
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
```

Initialize the database using `code/server/schema.sql`, then apply any files in `code/server/migrations/` in date order.

### 3. Configure the frontend

Create `code/client/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Install dependencies and run the application

In one terminal:

```bash
cd code/server
npm install
npm run dev
```

In a second terminal:

```bash
cd code/client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Testing

The project should be evaluated through:

- Functional testing of authentication, profiles, mentorship, chat, and events
- API and database integration testing
- Role-based authorization testing
- Form validation and error-state testing
- Responsive and usability testing

## Future Improvements

- Mentor recommendations based on student interests
- Calendar integration for registered events
- Push notifications and real-time updates
- Advanced engagement analytics
- Support for multiple universities

## Team CodeX

| Registration No. | Member |
| --- | --- |
| E/23/435 | E. S. Wickramasinghe |
| E/23/362 | S. N. V. N. Senadheera |
| E/23/340 | W. H. C. C. Samarasinghe |
| E/23/075 | K. K. Dilshara |

## Course Information

- **Course:** CO2060 — Software Systems Design Project
- **Department:** Department of Computer Engineering, University of Peradeniya
- **Semester:** 4

## Useful Links

- [Live ALUMNET application](https://alumnetconnect.vercel.app/)
- [Project documentation website](https://cepdnaclk.github.io/e23-co2060-Alumnet/)
- [GitHub repository](https://github.com/cepdnaclk/e23-co2060-Alumnet)
- [Department of Computer Engineering](https://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)
