// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"

import { wrapWithTag } from "./wrap-with-tag"

// class JsxJockeyProvider implements vscode.CodeActionProvider {
//   provideCodeActions(
//     document: vscode.TextDocument,
//     range: vscode.Range | vscode.Selection,
//     context: vscode.CodeActionContext
//   ) {
// 		console.log('hello from provideCodeActions');
// 		// return [];
//     // if (!isSelectionLikelyJsx(document, range, context)) {
//     //   return [];
//     // }

//     const refactor = new vscode.CodeAction('Hello World', vscode.CodeActionKind.Refactor);

//     refactor.command = {
//       command: 'jsx-jockey.helloWorld',
//       title: 'Hello World',
//       arguments: [document, range]
//     };

//     return [refactor];
//   }
// }

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('jsx-jockey.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	console.log('gonna call delete component');
	// 	vscode.window.showInformationMessage('Hello World from jsx-jockey!!!!!');
	// 	deleteComponent();
	// 	console.log('just called delete component');
	// });

	// context.subscriptions.push(
	//   vscode.languages.registerCodeActionsProvider(
	//     [{ pattern: '{**/*.jsx,**/*.tsx}' }],
	//     new JsxJockeyProvider(),
	//     {
	//       providedCodeActionKinds: [vscode.CodeActionKind.Refactor]
	//     }
	//   )
	// );

	// context.subscriptions.push(
	// 	vscode.commands.registerCommand('jsx-jockey.wrapWithTag', wrapWithTag)
	// );

	let disposable = vscode.commands.registerCommand("jsx-jockey.wrapWithTag", async () => {
		const editor = vscode.window.activeTextEditor
		if (editor) {
			const document = editor.document
			const position = editor.selection.active

			const [edits, startPositions] = wrapWithTag(document, position)
			const edit = new vscode.WorkspaceEdit()
			edit.set(document.uri, edits)
			await vscode.workspace.applyEdit(edit)
			// await vscode.commands.executeCommand("editor.action.formatDocument")

			if (edits.length > 0 && startPositions.length === 2) {
				// Set multiple cursors: one in the opening and one in the closing tag
				editor.selections = [
					new vscode.Selection(startPositions[0], startPositions[0]),
					new vscode.Selection(startPositions[1], startPositions[1]),
				]
				// editor.selections = [
				// 	new vscode.Selection(
				// 		movePositionRight(startPositions[0], 1, document),
				// 		movePositionRight(startPositions[0], 1, document)
				// 	),
				// 	new vscode.Selection(
				// 		movePositionRight(startPositions[1], 2, document),
				// 		movePositionRight(startPositions[1], 2, document)
				// 	),
				// ]
			}
			await vscode.commands.executeCommand("editor.action.formatDocument")
		}
	})

	context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() {}

function movePositionRight(
	currentPosition: vscode.Position,
	count: number,
	document: vscode.TextDocument
): vscode.Position {
	// Check if the next position exceeds the line length
	let newCharacterPosition = currentPosition.character + count
	const maxCharacterPosition = document.lineAt(currentPosition.line).text.length

	// Ensure the new character position does not exceed the line length
	if (newCharacterPosition > maxCharacterPosition) {
		// Optionally handle the case where the position moves beyond the current line
		// For simplicity, let's just clamp the position to the max length
		newCharacterPosition = maxCharacterPosition
	}

	return new vscode.Position(currentPosition.line, newCharacterPosition)
}
