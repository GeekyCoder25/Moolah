import JailMonkey from 'jail-monkey';
import {Platform, Alert} from 'react-native';

export interface SecurityStatus {
	isRooted: boolean;
	isJailbroken: boolean;
	isDebuggedMode: boolean;
	isDevelopmentBuild: boolean;
	canMockLocation: boolean;
	violations: string[];
}

export const performSecurityCheck = async (): Promise<SecurityStatus> => {
	const violations: string[] = [];

	// Check for root/jailbreak
	const isRooted = JailMonkey.isJailBroken();
	if (isRooted)
		violations.push(
			`Device is ${Platform.OS === 'ios' ? 'jailbroken' : 'rooted'}`
		);

	// Check for debugger
	const isDebuggedMode = await JailMonkey.isDebuggedMode();
	if (isDebuggedMode) violations.push('Debugger detected');

	// Check if running on emulator / external storage
	const isOnExternalStorage =
		Platform.OS === 'android' && JailMonkey.isOnExternalStorage();
	if (isOnExternalStorage) violations.push('App running from external storage');

	// Check for mock location (Android)
	const canMockLocation =
		Platform.OS === 'android' && JailMonkey.canMockLocation();
	if (canMockLocation) violations.push('Mock location enabled');
	44;

	// Check for development build
	const isDevelopmentBuild = __DEV__;

	return {
		isRooted,
		isJailbroken: isRooted,
		isDebuggedMode,
		isDevelopmentBuild,
		canMockLocation,
		violations,
	};
};

export const handleSecurityViolation = (status: SecurityStatus) => {
	if (status.violations.length > 0 && !status.isDevelopmentBuild) {
		Alert.alert(
			'Security Warning',
			status.canMockLocation
				? 'Mock location is enabled. This app cannot run with mock location for security reasons.'
				: status.isDebuggedMode
				? 'Debugger detected. This app cannot run in debugging mode for security reasons.'
				: status.isJailbroken
				? 'Device is jailbroken. This app cannot run on jailbroken devices for security reasons.'
				: status.isRooted
				? 'This app cannot run on rooted devices for security reasons.'
				: 'The app is running in an unauthorized environment.',
			[
				{
					text: 'Exit',
					onPress: () => {
						// Force close the app
						if (Platform.OS === 'android') {
							const {BackHandler} = require('react-native');
							BackHandler.exitApp();
						}
					},
				},
			],
			{cancelable: false}
		);
		return true;
	}
	return false;
};
