import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {useEffect, useState} from 'react';
import {colorScheme} from 'nativewind';
import 'react-native-reanimated';
import '../styles/global.css';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Text, View} from 'react-native';
import {useGlobalStore} from '@/context/store';
import {MemoryStorage} from '@/utils/storage';
import {APP_THEME} from '@/constants';
import Loading from './components/loading';
import Toast from 'react-native-toast-message';
import {
	handleSecurityViolation,
	performSecurityCheck,
} from '@/utils/SecurityCheck';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const {setDarkMode} = useGlobalStore();
	const insets = useSafeAreaInsets();
	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
		PlusJakartaSansBold: require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
		PlusJakartaSansExtraBold: require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
		PlusJakartaSansExtraLight: require('../assets/fonts/PlusJakartaSans-ExtraLight.ttf'),
		PlusJakartaSansMedium: require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
		PlusJakartaSansRegular: require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
		PlusJakartaSansSemiBold: require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
	});
	const [isSecure, setIsSecure] = useState<boolean | null>(null);

	useEffect(() => {
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
				const storage = new MemoryStorage();
				const mode = await storage.getItem(APP_THEME);

				setDarkMode(
					mode ? (mode === 'dark' ? true : false) : colorScheme.get() === 'dark'
				);
				SplashScreen.hideAsync();
			};
			setTheme();
		}
		7;
	}, [loaded]);

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
	);
}
