module.exports = {
    out: './docs',
    src: [
		'./src/',
	],
	mode: 'file',
    includeDeclarations: true,
	tsconfig: 'tsconfig.json',
	excludePrivate: true,
	excludeProtected: true,
	excludeExternals: true,
	readme: 'README.md',
	name: 'mock',
	theme: 'minimal',
	ignoreCompilerErrors: true,
	plugin: 'typedoc-plugin-as-member-of',
	listInvalidSymbolLinks: true,
}
