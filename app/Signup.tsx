import {Text} from '@/components/text';
import {
	KeyboardAvoidingView,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import React, {useState} from 'react';
import Logo from '@/assets/icons/logo';
import {router} from 'expo-router';
import {ScrollView} from 'react-native';
import Button from './components/button';
import {AxiosClient} from '@/utils/axios';
import Toast from 'react-native-toast-message';
import {useGlobalStore} from '@/context/store';
import {MemoryStorage} from '@/utils/storage';
import {ACCESS_TOKEN_KEY} from '@/constants';

interface User {
	createdAt: string;
	sApiKey: string;
	sBankName: string;
	sBankNo: string;
	sEmail: string;
	sFname: string;
	sId: number;
	sLname: string;
	sPass: string;
	sPhone: string;
	sPin: number;
	sReferal: string | null;
	sRegStatus: number;
	sState: string | null;
	sType: number;
	sVerCode: number;
	updatedAt: string;
}

interface AuthResponse {
	data: {
		token: string;
		user: User;
	};
	message: string;
	status: number;
}

const Signup = () => {
	const {setLoading} = useGlobalStore();
	const [formData, setFormData] = useState({
		fname: '',
		lname: '',
		sEmail: '',
		sPhone: '',
		password: '',
		password_confirmation: '',
		referral: '',
		pin: '0000',
		state: '',
	});
	const [error, setError] = useState(formData);

	const handleSubmit = async () => {
		try {
			const axiosClient = new AxiosClient();
			const storage = new MemoryStorage();
			setLoading(true);
			const response = await axiosClient.post<any, AuthResponse>(
				'/register',
				formData
			);
			if (response.status === 200) {
				console.log(response.data);
				storage.setItem(ACCESS_TOKEN_KEY, response.data.data.token);
				router.navigate(`/VerifyOTP?email=${formData.sEmail}`);
			}
		} catch (err: any) {
			Toast.show({
				type: 'error',
				text1: 'Registration Error',
				text2: err.response?.data || err.message,
			});
			console.log(
				err.response?.data.errors || err.response?.data || err.message
			);
			setError(err.response.data?.errors);
		} finally {
			setLoading(false);
		}
	};

	return (
		<ScrollView className="bg-white flex-1 px-[3%] py-5">
			<KeyboardAvoidingView>
				<Logo />
				<Text className="text-4xl mt-10 mb-2" fontWeight={700}>
					Create your account
				</Text>
				<Text className="text-[#222222] text-xl">
					To get started with more features
				</Text>

				<View className="my-20 gap-y-5">
					<View className="">
						<Text className="text-xl" fontWeight={600}>
							First Name
						</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14"
							onChangeText={text => {
								setFormData(prev => ({...prev, fname: text}));
								setError(prev => ({
									...prev,
									fname: '',
								}));
							}}
							value={formData.fname}
						/>
						<View className="ml-1">
							<Text className="text-red-500 text-sm">{error.fname}</Text>
						</View>
					</View>
					<View className="">
						<Text className="text-xl" fontWeight={600}>
							Last Name
						</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14"
							onChangeText={text => {
								setFormData(prev => ({...prev, lname: text}));
								setError(prev => ({
									...prev,
									lname: '',
								}));
							}}
							value={formData.lname}
						/>
						<View className="ml-1">
							<Text className="text-red-500 text-sm">{error.lname}</Text>
						</View>
					</View>
					<View className="">
						<Text className="text-xl" fontWeight={600}>
							Email address
						</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14"
							onChangeText={text => {
								setFormData(prev => ({...prev, sEmail: text}));
								setError(prev => ({
									...prev,
									sEmail: '',
								}));
							}}
							value={formData.sEmail}
						/>
						<View className="ml-1">
							<Text className="text-red-500 text-sm">{error.sEmail}</Text>
						</View>
					</View>
					<View className="">
						<Text className="text-xl" fontWeight={600}>
							Phone Number
						</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14"
							onChangeText={text => {
								setFormData(prev => ({...prev, sPhone: text}));
								setError(prev => ({
									...prev,
									sPhone: '',
								}));
							}}
							value={formData.sPhone}
							inputMode="tel"
							maxLength={11}
						/>
						<View className="ml-1">
							<Text className="text-red-500 text-sm">{error.sPhone}</Text>
						</View>
					</View>
					<View className="">
						<Text className="text-xl" fontWeight={600}>
							Password
						</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14"
							onChangeText={text => {
								setFormData(prev => ({...prev, password: text}));
								setError(prev => ({
									...prev,
									password: '',
								}));
							}}
							value={formData.password}
							secureTextEntry
						/>
						<View className="ml-1">
							<Text className="text-red-500 text-sm">{error.password}</Text>
						</View>
					</View>
					<View className="">
						<Text className="text-xl" fontWeight={600}>
							Confirm Password
						</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14"
							onChangeText={text => {
								setFormData(prev => ({...prev, password_confirmation: text}));
								setError(prev => ({
									...prev,
									password: '',
								}));
							}}
							value={formData.password_confirmation}
							secureTextEntry
						/>
					</View>
				</View>
				<View className="mb-20">
					<Button title="Sign up" onPress={handleSubmit} />
					<View className="flex-row justify-center items-center mt-5">
						<Text className="text-xl">Don't have an account? </Text>

						<TouchableOpacity onPress={() => router.navigate('/Signin')}>
							<Text className="text-primary text-2xl" fontWeight={700}>
								Sign in{' '}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>
		</ScrollView>
	);
};

export default Signup;
