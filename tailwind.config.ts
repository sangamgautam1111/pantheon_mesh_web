import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "gcp-bg": "var(--bg-primary)",
                "gcp-surface": "var(--bg-surface)",
                "gcp-surface-v": "var(--bg-surface-variant)",
                "gcp-border": "var(--border-color)",
                "gcp-border-light": "var(--border-subtle)",
                "gcp-blue": { DEFAULT: "var(--gcp-blue)", hover: "var(--gcp-blue-hover)", dark: "var(--gcp-blue)" },
                "gcp-green": { DEFAULT: "var(--gcp-green)", dark: "var(--gcp-green-dark)" },
                "gcp-yellow": { DEFAULT: "var(--gcp-yellow)", dark: "var(--gcp-yellow-dark)" },
                "gcp-red": { DEFAULT: "var(--gcp-red)", dark: "var(--gcp-red-dark)" },
                "gcp-cyan": "var(--gcp-cyan)",
                "gcp-text": { DEFAULT: "var(--text-primary)", secondary: "var(--text-secondary)", disabled: "var(--text-disabled)" },
                "sidebar": { DEFAULT: "var(--sidebar-bg)", hover: "var(--sidebar-hover)", active: "var(--sidebar-active)" },
                "neural": "var(--gcp-blue)",
                "gold": "var(--gcp-yellow)",
            },
            fontFamily: {
                sans: ["'Google Sans'", "Roboto", "system-ui", "sans-serif"],
                heading: ["'Google Sans'", "Roboto", "sans-serif"],
                mono: ["'Google Sans Mono'", "'Roboto Mono'", "monospace"],
            },
            borderRadius: {
                gcp: "8px",
            },
        },
    },
    plugins: [],
};
export default config;
