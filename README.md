# austides

Free, open-source Australian tide prediction API.

No API exists for Australian tide predictions — the Bureau of Meteorology publishes HTML pages only. austides proxies BOM data into clean, developer-friendly JSON.

## Quickstart

```bash
# Get all tide stations
curl https://austides.vercel.app/v1/stations

# Get tide predictions for Sydney
curl https://austides.vercel.app/v1/stations/nsw_tp007/tides?date=2026-05-06
```

See [docs/quickstart.md](docs/quickstart.md) for more.

## API Reference

### GET /v1/stations

Returns all ~112 Australian tide stations with coordinates.

### GET /v1/stations/:id/tides?date=YYYY-MM-DD

Returns high/low tide predictions for a station on a date.

## Contributing

PRs welcome. See the issues tab for things to work on.

## License

MIT
