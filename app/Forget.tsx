import {Pressable, TextInput, View} from 'react-native';
import React, {useState} from 'react';
import Logo from '@/assets/icons/logo';
import {Text} from '@/components/text';
import Button from './components/button';
import {router} from 'expo-router';
import BackIcon from '@/assets/icons/back-icon';

const Forget = () => {
	const [formData, setFormData] = useState({
		email: '',
	});

	const handleSubmit = async () => {
		router.push(`/ForgetOTP?email=${formData.email}`);
	};

	return (
		<View className="bg-white flex-1 px-[3%] py-5">
			<Pressable className="pb-5" onPress={router.back}>
				<BackIcon />
			</Pressable>
			<Logo />
			<Text className="text-4xl mt-10 mb-2" fontWeight={700}>
				Recover your password
			</Text>
			<Text className="text-[#222222] text-xl">
				To get back into more features
			</Text>

			<View className="my-20 gap-y-5 flex-1">
				<View className="">
					<Text className="text-2xl" fontWeight={700}>
						Email address
					</Text>
					<TextInput
						className="bg-white border-[1px] border-[#C8C8C8] w-full my-3 rounded-lg px-5 h-14"
						onChangeText={text => setFormData(prev => ({...prev, email: text}))}
						value={formData.email}
					/>
				</View>
			</View>
			<Button title="Continue" onPress={handleSubmit} />
		</View>
	);
};

export default Forget;
