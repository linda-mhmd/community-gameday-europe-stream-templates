/**
 * Property-based tests for GameDay MainEvent AudioBadge bugfix.
 * Uses fast-check to verify AudioBadge positioning and SVG icon usage.
 *
 * Bug Condition Exploration: These tests encode the EXPECTED (fixed) behavior.
 * They FAIL on unfixed code, confirming both bugs exist:
 *   1. AudioBadge at top:16 overlaps Countdown at top:30
 *   2. AudioBadge uses emoji instead of SVG icons
 */
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import React from "react";
import { AudioBadge, GD_ACCENT, GD_ORANGE } from "../shared/GameDayDesignSystem";

const FC_CONFIG = { numRuns: 10 };

/**
 * Render AudioBadge by invoking the FC directly to get the React element tree.
 */
function renderAudioBadge(muted: boolean): React.ReactElement {
  // AudioBadge is an FC  -  call it to get the element tree
  return AudioBadge({ muted }) as React.ReactElement;
}

/**
 * Recursively collect all string content from a React element tree.
 */
function collectText(element: unknown): string {
  if (element == null || typeof element === "boolean") return "";
  if (typeof element === "string") return element;
  if (typeof element === "number") return String(element);
  if (Array.isArray(element)) return element.map(collectText).join("");
  if (typeof element === "object" && element !== null && "props" in element) {
    const el = element as { props: { children?: unknown } };
    return collectText(el.props.children);
  }
  return "";
}

/**
 * Recursively search for elements with a given type (string tag name) in the React tree.
 */
function findElementsByType(element: unknown, typeName: string): Array<{ props: Record<string, unknown> }> {
  const results: Array<{ props: Record<string, unknown> }> = [];
  if (element == null || typeof element !== "object") return results;
  if (Array.isArray(element)) {
    for (const child of element) {
      results.push(...findElementsByType(child, typeName));
    }
    return results;
  }
  const el = element as { type?: unknown; props?: { children?: unknown } };
  if (el.type === typeName) {
    results.push(el as { props: Record<string, unknown> });
  }
  if (el.props?.children) {
    results.push(...findElementsByType(el.props.children, typeName));
  }
  return results;
}


/**
 * Render a GlassCard React element by invoking the FC to get the actual div with merged styles.
 * GlassCard is a component, so we need to call it to get the rendered output.
 */
function renderGlassCard(glassCardElement: React.ReactElement): React.ReactElement {
  const gcType = glassCardElement.type as React.FC<{ children: React.ReactNode; style?: React.CSSProperties }>;
  return gcType(glassCardElement.props as { children: React.ReactNode; style?: React.CSSProperties }) as React.ReactElement;
}

describe("Feature: gameday-mainevent-bugfix", () => {
  describe("Property 1: Bug Condition  -  AudioBadge Overlap and Emoji Usage", () => {
    /**
     * **Validates: Requirements 1.1, 1.2, 1.3**
     *
     * For any muted state (true/false), the AudioBadge component SHALL:
     * - Position at bottom:16 (not top:16) to avoid overlap with Countdown at top:30
     * - Render inline SVG icons (not emoji characters 🔇/🔊)
     * - Use correct icon colors (GD_ACCENT for muted, GD_ORANGE for unmuted)
     *
     * On UNFIXED code, these tests FAIL  -  confirming both bugs exist.
     */

    it("Test 1 - Position: AudioBadge uses bottom:16, not top:16 (avoids Countdown overlap)", () => {
      fc.assert(
        fc.property(fc.boolean(), (muted) => {
          const element = renderAudioBadge(muted);
          const outerStyle = (element as React.ReactElement<{ style: React.CSSProperties }>).props.style;

          // Expected: bottom: 16 is present
          expect(outerStyle).toHaveProperty("bottom", 16);
          // Expected: top should NOT be 16 (overlap zone with Countdown at top:30)
          expect(outerStyle).not.toHaveProperty("top", 16);
        }),
        FC_CONFIG,
      );
    });

    it("Test 2 - SVG Icons: AudioBadge renders SVG, not emoji characters", () => {
      fc.assert(
        fc.property(fc.boolean(), (muted) => {
          const element = renderAudioBadge(muted);
          const text = collectText(element);

          // Expected: no emoji characters present
          expect(text).not.toContain("🔇");
          expect(text).not.toContain("🔊");

          // Expected: SVG element is present in the tree
          const svgs = findElementsByType(element, "svg");
          expect(svgs.length).toBeGreaterThan(0);
        }),
        FC_CONFIG,
      );
    });

    it("Test 3 - Icon Color: SVG icon color matches muted state", () => {
      // Test muted=true → GD_ACCENT (#c084fc)
      const mutedElement = renderAudioBadge(true);
      const mutedSvgs = findElementsByType(mutedElement, "svg");
      expect(mutedSvgs.length).toBeGreaterThan(0);
      const mutedSvgProps = mutedSvgs[0].props;
      const mutedColor = mutedSvgProps.fill || mutedSvgProps.color ||
        (mutedSvgProps.style as Record<string, unknown> | undefined)?.color;
      expect(mutedColor).toBe(GD_ACCENT);

      // Test muted=false → GD_ORANGE (#f97316)
      const unmutedElement = renderAudioBadge(false);
      const unmutedSvgs = findElementsByType(unmutedElement, "svg");
      expect(unmutedSvgs.length).toBeGreaterThan(0);
      const unmutedSvgProps = unmutedSvgs[0].props;
      const unmutedColor = unmutedSvgProps.fill || unmutedSvgProps.color ||
        (unmutedSvgProps.style as Record<string, unknown> | undefined)?.color;
      expect(unmutedColor).toBe(GD_ORANGE);
    });
  });

  describe("Property 2: Preservation  -  AudioBadge GlassCard Styling and Color Scheme", () => {
    /**
     * **Validates: Requirements 3.2, 3.3, 3.4**
     *
     * For any muted state (true/false), the AudioBadge component SHALL preserve:
     * - GlassCard wrapper with padding "8px 16px", borderRadius 12
     * - Border with correct color + "40" alpha suffix
     * - Text styling: fontSize 14, fontWeight 700, letterSpacing 2, textTransform "uppercase"
     * - Color scheme: GD_ACCENT for muted, GD_ORANGE for unmuted
     * - fontFamily includes "Inter"
     *
     * These tests PASS on unfixed code, confirming baseline styling to preserve.
     */

    it("GlassCard wrapper has padding '8px 16px' and borderRadius 12", () => {
      fc.assert(
        fc.property(fc.boolean(), (muted) => {
          const element = renderAudioBadge(muted);
          // Outer div → GlassCard element (component) → render it to get the div with merged styles
          const glassCardElement = (element.props as { children: React.ReactElement }).children;
          const glassCardDiv = renderGlassCard(glassCardElement);
          const style = (glassCardDiv.props as { style: React.CSSProperties }).style;

          expect(style.padding).toBe("8px 16px");
          expect(style.borderRadius).toBe(12);
        }),
        FC_CONFIG,
      );
    });

    it("GlassCard border contains correct color with '40' alpha suffix", () => {
      fc.assert(
        fc.property(fc.boolean(), (muted) => {
          const element = renderAudioBadge(muted);
          const glassCardElement = (element.props as { children: React.ReactElement }).children;
          const glassCardDiv = renderGlassCard(glassCardElement);
          const style = (glassCardDiv.props as { style: React.CSSProperties }).style;

          const expectedColor = muted ? GD_ACCENT : GD_ORANGE;
          expect(style.border).toBe(`1px solid ${expectedColor}40`);
        }),
        FC_CONFIG,
      );
    });

    it("Text has fontSize 14, fontWeight 700, letterSpacing 2, textTransform 'uppercase'", () => {
      fc.assert(
        fc.property(fc.boolean(), (muted) => {
          const element = renderAudioBadge(muted);
          const glassCardElement = (element.props as { children: React.ReactElement }).children;
          const glassCardDiv = renderGlassCard(glassCardElement);
          // GlassCard div → children → inner text div
          const innerDiv = (glassCardDiv.props as { children: React.ReactElement }).children as React.ReactElement;
          const textStyle = (innerDiv.props as { style: React.CSSProperties }).style;

          expect(textStyle.fontSize).toBe(14);
          expect(textStyle.fontWeight).toBe(700);
          expect(textStyle.letterSpacing).toBe(2);
          expect(textStyle.textTransform).toBe("uppercase");
        }),
        FC_CONFIG,
      );
    });

    it("Text color is GD_ACCENT when muted, GD_ORANGE when unmuted", () => {
      fc.assert(
        fc.property(fc.boolean(), (muted) => {
          const element = renderAudioBadge(muted);
          const glassCardElement = (element.props as { children: React.ReactElement }).children;
          const glassCardDiv = renderGlassCard(glassCardElement);
          const innerDiv = (glassCardDiv.props as { children: React.ReactElement }).children as React.ReactElement;
          const textStyle = (innerDiv.props as { style: React.CSSProperties }).style;

          const expectedColor = muted ? GD_ACCENT : GD_ORANGE;
          expect(textStyle.color).toBe(expectedColor);
        }),
        FC_CONFIG,
      );
    });

    it("fontFamily includes 'Inter'", () => {
      fc.assert(
        fc.property(fc.boolean(), (muted) => {
          const element = renderAudioBadge(muted);
          const glassCardElement = (element.props as { children: React.ReactElement }).children;
          const glassCardDiv = renderGlassCard(glassCardElement);
          const innerDiv = (glassCardDiv.props as { children: React.ReactElement }).children as React.ReactElement;
          const textStyle = (innerDiv.props as { style: React.CSSProperties }).style;

          expect(textStyle.fontFamily).toContain("Inter");
        }),
        FC_CONFIG,
      );
    });
  });
});
