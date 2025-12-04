# HR System Frontend

Frontend application for the HR Management System built with Next.js 14, TypeScript, and a warm, cozy design system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create .env file
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env

# Run development server (runs on port 3001 by default)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

**Default Ports:**
- Frontend: `http://localhost:3001` (Next.js default)
- Backend: `http://localhost:3000` (NestJS default)

---

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── login/                    # Login page
│   ├── register/                # Registration page
│   └── modules/                  # Module-specific pages
│       ├── employee-profile/
│       ├── leaves/
│       ├── organization-structure/
│       ├── payroll-configuration/
│       ├── payroll-execution/
│       ├── payroll-tracking/
│       ├── performance/
│       ├── recruitment/
│       └── time-management/
│
├── shared/                       # Shared resources (used by all modules)
│   ├── components/              # Reusable UI components
│   ├── styles/                  # Global styles and theme
│   ├── utils/                   # Utility functions (API client, formatting, etc.)
│   ├── hooks/                   # Shared React hooks
│   ├── types/                   # TypeScript types
│   └── constants/               # Constants (endpoints, routes, etc.)
│
└── .env                         # Environment variables
```

---

## 🎨 Shared UI Components

All teams use shared components from `shared/components/` to maintain UI consistency across modules.

### Available Components

#### Button
```tsx
import { Button } from '@/shared/components';

<Button variant="primary" size="lg" onClick={handleClick}>
  Submit
</Button>
```

**Variants:** `primary`, `secondary`, `accent`, `success`, `warning`, `error`, `outline`, `ghost`  
**Sizes:** `sm`, `md`, `lg`  
**Props:** `fullWidth`, `isLoading`, `disabled`

#### Card
```tsx
import { Card } from '@/shared/components';

<Card padding="lg" shadow="warm" hover>
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>
```

**Props:**
- `padding`: `none` | `sm` | `md` | `lg`
- `shadow`: `none` | `sm` | `md` | `lg` | `warm`
- `hover`: boolean (adds hover effect)

#### Input
```tsx
import { Input } from '@/shared/components';

<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  helperText="Enter your email address"
  required
  fullWidth
/>
```

**Props:** `label`, `error`, `helperText`, `fullWidth`, `required`, all standard input props

#### Modal
```tsx
import { Modal } from '@/shared/components';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  <p>Modal content</p>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: function
- `title`: string (optional)
- `size`: `sm` | `md` | `lg` | `xl`

### Design System

**Colors:**
- Backgrounds: Warm whites (`#fef9f3`, `#fff8ee`)
- Primary: Terracotta orange (`#e76f51`)
- Accent: Teal green (`#2a9d8f`)
- Success: Warm green (`#8ac926`)
- Warning: Golden orange (`#ff9f1c`)
- Borders: Light warm gray (`#e2dcd0`)

**Typography:**
- Font: Inter
- Weights: 300-900 (bold for headings: 700-900)

**Spacing:**
- Consistent spacing scale (xs, sm, md, lg, xl, 2xl, 3xl, 4xl)

**Border Radius:**
- Default: 16px (cozy rounded corners)

**Shadows:**
- Warm orange-tinted shadows for depth

---

## 🌐 API Calls

### How API Calls Work

All API calls go through a centralized API client (`shared/utils/api.ts`) that:
- Automatically includes cookies (for authentication)
- Handles errors (401 redirects to login)
- Uses the base URL from `.env`

### Making API Calls

```tsx
import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';

// GET request
const response = await apiClient.get(API_ENDPOINTS.EMPLOYEE_PROFILE);
const employees = response.data;

// POST request
const result = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
  email: 'user@example.com',
  password: 'password123'
});

// PUT request
await apiClient.put(`/employee-profile/${id}`, updatedData);

// DELETE request
await apiClient.delete(`/employee-profile/${id}`);
```

### Why `.env` is Extremely Important

The `.env` file tells the frontend **where your backend is located**. Without it, API calls will fail!

**What happens:**
1. You call `apiClient.get('/auth/me')`
2. API client reads `NEXT_PUBLIC_API_URL` from `.env`
3. Makes request to: `http://localhost:3000/auth/me` (or your configured URL)

**If `.env` is missing or wrong:**
- ❌ API calls go to wrong URL
- ❌ Authentication fails
- ❌ Data fetching fails
- ❌ Application breaks

**Always set `.env` before running the app!**

```env
# .env file (REQUIRED)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Different environments:**
```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Production
NEXT_PUBLIC_API_URL=https://api.yourcompany.com
```

**Important:**
- Must restart dev server after changing `.env`
- Variable must start with `NEXT_PUBLIC_` to be accessible in browser
- Never commit `.env` to git (it's in `.gitignore`)

---

## 🔐 Authentication & Cookies

### How Authentication Works

The frontend uses **cookie-based JWT authentication** that integrates seamlessly with the backend.

#### The Flow

1. **User Logs In:**
   ```tsx
   const { login } = useAuth();
   await login({ email: 'user@example.com', password: 'password123' });
   ```
   - Frontend sends credentials to backend
   - Backend validates and creates JWT token
   - Backend sets httpOnly cookie with token
   - Backend returns user data (NOT the token)
   - Frontend stores user data in React state

2. **Browser Stores Cookie:**
   - Cookie name: `token`
   - Cookie value: JWT token (encrypted)
   - httpOnly: true (JavaScript CANNOT access it - secure!)
   - Automatically sent with every request

3. **Making Authenticated Requests:**
   ```tsx
   // Just make API calls normally
   const data = await apiClient.get('/employee-profile');
   // Cookie is automatically included!
   ```
   - Browser automatically includes cookie
   - Backend validates cookie
   - Returns data if valid

4. **Getting Current User:**
   ```tsx
   const { user, isAuthenticated } = useAuth();
   // Automatically fetches from /auth/me on component mount
   ```

5. **Logout:**
   ```tsx
   const { logout } = useAuth();
   await logout();
   // Backend clears cookie, frontend clears state, redirects to login
   ```

### Key Points

✅ **Frontend DOES:**
- Send login credentials
- Store user data in React state
- Include cookies in requests (via `withCredentials: true`)
- Call `/auth/me` to get current user

❌ **Frontend DOES NOT:**
- Create JWT tokens (backend does this)
- Store tokens in localStorage (browser cookie stores it)
- Read cookies (can't - they're httpOnly)
- Manage token expiration (backend handles this)

✅ **Backend DOES:**
- Create JWT tokens
- Set httpOnly cookies
- Validate cookies on protected routes
- Extract user info from JWT

✅ **Browser DOES:**
- Store cookie automatically
- Send cookie with requests automatically
- Protect cookie from JavaScript (httpOnly)

### Using Authentication in Components

```tsx
'use client';

import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';

export default function MyComponent() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <p>Role: {user?.roles.join(', ')}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes

```tsx
'use client';

import { useAuth } from '@/shared/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected Content</div>;
}
```

### Role-Based Access

```tsx
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';

const { user } = useAuth();

const isAdmin = user?.roles.includes(SystemRole.SYSTEM_ADMIN) || 
                user?.roles.includes(SystemRole.HR_MANAGER);

if (!isAdmin) {
  return <div>Access Denied</div>;
}
```

### Available Auth Methods

```tsx
const {
  user,              // Current user data
  isLoading,         // Loading state
  error,             // Error message
  isAuthenticated,   // Boolean: is user logged in?
  login,             // Login function
  register,          // Register function
  logout,            // Logout function
  changePassword,    // Change password function
  refreshUser,       // Refresh user data
} = useAuth();
```

### Backend Endpoints

- `POST /auth/login` - Login (public)
- `POST /auth/register` - Register (public)
- `GET /auth/me` - Get current user (protected)
- `POST /auth/logout` - Logout (protected)
- `POST /auth/change-password` - Change password (protected)

---

## 📦 Module Structure

Each module (employee-profile, leaves, etc.) has its own folder under `app/modules/`:

```
module-name/
├── page.tsx              # Main page component
├── components/           # Module-specific components
└── types/               # Module-specific types
```

**Example:**
```tsx
// app/modules/employee-profile/page.tsx
'use client';

import { Card, Button } from '@/shared/components';
import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';

export default function EmployeeProfilePage() {
  // Module-specific logic here
  return (
    <Card padding="lg">
      <h1>Employee Profile</h1>
      {/* Module content */}
    </Card>
  );
}
```

---

## 🛠️ Development

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**That's it!** The default works for development.

### Available Scripts

```bash
npm run dev      # Start development server (port 3001)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npm run type-check  # TypeScript type checking
```

### Project Defaults

- **Frontend Port:** 3001 (Next.js default)
- **Backend Port:** 3000 (NestJS default)
- **API URL:** `http://localhost:3000` (from `.env`)

### Troubleshooting

**API calls failing?**
- ✅ Check `.env` file exists and has `NEXT_PUBLIC_API_URL`
- ✅ Verify backend is running on port 3000
- ✅ Restart dev server after changing `.env`
- ✅ Check browser console for CORS errors

**Authentication not working?**
- ✅ Check backend is running
- ✅ Verify `NEXT_PUBLIC_API_URL` in `.env` matches backend URL
- ✅ Check browser DevTools → Application → Cookies (should see `token` cookie)
- ✅ Ensure CORS is configured on backend to allow credentials

**Components not importing?**
- ✅ Use `@/shared/components` for shared components
- ✅ Check TypeScript paths in `tsconfig.json`
- ✅ Restart TypeScript server in your IDE

---

## 📚 Additional Resources

- **Shared Components:** `shared/components/`
- **API Client:** `shared/utils/api.ts`
- **Constants:** `shared/constants/index.ts`
- **Types:** `shared/types/`
- **Hooks:** `shared/hooks/`

---

## 🎯 Key Takeaways

1. **Always set `.env`** - Without it, API calls fail
2. **Use shared components** - Maintains UI consistency
3. **Cookies are automatic** - No manual token management needed
4. **Module structure** - Each team works in their module folder
5. **Default ports** - Frontend 3001, Backend 3000

---

## 📝 Notes

- All shared resources are in `shared/` directory
- Each module is self-contained in `app/modules/`
- Environment variables must start with `NEXT_PUBLIC_`
- Restart dev server after changing `.env`
- Never commit `.env` to git
