import {
	Keyboard,
	TextInput,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import React, {useState} from 'react';
import Back from '@/components/back';
import {Text} from '@/components/text';
import Button from './components/button';
import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';
import Toast from 'react-native-toast-message';
import {router} from 'expo-router';

const ChangePin = () => {
	const {setLoading} = useGlobalStore();
	const [formData, setFormData] = useState({
		old_pin: '',
		new_pin: '',
		new_pin_confirmation: '',
	});

	const handleChange = async () => {
		try {
			if (
				!formData.new_pin ||
				!formData.new_pin_confirmation ||
				!formData.old_pin
			) {
				throw new Error('Please input all fields');
			}
			setLoading(true);
			const axiosClient = new AxiosClient();
			const response = await axiosClient.post<{
				old_pin: string;
				new_pin: string;
				new_pin_confirmation: string;
			}>('/changepin', formData);
			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Transaction pin updated successfully',
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
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className="px-[5%] py-5 gap-x-4 flex-1">
				<Back title="Change Pin" />
				<View className="flex-1">
					<View className="gap-y-5 my-10">
						<View className="gap-y-5">
							<Text className="text-xl" fontWeight={600}>
								Old Pin
							</Text>

							<TextInput
								className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								value={formData.old_pin}
								onChangeText={text =>
									setFormData(prev => ({...prev, old_pin: text}))
								}
								placeholder="Old pin"
								inputMode="numeric"
							/>
						</View>
						<View className="gap-y-5">
							<Text className="text-xl" fontWeight={600}>
								New Pin
							</Text>

							<TextInput
								className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								value={formData.new_pin}
								onChangeText={text =>
									setFormData(prev => ({...prev, new_pin: text}))
								}
								placeholder="New pin"
								inputMode="numeric"
							/>
						</View>
						<View className="gap-y-5">
							<Text className="text-xl" fontWeight={600}>
								Retype Pin
							</Text>

							<TextInput
								className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								value={formData.new_pin_confirmation}
								onChangeText={text =>
									setFormData(prev => ({...prev, new_pin_confirmation: text}))
								}
								placeholder="Retype pin"
								inputMode="numeric"
							/>
						</View>
					</View>
				</View>
				<Button title="Change Pin" onPress={handleChange} />
			</View>
		</TouchableWithoutFeedback>
	);
};

export default ChangePin;
