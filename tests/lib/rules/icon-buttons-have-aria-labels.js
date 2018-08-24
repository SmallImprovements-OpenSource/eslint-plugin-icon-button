/**
 * @fileoverview Buttons that only have icons should have an alternative aria-label
 * @author
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/icon-buttons-have-aria-labels');
const RuleTester = require('eslint').RuleTester;
const ERROR_MSG = require('../../../constants');

const parserOptions = {
    ecmaVersion: 6,
    ecmaFeatures: {
        jsx: true,
    },
};

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({ parserOptions });
ruleTester.run('icon-buttons-have-aria-labels', rule, {
    valid: [
        { code: "<button aria-label='button-label'><svg></svg></button>" },
        { code: '<button>hello world</button>' },
    ],

    invalid: [
        {
            code: '<button><svg></svg></button>',
            errors: [{ message: ERROR_MSG.BUTTON_SVG }],
        },
        {
            code: '<button><svg /></button>',
            errors: [{ message: ERROR_MSG.BUTTON_SVG }],
        },
    ],
});
