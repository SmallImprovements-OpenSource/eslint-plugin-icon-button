/**
 * @fileoverview Report when a button component or element contains an SVG icon without accompanying text or aria-label
 * @author Charisse De Torres
 */
'use strict';

const getProp = require('jsx-ast-utils/getProp');
const getPropValue = require('jsx-ast-utils/getPropValue');
const ALPHANUMERIC_MATCHER = /\w/g;
const NODE_TYPES = {
    JSX_ELEMENT: 'JSXElement',
    LITERAL: 'Literal',
    JSX_TEXT: 'JSXText',
};

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: 'Buttons that only have SVG icons should have an accompanying text or aria-label',
            category: 'Best Practices',
            recommended: true,
        },
        schema: [],
        deprecated: false,
    },

    create: context => {
        function stripWhiteSpacesFromChildren(children) {
            return children.filter(child => {
                const { type } = child;

                if (type === NODE_TYPES.JSX_ELEMENT) {
                    return true;
                }

                if (type === NODE_TYPES.LITERAL || type === NODE_TYPES.JSX_TEXT) {
                    if (child.value.match(ALPHANUMERIC_MATCHER) !== null) {
                        return true;
                    }
                }
                return false;
            });
        }

        return {
            JSXElement: function(node) {
                const { openingElement, children } = node;

                if (openingElement.name.name !== 'Button') {
                    return;
                }

                const ariaLabelAttr = getProp(openingElement.attributes, 'aria-label');
                const strippedChildren = stripWhiteSpacesFromChildren(children);

                if (strippedChildren.length === 0) {
                    return;
                }

                const firstChildFromStripped = strippedChildren[0];
                if (
                    firstChildFromStripped.type == NODE_TYPES.JSX_TEXT ||
                    firstChildFromStripped.type == NODE_TYPES.LITERAL
                ) {
                    const containsActualLetters =
                        firstChildFromStripped.value.split('').filter(c => c !== ' ').length != 0;

                    if (containsActualLetters) {
                        return;
                    }
                }

                if (
                    strippedChildren.length === 1 &&
                    firstChildFromStripped.openingElement.name.name.includes('Icon') &&
                    ariaLabelAttr === undefined
                ) {
                    return context.report({
                        node: node,
                        message: 'No buttons that contain only icons. Please add an aria-label.',
                    });
                }

                const ariaLabelValue = ariaLabelAttr !== undefined && getPropValue(ariaLabelAttr);

                if (ariaLabelValue === '') {
                    return context.report({
                        node: node,
                        message: 'No empty aria-label',
                    });
                }

                if (ariaLabelValue !== false && ariaLabelValue.split(' ').length < 5) {
                    return context.report({
                        node: node,
                        message: 'Please provide a more descriptive aria-label.',
                    });
                }
            },
        };
    },
};
