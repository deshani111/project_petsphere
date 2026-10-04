export default [
  {
    ignores: ["node_modules/**", ".next/**", "app/generated/**"],
  },
  {
    files: ["app/sitter/Profile/**/*.js", "app/sitter/reviews/**/*.js", "app/api/sitter/profile/**/*.js", "app/api/sitter/reviews/**/*.js", "modules/sitter/profile/**/*.js", "modules/sitter/reviews/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        URL: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {},
  },
];