/// See: https://wxt.dev/guide/essentials/config/runtime.html

import { defineAppConfig } from 'wxt/sandbox';

// Define types for your config
declare module 'wxt/sandbox' {
  export interface WxtAppConfig {
    theme?: 'light' | 'dark';
  }
}

export default defineAppConfig({
  theme: 'dark',
});