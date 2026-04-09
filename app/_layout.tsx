import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {
	handleSecurityViolation,
	performSecurityCheck,
} from '@/utils/SecurityCheck';
import {initSmileID} from '@/utils/smileId';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {useEffect, useState} from 'react';
import {View} from 'react-native';
import 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import '../styles/global.css';
import Loading from './components/loading';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
		initSmileID();
		checkSecurity();
	}, []);

	const checkSecurity = async () => {
		try {
			const securityStatus = await performSecurityCheck();
			const hasViolations = handleSecurityViolation(securityStatus);
			setIsSecure(!hasViolations);
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
