/**
 * @fileoverview Report when a Button component contains a Featherico icon without accompanying text or aria-label
 * @author Charisse De Torres
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

var ruleTester = new RuleTester({ parserOptions });
ruleTester.run('icon-buttons-have-aria-labels', rule, {
    valid: [
        // jsx
        { code: '<Button>hello world</Button>' },
        { code: '<Button aria-label="an aria-label that describes something"><SomeIconComponent/></Button>' },
        { code: '<Button>\n<SomeIconComponent/> hello</Button>' },
        { code: '<Button><SomeIconComponent/> {expression}</Button>' },
    ],

    invalid: [
        // jsx
        {
            code: '<Button><SomeIconComponent/></Button>',
            errors: [{ message: 'No buttons that contain only icons. Please add an aria-label.' }],
        },
        {
            code: '<Button aria-label=""><SomeIconComponent/></Button>',
            errors: [{ message: 'No empty aria-label' }],
        },
        {
            code: '<Button aria-label="short label"><SomeIconComponent/></Button>',
            errors: [{ message: 'Please provide a more descriptive aria-label.' }],
        },
    ],
});
