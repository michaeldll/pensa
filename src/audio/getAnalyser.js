let context, source, analyser;

const handleSuccess = (stream) =>
	new Promise((resolve) => {
		context = new AudioContext();

		source = context.createMediaStreamSource(stream);

		analyser = context.createAnalyser();
		analyser.fftSize = 256;

		source.connect(analyser);
		// analyser.connect(context.destination);

		resolve(analyser);
	});

export default () => {
	return navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(handleSuccess);
};
