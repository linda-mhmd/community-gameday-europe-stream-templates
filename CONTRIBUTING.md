# Contributing

## Who this is for

Volunteer AWS User Group leaders, community organizers, and anyone running a competitive community cloud event who wants to offer a professional live stream experience to their participants.

## License

This project is licensed under [CC BY-NC-SA 4.0](LICENSE). This means:
- You may use and adapt it for **non-commercial community events**
- You must **credit** the original authors (AWS Community GameDay Europe co-organizer Linda Mohamed)
- Derivative works must use the **same license**
- **Commercial use is not permitted**

## How to adapt for your own event

There are two scenarios:

### Scenario A — use the template as-is, change only event data

Fork [`community-gameday-europe-event`](https://github.com/linda-mhmd/community-gameday-europe-event), update the config files, push. The template repo (this one) is pulled automatically during the build. You never touch this repo.

→ See the [event repo README](https://github.com/linda-mhmd/community-gameday-europe-event) for setup steps.

### Scenario B — modify the template itself (compositions, design, new inserts)

1. Fork this repo (`community-gameday-europe-stream-templates`) and make your changes
2. Fork [`community-gameday-europe-event`](https://github.com/linda-mhmd/community-gameday-europe-event) for your event config
3. In your event repo fork, go to **Settings → Secrets and variables → Actions → Variables tab**
4. Create a repository variable:
   - **Name:** `TEMPLATE_REPO`
   - **Value:** `your-org/your-template-repo-name`
5. Push to `main` — your event repo now builds from your modified template

No workflow file edits needed.

---

All event-specific data lives in `config/`. You should only need to change these files:

### `config/event.ts`
Update event name, edition year, date, host timezone, and timing offsets:
```typescript
export const EVENT_NAME = "Your Event Name";
export const EVENT_EDITION = "2027";
export const EVENT_DATE = "2027-03-XX";
export const HOST_TIMEZONE = "CET"; // or your host's timezone
export const HOST_LOCATION = "Your City, Country";
```

### `config/schedule.ts`
Update the segment timeline to match your event's run-of-show. All times are minute offsets from event start  -  timezone-independent.

### `config/participants.ts`
Replace organizer bios, AWS supporter info, and the user group list with your event's participants. Update face image paths to match files in `public/assets/faces/`.

### `config/logos.ts`
Add user group logo URLs.


## How to contribute back

**PRs are not accepted from non-collaborators at this time.**

This is a small project maintained by one person. The design, architecture, and roadmap are intentional - unsolicited PRs will be closed without review.

Here is what you can do:

- **Bug reports** - open a GitHub issue if something is broken. Include steps to reproduce and what you expected to happen.
- **Feature suggestions** - open a GitHub issue if you have an idea for a genuinely new capability (a new insert type, a new workflow integration, etc.). Suggestions for actual new features are welcome.
- **Reach out directly** - if you want to collaborate or have something more substantial to discuss, contact me directly via GitHub or LinkedIn.

**Design is not in scope for community input.** The visual design is maintained by me and is not open for pull requests or design review requests. If you need different visuals for your own event, fork the repo and make the changes in your fork (Scenario B above).

If you are interested in becoming a collaborator, reach out and we can talk.

## About the ClosingWinnersTemplate automation

`src/compositions/03-closing/ClosingWinnersTemplate.tsx` contains placeholder winner data that must be updated before rendering. See `TEMPLATE.md` for the current workflow.

A future contribution idea: an API-driven workflow that automatically pulls final scores from the GameDay leaderboard and updates `PODIUM_TEAMS` without manual editing. This is documented in `LESSONS_LEARNED.md` and `TEMPLATE.md`.

## Year convention

This repository tracks editions. **2026 = first edition** of AWS Community GameDay Europe. Future editions would increment the year in `config/event.ts`.
