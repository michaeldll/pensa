import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { MarkovContext } from '../reducer/Reducer';

export const MarkovGeneratorOutput = () => {
	const context = useContext(MarkovContext);

	const phrases = context[0].markov.out;

	const nodes = phrases.map((phrase, i) => <p key={i}>{unescape(phrase)}</p>);

	return <div className='out'>{nodes}</div>;
};

MarkovGeneratorOutput.propTypes = {
	words: PropTypes.array,
};
