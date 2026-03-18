# Compositions

All video compositions for the AWS Community GameDay Europe stream.

## Event Sequence

The numbered folders follow the event in order. Each one is a standalone composition rendered from Remotion Studio and screen-shared during the event.

| Folder | ID prefix | What it is |
|--------|-----------|------------|
| `00-preshow/` | `00-` | Pre-event display before the stream starts |
| `01-main-event/` | `01-` | Opening: host intro, schedule, rules |
| `02-gameplay/` | `02-` | Background during active gameplay |
| `03-closing/` | `03A-` / `03B-` | Closing ceremony and winner reveal |

## Marketing

`marketing/` contains standalone compositions not part of the event sequence. Used for social media and promotion.

## Inserts

`inserts/` contains 30-second full-screen announcements triggered live during gameplay. They are independent of the event sequence - the stream operator switches to them on demand and returns to gameplay after.

See `inserts/README.md` for the full insert reference.

## Adding a composition

For inserts, copy `inserts/_TEMPLATE.tsx`.

For new event-sequence compositions, add a numbered folder, create the component, and register it in `src/Root.tsx`.
