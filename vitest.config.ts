import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

export default defineConfig({
	test: {
		include: ["src/**/__tests__/**/*.test.ts"],
	},
	resolve: {
		alias: {
			"@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
			"@consts": fileURLToPath(new URL("./src/consts.ts", import.meta.url)),
			"@types": fileURLToPath(new URL("./src/types.ts", import.meta.url)),
		},
	},
});
