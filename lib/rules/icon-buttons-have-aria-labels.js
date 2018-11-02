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

                if (node.children.length == 0) {
                    return context.report({
                        node: node,
                        message: 'No empty buttons',
                    });
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
            },
        };
    },
};
