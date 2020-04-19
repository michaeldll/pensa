import React, { useCallback, useContext } from 'react';
import ContentEditable from 'react-contenteditable';
import { MarkovContext } from '../reducer/Reducer';

export const MarkovGeneratorInput = () => {
	const [state, setState] = useContext(MarkovContext);

	const handleTextChange = useCallback(
		(e) => {
			const input = e.target.value;
			setState({ type: 'add markov source', value: input });
		},
		[setState]
	);

	const handlePaste = useCallback((e) => {
		e.preventDefault();

		// get text representation of clipboard
		var text = (e.originalEvent || e).clipboardData.getData('text/plain');

		// insert text manually
		document.execCommand('insertHTML', false, text);
	}, []);

	const html = state.markov.source.replace(/\n/g, '<br>');

	return (
		<div className='in'>
			<div className='content-editable-container'>
				<ContentEditable onPaste={handlePaste} onChange={handleTextChange} html={html} />
			</div>
		</div>
	);
};
