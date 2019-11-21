import React from 'react';
import { Container } from './GenericContainer';
import { MarkovGeneratorContainer } from './MarkovGeneratorContainer';
import { CanvasGL } from './CanvasGL';
import { MarkovProvider } from '../reducer/Reducer';

import '../css/App.css';

export const App = () => (
	<MarkovProvider>
		<Container>
			<MarkovGeneratorContainer />
			<CanvasGL />
		</Container>
	</MarkovProvider>
);
