import {
	initialize,
	setCallbackUrl,
	SmileConfig,
} from '@smile_identity/react-native-expo';

export const initSmileID = async () => {
	const config = new SmileConfig(
		'8214',
		'bos/ZLA8S6R0JiYX1r1j4pd6BT2UAzp2jDahdD9+DK9UkUyUsNH13ca2+AuI36WVH3aPVC2wEw8oTQUqMzwjnmlE2Q09/YDxSBEtQA4I7CxdcXyFVX4IYwu4/D2eSwtUTptKWtZgw2CgetanzDlJoJA/9MTKnG4Ze7ZXihO+F8U=',
		'https://api.smileidentity.com/v1/',
		'https://testapi.smileidentity.com/v1/',
	);
	await initialize(false, true, config, 'ea9c9a2d-fea7-49d8-9f4a-174537441e23');
	await setCallbackUrl('https://api.paxi.ng/api/smile-callback');
};
