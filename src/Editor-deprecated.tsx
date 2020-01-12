import React, { useState, SyntheticEvent } from 'react';
import './Editor.css';

const Editor: React.FC<{changeHandler?: Function}> = (props: any) => {
	const [language, setLanguage] = useState('js');
	const languages = ['html', 'js', 'css'];
	const [code, setCode] = useState('');

	const changeHandler = (e: SyntheticEvent) => {
		
		function removeHTMLTag(match: any, offset: any, string: any) {
			console.log(match.replace(/<[^>]*>/gm, '\n'));
			return match.replace(/<[^>]*>/gm, '\n');
		}

		// @ts-ignore
		const codeEncoded = e.target.innerHTML;
		const el = document.createElement('textarea');
		el.innerHTML = codeEncoded;
		let codeDecoded = el.value;
		switch (language) {
			case 'js':
				// these replacements make sure only to remove the html tags we actually should remove.
				codeDecoded = codeDecoded
					.replace(/(?:<[^>]*>)+$/gm, '') // replace trailing </div>.
					.replace(/[>]<[^>]*>/gm, removeHTMLTag) // replace '<div>' in '</div><div>' cases.
					.replace(/[\n|,|)|;|{|}]<[^>]*>/gm, removeHTMLTag); // replace the rest of the <div>'s and </div>'s.
				break;
			case 'css':
				codeDecoded = codeDecoded.replace(/<[^>]*>/gm, '').replace(/\s/gm, '');
				break;
			default:
				break;
		}

		console.log('codeEncoded:\n', codeEncoded);
		console.log('codeDecoded:\n', codeDecoded);

		props.changeHandler(codeDecoded, language, e);
	}

	return (
		<div className="editor">
			<select value={language} onChange={(e) => setLanguage(e.target.value)}>
				{languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
			</select>
			{/* <textarea cols={30} rows={10} onChange={(e) => props.changeHandler(e, language)}></textarea> */}
			<pre contentEditable suppressContentEditableWarning={true} onInput={changeHandler} placeholder="Code here...">
				
			</pre>
		</div>
	);
}

export default Editor;
