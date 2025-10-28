# Project Requirements Document (PRD)

## 1. Project Overview
The AMOOH Membership and Company Registration Platform is a full-stack web application designed to manage memberships, media channels, agencies, and advertisers in one unified dashboard. At its core, it provides a secure sign-up/sign-in flow, personalized member profiles, and CRUD (Create, Read, Update, Delete) operations for Display Mediums, Agencies, and Advertisers. By leveraging a modern tech stack, it aims to simplify administrative workflows and offer a responsive, accessible user experience.

This platform is being built to replace fragmented spreadsheets and manual processes with an integrated system that tracks members’ company affiliations, their roles, and their associated media channels. The key objectives are:
• Enable secure user authentication and role-based access.  
• Provide a clear, intuitive dashboard for managing members, media, agencies, and advertisers.  
• Ensure data integrity and type safety with a robust database layer.  
• Deliver fast page loads and API responses to boost user satisfaction.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (v1)
• User Authentication: Sign-up, sign-in, session management with JWT tokens.  
• Member Dashboard: Personalized landing page after login.  
• Member Profile CRUD: View and update personal and company details.  
• Display Mediums CRUD: Add, list, edit, delete media channels.  
• Agencies CRUD: Manage agency records linked to members.  
• Advertisers CRUD: Manage advertiser records under agencies.  
• Member–Media Association: Multi-select component to link a member to multiple mediums.  
• RESTful API Endpoints: `/api/members`, `/api/media`, `/api/agencies`, `/api/advertisers`.  
• PostgreSQL Database: Tables for Members, Media, Agencies, Advertisers, and join table MemberMedia.  
• Responsive UI: Accessible forms and lists styled with Tailwind CSS.  
• Type Safety: End-to-end typing with TypeScript and Drizzle ORM.  
• Containerization: Docker configuration for local development.

### Out-of-Scope (v1)
• Advanced Reporting & Analytics dashboards with charting libraries.  
• Progressive Web App (PWA) offline support.  
• Role-based permissions beyond basic member vs. admin.  
• Payment or subscription billing integration.  
• Third-party OAuth (Google, Facebook) or SSO.  
• Internationalization (i18n) and multi-language support.  
• Performance tuning beyond standard caching (e.g., Redis).

## 3. User Flow
When a new user arrives, they land on the home page with options to sign up or sign in. Clicking **Sign Up** leads to a form collecting name, email, password, and company information. On successful registration, the user receives a JWT token, is logged in automatically, and is redirected to the Dashboard.

On the Dashboard, a left-hand sidebar lists navigation links: **Profile**, **Media**, **Agencies**, and **Advertisers**. In **Profile**, users see their personal and company details with an **Edit** button opening a form for updates. In **Media**, they can add new display mediums via a form, view existing items in a paginated list, and edit or delete entries. **Agencies** and **Advertisers** follow similar CRUD patterns, each with its own list view and form. In **Profile**, a multi-select component lets members associate themselves with multiple media channels. All forms call the appropriate API routes, handle success/error messages, and update the UI in real time.

## 4. Core Features
- **Authentication Module**: JWT-based sign-up, sign-in, password hashing, session validation.  
- **Member Profile Management**: View/edit personal and company fields.  
- **Display Medium CRUD**: Create, list, edit, delete media entities.  
- **Agency Management**: Full CRUD for agency records tied to members.  
- **Advertiser Management**: CRUD operations for advertiser records linked to agencies.  
- **Member–Media Association**: Multi-select UI + API to update join table.  
- **API Routes**: RESTful endpoints under `app/api/`, each with GET/POST/PUT/DELETE.  
- **UI Components**: Reusable form inputs, buttons, lists from Shadcn UI.  
- **Type-Safe ORM**: Drizzle schemas for database models and relations.  
- **Docker Setup**: Containers for Node.js app and PostgreSQL database.

## 5. Tech Stack & Tools
- **Frontend**:  
  • Next.js (React framework with App Router)  
  • TypeScript (static typing)  
  • Shadcn UI & Radix UI (accessible components)  
  • Tailwind CSS (utility-first styling)  
- **Backend**:  
  • Next.js API Routes (node serverless functions)  
  • Better Auth library + JWT (authentication)  
  • Drizzle ORM (type-safe queries)  
  • PostgreSQL (relational database)  
- **Containerization**: Docker & Docker Compose  
- **IDE Tools** (optional): Cursor or Windsurf for AI-assisted coding  
- **Testing** (future): Jest for unit tests, Playwright/Cypress for E2E.

## 6. Non-Functional Requirements
- **Performance**: Page load time < 2 seconds; API response < 200ms for standard queries.  
- **Security**: All traffic over HTTPS; password hashing (bcrypt); JWT expiry; OWASP best practices.  
- **Usability**: WCAG 2.1 AA accessibility; mobile and desktop responsive.  
- **Data Integrity**: Enforce referential integrity in PostgreSQL; validate inputs server-side with Zod.  
- **Maintainability**: ESLint & Prettier for code style; clear folder structure; comprehensive code comments.

## 7. Constraints & Assumptions
- Node.js >= v18 and Next.js >= v14 environment is available.  
- PostgreSQL v14+ instance accessible via Docker or managed service.  
- Drizzle ORM must support many-to-many relations via join tables.  
- Users have modern browsers (Chrome, Edge, Firefox, Safari).  
- No external legacy systems to integrate in v1.  
- Future scale will remain within moderate traffic (< 10,000 daily active users).

## 8. Known Issues & Potential Pitfalls
- **JWT Expiration & Refresh**: Short-lived tokens require refresh logic; consider refresh tokens.  
- **API Rate Limits**: If publicly exposed, apply basic throttling or API key checks.  
- **DB Schema Migrations**: Frequent schema changes can break migration scripts; adopt a migration tool (e.g., Drizzle migrate).  
- **Timezone Handling**: Ensure date fields store and display in user’s local timezone.  
- **Form Validation Gaps**: Missing or inconsistent client/server validation could allow bad data; enforce Zod schemas in API routes.  
- **Container Networking**: Docker Compose may need port remapping adjustments on some OSes; document default ports.

---

This PRD provides a clear, unambiguous blueprint for developing the AMOOH Membership and Company Registration Platform. Subsequent technical documents (Tech Stack Details, Frontend Guidelines, Backend Structure, App Flow, File Structure, IDE Rules) can reference these sections to ensure consistency and completeness.