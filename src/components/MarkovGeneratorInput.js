import React, { useCallback, useContext } from 'react';
import ContentEditable from 'react-contenteditable';
import { MarkovContext } from '../reducer/Reducer';

export const MarkovGeneratorInput = () => {
	const [state, setState] = useContext(MarkovContext);

	const handleTextChange = useCallback(
		e => {
			const input = e.target.value;
			setState({ type: 'add markov source', value: input });
		},
		[setState]
	);

	const html = state.markov.source.replace('\n', '<br>');

	return (
		<div className='in'>
			<div className='content-editable-container'>
				<ContentEditable onChange={handleTextChange} html={html} />
			</div>
		</div>
	);
};
