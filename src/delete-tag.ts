import * as ts from "typescript"
import * as vscode from "vscode"

import {
	findNearestJsxNode,
	getClosingElementOrFragment,
	getOpeningElementOrFragment,
} from "./util"

export const deleteTag = (
	cursorPosition: vscode.Position
): vscode.TextEdit[] | undefined => {
	const document = vscode.window.activeTextEditor?.document
	if (!document) {
		return
	}

	const sourceFile = ts.createSourceFile(
		document.fileName,
		document.getText(),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX
	)

	const edits: vscode.TextEdit[] = []

	const nodeToDelete = findNearestJsxNode(sourceFile, cursorPosition)

	if (nodeToDelete) {
		if (ts.isJsxSelfClosingElement(nodeToDelete)) {
			const start = document.positionAt(nodeToDelete.pos)
			const end = document.positionAt(nodeToDelete.end)
			edits.push(vscode.TextEdit.delete(new vscode.Range(start, end)))
		} else {
			const openingTag = getOpeningElementOrFragment(nodeToDelete)
			const closingTag = getClosingElementOrFragment(nodeToDelete)
			const openingStart = document.positionAt(openingTag.pos)
			const openingEnd = document.positionAt(openingTag.end)
			const closingStart = document.positionAt(closingTag.pos)
			const closingEnd = document.positionAt(closingTag.end)
			edits.push(
				vscode.TextEdit.delete(
					new vscode.Range(openingStart, openingEnd)
				)
			)
			edits.push(
				vscode.TextEdit.delete(
					new vscode.Range(closingStart, closingEnd)
				)
			)
		}

		return edits
	}
}
