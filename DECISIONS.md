# DECISIONS.md



## What I built

Completed T-01 through T-09 with a focus on shipping a stable, usable dashboard before adding enhancements. Fixed the responsive layout and mobile overflow issues (T-01), connected `data.json` to the UI and added defensive rendering for inconsistent or missing fields (T-02), and wired workflow filtering with status normalization to handle mixed casing (`active`, `ACTIVE`, `In Progress`) (T-03). Added loading and error states for fetch resilience (T-04), extracted a reusable status badge to centralize status rendering and normalization (T-07), built the workflow detail panel with timeline/history support and mixed timestamp handling (T-05), and implemented the activity feed using real data (T-06). As a usability enhancement, I added pagination (6 workflows per page) and reset pagination on filter/search changes to avoid empty-state issues. I also surfaced `suggested_actions` as lightweight workflow quick actions (T-08), wired the “Summarise today” action with a mock operational summary (T-09), and added debounced search to reduce unnecessary filtering work.

## What I skipped and why

I prioritised stability, usability, and completion of the required layers over larger architectural changes or visual redesign. I intentionally avoided overengineering state management, introducing additional abstractions, or redesigning the dashboard because the assignment emphasized shipping working functionality under time constraints. I also chose not to aggressively clean or mutate the underlying dataset since the requirement was to make the UI resilient to messy real-world exports rather than “fix” the data itself.

## Most difficult bug to find

The most time-consuming issue was defensive rendering around inconsistent workflow data because failures surfaced indirectly in the UI. For example, some workflows contained incomplete ownership data (`assignee: null`, empty objects, deleted users), while progress and status values were inconsistent enough to break assumptions in rendering and filtering. The challenge was making the UI resilient without silently hiding problematic records. Debugging filter behavior also took time because button state updated visually before the actual parent filtering logic was wired correctly.

## Data quality issues I discovered

- Some workflows contain incomplete ownership data (`assignee: null`, empty object, deleted users), which required fallback rendering (`Unassigned`, safe avatar fallbacks) instead of assuming valid user objects.  
- A few workflows appear operationally inconsistent — for example, overdue workflows that still look active or unusually high progress values paired with unexpected workflow states, suggesting status/progress are not always synchronized.  
- Certain workflows appear stale from a business perspective (old updates, deleted assignees, overdue timelines) but still remain actionable in the dashboard, which could impact prioritisation logic.  
- Empty client names are used for internal workflows, which required treating client display as optional rather than assuming all workflows belong to external clients.  
- Search/filter/pagination interactions exposed UX edge cases (for example, filtering while on later pages causing empty results unless pagination resets automatically).  
- Activity/history rendering benefits from tolerant handling because incomplete user or event information should not block visibility into operational history.

## AI tools I used and how

Used ChatGPT/Codex primarily for implementation planning, debugging direction, and validating edge-case handling. I used AI to break work into smaller tasks, reason about React state flow, defensive rendering, timestamp normalization, and UI tradeoffs. I still validated behavior manually in the app, adjusted implementation details, and tested flows such as filtering, pagination, loading/error handling, and workflow interactions to ensure the final behavior matched expectations.

## What I'd do differently with more time

I would spend more time expanding T-08 into a more useful operational workflow assistant by making `suggested_actions` smarter and more contextual instead of simple quick actions. I would also centralize normalization/parsing logic (status, timestamps, progress handling) to reduce duplication and make future maintenance easier. Finally, I would add lightweight automated tests around filtering, pagination resets, and defensive rendering to better protect against inconsistent exports and regression bugs.
