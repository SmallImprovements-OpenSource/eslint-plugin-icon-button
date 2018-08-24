/**
 * Checks to see if a node is a line break
 * @param {ASTNode} node The AST node being checked
 * @returns {Boolean} True if node is a line break, false if not
 * (From jsx-a11y/no-danger-with-children)
 */
function isLineBreak(node) {
    const isLiteral = node.type === 'Literal' || node.type === 'JSXText';
    const isMultiline = node.loc.start.line !== node.loc.end.line;
    const isWhiteSpaces = /^\s*$/.test(node.value);

    return isLiteral && isMultiline && isWhiteSpaces;
}

function isAButtonElement(node) {
    return node.openingElement.name.name === 'button';
}

function getIdentifierName(node) {
    return node.openingElement.name.name;
}

module.exports = {
    isLineBreak,
    isAButtonElement,
    getIdentifierName,
};
