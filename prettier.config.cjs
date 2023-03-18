/** @type {import("prettier").Config & { [key:string]: any }} */
const config = {
    plugins: [
        '@ianvs/prettier-plugin-sort-imports',
        'prettier-plugin-tailwindcss',
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
};

module.exports = config;
