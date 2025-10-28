import {TextInput, View} from 'react-native';
import React, {useState} from 'react';
import Back from '@/components/back';
import {Text} from '@/components/text';
import Button from './components/button';
import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';
import Toast from 'react-native-toast-message';
import {router} from 'expo-router';

const ChangePassword = () => {
	const {setLoading} = useGlobalStore();
	const [formData, setFormData] = useState({
		old_password: '',
		new_password: '',
		new_password_confirmation: '',
	});

	const handleChange = async () => {
		try {
			setLoading(true);
			const axiosClient = new AxiosClient();
			const response = await axiosClient.post<{
				old_password: string;
				new_password: string;
				new_password_confirmation: string;
			}>('/changepass', formData);
			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Password updated successfully',
				});
				router.back();
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
			<Back title="Change Password" />
			<View className="flex-1">
				<View className="gap-y-5 my-10">
					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={600}>
							Old Password
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							value={formData.old_password}
							onChangeText={text =>
								setFormData(prev => ({
									...prev,
									old_password: text.replace(/[<>"'&/]/g, ''),
								}))
							}
							placeholder="Old password"
						/>
					</View>
					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={600}>
							New Password
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							value={formData.new_password}
							onChangeText={text =>
								setFormData(prev => ({
									...prev,
									new_password: text.replace(/[<>"'&/]/g, ''),
								}))
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
							value={formData.new_password_confirmation}
							onChangeText={text =>
								setFormData(prev => ({
									...prev,
									new_password_confirmation: text.replace(/[<>"'&/]/g, ''),
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

export default ChangePassword;
