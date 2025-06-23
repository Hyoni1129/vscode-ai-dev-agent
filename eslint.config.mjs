import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
    {
        files: ["**/*.js"],
        languageOptions: {
            globals: {
                ...globals.commonjs,
                ...globals.node,
                ...globals.mocha,
            },
            ecmaVersion: 2022,
            sourceType: "module",
        },
        rules: {
            "no-const-assign": "warn",
            "no-this-before-super": "warn",
            "no-undef": "warn",
            "no-unreachable": "warn",
            "no-unused-vars": "warn",
            "constructor-super": "warn",
            "valid-typeof": "warn",
        },
    },
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsParser,
            globals: {
                ...globals.node,
                ...globals.mocha,
            },
            ecmaVersion: 2022,
            sourceType: "module",
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-non-null-assertion": "warn",
        },
    }
];