# Firebase Auth Integration Guide

## Overview

You now have a complete, scalable Firebase Authentication system integrated into LAWOM. This prevents unauthorized access to your monitoring system.

---

## File Structure Created

```
src/
├── context/
│   └── AuthContext.jsx              ← Global auth state provider
├── hooks/
│   └── useAuth.js                   ← Hook to access auth anywhere
├── components/
│   ├── ProtectedRoute.jsx           ← Route guard component
│   └── UserMenu.jsx                 ← User dropdown (needs to be added to Dashboard)
├── lib/
│   ├── firebase.js                  ← UPDATED: Added auth export
│   └── authUtils.js                 ← Auth utility functions
└── pages/
    └── auth/
        ├── login.jsx                ← Login page
        ├── signup.jsx               ← Signup page
        └── reset-password.jsx       ← Password recovery page
```

---

## How Firebase Auth Works For Your System

### 1. **Authentication Layer** (What Happens Behind the Scenes)

```
User visits app
    ↓
AuthProvider checks Firebase for existing session
    ↓
If logged in: Sets user data in AuthContext
If not logged in: user = null
    ↓
Dashboard checks user state via useAuth()
    ↓
If no user: ProtectedRoute redirects to /login
If user exists: Shows dashboard normally
```

### 2. **What Firebase Auth Does**

| Feature | How It Works |
|---------|-------------|
| **Sign Up** | Creates user account with email/password, stored securely by Firebase |
| **Sign In** | Verifies credentials, creates session token |
| **Session Persistence** | User stays logged in even after page refresh (Firebase handles this) |
| **Sign Out** | Clears session, redirects to login |
| **Password Reset** | Sends reset email, user creates new password |

### 3. **Security**

- Passwords are **never** sent as plain text (Firebase encrypts them)
- Session tokens auto-expire after set period
- Firebase enforces database rules (you configure who can access what)
- Your Firebase config is in `.env` (never exposed)

---

## Integration Checklist

### ✅ Already Done
- [x] Firebase auth initialized
- [x] AuthProvider wraps entire app
- [x] Login, Signup, Password Reset pages created
- [x] Protected routes configured
- [x] Auth context & hooks set up

### ⚠️ Still Need To Do

#### 1. **Add UserMenu to Dashboard** (Quick - 2 minutes)

Open `src/pages/dashboard/dashboard.jsx` and add UserMenu to the header:

```jsx
// At the top, add import:
import { UserMenu } from "@/components/UserMenu";

// In the header section where you have "Network Status", add UserMenu:
// Find this line in the header:
<div className="text-right hidden md:block">
  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Network Status: Online</div>
  <div className="flex items-center gap-2 justify-end">
    <div className="font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm"></div>
  </div>
</div>

// Change it to:
<div className="flex items-center gap-4">
  <UserMenu />
  <div className="text-right">
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Network Status: Online</div>
    <div className="flex items-center gap-2 justify-end">
      <div className="font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm"></div>
    </div>
  </div>
</div>
```

#### 2. **Test the Auth Flow**

1. Start your dev server: `npm run dev`
2. App redirects to `/login` automatically (no user logged in)
3. Click "Sign up here" → Create test account
4. Dashboard loads → You're authenticated!
5. Click user menu (top right) → See "Sign Out" button
6. Click Sign Out → Redirected to login

#### 3. **Update Firebase Security Rules** (Important for Data Protection)

In Firebase Console:
1. Go to Realtime Database → Rules tab
2. Replace with this (allows only authenticated users):

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

This means:
- Only logged-in users can read rainfall/flood data
- Only logged-in users can write data from sensors
- Unauthenticated users get "Permission Denied" errors

#### 4. **Optional Enhancements**

**Email Verification** (require users to verify emails):
```javascript
// In signup.jsx after createUserWithEmailAndPassword:
import { sendEmailVerification } from "firebase/auth";
await sendEmailVerification(currentUser);
```

**Google Sign-In** (let users sign in with Google):
- Install: `npm install firebase`
- Add Google provider in auth pages
- Configure in Firebase Console → Authentication → Google

**Role-Based Access Control** (admin only features):
- Set custom claims in Firebase Admin SDK
- Check claims in `authUtils.js` `isUserAdmin()` function
- Gate components based on role

---

## File Explanations

### `AuthContext.jsx`
Wraps your entire app and monitors Firebase login state in real-time. When user logs in/out, all components automatically get notified.

### `useAuth.js`
Simple hook to grab auth info anywhere in your app. Replaces prop drilling.

### `ProtectedRoute.jsx`
Wrapper component that:
- Checks if user is logged in
- If yes → shows the page
- If no → redirects to /login
- If checking → shows loading screen

### Login/Signup/Reset Pages
Standard auth forms that use Firebase authentication directly. Clean UI matching your LAWOM design.

### `UserMenu.jsx`
Dropdown in dashboard header showing:
- Logged-in user's email
- Sign out button
- Appears only when user is authenticated

### `authUtils.js`
Helper functions like:
- `logout()` - Signs user out
- `getUserDisplayName()` - Gets name/email for display
- `isUserAdmin()` - Check if user is admin (stub for future use)

---

## Troubleshooting

**Q: User keeps getting sent to login page?**
A: Check browser console for errors. Make sure your `.env` file has correct Firebase credentials.

**Q: "Permission Denied" errors in database?**
A: Update Firebase security rules (see step 3 above). By default, new Firebase projects deny all access.

**Q: Can't create accounts?**
A: In Firebase Console → Authentication → Sign-in method → Make sure "Email/Password" is enabled.

**Q: How do I add other sign-in methods?**
A: Firebase supports Google, GitHub, Facebook, etc. Documentation: https://firebase.google.com/docs/auth

---

## Architecture Benefits

✅ **No Backend Needed** - Firebase handles auth completely
✅ **Scalable** - Easy to add more auth providers later
✅ **Secure** - Passwords encrypted, never visible to you
✅ **Clean Code** - Auth concerns separated from business logic
✅ **Real-time** - Session changes instantly reflect across app
✅ **Persistent** - Users stay logged in across sessions

---

## Security Reminders

1. **Never** commit `.env` file with real credentials
2. **Always** use security rules to protect database
3. **Enable** email verification for production
4. **Consider** IP whitelisting in Firebase for added security
5. **Rotate** API keys periodically

---

## Next Steps

1. Add UserMenu to Dashboard header (see Integration Checklist #1)
2. Test login/signup/logout flow
3. Update Firebase security rules (see #3)
4. Deploy and monitor
