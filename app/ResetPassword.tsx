import {Pressable, TextInput, View} from 'react-native';
import React, {useState} from 'react';
import Back from '@/components/back';
import {Text} from '@/components/text';
import Button from './components/button';
import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';
import Toast from 'react-native-toast-message';
import {router, useLocalSearchParams} from 'expo-router';
import BackIcon from '@/assets/icons/back-icon';
import {useNavigation} from 'expo-router';

const ResetPassword = () => {
	const navigation = useNavigation();
	const {setLoading} = useGlobalStore();
	const {email, token}: {email: string; token: string} = useLocalSearchParams();

	const [formData, setFormData] = useState({
		email,
		token,
		password: '',
		password_confirmation: '',
	});

	const handleChange = async () => {
		try {
			setLoading(true);
			const axiosClient = new AxiosClient();
			const response = await axiosClient.post<{
				token: string;
				email: string;
				password: string;
				password_confirmation: string;
			}>('/password/reset', formData);
			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Password updated successfully',
				});
				router.replace('/Signin');
			}
		} catch (error: any) {
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2:
					error.response?.data?.message ||
					error.response?.data ||
					error.message,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<View className="px-[5%] py-5 gap-x-4 flex-1">
			<Pressable
				className="flex-row items-center gap-x-4"
				onPress={() => navigation.goBack()}
			>
				<BackIcon />
				<Text className="text-2xl">Reset Password</Text>
			</Pressable>

			<View className="flex-1">
				<View className="gap-y-5 my-10">
					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={600}>
							New Password
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							value={formData.password}
							onChangeText={text =>
								setFormData(prev => ({...prev, password: text}))
							}
							placeholder="New password"
						/>
					</View>
					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={600}>
							Retype Password
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							value={formData.password_confirmation}
							onChangeText={text =>
								setFormData(prev => ({
									...prev,
									password_confirmation: text,
								}))
							}
							placeholder="Retype password"
						/>
					</View>
				</View>
			</View>
			<Button title="Change Password" onPress={handleChange} />
		</View>
	);
};

export default ResetPassword;
