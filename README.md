# Alumnet: Alumni-Student Engagement Platform

> A centralized, university-managed digital platform designed to bridge the gap between students and alumni.

---

## 📢 Project Overview
Universities face challenges in maintaining meaningful engagement with alumni, often relying on fragmented platforms like social media and email. **Alumnet** solves this by providing a secure, role-based environment for:
1.  **Connection:** A searchable directory to identify alumni using academic background or expertise.
2.  **Mentorship:** A structured workflow for the students to request guidance and for alumni to manage these requests.
3.  **Engagement:** A central hub for university events and engagement monitoring.

## 🚀 Key Features
* **Alumni Directory:** Searchable database filtering by batch, department, and skills.
* **Mentorship Workflow:** Structured system where students send requests and alumni can Accept/Reject.
* **Event Announcements:** Administrators can broadcast events to all users (no ticketing/payments involved).
* **Role-Based Access:** Secure dashboards for Students, Alumni, and Administrators.
* **Admin Dashboard:** Tools for user approval, role management, and engagement analytics.

## 🛠 Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) |
| **Backend** | ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) |
| **Database** | ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) |
| **Auth** | ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens) |
| **Deployment** | ![Render](https://img.shields.io/badge/Render-%2346E3B7.svg?style=for-the-badge&logo=render&logoColor=white) |
| **Design** | ![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white) |

## 👥 Team CodeX
* **E/23/435** - E.S Wickramasinghe
* **E/23/362** - S.N.V.N Senadheera
* **E/23/340** - W.H.C.C Samarasinghe
* **E/23/075** - K.K Dilshara

## ⚡ Getting Started
### Prerequisites
* Node.js (v14+)
* PostgreSQL

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/cepdnaclk/e23-co2060-project-alumnet.git
    ```

2.  **Install Dependencies**
    ```bash
    cd client && npm install
    cd ../server && npm install
    ```

3.  **Run the Application**
    ```bash
    # Run Backend
    cd server && npm start

    # Run Frontend
    cd client && npm start
    ```
   
## 🗄️ Database Schema

The system relies on a **PostgreSQL** relational database with the following core entities:

* **Users:** Base entity for authentication (Email, Password Hash, Role).
* **Profiles:** Distinct attributes for `StudentProfile` (GPA, Interests) vs. `AlumniProfile` (Experience, Current Company).
* **MentorshipRequests:** Tracks the status (`Pending`, `Accepted`, `Rejected`) between a Student and an Alumnus.
* **Events:** University announcements managed by Admins.
* **Notifications:** Asynchronous updates for users.
    
## 🏫 Course Information
* **Course:** CO2060 - Software Systems Design Project
* **Department:** Department of Computer Engineering, University of Peradeniya
* **Semester:** 4
