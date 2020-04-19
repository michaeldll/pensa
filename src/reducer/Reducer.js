import React, { createContext, useReducer } from 'react';
import Chain from 'markov-chains';

const initialState = {
	markov: { source: '', out: [] },
};

const getMarkovForecastFrom = (string) => {
	if (string.indexOf('\n') === -1) return [];

	const words = string.replace(/&nbsp;/g, ' ').split(' ');
	const newLineIndexes = words
		.map((word, index) => {
			if (word.indexOf('\n') > -1) return index;
		})
		.filter((index) => typeof index !== 'undefined');

	const chain = new Chain([words]);
	const forecast = chain.walk();
	const forecastWithNewLines = forecast.map((word, wordIndex) => {
		for (let index = 0; index < newLineIndexes.length; index++) {
			if (wordIndex === newLineIndexes[index]) return word.concat('\n');
			else return word;
		}
	});

	return forecastWithNewLines; //array
};

const reducer = (state, action) => {
	switch (action.type) {
		case 'add markov source':
			const value = action.value
				.replace(/<\/div>/g, '\n')
				.replace(/<div>/g, '')
				.replace(/<br>/g, '\n');

			return {
				...state,
				markov: {
					source: action.value,
					out: getMarkovForecastFrom(value)
						.join(' ')
						.replace(/&nbsp;/g, ' ')
						.split('\n'),
				},
			};
		default:
			return { ...initialState };
	}
};

export const MarkovContext = createContext(initialState);

export const MarkovProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialState);
	return <MarkovContext.Provider value={[state, dispatch]}>{children}</MarkovContext.Provider>;
};
