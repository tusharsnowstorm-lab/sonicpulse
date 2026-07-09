import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // mobile/ is a separate Expo/React Native app with its own toolchain
    // (npx tsc --noEmit + expo export, no eslint of its own) — this
    // Next.js web config's rules (react/no-unescaped-entities on RN text,
    // no-require-imports on RN's require()-based image imports, jsx-a11y
    // rules meant for DOM <img>) don't apply to it and were never
    // satisfiable by React Native code in the first place.
    "mobile/**",
  ]),
]);

export default eslintConfig;
