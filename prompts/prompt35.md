Read AGENTS.md fully and strictly follow it before starting.

Build shared rating flow:

- 1-5 star rating + optional comment after a completed booking or job
- Ratings apply bidirectionally (Driver rates Client/Owner, Client rates Driver, etc.)

Build Dispute Management:

- Dispute types: No Show, Poor Service, Payment Dispute, Vehicle Condition
- Workflow: Complaint → Investigation → Resolution → Closure (status tracker UI)
- Simple form to file a dispute from a completed/active booking

Store dispute and rating data via the backend, not AsyncStorage — this is shared/multi-user data.
