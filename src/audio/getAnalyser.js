let context, source, analyser, compressor;

const handleSuccess = stream =>
	new Promise(resolve => {
		context = new AudioContext();

		source = context.createMediaStreamSource(stream);

		analyser = context.createAnalyser();
		analyser.smoothingTimeConstant = 0.85;
		analyser.fftSize = 2048;

		// compressor = context.createDynamicsCompressor();
		// compressor.threshold.setValueAtTime(-70, context.currentTime);
		// compressor.knee.setValueAtTime(40, context.currentTime);
		// compressor.ratio.setValueAtTime(12, context.currentTime);
		// compressor.attack.setValueAtTime(0, context.currentTime);
		// compressor.release.setValueAtTime(0.25, context.currentTime);

		source.connect(analyser);
		// analyser.connect(context.destination);
		analyser.connect(context.destination);

		resolve(analyser);
	});

export default () => {
	return navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(handleSuccess);
};
