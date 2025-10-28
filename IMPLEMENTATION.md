# AMOOH Membership & Company Registration Module - Implementation Guide

## Overview

This implementation provides a complete membership and company registration system for AMOOH with the following features:

- **Database Schema** with Drizzle ORM (PostgreSQL)
- **RESTful API Routes** with JWT authentication
- **CRUD Components** for all entities
- **Interactive Reporting Dashboard** with data visualization
- **Progressive Web App (PWA)** capabilities
- **Mobile-responsive** design

## Database Schema

### Tables Created

1. **display_medium** - Media outlets (TV, Online, Print, etc.)
2. **agency** - Advertising agencies
3. **advertiser** - Advertisers linked to agencies
4. **member** - Member profiles linked to users
5. **member_media** - Many-to-many relationship between members and media

### Relationships

- Agency ↔ Advertiser (One-to-Many)
- Member ↔ User (One-to-One)
- Member ↔ DisplayMedium (Many-to-Many via member_media)

## API Endpoints

### Display Media
- `GET /api/media` - List all media (with pagination & filters)
- `POST /api/media` - Create new media
- `GET /api/media/[id]` - Get specific media
- `PUT /api/media/[id]` - Update media
- `DELETE /api/media/[id]` - Delete media

### Agencies
- `GET /api/agencies` - List all agencies
- `POST /api/agencies` - Create new agency
- `GET /api/agencies/[id]` - Get specific agency
- `PUT /api/agencies/[id]` - Update agency
- `DELETE /api/agencies/[id]` - Delete agency

### Advertisers
- `GET /api/advertisers` - List all advertisers
- `POST /api/advertisers` - Create new advertiser
- `GET /api/advertisers/[id]` - Get specific advertiser
- `PUT /api/advertisers/[id]` - Update advertiser
- `DELETE /api/advertisers/[id]` - Delete advertiser

### Members
- `GET /api/members` - List all members
- `POST /api/members` - Create new member
- `GET /api/members/[id]` - Get specific member
- `PUT /api/members/[id]` - Update member
- `DELETE /api/members/[id]` - Delete member

### Member Media Associations
- `GET /api/members/[id]/media` - Get member's media associations
- `POST /api/members/[id]/media` - Add media associations
- `DELETE /api/members/[id]/media` - Remove media associations

## Features

### 1. Authentication & Authorization
- JWT-based authentication using Better Auth
- Members can only edit their own profile and media associations
- Admin role support for elevated permissions

### 2. CRUD Operations
All entities support full CRUD operations with:
- Form validation using Zod
- Error handling and user feedback
- Success notifications using Sonner

### 3. Member Profile
- View and edit personal information
- Multi-select media association management
- Real-time updates

### 4. Reporting Dashboard
Located at `/dashboard/reports`:
- Key metrics cards (total media, agencies, advertisers, members)
- Data visualization with Recharts:
  - Bar charts
  - Pie charts
  - Line charts
- Advanced filtering:
  - Date range
  - Media type
  - Industry
- Export to CSV functionality
- Real-time data refresh

### 5. Progressive Web App (PWA)
- Installable on mobile devices
- Offline support with service workers
- Caching strategies for optimal performance
- App-like experience on mobile

## File Structure

```
/workspace/repo/
├── app/
│   ├── api/
│   │   ├── media/              # Media CRUD endpoints
│   │   ├── agencies/           # Agency CRUD endpoints
│   │   ├── advertisers/        # Advertiser CRUD endpoints
│   │   └── members/            # Member CRUD endpoints
│   ├── dashboard/
│   │   ├── membership/         # Main management page
│   │   └── reports/            # Reporting dashboard
│   └── layout.tsx              # Root layout with PWA metadata
├── components/
│   └── features/
│       ├── media/              # Media components
│       ├── members/            # Member components
│       └── shared/             # Reusable components
├── db/
│   ├── schema/
│   │   ├── auth.ts             # Better Auth schema
│   │   ├── membership.ts       # Membership entities schema
│   │   └── index.ts            # Schema exports
│   └── index.ts                # Drizzle instance
├── drizzle/
│   ├── 0000_*.sql              # Initial auth migration
│   └── 0001_membership_module.sql  # Membership tables migration
├── lib/
│   ├── api-client.ts           # Type-safe API client
│   ├── auth-middleware.ts      # Auth helpers
│   ├── validations.ts          # Zod schemas
│   └── auth.ts                 # Better Auth config
├── public/
│   └── manifest.json           # PWA manifest
└── next.config.ts              # PWA configuration
```

## Setup Instructions

### 1. Database Setup

Run the database migrations:

```bash
# Start PostgreSQL (using Docker)
npm run db:up

# Push schema to database
npm run db:push

# Or manually run migrations
npm run db:migrate
```

### 2. Environment Variables

Ensure these are set in `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/amooh
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Visit:
- Main app: http://localhost:3000
- Membership management: http://localhost:3000/dashboard/membership
- Reports: http://localhost:3000/dashboard/reports

## Usage

### For Members

1. **Sign up/Sign in** - Create an account or log in
2. **Access Dashboard** - Navigate to `/dashboard/membership`
3. **Manage Profile** - Update personal information in the "My Profile" tab
4. **Associate Media** - Select media outlets you're associated with
5. **View Reports** - Access analytics in the "Reports" section

### For Administrators

1. **Manage Entities** - Full CRUD access to all entities
2. **View All Members** - Access member directory
3. **Generate Reports** - Create custom reports with filters
4. **Export Data** - Download reports as CSV

## Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Route Protection** - All API routes require authentication
3. **Authorization Checks** - Members can only access their own data
4. **Input Validation** - Zod schemas validate all inputs
5. **SQL Injection Prevention** - Drizzle ORM parameterized queries

## Mobile & PWA

The application is fully responsive and works on:
- Desktop browsers
- Mobile browsers (iOS, Android)
- Installed as PWA on mobile devices

### Installing as PWA

**On Mobile (Chrome/Safari):**
1. Open the app in browser
2. Tap browser menu
3. Select "Add to Home Screen"
4. Follow prompts

**Features when installed:**
- Offline access to cached pages
- Fast loading with service workers
- App-like navigation
- Push notifications (future enhancement)

## Testing

### Test the API Endpoints

```bash
# List all media
curl http://localhost:3000/api/media

# Create a new media outlet
curl -X POST http://localhost:3000/api/media \
  -H "Content-Type: application/json" \
  -d '{"name":"Example TV","type":"TV","location":"New York"}'
```

### Test Authentication

1. Sign up at `/sign-up`
2. Sign in at `/sign-in`
3. Access protected routes in `/dashboard`

## Performance Optimizations

1. **Server Components** - Faster initial page loads
2. **Data Caching** - Reduced API calls with caching strategies
3. **Lazy Loading** - Components loaded on-demand
4. **Image Optimization** - Next.js automatic image optimization
5. **Code Splitting** - Smaller bundle sizes

## Future Enhancements

Potential improvements to consider:

1. **Bulk Operations** - Import/export multiple records
2. **Advanced Search** - Full-text search across entities
3. **Email Notifications** - Alert members of changes
4. **Audit Logs** - Track all CRUD operations
5. **Role-Based Access Control** - More granular permissions
6. **Real-time Updates** - WebSocket support for live data
7. **File Uploads** - Member avatars, company logos
8. **API Documentation** - Swagger/OpenAPI specs

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
npm run db:up

# Verify connection string
echo $DATABASE_URL
```

### PWA Not Installing

- Ensure running on HTTPS (or localhost)
- Check browser console for service worker errors
- Verify manifest.json is accessible

### Authentication Issues

- Clear browser cookies/localStorage
- Check Better Auth configuration
- Verify JWT secret is set

## Support

For issues or questions:
1. Check the documentation files in `/documentation/`
2. Review the tech stack document
3. Examine backend structure guide

## License

See project LICENSE file.
