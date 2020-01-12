import React, { useState, SyntheticEvent, useRef } from 'react';
import './Editor.css';

// https://stackoverflow.com/questions/7745867/how-do-you-get-the-cursor-position-in-a-textarea
const Editor: React.FC<{changeHandler?: Function}> = (props: any) => {
	const [language, setLanguage] = useState('js');
	const languages = ['html', 'js', 'css'];
	const textArea = useRef<HTMLTextAreaElement>(null);
	const pre = useRef<HTMLDivElement>(null);
	const [code, setCode] = useState('');
	const [prettycode, setPrettyCode] = useState('');
	const jsColorMappings = [
		{
			code: /(console|window|document)/gm,
			classes: 'c--green',
		},
		{
			code: /(log)/gm,
			classes: 'c--purple',
		},
	];

	const changeHandler = (e: SyntheticEvent) => {
		// @ts-ignore
		const latestCode = e.target.value;
		setCode(latestCode);
		prettifyCode(latestCode);
		props.changeHandler(latestCode, language, e);
	}

	const keyUpHandler = (e: SyntheticEvent) => {
		// @ts-ignore
		const key = e.key;

		if (key === 'Enter') {
			// todo: add line break to pretty code
			const cursorPos = textArea.current?.selectionStart;
			
			console.log(cursorPos);
			
			if (cursorPos) {
				// const latestCode = prettycode.substr(0, cursorPos) + '<br>' + prettycode.substr(cursorPos);
				console.log('code:\n', code);
				const latestCode = code.substr(0, cursorPos) + '<br>' + code.substr(cursorPos);
				console.log('latestCode:\n', latestCode);
				setPrettyCode(latestCode);
			}
		}
	}

	const prettifyCode = (code: string) => {
		let formattedCode: string = code;
		// const wrapInSpan = (classes: string) => (match: any, offset: any, string: any) => `<span class="${classes}">${match}</span>`;

		if ( language === 'js' ) {
			// jsColorMappings.forEach(mapping => formattedCode = formattedCode.replace(mapping.code, wrapInSpan(mapping.classes)));
			jsColorMappings.forEach(mapping => formattedCode = formattedCode.replace(mapping.code, `<span class="${mapping.classes}">$&</span>`));
		}
		// console.log(formattedCode);
		setPrettyCode(formattedCode);
	}

	return (
		<div className="editor">
			<div className="editor__content">
				<textarea
				className="editor__content__writer" 
				placeholder="Code here..." 
				spellCheck="false" 
				ref={textArea} 
				onChange={changeHandler}
				onKeyUp={keyUpHandler}></textarea>

				<div
				className="editor__content__pretty"
				ref={pre}
				dangerouslySetInnerHTML={{__html: prettycode}}></div>
			</div>

			<div className="editor__meta">
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
