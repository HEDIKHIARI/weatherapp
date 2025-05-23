module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  },
  extends: [
    "eslint:recommended",
    "google"
  ],
  rules: {
    "max-len": ["error", {
      "code": 120,
      "ignoreComments": true,
      "ignoreStrings": true,
      "ignoreTemplateLiterals": true
    }],
    "indent": ["error", 2, {
      "SwitchCase": 1,
      "MemberExpression": 1,
      "FunctionDeclaration": { "parameters": "first" },
      "FunctionExpression": { "parameters": "first" },
      "CallExpression": { "arguments": "first" }
    }],
    "quotes": ["error", "double", {
      "avoidEscape": true,
      "allowTemplateLiterals": true
    }],
    "comma-dangle": ["error", "never"],
    "no-trailing-spaces": ["error", {
      "skipBlankLines": false,
      "ignoreComments": false
    }],
    "eol-last": ["error", "always"],
    "require-jsdoc": "off",
    "object-curly-spacing": ["error", "always"],
    "arrow-parens": ["error", "always"],
    "linebreak-style": ["error", "unix"],
    "semi": ["error", "never"],
    "no-console": "warn",
    "no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }]
  },
  overrides: [
    {
      files: ["**/*.test.js"],
      env: {
        jest: true
      },
      rules: {
        "no-unused-vars": "off",
        "max-len": "off"
      }
    }
  ]
}
