import BackIcon from '@/assets/icons/back-icon';
import Logo from '@/assets/icons/logo';
import {useGlobalStore} from '@/context/store';
import {router} from 'expo-router';
import React, {useState} from 'react';
import {Keyboard, Pressable, Text, TextInput, View} from 'react-native';
import Toast from 'react-native-toast-message';
import Button from '../components/button';

const Step2 = () => {
	const {nin, setNin} = useGlobalStore();
	const [input, setInput] = useState(nin);

	const handleVerify = async () => {
		if (input.length < 11) {
			return Toast.show({
				text1: 'Invalid NIN provided',
				type: 'error',
			});
		}
		setNin(input);
		router.back();
	};

	return (
		<Pressable
			className="bg-white px-[5%] pt-5 pb-10 flex-1"
			onPress={Keyboard.dismiss}
		>
			<Pressable
				className="flex-row items-center gap-x-4 mb-5"
				onPress={router.back}
			>
				<BackIcon />
			</Pressable>

			<Logo />

			<View className="my-10">
				<Text className="text-3xl font-bold">
					Verify your identity with your NIN
				</Text>
				<Text className="text-[#222222] mt-2 rounded-tl-2xl">
					Input your NIN to verify your identity
				</Text>
			</View>

			<View className="flex-1">
				<View className="gap-y-5">
					<Text className="text-xl font-bold">NIN</Text>

					<TextInput
						className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
						inputMode="tel"
						maxLength={11}
						value={input.replace(/[<>"'&/]/g, '')}
						onChangeText={text => setInput(text.replace(/[<>"'&/]/g, ''))}
					/>
				</View>
			</View>

			<View className="my-10">
				<Button title="Verify NIN" onPress={handleVerify} />
			</View>
		</Pressable>
	);
};

export default Step2;
