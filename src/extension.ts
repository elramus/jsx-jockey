import * as vscode from "vscode"

import { deleteTag } from "./delete-tag"
import { wrapWithTag } from "./wrap-with-tag"

export function activate(context: vscode.ExtensionContext) {
	const disposableWrapWithTag = vscode.commands.registerCommand(
		"jsx-jockey.wrapWithTag",
		async () => {
			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return
			}

			// Do an extra formatting up front to help maintain correct cursor
			// positions after inserting new nodes.
			await vscode.commands.executeCommand("editor.action.formatDocument")

			const document = editor.document

			const results = wrapWithTag(document, editor.selection)
			if (!results) {
				return
			}

			const [edits, cursorPositions] = results
			const edit = new vscode.WorkspaceEdit()
			edit.set(document.uri, edits)
			await vscode.workspace.applyEdit(edit)

			const openingTagPos = document
				.positionAt(cursorPositions[0])
				.translate(0, 1)
			const closingTagPos = document
				.positionAt(cursorPositions[1])
				.translate(0, 4)

			editor.selections = [
				new vscode.Selection(openingTagPos, openingTagPos),
				new vscode.Selection(closingTagPos, closingTagPos),
			]

			await vscode.commands.executeCommand("editor.action.formatDocument")
		}
	)

	const disposableDeleteTag = vscode.commands.registerCommand(
		"jsx-jockey.deleteTag",
		async () => {
			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return
			}

			const document = editor.document
			const position = editor.selection.active

			const edits = deleteTag(position)
			if (!edits) {
				return
			}

			const edit = new vscode.WorkspaceEdit()
			edit.set(document.uri, edits)
			await vscode.workspace.applyEdit(edit)

			await vscode.commands.executeCommand("editor.action.formatDocument")
		}
	)

	context.subscriptions.push(disposableWrapWithTag)
	context.subscriptions.push(disposableDeleteTag)
}

// This method is called when your extension is deactivated
export function deactivate() {}
