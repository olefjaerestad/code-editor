import React, { SyntheticEvent } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import CodeEditor from './CodeEditor';
import * as serviceWorker from './serviceWorker';

const test = (code: string, language: string, e: SyntheticEvent|undefined) => {
	// localStorage.setItem( 'code', JSON.stringify(code) );
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

// @ts-ignore
ReactDOM.render(<CodeEditor onChange={test} language="js" useLanguageSwitcher={true} value={localStorage.getItem('code')} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
