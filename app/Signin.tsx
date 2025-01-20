import {Text} from '@/components/text';
import {TextInput, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import Logo from '@/assets/icons/logo';
import {router} from 'expo-router';
import Button from './components/button';

const Signin = () => {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	const handleSubmit = async () => {
		router.replace('/(tabs)');
	};

	return (
		<View className="bg-white flex-1 px-[3%] py-5">
			<Logo />
			<Text className="text-4xl mt-10 mb-2" fontWeight={700}>
				Sign in to your account
			</Text>
			<Text className="text-[#222222] text-xl">
				To get back into more features
			</Text>

			<View className="my-20 gap-y-5">
				<View className="">
					<Text className="text-2xl" fontWeight={700}>
						Email address / Phone Number
					</Text>
					<TextInput
						className="bg-white border-[1px] border-[#C8C8C8] w-full my-3 rounded-lg px-5 h-14"
						onChangeText={text => setFormData(prev => ({...prev, email: text}))}
						value={formData.email}
					/>
				</View>
				<View className="">
					<Text className="text-2xl" fontWeight={700}>
						Password
					</Text>
					<TextInput
						className="bg-white border-[1px] border-[#C8C8C8] w-full my-3 rounded-lg px-5 h-14"
						onChangeText={text =>
							setFormData(prev => ({...prev, password: text}))
						}
						value={formData.password}
						secureTextEntry
					/>
					<TouchableOpacity onPress={() => router.navigate('/Forget')}>
						<Text className="text-xl text-primary text-right" fontWeight={600}>
							Forget Password?
						</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View>
				<Button title="Log in" onPress={handleSubmit} />
				<View className="flex-row justify-center items-center mt-5">
					<Text className="text-xl">Already have an existing account? </Text>

					<TouchableOpacity onPress={() => router.navigate('/Signup')}>
						<Text className="text-primary text-2xl" fontWeight={700}>
							Sign up{' '}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

export default Signin;
