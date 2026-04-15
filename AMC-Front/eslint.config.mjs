import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    ignores: ["node_modules", ".next", "dist"],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    extends: [js.configs.recommended],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: null,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  }
)
