/** @type {import("prettier").Config & { [key:string]: any }} */
const config = {
    plugins: [
        require.resolve('@ianvs/prettier-plugin-sort-imports'),
        require.resolve('prettier-plugin-tailwindcss'),
    ],
    singleQuote: true,
    arrowParens: 'avoid',
    tabWidth: 4,
    importOrder: [
        '^(react/(.*)$)|^(react$)|^(react-native(.*)$)',
        '^(next/(.*)$)|^(next$)',
        '^(expo(.*)$)|^(expo$)',
        '<THIRD_PARTY_MODULES>',
        '',
        '',
        '^@/utils/(.*)$',
        '^@/components/(.*)$',
        '^@/(.*)$',
        '^[./]',
    ],
    importOrderSeparation: false,
    importOrderSortSpecifiers: true,
    importOrderBuiltinModulesToTop: true,
    importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
    importOrderMergeDuplicateImports: true,
    importOrderCombineTypeAndValueImports: true,
    tailwindConfig: './tailwind.config.ts',
};

module.exports = config;
