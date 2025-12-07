/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(220 13% 91%)",
        input: "hsl(220 13% 91%)",
        ring: "hsl(160 84% 39%)",
        background: "hsl(210 20% 98%)",
        foreground: "hsl(222 47% 11%)",
        primary: {
          DEFAULT: "hsl(160 84% 39%)",
          foreground: "hsl(0 0% 100%)",
          50: "hsl(160 84% 95%)",
          100: "hsl(160 84% 90%)",
          200: "hsl(160 84% 80%)",
          300: "hsl(160 84% 60%)",
          400: "hsl(160 84% 50%)",
          500: "hsl(160 84% 39%)",
          600: "hsl(160 84% 32%)",
          700: "hsl(160 84% 25%)",
        },
        secondary: {
          DEFAULT: "hsl(210 20% 96%)",
          foreground: "hsl(222 47% 11%)",
        },
        muted: {
          DEFAULT: "hsl(210 20% 96%)",
          foreground: "hsl(215 16% 47%)",
        },
        accent: {
          DEFAULT: "hsl(160 84% 39%)",
          foreground: "hsl(0 0% 100%)",
        },
        destructive: {
          DEFAULT: "hsl(0 72% 51%)",
          foreground: "hsl(0 0% 100%)",
        },
        sidebar: {
          DEFAULT: "hsl(222 47% 11%)",
          foreground: "hsl(0 0% 100%)",
          hover: "hsl(222 47% 18%)",
          border: "hsl(222 47% 20%)",
        },
        slate: {
          50: "hsl(210 20% 98%)",
          100: "hsl(210 20% 96%)",
          200: "hsl(214 32% 91%)",
          300: "hsl(213 27% 84%)",
          400: "hsl(215 20% 65%)",
          500: "hsl(215 16% 47%)",
          600: "hsl(215 19% 35%)",
          700: "hsl(215 25% 27%)",
          800: "hsl(217 33% 17%)",
          900: "hsl(222 47% 11%)",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.12)',
        'primary': '0 4px 14px 0 rgba(16, 185, 129, 0.15)',
        'primary-lg': '0 8px 24px 0 rgba(16, 185, 129, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

