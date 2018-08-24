/**
 * @fileoverview Report when a button component or element contains an SVG icon without accompanying text or aria-label
 * @author Charisse De Torres
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
        { code: '<CustomButtonComponent>hello world</CustomButtonComponent>' },
        { code: '<CustomButtonComponent aria-label="an aria-label"><svg></svg></CustomButtonComponent>' },
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
        {
            code: '<CustomButtonComponent aria-label="abc"><svg></svg></CustomButtonComponent>',
            errors: [{ message: ERROR_MSG.NO_STUPID_ARIA_LABELS }],
        },
    ],
});
