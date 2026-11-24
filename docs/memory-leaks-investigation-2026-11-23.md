# Memory leaks investigation 2026-11-23

## Memory leaks investigation 2026-11-23

### Symptom

The GEO stack had been running since 2026-11-17 without a task error, but host
memory grew from **11.92 GiB to 19.63 GiB** (about **1.3 GiB/day**); the earlier
8.7 → 22.2 GiB range covers the whole run.

### Root cause

The host growth was traced to the desktop session, not to the six GEO
repositories: `gnome-system-monitor` held **9.74 GiB RSS** and grew by about
**1.1 GiB/day**, and Chrome held a further ~6.3 GiB. The nine GEO containers
together stayed around **2.6–3.4 GiB** and did not grow. Details are repeated
in every repository's investigation page so each project records its own
evidence.

### Frontend audit

The React app is served as static files by nginx, so it cannot grow the server
process. It can, however, grow the browser tab when it is left open — the
original symptom may have included that memory.

One unbounded cache was found in `src/api/dataQuality.js`:

```js
const indexCache = new Map()          // module-level, never evicted
...
indexCache.set(tableName, index)      // full probe payload per table
```

`fetchTableIndex` caches the full date-probe payload (one long-format row per
snapshot date and metric, roughly 21,000 rows per table). The map was keyed by
table and never evicted, so browsing all ~36 tables kept every payload alive
for the lifetime of the tab. `clearIndexCache()` existed but only tests called
it.

Other checked areas:

* `DownloadMenu` clears its hover timer on unmount; its `setTimeout(..., 0)`
  only defers one focus check and does not hold component state.
* Chart.js instances are owned by `react-chartjs-2`, which destroys them on
  unmount; `ChartJS.register` runs once at module load.
* Every view effect sets a `cancelled` flag before updating state after an
  async request, so a completed request does not keep an unmounted view alive.

### Change made

The probe cache is now a **bounded LRU with a TTL**:

* at most **4** tables are retained (`DATA_QUALITY_INDEX_CACHE_MAX_ENTRIES`);
* entries expire after **5 minutes** (`DATA_QUALITY_INDEX_CACHE_TTL_MS`);
* reading an entry refreshes its LRU position, and the oldest entry is evicted
  when a fifth table is cached.

Both limits live in `src/config.js` with the rest of the app settings.

This keeps the useful table-switch case fast while making the tab's worst-case
memory independent of how many tables the user visits.

Tests in `src/api/dataQuality.test.js` cover:

* eviction of the least-recently-used table and reuse of the newest one;
* a TTL expiry that triggers a fresh probe;
* the existing batching / cache behaviour.

### Verification

```bash
cd GEO_APP
npm test -- --run src/api/dataQuality.test.js
npm test -- --run
```

The page itself is static; to inspect the browser tab use Chrome's Memory tab
before and after switching across every table and check that the retained
`indexCache` entries stay at four.

### Conclusion

The server-side GEO stack was not leaking. This repository contributed one real
browser-side unbounded cache; it is now bounded and covered by tests.
