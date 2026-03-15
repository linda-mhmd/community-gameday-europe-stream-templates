# Implementation Plan: Closing Podium Template

## Overview

Split the closing ceremony into two independent compositions (Part A: fixed content, Part B: winners template) with a shared utilities module, and redesign the podium as a bottom-aligned bar-chart layout. All code is TypeScript/React using Remotion.

## Tasks

- [x] 1. Create shared utilities module
  - [x] 1.1 Create `shared/closing-utils.ts` with Phase enum, PHASE_BOUNDARIES, REVEAL_SCHEDULE, REVEAL_FRAMES, and all pure utility functions (getActivePhase, isTransitionFrame, getFadeOpacity, getCountUpValue, getPodiumBarHeight, getRevealedPlacements, getShowcasePage, getAllShowcasePages, getShuffleCycleSpeed)
    - Export the TeamData interface with the new `country` field
    - Export PODIUM_TEAMS placeholder data ("Team #1" through "Team #6", no lorem ipsum, distinct descending scores)
    - Export WINNING_CITY_TEAMS placeholder data with same conventions
    - Export all composition constants (WIDTH, HEIGHT, FPS, TOTAL_FRAMES, etc.)
    - _Requirements: 2.2, 2.3, 2.4, 6.1, 6.4_

  - [ ]* 1.2 Write property test: TeamData Interface Completeness
    - **Property 2: TeamData Interface Completeness**
    - **Validates: Requirements 2.2**

  - [ ]* 1.3 Write property test: Placeholder Data Validity
    - **Property 3: Placeholder Data Validity**
    - **Validates: Requirements 2.3, 2.4**

  - [ ]* 1.4 Write property test: Podium Bar Height Proportionality
    - **Property 4: Podium Bar Height Proportionality**
    - **Validates: Requirements 3.2**

  - [ ]* 1.5 Write property test: Reveal Ordering
    - **Property 5: Reveal Ordering**
    - **Validates: Requirements 4.1, 4.8**

  - [ ]* 1.6 Write property test: Total Frame Budget
    - **Property 6: Total Frame Budget**
    - **Validates: Requirements 5.1**

  - [ ]* 1.7 Write property test: Backward Compatibility Re-exports
    - **Property 8: Backward Compatibility Re-exports**
    - **Validates: Requirements 6.4**

- [x] 2. Checkpoint - Ensure shared module and property tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Create Part A composition (03a-ClosingFixed.tsx)
  - [x] 3.1 Create `03a-ClosingFixed.tsx` containing HeroIntro (Scenes 1-5) and FastScroll components extracted from the current closing file
    - Import Phase, boundaries, and utilities from `shared/closing-utils.ts`
    - Export `GameDayClosingFixed` as the main composition (1900 frames, 1280×720, 30fps)
    - Export `ClosingShowcase` as a standalone sub-composition for Remotion Studio preview
    - Ensure zero references to PODIUM_TEAMS, WINNING_CITY_TEAMS, or any winner data
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 3.2 Write property test: Part A Contains Zero Winner Data References
    - **Property 1: Part A Contains Zero Winner Data References**
    - **Validates: Requirements 1.2**

- [ ] 4. Create Part B composition (03b-ClosingWinners.tsx)
  - [~] 4.1 Create `03b-ClosingWinners.tsx` with the Shuffle phase (frames 0-1799)
    - Import TeamData, PODIUM_TEAMS, utilities from `shared/closing-utils.ts`
    - Use GlassCard, springConfig, TYPOGRAPHY, and GD palette colors from GameDayDesignSystem
    - _Requirements: 2.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [~] 4.2 Implement PodiumBar component and bar-chart podium layout in `03b-ClosingWinners.tsx`
    - Bottom-aligned bars with heights proportional to score/maxScore via getPodiumBarHeight
    - Primary row (1st, 2nd, 3rd) at full opacity; secondary row (4th, 5th, 6th) at reduced opacity (0.5-0.8)
    - Each bar displays: rank badge, logo/flag fallback, team name (largest text), city, country, score
    - PODIUM title in top 15% of viewport
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [~] 4.3 Implement Reveal animation sequence in `03b-ClosingWinners.tsx`
    - 6th→5th→4th quick reveals (600 frames each, reduced opacity bars with spring rise)
    - 3rd→2nd→1st dramatic reveals (1200 frames each: bar-rise → country fade-in → UG name+logo fade-in)
    - Roll call: all 6 team names displayed sequentially 6th→1st (frames 7200-7799)
    - Use springConfig.emphasis for top-3 bar animations
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [~] 4.4 Implement ThankYou phase and fade-to-black in `03b-ClosingWinners.tsx` (frames 7800-8999)
    - Export `GameDayClosingWinners` as main composition (9000 frames, 1280×720, 30fps)
    - Export standalone sub-compositions: `ClosingReveal`, `ClosingFinalStandings`, `ClosingTeamPodium`, `ClosingThankYou`
    - _Requirements: 2.1, 2.5, 5.1, 5.7_

  - [ ]* 4.5 Write property test: Design System Compliance
    - **Property 7: Design System Compliance**
    - **Validates: Requirements 5.2, 5.4, 5.5**

- [~] 5. Checkpoint - Ensure Part A and Part B compile and all property tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Update Root.tsx and clean up old file
  - [~] 6.1 Update `src/Root.tsx` to remove old GameDayClosing import and register new compositions
    - Import `GameDayClosingFixed`, `ClosingShowcase` from `03a-ClosingFixed`
    - Import `GameDayClosingWinners`, `ClosingReveal`, `ClosingFinalStandings`, `ClosingTeamPodium`, `ClosingThankYou` from `03b-ClosingWinners`
    - Register `GameDayClosingFixed` (1900 frames) and `GameDayClosingWinners` (9000 frames) at 1280×720, 30fps
    - Keep sub-composition registrations with same IDs pointing to new source files
    - _Requirements: 1.5, 2.6, 6.2, 6.3_

  - [~] 6.2 Move `03-GameDayStreamClosing-Audio.tsx` to `archive/` for reference
    - _Requirements: 6.2_

- [~] 7. Final checkpoint - Ensure all tests pass and compositions render
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- All property tests go in `__tests__/closing-podium-template.property.test.ts` using fast-check
- The design uses TypeScript/React (Remotion) throughout — no language selection needed
