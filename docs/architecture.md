# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Build React route components for Activities, Teams, Leaderboard, and Workouts in `octofit-tracker/frontend/src`. Use `src/api/client.ts` to construct API URLs and fetch JSON responses, including relative `/api` requests by default and the `VITE_API_BASE_URL` override. Each view will expose explicit loading, success, empty, and accessible error states.
- Logic tier decision: Keep Express route handlers thin and place validation, aggregation, and recommendation behavior in explicit TypeScript service functions under `octofit-tracker/backend/src/services`. Validate ObjectIds before database casts and return `400`/`404` responses for invalid or missing references rather than allowing Mongoose cast errors to become `500` responses.
- Data tier decision: Define Mongoose models for `User`, `Team`, `Activity`, and `Workout` under `octofit-tracker/backend/src/models`, with required fields and ObjectId references enforced by schemas. Use the shared database configuration and an idempotent seed script that upserts demo records, preserves unrelated user data, and reconciles a demo user's previous team membership.
- Activity tracking approach: Accept `userId`, `teamId`, `type`, and `minutes`; verify that both IDs are valid ObjectIds and refer to existing records; calculate positive `points` from submitted activity data, set `occurredAt` to the creation time, and return the created activity. `GET` will list stored activities.
- Team management approach: Require `name` and `mascot` in the team schema, default `members` to an empty array, and validate submitted member ObjectIds as references. `POST /api/teams` will return `400` for a missing name and `201` with the created team; `GET` will preserve the team name, mascot, and member IDs.
- Leaderboard approach: Aggregate `Activity.points` by team in MongoDB, join or look up team names, sort totals from highest to lowest, and assign a 1-based `rank` after sorting.
- Workout suggestions approach: Find the user by email, derive the preferred focus from their fitness goal or most recent/relevant activity pattern, filter workouts by that focus, and return matching workouts with a reason that names the goal or activity. Return `404` for an unknown email.

## Test plan

Run the smallest focused contract test after completing each tier, then run builds as final integration checks.

- Data tier command: `npm run test:data --prefix octofit-tracker/backend`
  - Baseline: 4 of 5 tests fail because the `User`, `Team`, `Activity`, and `Workout` model requirements are incomplete; the seed/idempotency test passes.
  - Meaning: Failures indicate missing Mongoose required fields or validation, while a passing seed test confirms MongoMemoryServer setup and the existing seed contract can be exercised.
  - Success: All schema-validation and representative seed/idempotency tests pass.

- API tier command: `npm run test:api --prefix octofit-tracker/backend`
  - Baseline: 4 of 4 tests fail. Activity/team creation is unimplemented or returns `501`, the leaderboard is empty, and workout suggestions return the wrong workout or incomplete response.
  - Meaning: This tier has routing/service gaps, missing deliberate 4xx handling, and incorrect leaderboard/recommendation behavior.
  - Success: Valid creates/list operations pass, malformed or missing references use 4xx responses, leaderboard totals and ranks are correct, and suggestions match each user's goal/activity.

- Frontend tier command: `npm test --prefix octofit-tracker/frontend`
  - Baseline: 15 of 15 tests fail because the starter UI does not render fetched data or implement loading, empty, and alert states.
  - Meaning: The React routes and shared API client have not yet satisfied the presentation contract.
  - Success: All four routes render API success data, make the expected workout request, show accessible loading and empty states, and announce failures with `role="alert"`.

- Backend build command: `npm run build --prefix octofit-tracker/backend`
  - Meaning: A passing result verifies TypeScript compilation and that routes, models, services, and scripts have no type errors.

- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
  - Meaning: A passing result verifies React/TypeScript compilation and a complete Vite production bundle.
