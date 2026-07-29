import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

// Pinoox Design System — PrimeVue preset
// Primary: #0E73FD, sky alias chain.

const ConsolePreset = definePreset(Aura, {
    semantic: {
        focusRing: {
            width: '3px',
            style: 'solid',
            color: 'rgba(14, 115, 253, 0.32)',
            offset: '0',
            shadow: 'none',
        },
        primary: {
            50: '#EEF5FF',
            100: '#DBE7FE',
            200: '#B6CEFD',
            300: '#8BB1FB',
            400: '#5F95F9',
            500: '#0E73FD',
            600: '#0858D4',
            700: '#0644A8',
            800: '#053580',
            900: '#03245A',
            950: '#02153A',
        },
        borderRadius: {
            none: '0',
            xs: '8px',
            sm: '12px',
            md: '16px',
            lg: '20px',
            xl: '28px',
        },
        colorScheme: {
            light: {
                surface: {
                    0: '#ffffff',
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A',
                    950: '#020617',
                },
            },
            dark: {
                surface: {
                    0: '#050811',
                    50: '#0B1220',
                    100: '#111827',
                    200: '#1F2937',
                    300: '#273449',
                    400: '#334155',
                    500: '#475569',
                    600: '#64748B',
                    700: '#94A3B8',
                    800: '#CBD5E1',
                    900: '#E2E8F0',
                    950: '#F8FAFC',
                },
            },
        },
    },
});

export default ConsolePreset;