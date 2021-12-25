module.exports = {
  globals: {
    __dirname: false,
  },
  extends: "eslint:recommended",
  rules: {
    'no-undefined': 0,
    'prefer-promise-reject-errors': 0,
    'max-nested-callbacks': [2, 4],
    'max-params': [2, 4],
  },
  parserOptions: {
    "ecmaVersion": 6,
    "sourceType": "module"
  },
  overrides: [{
      files: ["rollup.config.js"]
    },
    // ts文件采用typescript-eslint解析器
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'no-template-curly-in-string': 1,
        '@typescript-eslint/member-ordering': 0,
        'react/no-did-update-set-state': 0,
        'react-hooks/exhaustive-deps': 0,
      },
    },
  ],
};