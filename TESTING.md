# Testing

## Server (`server-main`)

Unit and integration-style tests with **Jest** and **ts-jest**.

```bash
cd server-main
npm test
npm run test:coverage
```

Coverage focus:

- **Controllers**: HTTP status codes, cookies, validation, auth guards (`auth.controller`, `reports.controller`)
- Report deduplication and PostGIS merge flows
- Auth service (sign-in / sign-up)
- Zod request schemas (auth, reports)
- JWT utilities and API response helpers
- Security middleware (headers, auth rate limiting)

## Website (`website-main`)

Client validation and display helpers with **Vitest**:

```bash
cd website-main
npm test
```

## CI recommendation

Run `npm test` in both packages before each submission or release.