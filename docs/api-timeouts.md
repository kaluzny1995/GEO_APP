# API timeouts and the data-quality date probe

## 2026-11-25 incident

The dashboard showed **“API server is down! Please check the API server.”** while the
browser console reported a CORS failure for the data-quality `file-dates` request.

Two things were happening:

1. The API returned intermittent 500s from its Supabase connection pool
   (`prepared statement ... does not exist` / `already exists`). Starlette returned
   those 500s without a CORS header, so the browser reported a CORS error and the
   fetch wrapper classified it as a connection failure.
2. The data-quality probe requests up to 100 snapshot dates at once. For IBTrACS that
   is **29,049 rows / ~4.1 MB**, measured at **5–9 s** under concurrent requests. The
   old **8 s** client timeout aborted requests before the API finished serializing
   them, which produced the same “API down” message.

The API-side fix is documented in
[GEO_API — API timeouts, CORS and Supabase pooling](../../GEO_API/docs/api-timeouts-and-cors.md).

## Frontend change

`src/config.js` now sets:

```js
export const API_TIMEOUT_MS = 30000
```

The timeout remains centralised in `config.js` with the other app settings. Small
endpoints still respond in milliseconds; the longer budget only affects the large
date-probe response and slow database days.

The bounded probe cache from 2026-11-23 is unchanged: four tables, five-minute TTL.

## Verification

```bash
cd GEO_APP
npm test -- --run
npm run build
curl -s -D - -o /dev/null -H 'Origin: http://localhost:3000' \
  'http://localhost:8000/data-quality/tables'
```

The API header check must include `access-control-allow-origin`. The full sample
requests (and the API's 24/24 successful concurrent probes) are in the GEO_API page
linked above.
