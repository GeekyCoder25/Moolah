import {Text} from '@/components/text';
import {ScrollView, TextInput, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import Logo from '@/assets/icons/logo';
import {router} from 'expo-router';
import Button from './components/button';
import {useGlobalStore} from '@/context/store';
import Toast from 'react-native-toast-message';
import {AxiosClient} from '@/utils/axios';
import {errorFormat} from '@/utils';
import {MemoryStorage} from '@/utils/storage';
import {ACCESS_TOKEN_KEY, IS_LOGGED_IN} from '@/constants';
import {UserResponse} from './types';
import AntDesign from '@expo/vector-icons/AntDesign';
interface SigninRequest {
	sPhone: string;
	password: string;
}
interface SigninResponse {
	status: number;
	message: string;
	data: {
		token: string;
		user: {
			name: string;
			email: string;
		};
	};
}

const Signin = () => {
	const {setLoading, setUser, setAccessToken} = useGlobalStore();
	const [formData, setFormData] = useState({
		sPhone: '',
		password: '',
	});
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async () => {
		const axiosClient = new AxiosClient();
		try {
			setLoading(true);

			const response = await axiosClient.post<SigninRequest, SigninResponse>(
				'/login',
				formData
			);
			if (response.status === 200) {
				const storage = new MemoryStorage();
				setAccessToken(response.data.data.token);
				// await storage.setItem(ACCESS_TOKEN_KEY, response.data.data.token);
				const email = response.data.data.user.email;
				const userResponse = await axiosClient.get<UserResponse>('/user');
				if (userResponse.status === 200) {
					if (userResponse.data.data.email_verified === false) {
						router.navigate(`/VerifyOTP?email=${email}`);
						await axiosClient.post('/resend-verify/email', {email});
					} else {
						await storage.setItem(IS_LOGGED_IN, 'true');
						setUser(userResponse.data.data.attributes);
						router.replace('/(tabs)');
					}
				}
			}
		} catch (error: any) {
			console.log(error.response?.status, error.response?.data);
			if (error.response.status === 403) {
				if (formData.sPhone.includes('@')) {
					router.replace(`/VerifyOTP?email=${formData.sPhone}`);
					await axiosClient.post('/resend-verify/email', {
						email: formData.sPhone,
					});
				} else {
					router.replace('/Forget');
				}
			}
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2: errorFormat(
					error.response?.data?.message || error.response?.data || error.message
				),
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<ScrollView className="bg-white flex-1 px-[3%] py-5">
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
						Phone Number / Email
					</Text>
					<TextInput
						className="bg-white border-[1px] border-[#C8C8C8] w-full my-3 rounded-lg px-5 h-14 text-black"
						onChangeText={text =>
							setFormData(prev => ({
								...prev,
								sPhone: text.replace(/[<>"'&/]/g, ''),
							}))
						}
						value={formData.sPhone.replace(/[<>"'&/]/g, '')}
					/>
				</View>
				<View className="">
					<Text className="text-2xl" fontWeight={700}>
						Password
					</Text>
					<View className="relative">
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full my-3 rounded-lg px-5 h-14 text-black"
							onChangeText={text =>
								setFormData(prev => ({
									...prev,
									password: text.replace(/[<>"'&/]/g, ''),
								}))
							}
							value={formData.password.replace(/[<>"'&/]/g, '')}
							secureTextEntry={!showPassword}
						/>
						<View className="absolute right-5 top-1/2 -translate-y-1/2">
							{/* <EyeIcon /> */}
							<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
								{showPassword ? (
									<AntDesign name="eye" size={24} color="#C8C8C8" />
								) : (
									<AntDesign name="eye-invisible" size={24} color="#C8C8C8" />
								)}
							</TouchableOpacity>
						</View>
					</View>
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
		</ScrollView>
	);
};

export default Signin;
