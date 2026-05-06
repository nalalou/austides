# Quickstart

Get Australian tide predictions in 60 seconds.

## 1. List stations

```bash
curl https://austides.vercel.app/v1/stations
```

Response:

```json
{
  "object": "list",
  "data": [
    {
      "object": "station",
      "id": "nsw_tp007",
      "name": "Sydney (Fort Denison)",
      "state": "NSW",
      "latitude": -33.8554,
      "longitude": 151.2256
    }
  ],
  "count": 17
}
```

## 2. Get tide predictions

```bash
curl https://austides.vercel.app/v1/stations/nsw_tp007/tides?date=2026-05-06
```

Response:

```json
{
  "object": "tide_predictions",
  "station_id": "nsw_tp007",
  "date": "2026-05-06",
  "data": [
    { "time": "2026-05-06T20:09:00Z", "height_m": 0.65, "type": "low" },
    { "time": "2026-05-07T02:03:00Z", "height_m": 1.25, "type": "high" }
  ],
  "source": "Bureau of Meteorology, Australian Government"
}
```

## Tips

- **No API key needed.** Just send GET requests.
- **Dates are optional.** Omit `?date=` to get today's tides.
- **Cache responses.** Tide predictions for a given date don't change. Respect `Cache-Control` headers.
- **Rate limit:** 100 requests/minute per IP. Check `X-RateLimit-Remaining` header.
- **Find nearest station:** Use the lat/lon from `/v1/stations` to find the closest station to your location.
