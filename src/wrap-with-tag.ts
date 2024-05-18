import * as ts from "typescript"
import * as vscode from "vscode"

import { findNearestJsxNode } from "./util"

export const wrapWithTag = (
	document: vscode.TextDocument,
	cursorPosition: vscode.Position
): [vscode.TextEdit[], insertionPoints: number[]] => {
	const sourceFile = ts.createSourceFile(
		document.fileName,
		document.getText(),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX
	)

	const edits: vscode.TextEdit[] = []
	const insertionPoints: number[] = []

	const nodeToWrap = findNearestJsxNode(sourceFile, cursorPosition)

	if (nodeToWrap) {
		const start = document.positionAt(nodeToWrap.pos)
		const end = document.positionAt(nodeToWrap.end)
		const openingTag = `<>`
		const closingTag = `</>`
		edits.push(vscode.TextEdit.insert(start, openingTag))
		edits.push(vscode.TextEdit.insert(end, closingTag))
		insertionPoints.push(nodeToWrap.pos)
		insertionPoints.push(nodeToWrap.end)
	}

	return [edits, insertionPoints]
}
