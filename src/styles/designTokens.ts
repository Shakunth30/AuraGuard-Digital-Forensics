/**
 * AuraGuard Central Design Tokens & Cybersecurity Identity System
 * ==============================================================
 * Concept: "Aurora Glass"
 * Typography Hierarchy:
 * - Display: Orbitron (600-800) - Logo, Hero headlines, Large metrics only
 * - Headings / Labels: Chakra Petch (500-700) - Uppercase with tracking 0.04-0.12em
 * - Body: IBM Plex Sans (400-500) - High readability body text
 * - Data / Monospace: JetBrains Mono (400-700) - Hashes, IDs, timestamps, terminal
 * All fonts are self-hosted via @fontsource for 100% offline air-gapped demo fidelity.
 * Licenses: Open Font License (OFL).
 */

export const DESIGN_TOKENS = {
  colors: {
    void: {
      base: "#05070F",
      deep: "#0B1020",
      elevated: "#121A33",
      surface: "rgba(18, 26, 51, 0.65)",
    },
    aurora: {
      teal: {
        DEFAULT: "#2EF2C0",
        dark: "#19B8A6",
        glow: "rgba(46, 242, 192, 0.25)",
      },
      violet: {
        DEFAULT: "#8B6CFF",
        light: "#C4A8FF",
        glow: "rgba(139, 108, 255, 0.25)",
      },
    },
    ice: {
      blue: "#7CC4FF",
      glow: "rgba(124, 196, 255, 0.2)",
    },
    ember: {
      coral: "#FF4D5E",
      orange: "#FF8A5B",
      glow: "rgba(255, 77, 94, 0.35)",
    },
    text: {
      primary: "#EAF0FF",
      secondary: "#8FA0C7",
      muted: "#5A6E99",
    },
  },
  typography: {
    display: '"Orbitron", system-ui, sans-serif',
    heading: '"Chakra Petch", system-ui, sans-serif',
    body: '"IBM Plex Sans", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace',
  },
  statusStrings: {
    healthy: "[ STATUS: NORMAL WORKLOAD ]",
    underAttack: "[ ALERT: MITRE C2 BREACH DETECTED ]",
    quarantined: "[ STATUS: ZERO-TRUST QUARANTINED ]",
  },
} as const;

export default DESIGN_TOKENS;
