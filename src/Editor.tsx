import React, { useState, SyntheticEvent, useRef } from 'react';
import './Editor.css';

// https://stackoverflow.com/questions/7745867/how-do-you-get-the-cursor-position-in-a-textarea
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
				code: /<[^<]+>/gm,
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
				code: /(\d)/gm,
				classes: 'c--green',
			},
			{
				code: /('.*')/gm, // todo: add support for double quotes without breaking stuff (try typing console afterwards and check)
				classes: 'c--orange',
			},
			{
				code: /(if)/gm,
				classes: 'c--purple',
			},
			{
				code: /(\.\w+\()/gm,
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

		console.log(cursorPos);

		if (key === 'Tab') {
			e.preventDefault();
			e.nativeEvent.preventDefault();

			// todo: adjust cursor placement after pressing tab
			if (cursorPos !== undefined) {
				const latestCode = code.substr(0, cursorPos) + '    ' + code.substr(cursorPos);
				setCode(latestCode);
				prettifyCode(latestCode);
			}
		}
	}

	const prettifyCode = (code: string) => {
		let formattedCode: string = code
			.replace(/\n/gm, '<br>')
			.replace(/ {4}/gm, '&ensp;&ensp;&ensp;&ensp;');
		// const wrapInSpan = (classes: string) => (match: any, offset: any, string: any) => `<span class="${classes}">${match}</span>`;
		const wrapHtmlNodeInSpan = (classes: string) => (match: any, offset: any, string: any) => ['<br>'].includes(match) ? match : `<span class="${classes}">${match.replace(/</gm, '&lt;').replace(/>/gm, '&gt;')}</span>`;

		
		// colorMappings[language].forEach(mapping => formattedCode = formattedCode.replace(mapping.code, wrapInSpan(mapping.classes)));
		// @ts-ignore
		switch (language) {
			case 'html':
				// @ts-ignore
				if (colorMappings[language]) colorMappings[language].forEach(mapping => formattedCode = formattedCode.replace(mapping.code, wrapHtmlNodeInSpan(mapping.classes))); // todo: nested, unclosed tags cause formatting issues. must convert to htmlentities.
				break;
			default:
				// @ts-ignore
				if (colorMappings[language]) colorMappings[language].forEach(mapping => formattedCode = formattedCode.replace(mapping.code, `<span class="${mapping.classes}">$&</span>`));
				break;
		}

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