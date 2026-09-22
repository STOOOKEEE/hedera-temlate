import js from "@eslint/js";
import ts from "typescript-eslint";

export default ts.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/artifacts/**",
      "**/cache/**",
      "**/next-env.d.ts",
      "**/deployments/**",
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
      },
    },
  },
  {
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        AbortSignal: "readonly",
      },
    },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    files: ["**/test/*.cjs"],
    languageOptions: {
      globals: { describe: "readonly", it: "readonly", beforeEach: "readonly" },
    },
  },
);
