/* eslint-disable global-require */

module.exports = {
    rules: {
        'icon-button': require('./lib/rules/icon-buttons-have-aria-labels'),
    },
    configs: {
        recommended: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            'icon-button/icon-buttons-have-aria-labels': 'warn',
        },
    },
};
