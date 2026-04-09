import {initialize, SmileConfig} from '@smile_identity/react-native-expo';

export const initSmileID = () => {
	const config = new SmileConfig(
		'8214',
		'XPzd7Gq9W146zcfCVzL+ti+Fh8oMjlEWKi5Eey88pe9pWBDeUHWGCFEZeRu7uYLALBJBHA2Qm5A4AiVECq7L88TRVfqoQrdk2pSeKkjqG3e3bSHDjkpMTF8DxHUqxiMG+PrzjQatp/OoDXvciZqjyk3MOOfw/W8QUYx+SAw1jE4=',
		'https://api.smileidentity.com/v1/',
		'https://testapi.smileidentity.com/v1/',
	);
	initialize(true, true, config);
};
