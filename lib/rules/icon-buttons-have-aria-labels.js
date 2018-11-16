/**
 * @fileoverview Report when a Button component contains a Featherico icon without accompanying text or aria-label
 * @author Charisse De Torres
 */
'use strict';

const getProp = require('jsx-ast-utils/getProp');
const getPropValue = require('jsx-ast-utils/getPropValue');
const ALPHANUMERIC_MATCHER = /\w/g;

function filterWhiteSpace(children) {
    return children.filter(child => {
        const { type } = child;
        if (type === 'Literal' || type === 'JSXText') {
            return child.value.match(ALPHANUMERIC_MATCHER) !== null ? true : false;
        } else return true;
    });
}

function getOpeningElementNameOrUndefined(node) {
    return node.hasOwnProperty('openingElement') ? node.openingElement.name.name : undefined;
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
                const filteredNodes = filterWhiteSpace(children);

                if (filteredNodes.length === 0) {
                    return;
                }

                const firstChild = filteredNodes[0];
                const openingElementName = getOpeningElementNameOrUndefined(firstChild);
                if (openingElementName === undefined) {
                    return;
                }

                if (filteredNodes.length === 1 && openingElementName.includes('Icon') && ariaLabelAttr === undefined) {
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
