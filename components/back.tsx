import {Pressable, TouchableOpacity, View} from 'react-native';
import {Text} from './text';
import {FC} from 'react';
import ProfileIcon from '@/assets/icons/profile';
import NotificationIcon from '@/assets/icons/notification';
// import ModeIcon from '@/assets/icons/mode';
import {router, useNavigation} from 'expo-router';
import BackIcon from '@/assets/icons/back-icon';
import {useGlobalStore} from '@/context/store';
// import {colorScheme} from 'nativewind';
// import {MemoryStorage} from '@/utils/storage';
// import {APP_THEME} from '@/constants';

const Back: FC<{title: string}> = ({title}) => {
	const navigation = useNavigation();
	const {darkMode, setDarkMode} = useGlobalStore();

	// const handleMode = async () => {
	// 	const storage = new MemoryStorage();
	// 	await storage.setItem(APP_THEME, darkMode ? 'light' : 'dark');
	// 	colorScheme.set(darkMode ? 'light' : 'dark');
	// 	setDarkMode(!darkMode);
	// };

	return (
		<View className="flex-row justify-between">
			<Pressable
				className="flex-row items-center gap-x-4"
				onPress={() => navigation.goBack()}
			>
				<BackIcon />
				<Text className="text-2xl">{title}</Text>
			</Pressable>

			<View className="flex-row gap-x-4">
				{/* <TouchableOpacity onPress={handleMode}>
					<ModeIcon />
				</TouchableOpacity> */}
				<TouchableOpacity onPress={() => router.navigate('/Notification')}>
					<NotificationIcon />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => router.navigate('/Profile')}>
					<ProfileIcon />
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default Back;
