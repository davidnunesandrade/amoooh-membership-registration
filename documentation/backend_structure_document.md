# Backend Structure Document for Amoooh Membership Registration

This document explains how the backend of the `amoooh-membership-registration` project is set up. It covers architecture, databases, APIs, hosting, infrastructure, security, monitoring, and more—all written in everyday language.

## 1. Backend Architecture

### Overall Design
- **Next.js App Router**: We use Next.js not just for the frontend but also for backend logic via API routes. This keeps everything in one codebase.  
- **Serverless Functions**: Each API route (for authentication, members, media, agencies, advertisers) acts like a small serverless function.  
- **TypeScript & Drizzle ORM**: We write all code in TypeScript for type safety. Drizzle ORM handles database queries in a type-safe way.
- **Modular Structure**: Code is divided into folders:  
  - `app/api/` for backend routes,  
  - `db/` for database setup and schema,  
  - `lib/` for shared utilities (like authentication),  
  - `components/` for UI building blocks.

### Scalability, Maintainability, Performance
- **Scalability**: API routes can scale independently. We can deploy multiple instances behind a load balancer.  
- **Maintainability**: Clear folder structure and TypeScript types make it easy to add or change features.  
- **Performance**: Next.js server components let us fetch and render data on the server. Static assets and pages can be cached at the edge.

## 2. Database Management

### Database Technology
- **Type**: Relational (SQL)  
- **System**: PostgreSQL  
- **ORM**: Drizzle ORM for type-safe database access  
- **Migrations**: Managed via Drizzle’s migration tool to keep schemas in sync.

### Data Structure & Access
- **Tables**: We store users (members), display mediums, agencies, advertisers, the join table for member–media relationships, and user sessions.  
- **Structured Queries**: All queries go through Drizzle ORM, which maps tables and columns to TypeScript objects.  
- **Connection Pooling**: We use a single Drizzle client instance with built-in pooling to handle many simultaneous requests.

## 3. Database Schema

### Human-Readable Overview
- **Member**: Represents a user of the system. Includes contact info, role, and when they joined.  
- **Display Medium**: A type of media (e.g., TV, Online, Print).  
- **Agency**: A company that represents advertisers.  
- **Advertiser**: An entity that runs ads, tied to one agency.  
- **MemberMedia**: A join table linking members to the display mediums they work with.  
- **Session**: Tracks user login sessions for authentication.

### PostgreSQL Schema (SQL)
```sql
-- Member (formerly users)
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  company_id INT,            -- optional field for future company linking
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Display Medium
CREATE TABLE display_mediums (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agency
CREATE TABLE agencies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advertiser
CREATE TABLE advertisers (
  id SERIAL PRIMARY KEY,
  agency_id INT NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MemberMedia (many-to-many)
CREATE TABLE member_media (
  member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  display_medium_id INT NOT NULL REFERENCES display_mediums(id) ON DELETE CASCADE,
  PRIMARY KEY (member_id, display_medium_id)
);

-- Session (for authentication)
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL
);
```  
This schema can be managed and updated with Drizzle ORM migrations.

## 4. API Design and Endpoints

### Design Approach
- **RESTful**: We follow REST conventions—separate endpoints for each resource, standard HTTP verbs (GET, POST, PUT, DELETE).  
- **Next.js API Routes**: Placed under `app/api/`, each folder corresponds to an entity.

### Key Endpoints
- **Authentication**  
  - `POST /api/auth/sign-up`: Create a new member.  
  - `POST /api/auth/sign-in`: Log in and receive a JWT/session token.  
  - `POST /api/auth/sign-out`: Invalidate the session.

- **Members**  
  - `GET /api/members/[id]`: Fetch member profile.  
  - `PUT /api/members/[id]`: Update member profile (email, name).  
  - `DELETE /api/members/[id]`: Remove a member.

- **Display Mediums**  
  - `GET /api/media`: List all mediums.  
  - `POST /api/media`: Create a new medium.  
  - `PUT /api/media/[id]`: Update medium details.  
  - `DELETE /api/media/[id]`: Delete a medium.

- **Agencies & Advertisers**  
  - `GET /api/agencies`, `POST /api/agencies`, etc.  
  - `GET /api/advertisers`, `POST /api/advertisers`, etc.

- **Member–Media Relations**  
  - `POST /api/members/[id]/media`: Link a member with one or more display mediums.  
  - `DELETE /api/members/[id]/media/[mediaId]`: Unlink a specific medium.

Authentication checks happen in `lib/auth.ts`, verifying JWTs and ensuring a member only touches their own records.

## 5. Hosting Solutions

### Deployment Environment
- **Platform**: Vercel for Next.js serverless functions.  
- **Database Hosting**: Managed PostgreSQL service (e.g., Supabase, Railway, or AWS RDS).  
- **Containerization**: Docker for local development and CI pipelines.

### Benefits
- **Reliability**: Vercel and managed DB services provide high uptime.  
- **Scalability**: Serverless functions scale automatically with traffic.  
- **Cost-Effectiveness**: Pay-as-you-go model keeps costs aligned with usage.

## 6. Infrastructure Components

- **Load Balancer**: Built into Vercel’s platform, distributing API request load globally.  
- **Content Delivery Network (CDN)**: Vercel and Next.js automatically cache static assets and pages at the edge.  
- **Caching Layer**: Optional Redis instance for session caching or heavy queries (e.g., reporting).  
- **Docker Compose**: For spinning up local dev environments with Postgres and Redis.

All pieces work together so assets load fast for users worldwide, API calls remain responsive, and backend services handle peaks smoothly.

## 7. Security Measures

- **Authentication & Authorization**  
  - Better Auth library with JWTs or session tokens.  
  - Middleware checks in `lib/auth.ts` to protect routes.  
- **Data Encryption**  
  - TLS (HTTPS) enforced on all endpoints.  
  - Environment variables for secrets (no hard-coding).  
  - Passwords hashed with a secure algorithm (e.g., bcrypt).
- **Input Validation**  
  - Use libraries like Zod for request payload validation on all CRUD endpoints.
- **Database Security**  
  - Least-privilege database user.  
  - SSL connections to the database.
- **Compliance**  
  - GDPR-friendly data handling (users can request data deletion).

## 8. Monitoring and Maintenance

- **Error Tracking**: Sentry or LogRocket for capturing runtime errors.  
- **Performance Metrics**: Vercel Analytics or New Relic for request timings and resource usage.  
- **Logging**: Structured logs (via Winston or built-in Next.js logging).  
- **Health Checks**: Automated ping endpoints monitored via services like UptimeRobot.
- **Maintenance Strategy**  
  - CI/CD with GitHub Actions: Run tests, build Docker images, and deploy on merge.  
  - Scheduled dependency updates (Dependabot) and routine security audits.  
  - Regular database backups and migration testing.

## 9. Conclusion and Overall Backend Summary

The backend for the Amoooh membership-registration project uses a modern, unified Next.js/TypeScript/Drizzle stack. It combines serverless API routes, a relational PostgreSQL database, and containerized local development. Hosting on Vercel with a managed database ensures reliability and cost efficiency. Key infrastructure elements—load balancing, CDN, caching—keep performance high. Strong security and monitoring practices protect and maintain the system. Together, these components create a scalable, maintainable, and fast backend that aligns with your project’s goals and sets a solid foundation for future growth.