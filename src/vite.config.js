import { defineConfig } from "vite";
import builtins from 'rollup-plugin-node-builtins';

const builtinsPlugin = builtins({crypto: true});
builtinsPlugin.name = 'builtins';

export default defineConfig({
  rollupInputOptions: {
    plugins: [
      builtinsPlugin
    ]
  }
});