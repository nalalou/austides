# austides

Australian tide predictions as JSON. Proxies [Bureau of Meteorology](https://www.bom.gov.au/australia/tides/) data.

```bash
curl https://austides.vercel.app/v1/stations/nsw_tp007/tides?date=2026-05-06
```

```json
{
  "object": "tide_predictions",
  "station_id": "nsw_tp007",
  "date": "2026-05-06",
  "data": [
    { "time": "2026-05-06T20:09:00Z", "height_m": 0.65, "type": "low" },
    { "time": "2026-05-07T02:03:00Z", "height_m": 1.25, "type": "high" },
    { "time": "2026-05-07T07:17:00Z", "height_m": 0.82, "type": "low" },
    { "time": "2026-05-07T13:56:00Z", "height_m": 1.64, "type": "high" }
  ],
  "source": "Bureau of Meteorology, Australian Government"
}
```

No API key. No signup. `Cache-Control` headers included.

## Endpoints

**`GET /v1/stations`** — all tide stations with lat/lon

**`GET /v1/stations/:id/tides?date=YYYY-MM-DD`** — high/low predictions for a date

## Data availability

Tide data comes live from BOM on each request. BOM only publishes predictions **~7 days into the future** from today's date and does not serve historical data. Requesting a past date or a date too far ahead will return a `422` error.

[Quickstart](docs/quickstart.md) · [Error codes](docs/errors.md)

## Why

BOM publishes tide predictions as HTML and there's no API.

## Run locally

```bash
npm install
npm run dev
```

## Support

If austides is useful to you, consider [helping cover hosting costs](https://donate.stripe.com/4gM4gB9fgcoc9OTdWN8Zq00).

## License

MIT
