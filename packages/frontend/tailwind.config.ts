export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        merriweather: ['Merriweather', 'serif'],
        openSans: ['Open Sans', 'sans-serif'],
      },
      backgroundImage: {
        'custom-gradient': 'linear-gradient(112deg, rgb(153, 86, 232) 0%, rgb(53, 0, 100) 100%)',
      },
      colors: {
        bg: {
          200: '#A779D1',
          300: '#7138A5',
          400: '#3B0070',
          500: '#2B094A',
        },

        pink: {
          200: '#F795FF',
          300: '#F365FF',
          400: '#E811FB',
          500: '#AE00BD',
          600: '#6B0B74',
          700: '#3F0044',
        },
        violet: {
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        primary: {
          DEFAULT: 'rgba(164, 86, 251, 1)',
        },
        primaryLightText: {
          DEFAULT: 'rgb(170, 147, 195)',
        },
        primaryLight: {
          DEFAULT: 'rgba(164, 86, 251, 0.1)',
        },
        primaryDark: {
          DEFAULT: 'rgb(28, 20, 39)',
        },
        primaryButtonDark: {
          DEFAULT: 'rgb(52, 39, 66)',
        },
        bgDark: {
          DEFAULT: 'rgba(22, 18, 27, 0.8)',
        },
        borderViolet: {
          DEFAULT: 'rgb(62, 49, 77)',
        },
        cardBackground: {
          DEFAULT: 'rgb(18, 14, 22)',
        },
        green: {
          DEFAULT: 'rgba(23, 219, 78, 1)',
        },
        greenDark: {
          DEFAULT: 'rgba(45, 106, 69, 1)',
        },
        greenButton: {
          DEFAULT: 'rgb(56, 168, 65)',
        },
        greenLight: {
          DEFAULT: 'rgba(210, 232, 212, 1)',
        },
        white: {
          DEFAULT: 'rgba(255, 255, 255, 1)',
        },
        red: {
          DEFAULT: 'rgba(255, 0, 0, 1)',
        },

        greyLight: {
          DEFAULT: 'rgb(221, 223, 231)',
        },
        greyDark: {
          DEFAULT: 'rgba(192, 201, 191, 1)',
        },
        greyText: {
          DEFAULT: 'rgb(55, 55, 55)',
        },
      },
    },
  },
  plugins: [],
};
