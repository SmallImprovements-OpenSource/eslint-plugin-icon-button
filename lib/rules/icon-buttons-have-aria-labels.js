/**
 * @fileoverview Report when a button component or element contains an SVG icon without accompanying text or aria-label
 * @author Charisse De Torres
 */
'use strict';

const ERROR_MSG = require('../../constants');
const getProp = require('jsx-ast-utils/getProp');
const getPropValue = require('jsx-ast-utils/getPropValue');
const elementType = require('jsx-ast-utils/elementType');

const JS_IDENTIFIER_REGEX = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/;
const JSX_ANNOTATION_REGEX = /^\*\s*@jsx\s+([^\s]+)/;

const DEFAULT_OPTIONS = {
    ignoreCase: true,
};

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function getFromContext(context) {
    let pragma = 'React';

    const sourceCode = context.getSourceCode();
    const pragmaNode = sourceCode.getAllComments().find(node => JSX_ANNOTATION_REGEX.test(node.value));

    if (pragmaNode) {
        const matches = JSX_ANNOTATION_REGEX.exec(pragmaNode.value);
        pragma = matches[1].split('.')[0];
        // .eslintrc shared settings (http://eslint.org/docs/user-guide/configuring#adding-shared-settings)
    } else if (context.settings.react && context.settings.react.pragma) {
        pragma = context.settings.react.pragma;
    }

    if (!JS_IDENTIFIER_REGEX.test(pragma)) {
        throw new Error(`React pragma ${pragma} is not a valid identifier`);
    }
    return pragma;
}

function isCreateElement(node, context) {
    const pragma = getFromContext(context);
    return (
        node.callee &&
        node.callee.type === 'MemberExpression' &&
        node.callee.property.name === 'createElement' &&
        node.callee.object &&
        node.callee.object.name === pragma &&
        node.arguments.length > 0
    );
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
        function stripWhiteSpacesFromChildren(children) {
            return children.filter(child => {
                return child.type === 'JSXElement';
            });
        }

        return {
            JSXElement: function(node) {
                if (node.openingElement.name.name !== 'Button' || node.openingElement.name.name !== 'button') {
                    return;
                }

                if (!node.children) {
                    return;
                }

                const ariaLabelAttr = getProp(node.openingElement.attributes, 'aria-label');
                const strippedChildren = stripWhiteSpacesFromChildren(node.children);

                if (strippedChildren.length === 0) {
                    return;
                }

                const firstChildFromStripped = strippedChildren[0];

                if (
                    strippedChildren.length === 1 &&
                    firstChildFromStripped.openingElement.name.name.includes('Icon') &&
                    ariaLabelAttr === undefined
                ) {
                    return context.report({
                        node: node,
                        message: 'No buttons that contains only icons.',
                    });
                }

                const ariaLabelValue = ariaLabelAttr !== undefined && getPropValue(ariaLabelAttr);
                // const isNullValued = ariaLabelValue.value === null; // <Button aria-label />

                if (ariaLabelValue === '') {
                    return context.report({
                        node: node,
                        message: 'No stupid labels',
                    });
                }

                // if (
                //     ariaLabelAttr !== null &&
                //     ariaLabelAttr[0].value !== undefined &&
                //     (ariaLabelAttr[0].value.value === '' || ariaLabelAttr[0].value.value === undefined)
                // ) {
                //     return context.report({
                //         node: node,
                //         message: 'no stupid labels',
                //     });
                // }
            },
            CallExpression: function(node) {
                if (!isCreateElement(node, context)) {
                    return;
                }

                if (node.arguments[0].type !== 'Literal' || node.arguments[0].value !== 'button') {
                    return;
                }

                if (!node.arguments[1] || node.arguments[1].type !== 'ObjectExpression') {
                    return context.report({
                        node: node,
                        message: 'create element error',
                    });
                    return;
                }

                if (
                    !node.arguments[2] ||
                    (node.arguments[2].openingElement && node.arguments[2].openingElement.name.name === 'svg')
                ) {
                    return context.report({
                        node: node,
                        message: 'create element error',
                    });
                    return;
                }

                const props = node.arguments[1].properties;
                const typeProp = props.find(prop => prop.key && prop.key.value === 'aria-label');

                if (!typeProp && node.arguments[2].type === 'Literal') {
                    return;
                }

                if (!typeProp || typeProp.value.type !== 'Literal') {
                    return context.report({
                        node: node,
                        message: 'hi',
                    });
                    return;
                }
            },
        };
    },
};
