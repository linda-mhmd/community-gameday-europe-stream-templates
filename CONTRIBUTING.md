# Contributing

## Who this is for

Volunteer AWS User Group leaders, community organizers, and anyone running a competitive community cloud event who wants to offer a professional live stream experience to their participants.

## License

This project is licensed under [CC BY-NC-SA 4.0](LICENSE). This means:
- You may use and adapt it for **non-commercial community events**
- You must **credit** the original authors (AWS Community GameDay Europe organizers)
- Derivative works must use the **same license**
- **Commercial use is not permitted**

## How to adapt for your own event

All event-specific data lives in `config/`. You should only need to change these four files:

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
Add user group logo URLs. See the comment block at the top of the file for the Notion-based workflow used in the 2026 edition.

## How to source user group logos

The 2026 edition used a shared Notion database:
1. Create a Notion database with one page per user group
2. Each group uploads their logo as an image attachment
3. Copy the Notion CDN URL (right-click image → copy image address)
4. Add to `config/logos.ts`

If a group has no logo, their flag emoji is shown as a fallback.

## How to contribute back

Contributions welcome:
- **New inserts**: Copy `_TEMPLATE.tsx`, customize, and submit a PR
- **Composition improvements**: Bug fixes, accessibility, performance
- **Logo additions**: New user groups added to future editions
- **Documentation**: Clearer setup instructions, troubleshooting

### Submitting a PR

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Open a pull request with a clear description

## About the ClosingWinnersTemplate automation

`src/compositions/03-closing/ClosingWinnersTemplate.tsx` contains placeholder winner data that must be updated before rendering. See `TEMPLATE.md` for the current workflow.

A future contribution idea: an API-driven workflow that automatically pulls final scores from the GameDay leaderboard and updates `PODIUM_TEAMS` without manual editing. This is documented in `LESSONS_LEARNED.md` and `TEMPLATE.md`.

## Year convention

This repository tracks editions. **2026 = first edition** of AWS Community GameDay Europe. Future editions would increment the year in `config/event.ts`. Never reference 2025  -  that is a bug.
