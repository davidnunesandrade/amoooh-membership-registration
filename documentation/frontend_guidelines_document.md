# Frontend Guideline Document

This document outlines the frontend architecture, design principles, and technologies used in the `amoooh-membership-registration` project. It’s written in everyday language so anyone can understand how the frontend is set up and why each choice was made.

## 1. Frontend Architecture

**Framework & Language**  
• Next.js (App Router) for page structure, server-side rendering, and built-in API routes.  
• TypeScript for type safety and fewer runtime errors.

**UI Library & Styling**  
• Shadcn UI (built on Radix UI) for accessible, ready-to-use components.  
• Tailwind CSS for fast, utility-first styling.

**Why This Architecture?**  
- **Scalability**: Next.js keeps pages, layouts, and API routes organized in the `app/` folder. As you add features like media, agencies, and advertisers, each gets its own subfolder.  
- **Maintainability**: TypeScript plus Drizzle ORM (backend) means most errors are caught before code runs. Frontend components are small, reusable, and clearly named.  
- **Performance**: Server components in Next.js fetch data on the server and send minimal HTML to the client. Tailwind CSS’s JIT mode only ships the CSS you actually use.

## 2. Design Principles

1. **Usability**  
   Interfaces are intuitive. Forms use clear labels, validation messages, and focus states from Shadcn UI.  

2. **Accessibility**  
   Components follow ARIA best practices. Radix-based Shadcn UI ensures keyboard navigation and screen-reader support.  

3. **Responsiveness**  
   Layouts use Tailwind’s responsive utilities (`sm:`, `md:`, `lg:`) so pages adapt from mobile to desktop gracefully.

**How We Apply Them**  
- Every button and form input has a visible focus ring.  
- Color contrast meets WCAG AA standards.  
- Layouts collapse into a single column on narrow screens and expand into grids on wider screens.

## 3. Styling and Theming

**Styling Approach**  
- Utility-first with Tailwind CSS—no separate CSS files.  
- Small custom CSS for unique cases using Tailwind’s `@apply` directive.

**Theming**  
- Theme values (colors, fonts, spacing) live in `tailwind.config.js`.  
- Use CSS variables for dark mode toggle if needed.

**Visual Style**  
- **Flat & Modern**: Clean surfaces, minimal shadows, clear typography.  
- **Glassmorphism Accents**: Subtle blurred backgrounds for modals or floating cards.

**Color Palette**  
• Primary: #3B82F6 (Blue 500)  
• Secondary: #10B981 (Green 500)  
• Neutral Dark: #1F2937 (Gray 800)  
• Neutral Light: #F3F4F6 (Gray 100)  
• Error: #EF4444 (Red 500)

**Typography**  
- Font Family: Inter (system-fallback: `-apple-system, BlinkMacSystemFont, sans-serif`)  
- Weights: 400 (regular), 500 (medium), 700 (bold)

## 4. Component Structure

**Organization**  
- `components/ui/` for generic, reusable building blocks (Buttons, Inputs, Dropdowns).  
- `components/` for feature-specific components (MediaForm, AgencyList, AdvertiserForm).

**Reuse & Composition**  
- Use Shadcn UI components as wrappers—add props or class names to adjust look.  
- Keep each component small: one responsibility per file (e.g., `MemberProfile.tsx` only handles profile form).

**Benefits**  
- Faster development: you don’t rewrite common UI patterns.  
- Easier testing: small components have focused tests.  
- Better maintainability: updating one button style updates it everywhere.

## 5. State Management

**Approach**  
- **Server Components** for data fetching when possible (e.g., listing agencies).  
- **Client Components** with local `useState` or `useReducer` for form inputs and interactive widgets.  
- **Global State** via React Context (e.g., user session) or data-fetching libraries like React Query (TanStack Query) for caching API data.

**Sharing State**  
- Wrap the app in an `AuthProvider` that uses Context to expose the current user and a `signOut` function.  
- Use React Query hooks (`useQuery`, `useMutation`) for CRUD operations—automatic caching, refetching, and loading states.

## 6. Routing and Navigation

**Routing**  
- Next.js App Router handles file-based routes in `app/`.  
- Dynamic routes for entities: e.g., `app/api/members/[id]/route.ts` and `app/dashboard/media/[id]/page.tsx`.

**Navigation**  
- `MainNav` component in `components/main-nav.tsx` shows links to Dashboard, Media, Agencies, Advertisers.  
- `AuthButtons` component toggles Sign In/Sign Out based on session.

**Flow Example**  
1. User visits `/sign-in`.  
2. After sign-in, Next.js redirects to `/dashboard`.  
3. Sidebar or top nav lets the user select “Media” to go to `/dashboard/media`.

## 7. Performance Optimization

**Key Strategies**  
- **Code Splitting**: Next.js automatically splits code per route.  
- **Lazy Loading**: Dynamic imports (`next/dynamic`) for heavy components like charts.  
- **Asset Optimization**: Next.js Image component for responsive images and automatic compression.  
- **Tailwind JIT**: Only the CSS classes you use are generated.

**Impact**  
- Faster first load, smaller bundle sizes, responsive interactions even on slower networks.

## 8. Testing and Quality Assurance

**Unit Tests**  
- Jest + React Testing Library for components.  
- Test each component’s render and behavior (e.g., form validation messages).

**Integration Tests**  
- Jest or Vitest to test combined modules like `AuthProvider` + sign-in form.  
- Mock API calls with MSW (Mock Service Worker).

**End-to-End (E2E) Tests**  
- Playwright or Cypress to simulate user flows: sign up, login, update profile, manage media.  
- Tests run against a dev server with a seeded test database (via Docker).

**Linting & Formatting**  
- ESLint with Next.js plugin for code consistency.  
- Prettier for automatic formatting on commit.

## 9. Conclusion and Overall Frontend Summary

This frontend setup combines Next.js, TypeScript, Shadcn UI, and Tailwind CSS to deliver a scalable, maintainable, and high-performance application. The architecture leverages server and client components, clear folder organization, and component-based design to keep complexity in check. By following our design principles—usability, accessibility, responsiveness—you ensure every member enjoys a smooth experience on desktop or mobile. With React Query, React Context, and robust testing in place, your team can confidently build out the AMOOH membership and company registration platform, knowing the frontend foundation is solid and future-proof.

Happy coding! 🚀