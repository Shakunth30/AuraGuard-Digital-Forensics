/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
      fontFamily: {
        display: ['"Orbitron"', 'system-ui', 'sans-serif'],
        heading: ['"Chakra Petch"', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', '"SFMono-Regular"', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        'cyber-wide': '0.08em',
        'cyber-widest': '0.12em',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'aurora-drift': 'auroraDrift 20s ease infinite alternate',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'blink': 'blink 1s step-start infinite',
      },
      keyframes: {
        auroraDrift: {
          '0%': { transform: 'translate(0%, 0%) rotate(0deg) scale(1)' },
          '50%': { transform: 'translate(5%, 3%) rotate(2deg) scale(1.05)' },
          '100%': { transform: 'translate(-3%, -2%) rotate(-1deg) scale(0.98)' },
        },
        glowPulse: {
          '0%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px rgba(46, 242, 192, 0.3))' },
          '100%': { opacity: '0.9', filter: 'drop-shadow(0 0 30px rgba(46, 242, 192, 0.7))' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
