# MyCard App - Project Structure

## Overview
Mobile-first appointment booking system with NFC integration and customizable business landing pages.

## Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── a/                        # Admin routes (/a/*)
│   │   ├── admin/                # Superuser dashboard (/a/admin)
│   │   ├── login/                # Business admin login
│   │   ├── dashboard/            # Business admin dashboard
│   │   └── [token]/              # Token registration (/a/tokenKey=)
│   ├── c/                        # Client routes (/c/*)
│   │   └── [token]/              # Client access (/c/tokenKey=)
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── tokens/               # Token management
│   │   ├── businesses/           # Business CRUD
│   │   └── appointments/         # Appointment management
│   └── globals.css               # Global styles with theming
│
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── forms/                    # Form components
│   │   ├── BusinessRegistrationForm.tsx
│   │   ├── ClientRegistrationForm.tsx
│   │   └── LoginForm.tsx
│   └── layouts/                  # Layout components
│       ├── AdminLayout.tsx
│       ├── BusinessLayout.tsx
│       └── ClientLayout.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useBusinessTheme.ts
│   └── useAppointments.ts
│
├── lib/                          # Utilities and configurations
│   ├── auth/                     # Authentication logic
│   │   ├── tokenAuth.ts
│   │   └── passwordAuth.ts
│   ├── db/                       # Database queries
│   │   ├── users.ts
│   │   ├── businesses.ts
│   │   └── appointments.ts
│   ├── validation/               # Form validation schemas
│   │   └── schemas.ts
│   └── supabase.ts               # Supabase client
│
├── utils/                        # Helper functions
│   ├── theme.ts                  # Theme management
│   ├── dateTime.ts               # Date/time utilities
│   └── nfc.ts                    # NFC integration helpers
│
└── types/                        # TypeScript definitions
    └── index.ts                  # All type definitions
```

## Route Structure

### Admin Routes (`/a/*`)
- `/a/admin` - Superuser dashboard (generate tokens)
- `/a/login` - Business admin login
- `/a/dashboard` - Business admin dashboard
- `/a/[token]` - Business admin registration with token

### Client Routes (`/c/*`)
- `/c/[token]` - Client access/registration with NFC token

## Development Phases

### Phase 1: Authentication & User Management
- [ ] Token generation system
- [ ] User registration flows
- [ ] Authentication middleware

### Phase 2: Business Management
- [ ] Business registration
- [ ] Service management
- [ ] Hours configuration

### Phase 3: Appointment System
- [ ] Appointment booking
- [ ] Calendar management
- [ ] Notifications

### Phase 4: Theming & Customization
- [ ] Business landing page themes
- [ ] Custom CSS injection
- [ ] Logo/branding upload

### Phase 5: Mobile Optimization & NFC
- [ ] PWA implementation
- [ ] NFC integration testing
- [ ] Mobile UX refinements

## Key Features
- **Mobile-first design** - Optimized for smartphone usage
- **NFC Integration** - Seamless client access via NFC cards
- **Multi-tenant theming** - Customizable business landing pages
- **Token-based invitations** - Secure user onboarding
- **Role-based access** - Three distinct user levels