import React, { useState, SyntheticEvent, useRef } from 'react';
import './Editor.css';

// https://stackoverflow.com/questions/7745867/how-do-you-get-the-cursor-position-in-a-textarea
// http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
const Editor: React.FC<{onChange?: Function}> = (props: any) => {
	const [language, setLanguage] = useState('js');
	const languages = ['html', 'js', 'css'];
	const textArea = useRef<HTMLTextAreaElement>(null);
	const pre = useRef<HTMLDivElement>(null);
	const [code, setCode] = useState('');
	const [prettycode, setPrettyCode] = useState('');
	const colorMappings = {
		html: [
			{
				code: /&lt;[^&lt;]+&gt;/gm,
				classes: 'c--blue',
			}
		],
		js: [
			{
				code: /(var|let|const|function|class|true)/gm,
				classes: 'c--blue',
			},
			{
				code: /(console|window|document)/gm,
				classes: 'c--cyan',
			},
			{
				code: /#?(\d+)/gm, // # explained in wrapJsInSpan()
				classes: 'c--green',
			},
			{
				code: /('.*'|&#34;.*&#34;)/gm,
				classes: 'c--orange',
			},
			{
				code: /(if)/gm,
				classes: 'c--purple',
			},
			{
				code: /(\w+\()/gm,
				classes: 'c--yellow',
			},
		],
	};

	const changeHandler = (e: SyntheticEvent) => {
		// @ts-ignore
		const latestCode = e.target.value;
		setCode(latestCode);
		prettifyCode(latestCode);
		props.onChange(latestCode, language, e);
	}

	const keyDownHandler = (e: SyntheticEvent) => {
		// @ts-ignore
		const key = e.key;
		const cursorPos = textArea.current?.selectionStart;

		if (key === 'Tab') {
			e.preventDefault();
			// e.nativeEvent.preventDefault();

			// adjust cursor placement after pressing tab. avoids cursor always moving to last pos.
			if (cursorPos !== undefined) {
				// const latestCode = code.substr(0, cursorPos) + '    ' + code.substr(cursorPos);
				const latestCode = code.substr(0, cursorPos) + '\t' + code.substr(cursorPos);
				// @ts-ignore
				setTimeout(() => {textArea.current.selectionStart = cursorPos+1; textArea.current.selectionEnd = cursorPos+1}, 1); // setTimeout required
				setCode(latestCode);
				prettifyCode(latestCode);
			}
		}
	}

	const prettifyCode = (code: string) => {
		// https://www.freeformatter.com/html-entities.html
		let formattedCode: string = code
			.replace(/</gm, '&lt;')
			.replace(/>/gm, '&gt;')
			.replace(/"/gm, '&#34;')
			.replace(/\n/gm, '<br>');
			// .replace(/ /gm, '&ensp;');
		// const wrapInSpan = (classes: string) => (match: any, offset: any, string: any) => `<span class="${classes}">${match}</span>`;
		// const wrapJsInSpan = (classes: string) => (match: any, offset: any, string: any) => {
		// 	console.log('match:', match);
		// 	return `<span class="${classes}">${match}</span>`;
		// }
		const wrapJsInSpan = (classes: string) => (match: string, group1: any, offset: any, string: any) => {
			// avoid breaking htmlentities
			if (Number(match.substr(1)) && match[0] === '#') {
				return match;
			}
			return `<span class="${classes}">${match}</span>`;
		}
		const wrapHtmlNodeInSpan = (classes: string) => (match: any, offset: any, string: any) => ['<br>'].includes(match) ? match : `<span class="${classes}">${match}</span>`;

		
		// colorMappings[language].forEach(mapping => formattedCode = formattedCode.replace(mapping.code, wrapInSpan(mapping.classes)));
		// @ts-ignore
		switch (language) {
			case 'html':
				// @ts-ignore
				if (colorMappings[language]) colorMappings[language].forEach(mapping => formattedCode = formattedCode.replace(mapping.code, wrapHtmlNodeInSpan(mapping.classes)));
				break;
			default:
				// @ts-ignore
				if (colorMappings[language]) colorMappings[language].forEach(mapping => formattedCode = formattedCode.replace(mapping.code, wrapJsInSpan(mapping.classes)));
				break;
		}

		setPrettyCode(formattedCode);
	}

	return (
		<div className="editor">
			<div className="editor__content">
				<textarea
				className="editor__content__writer" 
				placeholder={`${language} here...`}
				spellCheck="false" 
				ref={textArea}
				value={code}
				onChange={changeHandler}
				onKeyDown={keyDownHandler}></textarea>

				<div
				className="editor__content__pretty"
				ref={pre}
				dangerouslySetInnerHTML={{__html: prettycode}}></div>
			</div>

			<div className="editor__meta">
				<span>{code.length} bytes/characters</span>
				<select
				value={language}
				onChange={(e) => setLanguage(e.target.value)}>
					{languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
				</select>
			</div>
		</div>
	);
}

export default Editor;
