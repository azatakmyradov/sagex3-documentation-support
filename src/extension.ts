import * as vscode from 'vscode';
import axios, { AxiosPromise } from 'axios';
import { NodeHtmlMarkdown } from 'node-html-markdown';

const searchDocs = (word: String): AxiosPromise => {
	return axios.get(
		`https://online-help.sageerpx3.com/erp/12/wp-static-content/static-pages/en_US/V7DEV/4gl_${word}.html`
	);
};

const parseDocs = (vscode: any, html: string): vscode.MarkdownString => {
	html = html.replace(
		html.substring(html.indexOf("<html>"), html.indexOf("<code>")),
		""
	);

	html = NodeHtmlMarkdown.translate(html, {}, undefined, undefined);

	html = html.replaceAll(/[0-9a-z_A-Z]+\.html/g, (replaced) => {
		return (
		"https://online-help.sageerpx3.com/erp/12/wp-static-content/static-pages/en_US/V7DEV/" +
		replaced
		);
	});

	return new vscode.MarkdownString(html);
};

export function activate(context: vscode.ExtensionContext) {
	 const documentationProvider = vscode.languages.registerHoverProvider(
		{ pattern: '**/*'},
		{
			provideHover: async (document: vscode.TextDocument, position: vscode.Position) => {
				// Get the word at the current position (e.g., function name)
				const wordRange = document.getWordRangeAtPosition(position);
				if (!wordRange) { return; };

				const word = document.getText(wordRange);

				return searchDocs(word)
					.then(result => {
						const documentation = parseDocs(vscode, result.data);
						return new vscode.Hover(documentation.value);
					});
			}
		}
  	);

	context.subscriptions.push(documentationProvider);
}

export function deactivate() {}
