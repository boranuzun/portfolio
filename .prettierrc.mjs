/** @type {import("prettier").Config} */
export default {
	semi: true,
	singleQuote: false,
	useTabs: true,
	printWidth: 100,
	trailingComma: "all",
	plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
	overrides: [
		{
			files: "*.astro",
			options: {
				parser: "astro",
			},
		},
	],
};
