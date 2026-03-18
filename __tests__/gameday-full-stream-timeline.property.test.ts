/**
 * Property-based tests for GameDay Full Stream Timeline shared design module.
 * Uses fast-check to verify pure function correctness across all valid inputs.
 */
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { formatTime, calculateCountdown, staggeredEntry, getPhaseInfo } from "../shared/GameDayDesignSystem";
import { isAudioCueBannerVisible } from "../00-GameDayStreamPreShow-Muted";
import { isGameplayAudioCueBannerVisible, isFinal30MinutesActive, isUrgencyGlowActive, GAMEPLAY_PHASES } from "../02-GameDayStreamGameplay-Muted";
import { MAIN_EVENT_SEGMENTS } from "../01-GameDayStreamMainEvent-Audio";
// CLOSING_SEGMENTS was removed in the closing-ceremony-v2 redesign.
// The new composition uses Phase enum and PHASE_BOUNDARIES instead.

const FC_CONFIG = { numRuns: 100 };

describe("Feature: gameday-full-stream-timeline", () => {
  describe("Property 1: formatTime produces valid MM:SS format", () => {
    /**
     * **Validates: Requirements 1.5**
     *
     * For any non-negative integer totalSeconds (0 - 7200), formatTime returns
     * a string matching /^\d{2,}:\d{2}$/ with correct minute and second values.
     */
    it("for any totalSeconds in [0, 7200], formatTime returns valid MM:SS with correct values", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 7200 }), (totalSeconds) => {
          const result = formatTime(totalSeconds);

          // Must match MM:SS pattern (2+ digits for minutes since 120:00 is valid)
          expect(result).toMatch(/^\d{2,}:\d{2}$/);

          const [minStr, secStr] = result.split(":");
          const expectedMinutes = Math.floor(totalSeconds / 60);
          const expectedSeconds = totalSeconds % 60;

          // Minutes portion is correct and zero-padded to at least 2 digits
          expect(parseInt(minStr, 10)).toBe(expectedMinutes);
          expect(minStr).toBe(expectedMinutes.toString().padStart(2, "0"));

          // Seconds portion is correct and zero-padded to 2 digits
          expect(parseInt(secStr, 10)).toBe(expectedSeconds);
          expect(secStr).toBe(expectedSeconds.toString().padStart(2, "0"));
        }),
        FC_CONFIG,
      );
    });
  });

  describe("Property 2: calculateCountdown accuracy and non-negativity", () => {
    /**
     * **Validates: Requirements 3.1, 3.2, 4.2, 4.3, 4.4, 4.5, 6.5, 9.2, 11.3, 12.1, 12.6**
     *
     * For any valid frame f (0 - 216000), offset o in {0, 10, 20, 30, 60, 180},
     * and target t > o, calculateCountdown returns a non-negative integer equal to
     * Math.max(0, Math.floor((t * 60 - o * 60) - f / 30))
     */
    it("for any valid (frame, offset, target) tuple, calculateCountdown returns non-negative accurate result", () => {
      // Valid (offset, target) pairs from the spec
      const validPairs: [number, number[]][] = [
        [0, [30, 60]],
        [10, [30, 60]],
        [20, [30, 60]],
        [30, [60]],
        [60, [180]],
        [180, [195]],
      ];

      const offsetTargetGen = fc.constantFrom(
        ...validPairs.flatMap(([offset, targets]) =>
          targets.map((target) => ({ offset, target })),
        ),
      );

      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 216000 }),
          offsetTargetGen,
          (frame, { offset, target }) => {
            const result = calculateCountdown(frame, offset, target, 30);

            // Non-negativity
            expect(result).toBeGreaterThanOrEqual(0);

            // Accuracy
            const expected = Math.max(
              0,
              Math.floor(target * 60 - offset * 60 - frame / 30),
            );
            expect(result).toBe(expected);
          },
        ),
        FC_CONFIG,
      );
    });
  });

  describe("Property 6: staggeredEntry produces correct delays", () => {
    /**
     * **Validates: Requirements 3.8, 6.4, 14.2, 14.5**
     *
     * For any base frame b, index i (0 - 20), and stagger s (≥1),
     * staggeredEntry returns b + i * s. Consecutive elements with
     * default stagger are exactly 20 frames apart.
     */
    it("for any (base, index, stagger), staggeredEntry returns base + index * stagger", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          fc.integer({ min: 0, max: 20 }),
          fc.integer({ min: 1, max: 100 }),
          (base, index, stagger) => {
            const result = staggeredEntry(base, index, stagger);
            expect(result).toBe(base + index * stagger);
          },
        ),
        FC_CONFIG,
      );
    });

    it("consecutive elements with default stagger are exactly 20 frames apart", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          fc.integer({ min: 0, max: 19 }),
          (base, index) => {
            const diff = staggeredEntry(base, index + 1) - staggeredEntry(base, index);
            expect(diff).toBe(20);
          },
        ),
        FC_CONFIG,
      );
    });
  });

  describe("Property 7: Audio cue banner visibility by frame range (PreShow portion)", () => {
    /**
     * **Validates: Requirements 3.6**
     *
     * For any frame f in [0, 17999], the audio cue banner is visible
     * if and only if f >= 14400.
     */
    it("for any frame in [0, 17999], audio cue banner is visible iff frame >= 14400", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 17999 }), (frame) => {
          expect(isAudioCueBannerVisible(frame)).toBe(frame >= 14400);
        }),
        FC_CONFIG,
      );
    });
  });

  describe("Property 7: Audio cue banner visibility by frame range (Gameplay portion)", () => {
    /**
     * **Validates: Requirements 9.8**
     *
     * For any frame f in [0, 215999], the audio cue banner is visible
     * if and only if f >= 207000.
     */
    it("for any frame in [0, 215999], audio cue banner is visible iff frame >= 207000", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 215999 }), (frame) => {
          expect(isGameplayAudioCueBannerVisible(frame)).toBe(frame >= 207000);
        }),
        FC_CONFIG,
      );
    });
  });

  describe("Property 4: Segment contiguity  -  no gaps or overlaps", () => {
    /**
     * **Validates: Requirements 6.1, 11.1**
     *
     * For MainEvent, Gameplay, and Closing segment arrays: first segment starts at 0,
     * last ends at composition final frame, consecutive segments satisfy
     * s[i+1].startFrame === s[i].endFrame + 1.
     *
     * Currently only MainEvent segments are available; Gameplay and Closing
     * will be added when those compositions are implemented.
     */
    it("MAIN_EVENT_SEGMENTS: first segment starts at frame 0", () => {
      expect(MAIN_EVENT_SEGMENTS[0].startFrame).toBe(0);
    });

    it("MAIN_EVENT_SEGMENTS: last segment ends at composition final frame (53999)", () => {
      expect(MAIN_EVENT_SEGMENTS[MAIN_EVENT_SEGMENTS.length - 1].endFrame).toBe(53999);
    });

    it("MAIN_EVENT_SEGMENTS: consecutive segments have no gaps or overlaps", () => {
      for (let i = 0; i < MAIN_EVENT_SEGMENTS.length - 1; i++) {
        expect(MAIN_EVENT_SEGMENTS[i + 1].startFrame).toBe(
          MAIN_EVENT_SEGMENTS[i].endFrame + 1,
        );
      }
    });

    it("GAMEPLAY_PHASES: first segment starts at frame 0", () => {
      expect(GAMEPLAY_PHASES[0].startFrame).toBe(0);
    });

    it("GAMEPLAY_PHASES: last segment ends at composition final frame (215999)", () => {
      expect(GAMEPLAY_PHASES[GAMEPLAY_PHASES.length - 1].endFrame).toBe(215999);
    });

    it("GAMEPLAY_PHASES: consecutive segments have no gaps or overlaps", () => {
      for (let i = 0; i < GAMEPLAY_PHASES.length - 1; i++) {
        expect(GAMEPLAY_PHASES[i + 1].startFrame).toBe(
          GAMEPLAY_PHASES[i].endFrame + 1,
        );
      }
    });

    // CLOSING_SEGMENTS tests removed  -  the closing-ceremony-v2 redesign
    // replaced segment-based architecture with Phase enum + PHASE_BOUNDARIES.
  });

  describe("Property 5: Phase info correctness", () => {
    /**
     * **Validates: Requirements 7.1, 9.7**
     *
     * For any frame f within a composition's segment range, getPhaseInfo returns
     * non-empty name and progress p where 0 ≤ p ≤ 1, matching
     * (f - seg.startFrame) / (seg.endFrame - seg.startFrame + 1)
     */
    it("for any frame in MainEvent range, getPhaseInfo returns non-empty name and correct progress", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 53999 }), (frame) => {
          const result = getPhaseInfo(frame, MAIN_EVENT_SEGMENTS);

          // Name must be a non-empty string
          expect(typeof result.name).toBe("string");
          expect(result.name.length).toBeGreaterThan(0);

          // Progress must be between 0 and 1 (inclusive)
          expect(result.progress).toBeGreaterThanOrEqual(0);
          expect(result.progress).toBeLessThanOrEqual(1);

          // Find the segment containing this frame and verify progress formula
          const seg = MAIN_EVENT_SEGMENTS.find(
            (s) => frame >= s.startFrame && frame <= s.endFrame,
          );
          expect(seg).toBeDefined();

          const expectedProgress =
            (frame - seg!.startFrame) / (seg!.endFrame - seg!.startFrame + 1);
          expect(result.progress).toBeCloseTo(expectedProgress, 10);
        }),
        FC_CONFIG,
      );
    });

    it("for any frame in Gameplay range, getPhaseInfo returns non-empty name and correct progress", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 215999 }), (frame) => {
          const result = getPhaseInfo(frame, GAMEPLAY_PHASES);
          expect(typeof result.name).toBe("string");
          expect(result.name.length).toBeGreaterThan(0);
          expect(result.progress).toBeGreaterThanOrEqual(0);
          expect(result.progress).toBeLessThanOrEqual(1);

          const seg = GAMEPLAY_PHASES.find(
            (s) => frame >= s.startFrame && frame <= s.endFrame,
          );
          expect(seg).toBeDefined();
          const expectedProgress =
            (frame - seg!.startFrame) / (seg!.endFrame - seg!.startFrame + 1);
          expect(result.progress).toBeCloseTo(expectedProgress, 10);
        }),
        FC_CONFIG,
      );
    });

    // Closing range test removed  -  CLOSING_SEGMENTS no longer exists after
    // the closing-ceremony-v2 redesign. Phase gating is now tested via
    // closing-ceremony-v2.property.test.ts Property 1.
  });

  describe("Property 8: Gameplay urgency thresholds", () => {
    /**
     * **Validates: Requirements 9.4, 9.5**
     *
     * For any frame f in [0, 215999]: "Final 30 Minutes" active iff f >= 162000;
     * pulsing glow active iff f >= 207000; glow implies "Final 30 Minutes".
     */
    it("for any frame in [0, 215999], isFinal30MinutesActive iff frame >= 162000", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 215999 }), (frame) => {
          expect(isFinal30MinutesActive(frame)).toBe(frame >= 162000);
        }),
        FC_CONFIG,
      );
    });

    it("for any frame in [0, 215999], isUrgencyGlowActive iff frame >= 207000", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 215999 }), (frame) => {
          expect(isUrgencyGlowActive(frame)).toBe(frame >= 207000);
        }),
        FC_CONFIG,
      );
    });

    it("for any frame in [0, 215999], urgency glow implies Final 30 Minutes", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 215999 }), (frame) => {
          if (isUrgencyGlowActive(frame)) {
            expect(isFinal30MinutesActive(frame)).toBe(true);
          }
        }),
        FC_CONFIG,
      );
    });
  });
});
