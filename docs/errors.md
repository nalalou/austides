# Error Codes

austides returns structured JSON errors with machine-readable codes.

## station_not_found

**HTTP 404** — The station ID in the URL doesn't match any known BOM tide station.

**Fix:** Check the station ID against `GET /v1/stations`. Station IDs are lowercase, e.g. `nsw_tp007`.

## invalid_date

**HTTP 422** — The `date` query parameter is malformed.

**Fix:** Use `YYYY-MM-DD` format, e.g. `?date=2026-05-06`.

## no_data_for_date

**HTTP 422** — BOM has no tide predictions for the requested date. BOM only publishes predictions ~7 days into the future and does not serve historical data.

**Fix:** Request a date within the next 7 days.

## upstream_unavailable

**HTTP 503** — BOM's tide prediction service is down or returned unexpected data.

**Fix:** Retry after a few minutes. This is a transient error.

## rate_limit_exceeded

**HTTP 429** — Too many requests from your IP address.

**Fix:** Wait until the time indicated in the `Retry-After` response header. Limit is 100 requests per minute.
