Read AGENTS.md fully and strictly follow it before starting.

Read the "AI Assistant Rules" section of AGENTS.md before starting.

Ask permission before adding a Claude API integration and explain why, per AGENTS.md library approval rule. All calls must go through backend/serverless functions — never from the client.

Implement two features:

1. Client trip-description parser: add a free-text box on the Search/Booking screen (e.g. "Need a car for my sister's wedding this Saturday, about 6 people"). Backend sends this to Claude requesting structured JSON output (occasion type, date, passenger count, suggested vehicle type). Pre-fill the booking form with the parsed result, but always show it to the user for review/edit before submission — never auto-submit.

2. Driver profile-writing assistant: on the Driver full-profile-completion screen (Prompt 23), add an optional feature where the driver types rough notes about their experience. Backend calls Claude to turn this into a polished, professional bio, shown as an editable suggestion. The driver must explicitly accept it — never silently overwrite their original input.

Validate/parse the JSON response server-side before sending to the client. Do not persist any AI-generated content until the user has explicitly confirmed it.
