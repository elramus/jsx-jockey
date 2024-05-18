import * as ts from "typescript"
import * as vscode from "vscode"

import { isPositionWithinNode } from "./util"

export const getPositionOfClosingTag = (
	document: vscode.TextDocument,
	position: vscode.Position
): vscode.Position | undefined => {
	const sourceFile = ts.createSourceFile(
		document.fileName,
		document.getText(),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX
	)

	const findClosingTag = (node: ts.Node): ts.Node | undefined => {
		if (ts.isJsxFragment(node)) {
			if (isPositionWithinNode(node.openingFragment, position)) {
				return node.closingFragment
			}
		}

		return node.forEachChild(findClosingTag)
	}

	const closingFragment = findClosingTag(sourceFile)

	if (closingFragment) {
		return document.positionAt(closingFragment.pos)
	}
}
