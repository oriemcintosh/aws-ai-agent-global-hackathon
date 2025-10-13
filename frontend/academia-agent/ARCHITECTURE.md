# NextAuth AWS Cognito Authentication Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser/Client                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              app/layout.tsx                          │      │
│  │  ┌────────────────────────────────────────────┐     │      │
│  │  │       AuthProvider (Session Context)       │     │      │
│  │  └────────────────────────────────────────────┘     │      │
│  └──────────────────────────────────────────────────────┘      │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              app/page.tsx (Protected)                │      │
│  │                                                      │      │
│  │  useSession() ──► status === "loading"              │      │
│  │                    → Show Loading Spinner            │      │
│  │                                                      │      │
│  │                   status === "unauthenticated"       │      │
│  │                    → Show AuthCard                   │      │
│  │                                                      │      │
│  │                   status === "authenticated"         │      │
│  │                    → Show Main App                   │      │
│  └──────────────────────────────────────────────────────┘      │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────┐      │
│  │         components/auth-card.tsx                     │      │
│  │                                                      │      │
│  │  • Terms Checkbox (required)                         │      │
│  │  • "Sign In" Button                 │      │
│  │  • Link to /terms                                    │      │
│  │                                                      │      │
│  │  onClick ──► signIn("cognito")                       │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js API Layer                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │     app/api/auth/[...nextauth]/route.ts              │      │
│  │                                                      │      │
│  │  NextAuth({                                          │      │
│  │    providers: [CognitoProvider],                     │      │
│  │    callbacks: { jwt, session },                      │      │
│  │    secret: NEXTAUTH_SECRET                           │      │
│  │  })                                                  │      │
│  │                                                      │      │
│  │  Initiates OAuth 2.0 flow                            │      │
│  └──────────────────────────────────────────────────────┘      │
│                           │                                      │
│                           ▼                                      │
│                    Redirects user to                             │
│                    AWS Cognito Hosted UI                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AWS Cognito Service                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │            Cognito Hosted UI                         │      │
│  │                                                      │      │
│  │  • Sign In / Sign Up forms                           │      │
│  │  • Email verification                                │      │
│  │  • Password management                               │      │
│  │  • Forgot password flow                              │      │
│  │  • Optional: Social login (Google, etc.)             │      │
│  │                                                      │      │
│  │  User authenticates ──► Generates OAuth tokens       │      │
│  └──────────────────────────────────────────────────────┘      │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────┐      │
│  │         Cognito User Pool                            │      │
│  │                                                      │      │
│  │  • Validates credentials                             │      │
│  │  • Creates/updates user                              │      │
│  │  • Issues ID token, access token, refresh token      │      │
│  │                                                      │      │
│  │  Redirects to callback URL with tokens               │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              NextAuth OAuth Callback Handler                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  /api/auth/callback/cognito                                      │
│                                                                  │
│  • Validates OAuth tokens from Cognito                           │
│  • Extracts user information                                     │
│  • Creates NextAuth session                                      │
│  • Sets secure HTTP-only cookies                                 │
│  • Redirects user back to application                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Authentication Flow Sequence

```
User                 Browser              Next.js API         AWS Cognito           Cognito Pool
 │                      │                      │                    │                     │
 │ 1. Visit website     │                      │                    │                     │
 ├─────────────────────►│                      │                    │                     │
 │                      │                      │                    │                     │
 │                      │ 2. Check session     │                    │                     │
 │                      ├─────────────────────►│                    │                     │
 │                      │                      │                    │                     │
 │                      │ 3. No session found  │                    │                     │
 │                      │◄─────────────────────┤                    │                     │
 │                      │                      │                    │                     │
 │ 4. Show AuthCard     │                      │                    │                     │
 │◄─────────────────────┤                      │                    │                     │
 │                      │                      │                    │                     │
 │ 5. Check terms box   │                      │                    │                     │
 │ 6. Click "Sign In"   │                      │                    │                     │
 ├─────────────────────►│                      │                    │                     │
 │                      │                      │                    │                     │
 │                      │ 7. Call signIn()     │                    │                     │
 │                      ├─────────────────────►│                    │                     │
 │                      │                      │                    │                     │
 │                      │                      │ 8. Redirect to     │                     │
 │                      │                      │    Cognito         │                     │
 │                      │                      ├───────────────────►│                     │
 │                      │                      │                    │                     │
 │ 9. Redirect to       │                      │                    │                     │
 │    Cognito Hosted UI │                      │                    │                     │
 │◄─────────────────────┼──────────────────────┼────────────────────┤                     │
 │                      │                      │                    │                     │
 │ 10. Show sign-in/    │                      │                    │                     │
 │     sign-up form     │                      │                    │                     │
 │◄─────────────────────┼──────────────────────┼────────────────────┤                     │
 │                      │                      │                    │                     │
 │ 11. Enter email +    │                      │                    │                     │
 │     password         │                      │                    │                     │
 │ 12. Submit           │                      │                    │                     │
 ├─────────────────────►│                      │                    │                     │
 │                      ├──────────────────────┼────────────────────►│                     │
 │                      │                      │                    │                     │
 │                      │                      │                    │ 13. Validate        │
 │                      │                      │                    │     credentials     │
 │                      │                      │                    ├────────────────────►│
 │                      │                      │                    │                     │
 │                      │                      │                    │ 14. User OK         │
 │                      │                      │                    │◄────────────────────┤
 │                      │                      │                    │                     │
 │                      │                      │                    │ 15. Issue tokens    │
 │                      │                      │                    │     (ID, Access,    │
 │                      │                      │                    │      Refresh)       │
 │                      │                      │                    │                     │
 │ 16. Redirect to      │                      │                    │                     │
 │     callback URL     │                      │                    │                     │
 │     with auth code   │                      │                    │                     │
 │◄─────────────────────┼──────────────────────┼────────────────────┤                     │
 │                      │                      │                    │                     │
 │                      │ 17. OAuth callback   │                    │                     │
 │                      │     /api/auth/       │                    │                     │
 │                      │     callback/cognito │                    │                     │
 │                      ├─────────────────────►│                    │                     │
 │                      │                      │                    │                     │
 │                      │                      │ 18. Exchange code  │                     │
 │                      │                      │     for tokens     │                     │
 │                      │                      ├───────────────────►│                     │
 │                      │                      │                    │                     │
 │                      │                      │ 19. Return tokens  │                     │
 │                      │                      │◄───────────────────┤                     │
 │                      │                      │                    │                     │
 │                      │                      │ 20. Verify tokens  │                     │
 │                      │                      │                    │                     │
 │                      │                      │ 21. Create session │                     │
 │                      │                      │ 22. Set cookie     │                     │
 │                      │                      │                    │                     │
 │                      │ 23. Redirect to app  │                    │                     │
 │                      │◄─────────────────────┤                    │                     │
 │                      │                      │                    │                     │
 │ 24. Redirect to /    │                      │                    │                     │
 │◄─────────────────────┤                      │                    │                     │
 │                      │                      │                    │                     │
 │ 25. Show main app    │                      │                    │                     │
 │     (authenticated)  │                      │                    │                     │
 │◄─────────────────────┤                      │                    │                     │
```

```

## 📦 Component Dependencies

```
app/page.tsx
    │
    ├── useSession() from next-auth/react
    ├── AuthCard from @/components/auth-card
    └── Button from @/components/ui/button

components/auth-card.tsx
    │
    ├── signIn() from next-auth/react
    ├── Card, CardHeader, CardTitle, CardDescription, CardContent from @/components/ui/card
    ├── Button from @/components/ui/button
    ├── Checkbox from @/components/ui/checkbox
    ├── Label from @/components/ui/label
    └── Link from next/link

components/auth-provider.tsx
    │
    └── SessionProvider from next-auth/react

app/layout.tsx
    │
    └── AuthProvider from @/components/auth-provider

app/api/auth/[...nextauth]/route.ts
    │
    ├── NextAuth from next-auth
    ├── CognitoProvider from next-auth/providers/cognito
    └── Environment variables (NEXTAUTH_SECRET, COGNITO_CLIENT_ID, etc.)
```

## 🗂️ Data Flow

```
┌──────────────────────────────────────────────────────────┐
│                    Environment Variables                  │
│  (.env.local)                                            │
│                                                          │
│  • NEXTAUTH_SECRET                                       │
│  • COGNITO_CLIENT_ID                                     │
│  • COGNITO_CLIENT_SECRET                                 │
│  • COGNITO_ISSUER                                        │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│               NextAuth Configuration                      │
│  (app/api/auth/[...nextauth]/route.ts)                   │
│                                                          │
│  Reads env vars and configures:                          │
│  • Cognito provider                                      │
│  • OAuth 2.0 flow                                        │
│  • Session handling                                      │
│  • JWT and session callbacks                             │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                   Session Context                         │
│  (AuthProvider wraps entire app)                         │
│                                                          │
│  Provides session state to all components:               │
│  • session.user.email                                    │
│  • session.user.id                                       │
│  • session.user.name                                     │
│  • session.user.image                                    │
│  • session.accessToken (from Cognito)                    │
│  • status: "loading" | "authenticated" | "unauthenticated"│
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                   UI Components                           │
│  (page.tsx, auth-card.tsx)                               │
│                                                          │
│  Use session data to:                                     │
│  • Show/hide auth UI                                     │
│  • Display user info                                     │
│  • Enable/disable features                               │
│  • Handle sign-in/sign-out                               │
└──────────────────────────────────────────────────────────┘
```

## 🔐 Security Layers

```
1. Environment Variables
   └─► Secrets stored securely, never committed to git

2. NEXTAUTH_SECRET
   └─► Signs and encrypts session tokens

3. CSRF Protection
   └─► Built into NextAuth, prevents cross-site attacks

4. OAuth 2.0 Authorization Code Flow
   └─► Industry-standard secure authentication

5. AWS Cognito Security Features
   └─► Password policies, brute force protection, MFA

6. Secure Cookies
   └─► HTTP-only, secure (HTTPS in production)

7. JWT Token Validation
   └─► Cognito tokens verified on every request

8. Terms Agreement
   └─► Required consent before account creation
```

## 🎨 UI Component Hierarchy

```
app/layout.tsx
└── AuthProvider
    └── app/page.tsx
        ├── Loading State
        │   └── Spinner + "Loading..." text
        │
        ├── Unauthenticated State
        │   └── AuthCard
        │       └── Card
        │           ├── CardHeader
        │           │   ├── CardTitle: "Welcome to Academia Agent"
        │           │   └── CardDescription: "Sign in or create..."
        │           │
        │           └── CardContent
        │               ├── Checkbox + Label (terms agreement)
        │               │   └── Link to /terms
        │               ├── Error message (if any)
        │               ├── Button: "Sign In with AWS Cognito"
        │               └── Helper text: "You'll be redirected..."
        │
        └── Authenticated State
            └── Main App
                ├── Header
                │   ├── AI Logo
                │   ├── Title + Description
                │   └── Sign Out Button
                ├── Messages Area
                └── Input Area
```

This architecture provides a complete, secure, and scalable authentication system powered by AWS Cognito!
