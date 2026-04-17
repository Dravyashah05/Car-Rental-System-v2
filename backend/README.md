# Cab Booking Backend (Node.js + MongoDB)

This is a simple, production-ready starter API for a cab booking website.

## Quick Start
1. Create/update `backend/.env` and set required values (at minimum `MONGO_URI`).
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

## Troubleshooting

### `querySrv ECONNREFUSED _mongodb._tcp...`
This usually means Node is trying to do the MongoDB SRV DNS lookup via a non-working local DNS server (commonly `127.0.0.1`).

- Fix your system DNS (or start your local DNS service), then restart the backend.
- Or set `DNS_SERVERS` in `backend/.env` (use a working resolver, e.g. your adapter DNS from `ipconfig /all`, or `1.1.1.1,8.8.8.8`), then restart.
- Or switch `MONGO_URI` to a non-SRV `mongodb://...` connection string.
