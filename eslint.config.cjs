const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const globals = require("globals");

const {
    fixupConfigRules,
} = require("@eslint/compat");

const tsParser = require("@typescript-eslint/parser");
const reactRefresh = require("eslint-plugin-react-refresh");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        globals: {
            ...globals.browser,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            project: ["./tsconfig.json", "./tsconfig.node.json"],
            tsconfigRootDir: __dirname,
        },
    },

    extends: fixupConfigRules(compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
        "plugin:react-hooks/recommended",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
    )),

    plugins: {
        "react-refresh": reactRefresh,
    },

    settings: {
        react: {
            version: "detect",
        },
    },

    rules: {
        "complexity": ["error", 10],
        "eol-last": ["warn", "always"],

        "indent": ["warn", 2, {
            "SwitchCase": 1,
        }],

        "max-params": ["error", 3],

        "no-duplicate-imports": ["error", {
            "includeExports": true,
        }],

        "no-multiple-empty-lines": ["warn", {
            "max": 1,
            "maxEOF": 0,
            "maxBOF": 0,
        }],

        "no-nested-ternary": "error",
        "object-curly-spacing": ["warn", "always"],

        "react-refresh/only-export-components": ["warn", {
            allowConstantExport: true,
        }],

        "require-await": "error",

        "semi": ["warn", "always", {
            "omitLastInOneLineBlock": true,
        }],

        "no-shadow": ["error", {
            "allow": ["index", "value"],
        }],
    },
}, globalIgnores(["**/dist", "**/.eslintrc.cjs"])]);
