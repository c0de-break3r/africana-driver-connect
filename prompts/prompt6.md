Read AGENTS.md fully and strictly follow it before starting.

Build (onboarding)/owner-setup.tsx:

Step 1: Vehicle number, make, model, year, color, seating capacity
Step 2: Vehicle category (Sedan, SUV, Taxi, Bus, Truck, Luxury, School Bus)
Step 3: Document upload placeholders (registration, insurance, roadworthy certificate) — same as driver flow, defer actual upload, allow "complete later"

Store in store/useOwnerProfileStore.ts, persisted via AsyncStorage.

Route to a brief "Vehicle pending verification" screen, then to (owner)/dashboard.
