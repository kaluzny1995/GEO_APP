# Memory leaks investigation 2026-11-24

## Memory leaks investigation 2026-11-24

### Symptom

Host memory was **33 % before the 2026-11-24 pipeline run and 35.2 % after it**
(+~1.4 GiB on a 62.5 GiB host). This follow-up checks the React browser layer
after yesterday's bounded-cache change.

### Finding

No server-side leak: GEO_APP is served as static files by nginx, whose container
held only **7.4 MiB**. The browser-side date-probe cache is bounded to four
tables with a five-minute TTL, so browsing more tables cannot retain one payload
per table across a long-lived tab.

The host increase is the desktop session:

| Measurement | Value |
|-------------|------:|
| `gnome-system-monitor` | 10.65 GiB, +0.87 GiB since 23 Nov |
| Chrome | 6.54 GiB, +0.21 GiB since 23 Nov |
| All nine GEO containers | 1.95 GiB |
| `nginx` (GEO_APP) | 7.4 MiB |

`gnome-system-monitor` is the same process identified on 2026-11-23 and is still
growing ~1.1 GiB/day. Chrome growth is ordinary browser usage; the app no longer
contributes an unbounded module cache.

### Code status

No new leak and no code change today. The 2026-11-23 LRU/TTL fix
(`DATA_QUALITY_INDEX_CACHE_MAX_ENTRIES` and
`DATA_QUALITY_INDEX_CACHE_TTL_MS` in `src/config.js`) is deployed in the rebuilt
`geo_react_app` image. The test suite remains unchanged and green.

### Verification

```bash
cd GEO_APP
npm test -- --run
docker stats --no-stream geo_e2e-geo_react_app-1
```

To confirm the browser cache bound, switch through every table in a long-lived
tab and check that retained `indexCache` entries stay at four.

### Conclusion

GEO_APP does not explain the host increase. Closing or restarting
`gnome-system-monitor` releases its ~10.6 GiB history buffer. After the monitor exited at ~18:44, host used fell from 22.0 GiB (35.2 %) to 11.1 GiB (17.6 %), confirming the attribution. Full evidence is
in [GEO_E2E — Memory leaks investigation 2026-11-24](../../GEO_E2E/docs/memory-leaks-investigation-2026-11-24.md).
