import {IS_LOGGED_IN} from '@/constants';
import {AxiosClient} from '@/utils/axios';
import {MemoryStorage} from '@/utils/storage';
import {router, useFocusEffect} from 'expo-router';
import React from 'react';
import {ActivityIndicator, Image, View} from 'react-native';
import {UserResponse} from './types';
import {useGlobalStore} from '@/context/store';
import {GlobalColors} from '@/styles';

const Splash = () => {
	const {setUser} = useGlobalStore();

	useFocusEffect(() => {
		const checkLoginStatus = async () => {
			try {
				const storage = new MemoryStorage();
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
				console.error('Error checking login status:', error);
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
