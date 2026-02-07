---
layout: home
permalink: index.html

repository-name: e23-co2060-Alumnet
title: Alumnet - Student-Alumni Engagement Platform
---

# Alumnet

## Team
- **E/23/435**, E.S Wickramasinghe, [e23435@eng.pdn.ac.lk](mailto:e23435@eng.pdn.ac.lk)
- **E/23/362**, S.N.V.N Senadheera, [e23362@eng.pdn.ac.lk](mailto:e23362@eng.pdn.ac.lk)
- **E/23/340**, W.H.C.C Samarasinghe, [e23340@eng.pdn.ac.lk](mailto:e23340@eng.pdn.ac.lk)
- **E/23/075**, K.K Dilshara, [e23075@eng.pdn.ac.lk](mailto:e23075@eng.pdn.ac.lk)

#### Table of Contents
1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture)
3. [Software Designs](#software-designs)
4. [Testing](#testing)
5. [Conclusion](#conclusion)
6. [Links](#links)

## Introduction

[cite_start]Universities face ongoing challenges in maintaining meaningful and structured engagement with their alumni after graduation[cite: 405]. [cite_start]Currently, alumni information is fragmented across informal platforms such as social media groups, emails, and personal networks[cite: 406]. [cite_start]This fragmentation makes it difficult to identify alumni by expertise, facilitate mentorship, or effectively promote university events[cite: 407].

**Alumnet** is a centralized, university-managed digital platform designed to solve this problem. [cite_start]It enables organized alumni engagement, structured mentorship workflows, and engagement monitoring in a secure, role-based environment[cite: 409].

## Solution Architecture

Alumnet operates as a standalone web-based application using a 3-tier architecture:

1.  [cite_start]**Presentation Layer (Frontend):** Built with **React.js** to provide a responsive and interactive user interface for Students, Alumni, and Administrators[cite: 443].
2.  [cite_start]**Application Layer (Backend):** Powered by **Node.js** and **Express**, handling API routing, business logic, and authentication[cite: 445].
3.  [cite_start]**Data Layer (Database):** Uses **PostgreSQL** for persistent storage of user profiles, mentorship requests, and events[cite: 447].

[cite_start]The system is deployed on **Render** and uses **JWT (JSON Web Tokens)** for secure, stateless authentication [cite: 448-449].

## Software Designs

The system is designed around five core features to ensure scalability and usability:

### 1. User Authentication & Role Management
Secure login with JWT-based authentication. [cite_start]The system supports three distinct roles [cite: 422-424]:
* **Students:** Can search directories and request mentorship.
* **Alumni:** Can manage profiles and accept/reject requests.
* **Admins:** Manage users and events.

### 2. Alumni Profile Management
A centralized directory allowing alumni to create professional profiles. [cite_start]Students can search this directory filtering by **batch, department, profession, and skills** [cite: 425-426].

### 3. Mentorship Workflow
[cite_start]A structured process to formalize guidance [cite: 428-430]:
* **Request:** Students send a mentorship request to a specific alumnus.
* **Response:** Alumni receive the request and can simply "Accept" or "Reject".
* **Tracking:** Both parties can track the status of the connection.

### 4. Event Announcements
University administrators can broadcast official event announcements to all users. [cite_start]To avoid complexity and legal risks, the system **does not** handle ticket bookings or financial transactions [cite: 431-433].

### 5. Database Design
[cite_start]The database schema includes entities for **Users**, **AlumniProfiles**, **StudentProfiles**, **MentorshipRequests**, **Events**, and **Notifications** to support clear relationships and data integrity [cite: 452-458].

## Testing

The verification strategy for Alumnet includes:

* [cite_start]**Functional Testing:** Verifying that each feature (e.g., login, search, request sending) functions according to the requirements[cite: 387].
* [cite_start]**Security Testing:** Ensuring that role-based access control (RBAC) is strictly enforced (e.g., a Student cannot delete an Event) and that user data is protected[cite: 388].
* [cite_start]**Usability Inspection:** Reviewing the interface to ensure that the "Accept/Reject" workflow is intuitive for alumni with varying technical skills[cite: 379].

## Conclusion

Alumnet successfully addresses the problem of unstructured alumni engagement by providing a secure and scalable platform. [cite_start]The project delivers a functional directory, a mentorship workflow, and an event broadcasting system[cite: 468].

**Future Enhancements:**
* [cite_start]Support for multiple universities[cite: 466].
* [cite_start]Inclusion of corporate or industry mentors[cite: 466].
* [cite_start]Advanced analytics dashboards for engagement monitoring[cite: 466].

## Links

- [Project Repository](https://github.com/cepdnaclk/{{ page.e23-co2060-Alumnet }}){:target="_blank"}
- [Project Page](https://cepdnaclk.github.io/{{ page.e23-co2060-Alumnet }}){:target="_blank"}
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
