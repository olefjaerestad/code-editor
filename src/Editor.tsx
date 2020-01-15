import React, { useState, SyntheticEvent, useRef } from 'react';
import './Editor.css';

// https://stackoverflow.com/questions/7745867/how-do-you-get-the-cursor-position-in-a-textarea
// http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
const Editor: React.FC<{onChange?: Function}> = (props: any) => {
	const [language, setLanguage] = useState('html');
	const languages = ['html', 'js', 'css'];
	const textArea = useRef<HTMLTextAreaElement>(null);
	const pre = useRef<HTMLDivElement>(null);
	const testLetter = useRef<HTMLSpanElement>(null);
	const [code, setCode] = useState('');
	const [prettycode, setPrettyCode] = useState('');
	const [rowHeights, setRowHeights] = useState<number[]>([18]);
	const [currentRow, setCurrentRow] = useState(1);
	const [currentCol, setCurrentCol] = useState(1);
	const colorMappings = {
		html: [
			{
				code: /&lt;[^&lt;]+&gt;/gm, // todo: this doesnt work with <div class="">, <table>, <style>, <script> or any tag containing 'l' or 't'
				// code: /&lt;[^&;]+&gt;/gm,
				// code: /&lt;[^&\b]+&gt;/gm,
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

	const prettifyCode = (code: string, lang?: string) => {
		lang = lang || language;
		// https://www.freeformatter.com/html-entities.html
		let formattedCode: string = code
			.replace(/</gm, '&lt;')
			.replace(/>/gm, '&gt;')
			.replace(/"/gm, '&#34;');
			// .replace(/\n/gm, '<br>');
			// .replace(/ /gm, '&ensp;');
		// console.log('formattedCode:\n', formattedCode);
		const wrapJsInSpan = (classes: string) => (match: string, group1: any, offset: any, string: any) => {
			// avoid breaking htmlentities
			if (Number(match.substr(1)) && match[0] === '#') {
				return match;
			}
			return `<span class="${classes}">${match}</span>`;
		}
		const wrapHtmlNodeInSpan = (classes: string) => (match: any, group1: any, offset: any, string: any) => {
			// console.log('match:', match);
			return ['<br>'].includes(match) ? match : `<span class="${classes}">${match}</span>`;
		}

		
		// colorMappings[language].forEach(mapping => formattedCode = formattedCode.replace(mapping.code, wrapInSpan(mapping.classes)));
		// @ts-ignore
		switch (lang) {
			case 'html':
				// @ts-ignore
				if (colorMappings[lang]) colorMappings[lang].forEach(mapping => formattedCode = formattedCode.replace(mapping.code, wrapHtmlNodeInSpan(mapping.classes)));
				break;
			default:
				// @ts-ignore
				if (colorMappings[lang]) colorMappings[lang].forEach(mapping => formattedCode = formattedCode.replace(mapping.code, wrapJsInSpan(mapping.classes)));
				break;
		}

		setPrettyCode(formattedCode);
	}

	const keyUpHandler = () => {
		setRowHeights(getRowHeights());
		setCurrentRow(getCurrentRow());
		setCurrentCol(getCurrentCol());
	}

	const getRowHeights = (): number[] => {
		let rows: number[] = [];
		const latestCode = textArea.current?.value;
		// const cursorPos = textArea.current?.selectionStart;
		const currentRows = (latestCode || '').split('\n');
		// @ts-ignore
		// const fontSize = parseInt(getComputedStyle(textArea.current).getPropertyValue('--font-size'));
		const textAreaWidth = (textArea.current?.getBoundingClientRect().width || 0) - 20; // -20 for padding
		const letterWidth = (testLetter.current?.getBoundingClientRect().width || 0);
		const letterHeight = (testLetter.current?.getBoundingClientRect().height || 0);
		const lettersPrLine = Math.floor(textAreaWidth/letterWidth);

		for ( var i = 0; i < currentRows.length; ++i ) {
			var letters = currentRows[i];
			const height = Math.max(Math.ceil(letters.length/lettersPrLine), 1) * letterHeight;
			rows.push(height);
		}

		return rows;
	}

	const getCurrentRow = (): number => {
		const latestCode = textArea.current?.value;
		const cursorPos = textArea.current?.selectionStart;
		const theCurrentRow = latestCode?.substr(0, cursorPos).split('\n').length || 1;
		return theCurrentRow;
	}

	const getCurrentCol = (): number => {
		const latestCode = textArea.current?.value;
		const cursorPos = textArea.current?.selectionStart;
		const lastLineBreakIndex = latestCode?.substr(0, cursorPos).lastIndexOf('\n');
		const theCurrentCol = (cursorPos||0) - (lastLineBreakIndex||0);
		return theCurrentCol;
	}

	return (
		<div className="editor">
			<div className="editor__content">
				<div className="editor__content__rows">
					{rowHeights.map((height: number, i: number) => <div key={i} style={{height: `${height}px`}}>{i}</div>)}
				</div>
				<div className="editor__content__main">
					<textarea
					className="editor__content__main__writer" 
					placeholder={`${language} here...`}
					spellCheck="false" 
					ref={textArea}
					value={code}
					onChange={changeHandler}
					onKeyDown={keyDownHandler}
					onKeyUp={keyUpHandler}></textarea>

					<div
					className="editor__content__main__pretty"
					ref={pre}
					dangerouslySetInnerHTML={{__html: prettycode}}></div>
				</div>
				<span ref={testLetter} className="editor__content__testletter">i</span>
			</div>

			<div className="editor__meta">
				<span>Row: {currentRow}</span>
				<span>Col: {currentCol}</span>
				{/* <span>{rowHeights.length} rows</span> */}
				<span>Bytes/characters: {code.length}</span>
				<select
				value={language}
				onChange={(e) => {setLanguage(e.target.value); prettifyCode(textArea.current?.value || '', e.target.value);}}>
					{languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
				</select>
			</div>
		</div>
	);
}

export default Editor;
