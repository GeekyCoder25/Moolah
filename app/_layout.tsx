import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {useEffect} from 'react';
import {colorScheme} from 'nativewind';
import 'react-native-reanimated';
import '../styles/global.css';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {View} from 'react-native';
import {useGlobalStore} from '@/context/store';
import {MemoryStorage} from '@/utils/storage';
import {APP_THEME} from '@/constants';
import PinModal from './components/PinModal';
import Loading from './components/loading';
import Toast from 'react-native-toast-message';

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
				<Stack.Screen name="+not-found" />
			</Stack>
			<PinModal />
			<Loading />
			<Toast />
		</View>
	);
}
