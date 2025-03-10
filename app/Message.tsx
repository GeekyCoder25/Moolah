import {TextInput, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {Text} from '@/components/text';
import Back from '@/components/back';
import {ScrollView} from 'react-native';
import Button from './components/button';
import {AxiosClient} from '@/utils/axios';
import {useGlobalStore} from '@/context/store';
import Toast from 'react-native-toast-message';
import {router} from 'expo-router';

const Message = () => {
	const {setLoading, user} = useGlobalStore();
	const [formData, setFormData] = useState({subject: '', message: ''});

	const handleSubmit = async () => {
		try {
			const axiosClient = new AxiosClient();

			setLoading(true);
			const response = await axiosClient.post<{
				name: string;
				email: string;
				subject: string;
				message: string;
			}>('/support', {
				name: `${user?.firstname} ${user?.lastname}`,
				email: user?.email || '',
				subject: formData.subject,
				message: formData.message,
			});
			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Message sent',
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
			console.log(error.response?.data || error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<ScrollView className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="Contact us" />

			<View>
				<View className="mt-10">
					<Text className="text-3xl" fontWeight={600}>
						Send direct message
					</Text>
					<Text className="text-secondary mt-2 rounded-tl-2xl">Contact us</Text>
				</View>

				<View className="gap-y-5 my-10">
					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={600}>
							Subject
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							value={formData.subject}
							onChangeText={text =>
								setFormData(prev => ({...prev, subject: text}))
							}
							placeholder="Subject"
						/>
					</View>
					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={600}>
							Message
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] p-5 h-36 rounded-lg flex-row justify-between items-center"
							value={formData.message}
							onChangeText={text =>
								setFormData(prev => ({...prev, message: text}))
							}
							placeholder="Your message"
							textAlignVertical="top"
							multiline
						/>
					</View>
				</View>

				<Button title="Submit" onPress={handleSubmit} />
			</View>
		</ScrollView>
	);
};

export default Message;
