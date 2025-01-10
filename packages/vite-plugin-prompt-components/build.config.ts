import { defineBuildConfig } from 'unbuild'
export default defineBuildConfig({
	entries: ["./index"],
	outDir: "dist",
	clean: true,
	declaration: true,
	failOnWarn: false,
	rollup: {
		emitCJS: true,
		inlineDependencies: true,
	},
})