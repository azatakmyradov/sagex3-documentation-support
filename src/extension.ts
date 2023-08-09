import * as vscode from 'vscode';
import axios, { AxiosResponse } from 'axios';
import TurndownService from 'turndown';
const turndownService = new TurndownService();

const searchDocs = async (word: String): Promise<String|void> => {
	const response: AxiosResponse = await axios.get(
		`https://online-help.sageerpx3.com/erp/12/wp-static-content/static-pages/en_US/V7DEV/4gl_${word}.html`
	);

	if (response.status !== 200) {
		return;
	}

	let html: String = response.data;

	return html;
};

const parseDocs = (vscode: any, html: String): vscode.MarkdownString => {
	html = html.replace(
		html.substring(html.indexOf("<html>"), html.indexOf("<code>")),
		""
	);

	html = turndownService.turndown(html);
	html = html.replaceAll(/[0-9a-z_A-Z]+\.html/g, (replaced) => {
		return (
		"https://online-help.sageerpx3.com/erp/12/wp-static-content/static-pages/en_US/V7DEV/" +
		replaced
		);
	});

	return new vscode.MarkdownString(html);
};

export function activate(context: vscode.ExtensionContext) {

	 const documentationProvider = vscode.languages.registerHoverProvider({scheme: 'file', language: 'x3'},
    {
      provideHover: async (document: vscode.TextDocument, position: vscode.Position) => {
		// Get the word at the current position (e.g., function name)
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) { return; };

        const word = document.getText(wordRange);

        let result = await searchDocs(word);

        if (!result) {
			return undefined;
		};

        const documentation = parseDocs(vscode, result);
        return new vscode.Hover(documentation);
	  }
    }
  );

	context.subscriptions.push(documentationProvider);
}

export function deactivate() {}
