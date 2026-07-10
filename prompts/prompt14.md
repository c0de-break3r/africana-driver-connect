Read AGENTS.md fully and strictly follow it before starting.

Ask permission before adding: recommend react-native-maps (or Google Maps SDK) for live tracking, route monitoring, ETA calculation, and geofencing, and explain why, per AGENTS.md library approval rule.

Once approved, implement:

- Live driver location on the Client tracking screen during an active booking
- ETA calculation display
- Basic geofencing trigger (e.g. "Driver arrived" state change) for pickup point

Keep all map API keys in backend/serverless config — never in the client bundle.
