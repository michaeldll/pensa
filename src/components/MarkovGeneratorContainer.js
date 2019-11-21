import React from 'react';
import { MarkovGeneratorInput as Input } from './MarkovGeneratorInput';
import { MarkovGeneratorOutput as Output } from './MarkovGeneratorOutput';

export const MarkovGeneratorContainer = () => {
	return (
		<section className='markov-generator-container'>
			<Input />
			<Output />
		</section>
	);
};
