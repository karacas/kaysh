const rxjs_cache = {
  printWidth: 140,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  semi: true,
  proseWrap: 'always',
  arrowParens: 'avoid',
  overrides: [
    {
      files: '*.html',
      options: {
        printWidth: 120,
        parser: 'html',
        proseWrap: 'preserve',
        htmlWhitespaceSensitivity: 'ignore',
        bracketSpacing: true,
        arrowParens: 'avoid',
      },
    },
    {
      files: '*.scss',
      options: {
        parser: 'scss',
      },
    },
  ],
};

module.exports = rxjs_cache;
