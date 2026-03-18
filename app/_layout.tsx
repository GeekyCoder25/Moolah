import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {useEffect, useState} from 'react';
import 'react-native-reanimated';
import '../styles/global.css';

import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {
	handleSecurityViolation,
	performSecurityCheck,
} from '@/utils/SecurityCheck';
import {initialize, SmileConfig} from '@smile_identity/react-native-expo';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Loading from './components/loading';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const config = new SmileConfig(
	'8214', // Partner ID from Smile ID portal
	'XPzd7Gq9W146zcfCVzL+ti+Fh8oMjlEWKi5Eey88pe9pWBDeUHWGCFEZeRu7uYLALBJBHA2Qm5A4AiVECq7L88TRVfqoQrdk2pSeKkjqG3e3bSHDjkpMTF8DxHUqxiMG+PrzjQatp/OoDXvciZqjyk3MOOfw/W8QUYx+SAw1jE4=', // Authentication token
	'https://api.smileidentity.com/v1/', // Production lambda URL
	'https://testapi.smileidentity.com/v1/', // Test lambda URL
);

export default function RootLayout() {
	const {setDarkMode} = useGlobalStore();
	const insets = useSafeAreaInsets();
	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
		PlusJakartaSansExtraLight: require('../assets/fonts/PlusJakartaSans-ExtraLight.ttf'),
		PlusJakartaSansLight: require('../assets/fonts/PlusJakartaSans-Light.ttf'),
		PlusJakartaSansRegular: require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
		PlusJakartaSansMedium: require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
		PlusJakartaSansSemiBold: require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
		PlusJakartaSansBold: require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
		PlusJakartaSansExtraBold: require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
	});
	const [isSecure, setIsSecure] = useState<boolean | null>(true);

	useEffect(() => {
		initialize(true, true, config);
		checkSecurity();
	}, []);

	const checkSecurity = async () => {
		try {
			// Perform security checks
			const securityStatus = await performSecurityCheck();

			// Handle violations (will show alert and exit if needed)
			const hasViolations = handleSecurityViolation(securityStatus);

			if (!hasViolations) {
				setIsSecure(true);
			} else {
				setIsSecure(false);
			}
		} catch (error) {
			console.error('Security check failed:', error);
			setIsSecure(false);
		}
	};

	useEffect(() => {
		if (loaded) {
			const setTheme = async () => {
				setDarkMode(false);
				SplashScreen.hideAsync();
			};
			setTheme();
		}
	}, [loaded, setDarkMode]);

	if (!loaded) {
		return null;
	}

	if (!isSecure) {
		return (
			<View className="flex-1 items-center justify-center bg-white">
				<Text className="text-red-500">Security check failed</Text>
			</View>
		);
	}

	return (
		<QueryClientProvider client={queryClient}>
			<View className="flex-1">
				<View style={{height: insets.top, backgroundColor: '#FFF'}}>
					<StatusBar style="dark" />
				</View>
				<Stack screenOptions={{headerShown: false}}>
					<Stack.Screen name="Signup" />
					<Stack.Screen name="Signin" />
					<Stack.Screen name="(tabs)" />
					<Stack.Screen name="Electricity" />
					<Stack.Screen name="Tv" />
					<Stack.Screen name="Exam" />
					<Stack.Screen name="VerifyOTP" />
					<Stack.Screen name="+not-found" />
				</Stack>
				<Loading />
				<Toast />
			</View>
		</QueryClientProvider>
	);
}
