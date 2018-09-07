/**
 * @fileoverview Report when a button component or element contains an SVG icon without accompanying text or aria-label
 * @author Charisse De Torres
 */
'use strict';

const ERROR_MSG = require('../../constants');

const JS_IDENTIFIER_REGEX = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/;
const JSX_ANNOTATION_REGEX = /^\*\s*@jsx\s+([^\s]+)/;

const DEFAULT_OPTIONS = {
    ignoreCase: true,
};

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function getProp(props = [], prop = '', options = DEFAULT_OPTIONS) {
    const propToFind = options.ignoreCase ? prop.toUpperCase() : prop;

    return props.find(attribute => {
        // If the props contain a spread prop, then skip.
        if (attribute.type === 'JSXSpreadAttribute') {
            return false;
        }

        const currentProp = options.ignoreCase ? propName(attribute).toUpperCase() : propName(attribute);

        return propToFind === currentProp;
    });
}

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

function getAriaLabelAttr(attributes) {
    if (attributes.length === 0) {
        return null;
    }

    return attributes.filter(attr => {
        return attr.name.name === 'aria-label';
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
        // function getIdentifierName(node) {
        //     return node.openingElement.name.name;
        // }

        function stripWhiteSpacesFromChildren(children) {
            return children.filter(child => {
                // console.log('child type', child.type);
                // const isLiteral = child.type == 'Literal';
                // const isJSXText = child.type == 'JSXText';
                // console.log(isLiteral, isJSXText);

                // let hasNoWhiteSpace = true;
                // if (child.value) {
                //     hasNoWhiteSpace = /^\s/.test(child.value);
                // }

                return child.type === 'JSXElement';
            });
        }

        return {
            // ExpressionStatement: function(node) {
            //     const element = node.expression;

            //     if (element.openingElement.name.name !== 'Button') {
            //         return;
            //     }

            //     const typeProp = getProp(element.attributes, 'aria-label');

            //     let hasChildren = false;
            //     if (element.children && element.children.length !== 0) {
            //         hasChildren = true;
            //     }

            //     const leftBehind = hasChildren && stripWhiteSpacesFromChildren(element.children);
            //     const firstChild = hasChildren && leftBehind[0];
            //     if ((firstChild.type === 'Literal') || !firstChild.openingElement) {
            //         return;
            //     }

            //     const isSVG = getIdentifierName(firstChild) === 'svg';
            //     if (
            //         firstChild.openingElement !== undefined &&
            //         (firstChild.type === 'Literal' || !firstChild.openingElement)
            //     ) {
            //         return;
            //     }

            //     const hasIconPrefix = firstChild.openingElement && firstChild.openingElement.name.name.includes('Icon');
            //     const hasClosingElement = firstChild.closingElement != null;
            //     const attributes = element.openingElement && getProp(element.attributes, 'aria-label');

            //     if (!attributes) {
            //         return context.report({
            //             node: element,
            //             message: 'test error',
            //         });
            //     }

            //     const ariaLabelValue = attributes[0].value.value;
            //     if (ariaLabelValue.length < 5 || ariaLabelValue.length === 0) {
            //         return context.report({
            //             node: element,
            //             message: 'no stupid aria labels',
            //         });
            //     }

            //     if (
            //         (isSVG || (hasIconPrefix && !hasClosingElement)) &&
            //         element.children.length === 1 &&
            //         attributes.length === 0 &&
            //         ariaLabelIsEmpty
            //     ) {
            //         return context.report({
            //             node: element,
            //             message: 'test error',
            //         });
            //     }
            // },
            JSXElement: function(node) {
                if (node.openingElement.name.name !== 'Button') {
                    return;
                }

                if (!node.children) {
                    return;
                }

                const ariaLabelAttr = getAriaLabelAttr(node.openingElement.attributes);
                const strippedChildren = stripWhiteSpacesFromChildren(node.children);

                if (strippedChildren.length === 0) {
                    return;
                }

                const firstChildFromStripped = strippedChildren[0];

                if (
                    strippedChildren.length === 1 &&
                    firstChildFromStripped.openingElement.name.name.includes('Icon') &&
                    ariaLabelAttr === null
                ) {
                    return context.report({
                        node: node,
                        message: 'create element error',
                    });
                }

                if (ariaLabelAttr !== null && ariaLabelAttr[0].value.value === '') {
                    return context.report({
                        node: node,
                        message: 'no stupid labels',
                    });
                }
            },

            // JSXAttribute: function(node) {
            //     if (node.name.name === 'aria-label') {
            //         return;
            //     }

            //     return context.report({
            //         node: node,
            //         message: 'create element error',
            //     });
            // },
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
