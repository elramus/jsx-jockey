import * as ts from "typescript"
import * as vscode from "vscode"

export const isCursorBetweenTags = (
	openingNode: ts.Node,
	closingNode: ts.Node,
	position: vscode.Position
): boolean => {
	const document = vscode.window.activeTextEditor?.document
	if (!document) {
		return false
	}

	const endOfOpening = document.positionAt(openingNode.end)
	const startOfClosing = document.positionAt(closingNode.end)

	return position.isAfter(endOfOpening) && position.isBefore(startOfClosing)
}

export const isPositionWithinNode = (
	node: ts.Node,
	position: vscode.Position
): boolean => {
	const document = vscode.window.activeTextEditor?.document
	if (!document) {
		return false
	}

	const start = document.positionAt(node.pos)
	const end = document.positionAt(node.end)

	return position.isAfterOrEqual(start) && position.isBeforeOrEqual(end)
}

export const getOpeningElementOrFragment = (
	node: ts.JsxElement | ts.JsxFragment
): ts.JsxOpeningElement | ts.JsxOpeningFragment => {
	if (ts.isJsxElement(node)) {
		return node.openingElement
	} else {
		return node.openingFragment
	}
}

export const getClosingElementOrFragment = (
	node: ts.JsxElement | ts.JsxFragment
): ts.JsxClosingElement | ts.JsxClosingFragment => {
	if (ts.isJsxElement(node)) {
		return node.closingElement
	} else {
		return node.closingFragment
	}
}

export const findNearestJsxNode = (
	node: ts.Node,
	position: vscode.Position
): ts.JsxSelfClosingElement | ts.JsxElement | ts.JsxFragment | undefined => {
	if (ts.isJsxSelfClosingElement(node)) {
		if (isPositionWithinNode(node, position)) {
			return getNodeFromProps(node, position) || node
		}
	} else if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
		const openingTag = getOpeningElementOrFragment(node)

		if (isPositionWithinNode(openingTag, position)) {
			if (ts.isJsxOpeningElement(openingTag)) {
				return getNodeFromProps(openingTag, position) || node
			} else {
				return node
			}
		}

		const closingTag = getClosingElementOrFragment(node)

		if (isPositionWithinNode(closingTag, position)) {
			return node
		} else if (isCursorBetweenTags(openingTag, closingTag, position)) {
			const nearestNode = node.forEachChild((child) =>
				findNearestJsxNode(child, position)
			)
			return nearestNode ?? node
		}
	}

	return node.forEachChild((child) => findNearestJsxNode(child, position))
}

export const getNodeFromProps = (
	node: ts.JsxElement | ts.JsxOpeningElement | ts.JsxSelfClosingElement,
	position: vscode.Position
): ReturnType<typeof findNearestJsxNode> => {
	const checkProperties = (
		properties: ts.NodeArray<ts.JsxAttributeLike>
	): ReturnType<typeof findNearestJsxNode> => {
		for (const prop of properties) {
			if (
				ts.isJsxAttribute(prop) &&
				prop.initializer &&
				ts.isJsxExpression(prop.initializer)
			) {
				const { expression } = prop.initializer
				if (expression) {
					const result = findNearestJsxNode(expression, position)
					if (result) {
						return result
					}
				}
			}
		}
	}

	if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
		return checkProperties(node.attributes.properties)
	} else {
		return checkProperties(node.openingElement.attributes.properties)
	}
}
