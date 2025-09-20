import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**/*",
      "node_modules/**/*",
      "dist/**/*",
      "build/**/*",
      "out/**/*",
      "*.js",
      "*.mjs",
      "scripts/**/*",
      "server.js",
      "*.config.js",
      "*.config.mjs",
      "tailwind.config.ts",
      "next-env.d.ts"
    ]
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "react/no-unescaped-entities": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      "prefer-const": "error",
      "react-hooks/exhaustive-deps": "error",
      "@next/next/no-img-element": "error",
      "no-console": "warn",
      "no-debugger": "error",
      "no-var": "error",
      eqeqeq: "error",
    },
  },
];

export default eslintConfig;
