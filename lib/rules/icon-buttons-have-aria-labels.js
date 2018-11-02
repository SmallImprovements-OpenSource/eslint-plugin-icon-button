/**
 * @fileoverview Report when a button component or element contains an SVG icon without accompanying text or aria-label
 * @author Charisse De Torres
 */
'use strict';

const getProp = require('jsx-ast-utils/getProp');
const getPropValue = require('jsx-ast-utils/getPropValue');

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
                if (child.type === 'JSXElement') {
                    return true;
                }

                if (child.type === 'Literal' || child.type === 'JSXText') {
                    if (child.value.startsWith('\n')) {
                        return false;
                    }

                    if (child.value.split('').filter(c => c !== ' ').length != 0) {
                        return true;
                    }
                }
                return false;
            });
        }

        return {
            JSXElement: function(node) {
                if (node.openingElement.name.name !== 'Button') {
                    return;
                }

                const ariaLabelAttr = getProp(node.openingElement.attributes, 'aria-label');
                const strippedChildren = stripWhiteSpacesFromChildren(node.children);

                if (strippedChildren.length === 0) {
                    return;
                }

                const firstChildFromStripped = strippedChildren[0];
                if (firstChildFromStripped.type == 'JSXText' || firstChildFromStripped.type == 'Literal') {
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
