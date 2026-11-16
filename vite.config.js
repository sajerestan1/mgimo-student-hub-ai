import base44 from "@base44/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const demoMode = env.VITE_DEMO_MODE === "true";

  return {
    plugins: [
      // Standalone builds must not inject Base44 editor/analytics integrations.
      ...(demoMode ? [] : [base44({
        legacySDKImports: env.BASE44_LEGACY_SDK_IMPORTS === "true",
        hmrNotifier: true,
        navigationNotifier: true,
        analyticsTracker: true,
        visualEditAgent: true,
      })]),
      react(),
    ],
  };
});
