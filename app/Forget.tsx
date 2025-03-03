import {
	Keyboard,
	Pressable,
	TextInput,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import React, {useState} from 'react';
import Logo from '@/assets/icons/logo';
import {Text} from '@/components/text';
import Button from './components/button';
import {router} from 'expo-router';
import BackIcon from '@/assets/icons/back-icon';
import Toast from 'react-native-toast-message';
import {AxiosClient} from '@/utils/axios';
import {useGlobalStore} from '@/context/store';

const Forget = () => {
	const {setLoading} = useGlobalStore();
	const [formData, setFormData] = useState({
		email: '',
	});

	const handleSubmit = async () => {
		if (!formData.email) {
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2: 'Please provide your email address',
			});
		}
		setLoading(true);
		try {
			const axiosClient = new AxiosClient();
			const response = await axiosClient.post<{
				email: string;
			}>('/password/email', {
				email: formData.email,
			});
			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'OTP sent to email',
				});
				router.push(`/ForgetOTP?email=${formData.email}`);
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
			console.log(error.response?.data || error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className="bg-white flex-1 px-[3%] py-5 pb-10">
				<Pressable className="pb-5" onPress={router.back}>
					<BackIcon />
				</Pressable>
				<Logo />
				<Text className="text-4xl mt-10 mb-2" fontWeight={700}>
					Recover your password
				</Text>
				<Text className="text-[#222222] text-xl">
					Lets reset your password to regain access
				</Text>

				<View className="my-20 gap-y-5 flex-1">
					<View className="">
						<Text className="text-2xl" fontWeight={700}>
							Email address
						</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full my-3 rounded-lg px-5 h-14"
							onChangeText={text =>
								setFormData(prev => ({...prev, email: text}))
							}
							value={formData.email}
						/>
					</View>
				</View>
				<Button title="Continue" onPress={handleSubmit} />
			</View>
		</TouchableWithoutFeedback>
	);
};

export default Forget;
