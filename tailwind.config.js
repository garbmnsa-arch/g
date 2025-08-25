/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "gradient": "gradient 15s ease infinite",
        "spin-slow": "spin 20s linear infinite",
        "toast-in": "toast-slide-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "toast-out": "toast-slide-out 0.2s cubic-bezier(0.55, 0.085, 0.68, 0.53)",
        "bounce-gentle": "bounce-gentle 0.6s ease-out",
      },
      keyframes: {
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "toast-slide-in": {
          "0%": { 
            transform: "translateY(100%) scale(0.95)", 
            opacity: "0" 
          },
          "100%": { 
            transform: "translateY(0) scale(1)", 
            opacity: "1" 
          },
        },
        "toast-slide-out": {
          "0%": { 
            transform: "translateY(0) scale(1)", 
            opacity: "1" 
          },
          "100%": { 
            transform: "translateY(100%) scale(0.95)", 
            opacity: "0" 
          },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
}

