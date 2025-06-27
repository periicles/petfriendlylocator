import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

export default [
	...compat.extends(
		"next/core-web-vitals", // vérifications a11y/perf adaptées à Next.js
		"next"                  // support React + TypeScript inclus
	),
	{
		files: ["**/*.{js,ts,jsx,tsx}"],
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json", // si tu veux les checks types
			},
		},
		rules: {
			// optionnel : tu peux ajouter des règles ici
		},
	},
];
