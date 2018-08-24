/**
 * @fileoverview Buttons that only have icons should have an alternative aria-label
 * @author Charisse
 */
'use strict';

const ERROR_MSG = require('../../constants');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: 'Buttons that only have icons should have an alternative aria-label',
            category: 'Best Practices',
            recommended: true,
        },
        schema: [],
        deprecated: false,
    },

    create: context => {
        return {
            JSXElement: function(node) {
                const children = node.children;
                if (!children) {
                    return;
                }

                if (node.openingElement.name.name !== 'button') {
                    return;
                }

                const firstChild = children.length > 0 && node.children[0];
                if ((firstChild.type === 'Literal') | !firstChild.openingElement) {
                    return;
                }

                if (children.length === 0) {
                    context.report({
                        node: node,
                        message: ERROR_MSG.BUTTON_NO_TEXT,
                    });
                }

                const attributes = node.openingElement.attributes;
                const containsAriaLabel = attributes.filter(attr => {
                    return attr.name.name === 'aria-label';
                });

                const isSvg = firstChild.openingElement.name.name === 'svg';

                if (isSvg && node.children.length === 1 && containsAriaLabel.length === 0) {
                    context.report({
                        node: node,
                        message: ERROR_MSG.BUTTON_SVG,
                    });
                }
            },
        };
    },
};
