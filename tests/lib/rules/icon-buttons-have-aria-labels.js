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

const parserOptions = {
    ecmaVersion: 6,
    ecmaFeatures: {
        jsx: true,
    },
};

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const BUTTON_NO_TEXT = 'button should have text';
const BUTTON_SVG = 'icon buttons need aria-label';

var ruleTester = new RuleTester({ parserOptions });
ruleTester.run('icon-buttons-have-aria-labels', rule, {
    valid: [
        { code: "<button aria-label='button-label'><svg></svg></button>" },
        { code: '<button>hello world</button>' },
    ],

    invalid: [
        {
            code: '<button><svg></svg></button>',
            errors: [
                {
                    message: BUTTON_SVG,
                },
            ],
        },
        {
            code: '<button><svg /></button>',
            errors: [
                {
                    message: BUTTON_SVG,
                },
            ],
        },
    ],
});
