/**
 * @fileoverview Report when a Button component contains a Featherico icon without accompanying text or aria-label
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
    JSX_EXPRESSION_CONTAINER: 'JSXExpressionContainer',
    EXPRESSION: 'Expression',
    EMPTY_EXPRESSION: 'JSXEmptyExpression',
};

function getNodesWithTextAndJSXElements(children) {
    return children.filter(child => {
        const { type } = child;

        if (
            type === NODE_TYPES.JSX_ELEMENT ||
            type === NODE_TYPES.JSX_EXPRESSION_CONTAINER ||
            type === NODE_TYPES.EXPRESSION ||
            type === NODE_TYPES.EMPTY_EXPRESSION
        ) {
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
        return {
            JSXElement: function(node) {
                const { openingElement, children } = node;

                if (openingElement.name.name !== 'Button') {
                    return;
                }

                const ariaLabelAttr = getProp(openingElement.attributes, 'aria-label');
                const filteredNodes = getNodesWithTextAndJSXElements(children);

                if (filteredNodes.length === 0) {
                    return;
                }

                const firstChild = filteredNodes[0];
                if (firstChild.type == NODE_TYPES.JSX_TEXT || firstChild.type == NODE_TYPES.LITERAL) {
                    if (firstChild.value.match(ALPHANUMERIC_MATCHER) !== null) {
                        return;
                    }
                }

                if (
                    filteredNodes.length === 1 &&
                    firstChild.openingElement &&
                    firstChild.openingElement.name.name.includes('Icon') &&
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
