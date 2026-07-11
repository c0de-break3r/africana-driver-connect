Read AGENTS.md fully and strictly follow it before starting.

Set up a backend/serverless function (per AGENTS.md — never expose this logic or any keys client-side) that implements basic matching:

Given a booking or job request, rank available drivers/vehicles by:

- Proximity (use location data)
- Availability
- Rating
- Cost
- Experience

Return a ranked list to the client. Start with a simple weighted-scoring function — do not overengineer with ML at this stage.

Wire this into the Jobs (owner) and Search (client) screens to show "Top Matches" instead of a plain unordered list, and replace the mocked trial data from Prompt 14 with real results now that auth and matching exist.
