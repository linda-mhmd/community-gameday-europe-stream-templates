/**
 * Property-based exploration tests for Design System Bugfix.
 * Uses fast-check to verify AWS supporter color usage and typography scale.
 *
 * Bug Condition Exploration: These tests encode the EXPECTED (fixed) behavior.
 * They FAIL on unfixed code, confirming both bugs exist:
 *   1. Scene 4b uses GD_ACCENT for AWS supporter elements instead of GD_ORANGE
 *   2. No TYPOGRAPHY export exists in the design system
 */
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import * as fs from "fs";
import * as path from "path";
import { GD_ACCENT, GD_ORANGE } from "../shared/GameDayDesignSystem";
import { AWS_SUPPORTERS } from "../shared/organizers";

const FC_CONFIG = { numRuns: 20 };

// Read source files once for inspection
const closingSource = fs.readFileSync(
  path.resolve(__dirname, "../03-GameDayStreamClosing-Audio.tsx"),
  "utf-8",
);
const designSystemSource = fs.readFileSync(
  path.resolve(__dirname, "../shared/GameDayDesignSystem.tsx"),
  "utf-8",
);

/**
 * Extract Scene 4b JSX rendering block from the closing file.
 * This is the block between "{/* ── SCENE 4b:" and "{/* ── SCENE 5:".
 */
function getScene4bJSX(): string {
  const jsxMarker = "{/* ── SCENE 4b:";
  const scene5Marker = "{/* ── SCENE 5:";
  const start = closingSource.indexOf(jsxMarker);
  const end = closingSource.indexOf(scene5Marker, start);
  if (start === -1 || end === -1) {
    throw new Error("Could not locate Scene 4b JSX block in source");
  }
  return closingSource.slice(start, end);
}

const scene4bJSX = getScene4bJSX();

describe("Feature: design-system-bugfix", () => {
  describe("Property 1: Bug Condition  -  AWS Supporter Color Mismatch in Scene 4b", () => {
    /**
     * **Validates: Requirements 1.1, 1.2, 2.1, 2.2**
     *
     * For all AWS supporters (`type: "aws"`), Scene 4b title "Thank You, AWS" color,
     * card boxShadow/border, and supporter country text color SHALL use GD_ORANGE
     * (#f97316), not GD_ACCENT (#c084fc).
     *
     * On UNFIXED code, these tests FAIL  -  confirming the color mismatch bug exists.
     */

    it("Test 1 - 'Thank You, AWS' title color uses GD_ORANGE, not GD_ACCENT", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...AWS_SUPPORTERS),
          (supporter) => {
            expect(supporter.type).toBe("aws");

            // The "Thank You, AWS" title must exist in Scene 4b JSX
            expect(scene4bJSX).toContain("Thank You, AWS");

            // Extract the title styling block (the div containing "Thank You, AWS")
            const thankYouIdx = scene4bJSX.indexOf("Thank You, AWS");
            const titleBlock = scene4bJSX.slice(
              Math.max(0, thankYouIdx - 200),
              thankYouIdx,
            );

            // The color for the title should be GD_ORANGE, not GD_ACCENT
            expect(titleBlock).toContain("GD_ORANGE");
            expect(titleBlock).not.toContain("color: GD_ACCENT");
          },
        ),
        FC_CONFIG,
      );
    });

    it("Test 2 - AWS supporter card boxShadow uses GD_ORANGE, not GD_ACCENT", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...AWS_SUPPORTERS),
          (supporter) => {
            expect(supporter.type).toBe("aws");

            // Find boxShadow in Scene 4b JSX
            const boxShadowRegex = /boxShadow:.*?`,/gs;
            const matches = scene4bJSX.match(boxShadowRegex) || [];
            expect(matches.length).toBeGreaterThan(0);

            for (const match of matches) {
              // boxShadow should use GD_ORANGE, not GD_ACCENT
              expect(match).toContain("GD_ORANGE");
              expect(match).not.toContain("GD_ACCENT");
            }
          },
        ),
        FC_CONFIG,
      );
    });

    it("Test 3 - AWS supporter card border uses GD_ORANGE, not GD_ACCENT", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...AWS_SUPPORTERS),
          (supporter) => {
            expect(supporter.type).toBe("aws");

            // Find border with template literal in Scene 4b JSX (card border, not the "And many more" box)
            const borderRegex = /border: `[^`]*\$\{[^}]+\}[^`]*`/g;
            const matches = scene4bJSX.match(borderRegex) || [];
            expect(matches.length).toBeGreaterThan(0);

            for (const match of matches) {
              // border should use GD_ORANGE, not GD_ACCENT
              expect(match).toContain("GD_ORANGE");
              expect(match).not.toContain("GD_ACCENT");
            }
          },
        ),
        FC_CONFIG,
      );
    });

    it("Test 4 - AWS supporter country text color uses GD_ORANGE, not GD_ACCENT", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...AWS_SUPPORTERS),
          (supporter) => {
            expect(supporter.type).toBe("aws");

            // Find the country text block near "person.country"
            const countryIdx = scene4bJSX.indexOf("person.country");
            expect(countryIdx).toBeGreaterThan(-1);

            // Extract the styling block before person.country
            const beforeCountry = scene4bJSX.slice(
              Math.max(0, countryIdx - 150),
              countryIdx,
            );

            // The color for country text should be GD_ORANGE, not GD_ACCENT
            expect(beforeCountry).toContain("GD_ORANGE");
            expect(beforeCountry).not.toContain("color: GD_ACCENT");
          },
        ),
        FC_CONFIG,
      );
    });
  });

  describe("Property 3: Bug Condition  -  Typography Scale Defined", () => {
    /**
     * **Validates: Requirements 1.3, 2.3**
     *
     * The design system SHALL export a TYPOGRAPHY constant with all 17 expected keys.
     *
     * On UNFIXED code, this test FAILS  -  confirming no typography scale exists.
     */

    const EXPECTED_TYPOGRAPHY_KEYS = [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "body", "bodySmall",
      "caption", "captionSmall",
      "label", "labelSmall",
      "overline",
      "stat", "timer", "timerSmall", "flag",
    ];

    it("Test 5 - TYPOGRAPHY is exported from GameDayDesignSystem with all 17 keys", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...EXPECTED_TYPOGRAPHY_KEYS),
          (key) => {
            // TYPOGRAPHY should be exported from the design system source
            expect(designSystemSource).toContain("export const TYPOGRAPHY");

            // Attempt to dynamically import and verify the key exists
            let TYPOGRAPHY: Record<string, number> | undefined;
            try {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const designSystem = require("../shared/GameDayDesignSystem");
              TYPOGRAPHY = designSystem.TYPOGRAPHY;
            } catch {
              // If require fails, source check above already failed
            }

            if (TYPOGRAPHY) {
              expect(TYPOGRAPHY).toHaveProperty(key);
              expect(typeof TYPOGRAPHY[key]).toBe("number");
              expect(TYPOGRAPHY[key]).toBeGreaterThan(0);
            }
          },
        ),
        FC_CONFIG,
      );
    });
  });
});


// ── Preservation Property Tests (Task 2) ──
// These tests capture baseline behavior on UNFIXED code.
// They MUST PASS on unfixed code, confirming behavior to preserve.

import {
  GD_DARK, GD_PURPLE, GD_VIOLET, GD_PINK, GD_GOLD,
  BackgroundLayer, HexGridOverlay, GlassCard, AudioBadge,
} from "../shared/GameDayDesignSystem";
import { ORGANIZERS } from "../shared/organizers";

const preShowInfoSource = fs.readFileSync(
  path.resolve(__dirname, "../04-GameDayStreamPreShowInfo-Muted.tsx"),
  "utf-8",
);

/**
 * Extract Scene 4 (community organizers) JSX block from the closing file.
 * This is the block between "{/* ── SCENE 4: Organizer shoutout" and "{/* ── SCENE 4b:".
 */
function getScene4JSX(): string {
  const scene4Marker = "{/* ── SCENE 4: Organizer shoutout";
  const scene4bMarker = "{/* ── SCENE 4b:";
  const start = closingSource.indexOf(scene4Marker);
  const end = closingSource.indexOf(scene4bMarker, start);
  if (start === -1 || end === -1) {
    throw new Error("Could not locate Scene 4 JSX block in source");
  }
  return closingSource.slice(start, end);
}

const scene4JSX = getScene4JSX();

describe("Feature: design-system-bugfix  -  Preservation", () => {
  describe("Property 2: Preservation  -  Community Organizer Colors and Design System Exports Unchanged", () => {
    /**
     * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
     *
     * Preservation tests verify baseline behavior that must remain unchanged after the fix.
     * These tests PASS on unfixed code, confirming the behavior to preserve.
     */

    it("Preservation 1 - Scene 4 community organizer card glow uses GD_VIOLET/GD_PURPLE, never GD_ORANGE", () => {
      /**
       * **Validates: Requirements 3.1**
       *
       * For all community organizers, Scene 4 card styling uses GD_VIOLET/GD_PURPLE
       * for boxShadow glow (never GD_ORANGE).
       */
      fc.assert(
        fc.property(
          fc.constantFrom(...ORGANIZERS),
          (organizer) => {
            expect(organizer.type).toBe("community");

            // Scene 4 must contain the community organizer section
            expect(scene4JSX).toContain("ORGANIZERS.map");

            // Find boxShadow in Scene 4 JSX (community organizer cards)
            const boxShadowRegex = /boxShadow:.*?`,/gs;
            const matches = scene4JSX.match(boxShadowRegex) || [];
            expect(matches.length).toBeGreaterThan(0);

            for (const match of matches) {
              // Community organizer card glow uses GD_VIOLET and GD_PURPLE
              expect(match).toContain("GD_VIOLET");
              expect(match).toContain("GD_PURPLE");
              // Community organizer card glow must NEVER use GD_ORANGE
              expect(match).not.toContain("GD_ORANGE");
            }
          },
        ),
        FC_CONFIG,
      );
    });

    it("Preservation 2 - 04-GameDayStreamPreShowInfo-Muted.tsx uses GD_ORANGE for AWS border/role differentiation", () => {
      /**
       * **Validates: Requirements 3.5**
       *
       * The pre-show info file already correctly uses GD_ORANGE for type: "aws"
       * border and role text differentiation.
       */
      fc.assert(
        fc.property(
          fc.constantFrom("border", "role"),
          (element) => {
            if (element === "border") {
              // The border uses a ternary: p.type === "aws" ? GD_ORANGE : GD_PURPLE
              expect(preShowInfoSource).toContain('p.type === "aws" ? GD_ORANGE : GD_PURPLE');
            }
            if (element === "role") {
              // The role text color uses a ternary: p.type === "aws" ? GD_ORANGE : GD_ACCENT
              expect(preShowInfoSource).toContain('p.type === "aws" ? GD_ORANGE : GD_ACCENT');
            }
          },
        ),
        FC_CONFIG,
      );
    });

    it("Preservation 3 - All 7 color constants exported with unchanged hex values", () => {
      /**
       * **Validates: Requirements 3.3**
       *
       * All 7 color constants (GD_DARK, GD_PURPLE, GD_VIOLET, GD_PINK, GD_ACCENT,
       * GD_ORANGE, GD_GOLD) are exported from the design system with their expected hex values.
       */
      const EXPECTED_COLORS: Array<{ name: string; hex: string; value: string }> = [
        { name: "GD_DARK", hex: "#0c0820", value: GD_DARK },
        { name: "GD_PURPLE", hex: "#6c3fa0", value: GD_PURPLE },
        { name: "GD_VIOLET", hex: "#8b5cf6", value: GD_VIOLET },
        { name: "GD_PINK", hex: "#d946ef", value: GD_PINK },
        { name: "GD_ACCENT", hex: "#c084fc", value: GD_ACCENT },
        { name: "GD_ORANGE", hex: "#f97316", value: GD_ORANGE },
        { name: "GD_GOLD", hex: "#fbbf24", value: GD_GOLD },
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...EXPECTED_COLORS),
          (color) => {
            // The color constant must be exported in the design system source
            expect(designSystemSource).toContain(`export const ${color.name} = "${color.hex}"`);
            // The runtime value must match the expected hex
            expect(color.value).toBe(color.hex);
          },
        ),
        FC_CONFIG,
      );
    });

    it("Preservation 4 - All 4 shared components are exported from the design system", () => {
      /**
       * **Validates: Requirements 3.4**
       *
       * BackgroundLayer, HexGridOverlay, GlassCard, and AudioBadge are all exported
       * from the design system as functional components.
       */
      const EXPECTED_COMPONENTS = [
        { name: "BackgroundLayer", ref: BackgroundLayer },
        { name: "HexGridOverlay", ref: HexGridOverlay },
        { name: "GlassCard", ref: GlassCard },
        { name: "AudioBadge", ref: AudioBadge },
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...EXPECTED_COMPONENTS),
          (component) => {
            // The component must be exported in the design system source
            expect(designSystemSource).toContain(`export const ${component.name}`);
            // The runtime reference must be a function (React component)
            expect(typeof component.ref).toBe("function");
          },
        ),
        FC_CONFIG,
      );
    });
  });
});
