import * as ts from "typescript"
import * as vscode from "vscode"

export const wrapWithTag = (
	document: vscode.TextDocument,
	position: vscode.Position
): [vscode.TextEdit[], positions: vscode.Position[]] => {
	const sourceFile = ts.createSourceFile(
		document.fileName,
		document.getText(),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX
	)

	let edits: vscode.TextEdit[] = []
	let startPositions: vscode.Position[] = []

	const isCursorWithinTag = (node: ts.Node): boolean => {
		const start = document.positionAt(node.pos)
		const end = document.positionAt(node.end)

		return position.isAfterOrEqual(start) && position.isBeforeOrEqual(end)
	}

	const isCursorBetweenTags = (openingNode: ts.Node, closingNode: ts.Node): boolean => {
		const endOfOpening = document.positionAt(openingNode.end)
		const startOfClosing = document.positionAt(closingNode.end)

		return position.isAfterOrEqual(endOfOpening) && position.isBeforeOrEqual(startOfClosing)
	}

	const findNearestJsxNode = (node: ts.Node): ts.Node | undefined => {
		if (node.kind === ts.SyntaxKind.JsxSelfClosingElement) {
			if (isCursorWithinTag(node)) {
				return node
			}
		} else if (ts.isJsxElement(node)) {
			const openingTag = node.openingElement

			if (isCursorWithinTag(openingTag)) {
				return node
			}

			const closingTag = node.closingElement

			if (isCursorWithinTag(closingTag)) {
				return node
			} else if (isCursorBetweenTags(openingTag, closingTag)) {
				const nearestNode = node.forEachChild(findNearestJsxNode)
				return nearestNode ?? node
			}
		}
		// 	const jsxNode = node as ts.JsxOpeningLikeElement
		// 	const start = document.positionAt(jsxNode.pos)
		// 	const end = document.positionAt(jsxNode.end)

		// 	if (position.isAfterOrEqual(start) && position.isBeforeOrEqual(end)) {
		// 		const openingTag = `<${wrapperTag}>`
		// 		const closingTag = `</${wrapperTag}>`
		// 		edits.push(vscode.TextEdit.insert(start, openingTag))
		// 		edits.push(vscode.TextEdit.insert(end, closingTag))
		// 	}
		// }

		return node.forEachChild(findNearestJsxNode)
	}

	const nodeToWrap = findNearestJsxNode(sourceFile)

	if (nodeToWrap) {
		const start = document.positionAt(nodeToWrap.pos)
		const end = document.positionAt(nodeToWrap.end)
		const openingTag = `<>`
		const closingTag = `</>`
		edits.push(vscode.TextEdit.insert(start, openingTag))
		edits.push(vscode.TextEdit.insert(end, closingTag))
		startPositions.push(start)
		startPositions.push(end)
	}

	return [edits, startPositions]
}
