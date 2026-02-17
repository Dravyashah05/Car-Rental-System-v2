# Cab Booking Backend (Node.js + MongoDB)

This is a simple, production-ready starter API for a cab booking website.

## Quick Start
1. Create `.env` from `.env.example` and update values.
2. Install dependencies and run:

```bash
npm install
npm run dev
```

## API Overview
- `GET /health` basic health check
- `POST /auth/register` register a user
- `POST /auth/login` login and get a JWT
- `POST /rides` create a ride (user)
- `GET /rides` list rides (admin = all, user = own)
- `PATCH /rides/:id/assign` assign driver (admin)
- `PATCH /rides/:id/status` update status (driver/admin)
- `GET /drivers` manage drivers (admin)
- `GET /vehicles` manage vehicles (admin)

## Notes
- MongoDB is required.
- All non-auth routes require `Authorization: Bearer <token>`.
