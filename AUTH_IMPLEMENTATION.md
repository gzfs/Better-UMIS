# Authentication Implementation

This document describes the authentication system implemented for the Better-UMIS project.

## Overview

The authentication system uses:

- **TanStack Forms** for form validation and state management
- **TanStack Query** for API state management and caching
- **shadcn/ui** components for the user interface
- **JWT tokens** for authentication (following the provided backend reference)

## Files Created/Modified

### Core Files

- `src/lib/auth.ts` - Authentication service with API calls
- `src/hooks/useAuth.ts` - Custom hooks for authentication using TanStack Query
- `src/components/LoginForm.tsx` - Login form component using TanStack Forms
- `src/routes/login.tsx` - Login page route
- `src/main.tsx` - Updated to include TanStack Query provider

### UI Components (via shadcn/ui)

- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/card.tsx`
- `src/lib/utils.ts`

## Features

### Login Form

- **Username and Password fields** with validation
- **Real-time validation** using TanStack Forms
- **Error handling** for both client-side validation and API errors
- **Loading states** during authentication
- **Responsive design** using Tailwind CSS and shadcn/ui

### Authentication Service

- **API integration** ready for the Moodle backend
- **Token management** using localStorage
- **Error handling** with proper error messages
- **Type safety** with TypeScript interfaces

### TanStack Query Integration

- **Mutation hooks** for login/logout operations
- **Automatic token storage** on successful login
- **Error handling** with proper error states
- **DevTools integration** for debugging

## Usage

1. **Navigate to `/login`** to access the login form
2. **Enter credentials** - the form validates in real-time
3. **Submit the form** - it will call your authentication API
4. **On success** - the JWT token is stored and user is authenticated

## Backend Integration

The authentication service is configured to work with the provided backend reference:

```typescript
// The service expects this API endpoint structure:
POST /api/auth/login
{
  "username": "user123",
  "password": "password123"
}

// Expected response:
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "user123",
    "fullname": "User Full Name"
  }
}
```

## Customization

### API Endpoint

Update the `API_BASE_URL` in `src/lib/auth.ts` to match your backend:

```typescript
const API_BASE_URL = "/api"; // Change this to your backend URL
```

### Token Storage

Currently using localStorage. For production, consider:

- HTTP-only cookies
- Secure token storage
- Token refresh logic

### Validation Rules

Modify validation in `src/components/LoginForm.tsx`:

```typescript
validators={{
  onChange: ({ value }) => {
    // Add your custom validation logic here
    if (!value) return 'Username is required'
    // ... more validation
    return undefined
  },
}}
```

## Development

1. **Start the dev server**: `pnpm run dev`
2. **Visit** `http://localhost:3000`
3. **Click "Go to Login"** to test the form
4. **Open DevTools** to see TanStack Query and Router devtools

## Next Steps

1. **Connect to your actual backend API**
2. **Implement protected routes** using the authentication state
3. **Add logout functionality** to the header
4. **Implement token refresh** for better security
5. **Add user profile management**
