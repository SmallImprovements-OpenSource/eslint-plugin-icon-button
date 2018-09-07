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
        // { code: "<button aria-label='button-label'><svg></svg></button>" }, NO
        { code: '<button>hello world</button>' },
        { code: '<Button>hello world</Button>' },
        // { code: '<MyComponent aria-label="an aria-label"><SomeIconComponent/></MyComponent>' }, NO
        { code: 'React.createElement("button", { "aria-label": "button label"}, "hello world")' },
        { code: 'React.createElement("button", { type: "button" }, "hello world")' },
    ],

    invalid: [
        {
            code: '<Button><SomeIconComponent/></Button>',
            errors: [{ message: 'create element error' }],
        },
        {
            code: 'React.createElement("button")',
            errors: [{ message: 'create element error' }],
        },
        {
            code: 'React.createElement("button", {}, <svg></svg>)',
            errors: [{ message: 'create element error' }],
        },

        {
            code: '<Button>      <SomeIconComponent/></Button>',
            errors: [{ message: 'create element error' }],
        },
    ],
});
