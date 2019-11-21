import React, { createContext, useReducer } from 'react';
import Chain from 'markov-chains';

const initialState = {
	markov: { source: '', out: [] },
};

const getMarkovForecastFrom = string => {
	if (string.indexOf('\n') === -1) return [];

	const words = string.split(' ');
	const chain = new Chain([words]);
	const forecast = chain.walk();

	return forecast; //array
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
