import React, { SyntheticEvent } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Editor from './Editor';
import * as serviceWorker from './serviceWorker';

const test = (code: string, language: string, e: SyntheticEvent) => {
	// @ts-ignore
	if (document.getElementById('output')) document.body.removeChild(document.getElementById('output'));
	const iframe = document.createElement('iframe');
	iframe.id = 'output';
	document.body.appendChild(iframe);
	// @ts-ignore
	const iframeDocument = iframe.contentWindow.document;

	iframeDocument.open();
	switch (language) {
		case 'html':
			// @ts-ignore
			iframeDocument.writeln(code);
			break;
		case 'js':
			// @ts-ignore
			iframeDocument.writeln(`<script>${code}</script>`);
			break;
		case 'css':
			// @ts-ignore
			iframeDocument.writeln(`<style>${code}</style>`);
			break;
		default:
			break;
	}
	iframeDocument.close();
}

ReactDOM.render(<Editor onChange={test} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
