import {ACCESS_TOKEN_KEY, IS_LOGGED_IN} from '@/constants';
import {useGlobalStore} from '@/context/store';
import {GlobalColors} from '@/styles';
import {UserResponse} from '@/types';
import {AxiosClient} from '@/utils/axios';
import {MemoryStorage} from '@/utils/storage';
import {router, useFocusEffect} from 'expo-router';
import React from 'react';
import {ActivityIndicator, Image, View} from 'react-native';
import Toast from 'react-native-toast-message';

const Splash = () => {
	const {setUser} = useGlobalStore();

	useFocusEffect(() => {
		const checkLoginStatus = async () => {
			const storage = new MemoryStorage();
			try {
				const isLoggedIn = await storage.getItem(IS_LOGGED_IN);
				if (isLoggedIn === 'true') {
					const axiosClient = new AxiosClient();

					const response = await axiosClient.get<UserResponse>('/user');
					if (response.status === 200) {
						if (response.data.data.email_verified === false) {
							router.replace('/Signin');
						} else {
							setUser(response.data.data.attributes);
							router.replace('/(tabs)');
						}
					}
				} else {
					router.replace('/Signin');
				}
			} catch (error: any) {
				if (error.response?.status === 401) {
					// Session no longer valid — clear the persisted session and re-auth.
					await storage.removeItem(IS_LOGGED_IN);
					await storage.removeItem(ACCESS_TOKEN_KEY);
					router.replace('/Signin');
				} else {
					Toast.show({
						type: 'error',
						text1: 'Error',
						text2: error.response?.data || error.message,
					});
				}
			}
		};

		checkLoginStatus();
	});

	return (
		<View className="flex-1 bg-white flex justify-center items-center">
			<Image
				source={require('../assets/images/adaptive-icon.png')}
				className="w-[200px] h-[200px] mb-10"
			/>
			<ActivityIndicator size={'large'} color={GlobalColors.secondary} />
		</View>
	);
};

export default Splash;
