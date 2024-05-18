import * as ts from "typescript"
import * as vscode from "vscode"

import {
	findNearestJsxNode,
	getClosingElementOrFragment,
	getOpeningElementOrFragment,
	isCursorBetweenTags,
	nodesAreEqual,
} from "./util"

export const wrapWithTag = (
	document: vscode.TextDocument,
	selection: vscode.Selection
): [vscode.TextEdit[], insertionPoints: number[]] | undefined => {
	const sourceFile = ts.createSourceFile(
		document.fileName,
		document.getText(),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX
	)

	const getResults = (
		openingTagEntry: number,
		closingTagEntry: number
	): [vscode.TextEdit[], insertionPoints: number[]] => {
		const edits: vscode.TextEdit[] = []
		const insertionPoints: number[] = []

		const startPosition = document.positionAt(openingTagEntry)
		const endPosition = document.positionAt(closingTagEntry)
		const openingTag = "<>"
		const closingTag = "</>"
		edits.push(vscode.TextEdit.insert(startPosition, openingTag))
		edits.push(vscode.TextEdit.insert(endPosition, closingTag))
		insertionPoints.push(openingTagEntry)
		insertionPoints.push(closingTagEntry)

		return [edits, insertionPoints]
	}

	// First try to wrap just a text range inside an element.
	if (selection.end.isAfter(selection.start)) {
		const rangeStartNode = findNearestJsxNode(sourceFile, selection.start)
		const rangeEndNode = findNearestJsxNode(sourceFile, selection.end)

		if (
			rangeStartNode &&
			rangeEndNode &&
			nodesAreEqual(rangeStartNode, rangeEndNode) &&
			(ts.isJsxElement(rangeStartNode) ||
				ts.isJsxFragment(rangeStartNode))
		) {
			const opening = getOpeningElementOrFragment(rangeStartNode)
			const closing = getClosingElementOrFragment(rangeStartNode)

			if (
				opening &&
				closing &&
				isCursorBetweenTags(opening, closing, selection.start) &&
				isCursorBetweenTags(opening, closing, selection.end)
			) {
				return getResults(
					document.offsetAt(selection.start),
					document.offsetAt(selection.end)
				)
			}
		}
	} else {
		// If it's not a range, just find the nearest node and wrap it.
		const nodeToWrap = findNearestJsxNode(sourceFile, selection.active)

		if (nodeToWrap) {
			return getResults(nodeToWrap.pos, nodeToWrap.end)
		}
	}

	return
}
