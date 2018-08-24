/**
 * @fileoverview Report when a button component or element contains an SVG icon without accompanying text or aria-label
 * @author Charisse De Torres
 */
'use strict';

const ERROR_MSG = require('../../constants');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const UTILS = require('../../utils');

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
            ExpressionStatement: function(node) {
                const element = node.expression;
                const isAButtonElement = UTILS.isAButtonElement(element);

                let hasChildren = false;
                if (element.children.length && !UTILS.isLineBreak(element.children[0])) {
                    hasChildren = true;
                }

                const firstChild = element.children[0];
                // firstChild is a string, it won't have an openingElement property
                if ((firstChild.type === 'Literal') | !firstChild.openingElement) {
                    return;
                }

                const isSVG = UTILS.getIdentifierName(firstChild) === 'svg';
                const attributes =
                    element.openingElement &&
                    element.openingElement.attributes.filter(attr => {
                        return attr.name.name === 'aria-label';
                    });

                if (attributes.length === 0) {
                    return context.report({
                        node: element,
                        message: ERROR_MSG.BUTTON_SVG,
                    });
                }

                const ariaLabelValue = attributes[0].value.value;
                if (ariaLabelValue.length < 5 || ariaLabelValue.length === 0) {
                    return context.report({
                        node: element,
                        message: ERROR_MSG.NO_STUPID_ARIA_LABELS,
                    });
                }

                if (isSVG && element.children.length === 1 && attributes.length === 0 && ariaLabelIsEmpty) {
                    return context.report({
                        node: element,
                        message: ERROR_MSG.BUTTON_SVG,
                    });
                }
            },
        };
    },
};
