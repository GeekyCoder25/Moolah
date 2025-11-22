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
import AntDesign from '@expo/vector-icons/AntDesign';

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
	const {setLoading, setAccessToken} = useGlobalStore();
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
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const isFormValid =
		formData.fname.trim() !== '' &&
		formData.lname.trim() !== '' &&
		formData.sEmail.trim() !== '' &&
		formData.sPhone.trim() !== '' &&
		formData.password.trim() !== '' &&
		formData.password_confirmation.trim() !== '';

	const handleSubmit = async () => {
		try {
			const phoneDigits = String(formData.sPhone || '').replace(/\D/g, '');
			const email = String(formData.sEmail || '').trim();
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!email || !emailRegex.test(email)) {
				setError(prev => ({
					...prev,
					sEmail: 'Please enter a valid email address',
				}));
				Toast.show({
					type: 'error',
					text1: 'Invalid email address',
					text2: 'Please enter a valid email (e.g. user@example.com).',
				});
				return;
			}
			const localWithZero = `0${phoneDigits}`;
			const validPrefixes = [
				// MTN
				'0703',
				'0704',
				'0706',
				'0803',
				'0806',
				'0810',
				'0813',
				'0814',
				'0816',

				// Glo
				'0705',
				'0805',
				'0807',
				'0811',
				'0815',
				'0817',
				// Airtel
				'090',
				'0701',
				'0708',
				'0802',
				'0808',
				'0812',

				// 9mobile (common prefixes)
				'0909',
				'0809',
			];

			const hasValidPrefix = validPrefixes.some(prefix =>
				localWithZero.startsWith(prefix)
			);

			if (!hasValidPrefix) {
				setError(prev => ({
					...prev,
					sPhone: 'Phone number not valid',
				}));
				Toast.show({
					type: 'error',
					text1: 'Invalid phone prefix',
					text2: 'Phone number mot valid',
				});
				return;
			}
			if (!phoneDigits || phoneDigits.length !== 10) {
				setError(prev => ({...prev, sPhone: 'Phone number must be 10 digits'}));
				Toast.show({
					type: 'error',
					text1: 'Invalid phone number',
					text2:
						'Please enter a valid 10-digit phone number (without country code).',
				});
				return;
			}
			const password = String(formData.password || '').trim();
			const confirm = String(formData.password_confirmation || '').trim();

			// Password presence and length check
			if (!password || password.length < 8) {
				setError(prev => ({
					...prev,
					password: 'Password must be at least 8 characters',
				}));
				Toast.show({
					type: 'error',
					text1: 'Invalid password',
					text2: 'Password must be at least 8 characters long.',
				});
				return;
			}

			// Confirm password presence
			if (!confirm) {
				setError(prev => ({
					...prev,
					password_confirmation: 'Please confirm your password',
				}));
				Toast.show({
					type: 'error',
					text1: 'Confirm password required',
					text2: 'Please enter the same password in the confirmation field.',
				});
				return;
			}

			// Match check
			if (password !== confirm) {
				setError(prev => ({
					...prev,
					password_confirmation: 'Passwords do not match',
				}));
				Toast.show({
					type: 'error',
					text1: 'Passwords do not match',
					text2: 'Please make sure both password fields are identical.',
				});
				return;
			}

			// clear password errors when valid
			setError(prev => ({...prev, password: '', password_confirmation: ''}));

			const axiosClient = new AxiosClient();
			const storage = new MemoryStorage();
			setLoading(true);
			const response = await axiosClient.post<any, AuthResponse>('/register', {
				...formData,
				sPhone: localWithZero,
			});
			if (response.status === 200) {
				console.log(response.data);
				setAccessToken(response.data.data.token);
				// storage.setItem(ACCESS_TOKEN_KEY, response.data.data.token);
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
		<ScrollView className="bg-white flex-1 px-[3%] py-5 pb-28">
			<KeyboardAvoidingView>
				<Logo />
				<Text className="text-4xl mt-10 mb-2" fontWeight={700}>
					Create your account
				</Text>
				<Text className="text-[#222222] text-xl">
					To get started with more features
				</Text>

				<View className="my-20 gap-y-3">
					<View className="">
						<Text className="text-xl" fontWeight={600}>
							First Name
						</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14 text-black"
							onChangeText={text => {
								setFormData(prev => ({
									...prev,
									fname: text.replace(/[<>"'&/]/g, ''),
								}));
								setError(prev => ({
									...prev,
									fname: '',
								}));
							}}
							value={formData.fname.replace(/[<>"'&/]/g, '')}
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
							className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14 text-black"
							onChangeText={text => {
								setFormData(prev => ({
									...prev,
									lname: text.replace(/[<>"'&/]/g, ''),
								}));
								setError(prev => ({
									...prev,
									lname: '',
								}));
							}}
							value={formData.lname.replace(/[<>"'&/]/g, '')}
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
							className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14 text-black"
							onChangeText={text => {
								setFormData(prev => ({
									...prev,
									sEmail: text.replace(/[<>"'&/]/g, ''),
								}));
								setError(prev => ({
									...prev,
									sEmail: '',
								}));
							}}
							value={formData.sEmail.replace(/[<>"'&/]/g, '')}
							inputMode="email"
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
							className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14 text-black"
							onChangeText={text => {
								setFormData(prev => ({
									...prev,
									sPhone: text
										.replace(/[<>"'&/]/g, '')
										.replace('+234', '')
										.replace('+23', '')
										.replace('+2', '')
										.replace('+', ''),
								}));
								setError(prev => ({
									...prev,
									sPhone: '',
								}));
							}}
							value={`+234${formData.sPhone.replace(/[<>"'&/]/g, '')}`}
							inputMode="tel"
							maxLength={14}
						/>
						<View className="ml-1">
							<Text className="text-red-500 text-sm">{error.sPhone}</Text>
						</View>
					</View>
					<View className="">
						<Text className="text-xl" fontWeight={600}>
							Password
						</Text>
						<View className="relative">
							<TextInput
								className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14 text-black"
								onChangeText={text => {
									setFormData(prev => ({
										...prev,
										password: text.replace(/[<>"'&/]/g, ''),
									}));
									setError(prev => ({
										...prev,
										password: '',
									}));
								}}
								value={formData.password.replace(/[<>"'&/]/g, '')}
								secureTextEntry={!showPassword}
							/>
							<View className="absolute right-5 top-1/2 -translate-y-1/2">
								{/* <EyeIcon /> */}
								<TouchableOpacity
									onPress={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<AntDesign name="eye" size={24} color="#C8C8C8" />
									) : (
										<AntDesign name="eye-invisible" size={24} color="#C8C8C8" />
									)}
								</TouchableOpacity>
							</View>
						</View>
						<View className="ml-1">
							<Text className="text-red-500 text-sm">{error.password}</Text>
						</View>
					</View>
					<View className="">
						<Text className="text-xl" fontWeight={600}>
							Confirm Password
						</Text>
						<View className="relative">
							<TextInput
								className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14 text-black"
								onChangeText={text => {
									setFormData(prev => ({
										...prev,
										password_confirmation: text.replace(/[<>"'&/]/g, ''),
									}));
									setError(prev => ({
										...prev,
										password: '',
									}));
								}}
								value={formData.password_confirmation.replace(/[<>"'&/]/g, '')}
								secureTextEntry={!showConfirmPassword}
							/>
							<View className="absolute right-5 top-1/2 -translate-y-1/2">
								{/* <EyeIcon /> */}
								<TouchableOpacity
									onPress={() => setShowConfirmPassword(!showConfirmPassword)}
								>
									{showConfirmPassword ? (
										<AntDesign name="eye" size={24} color="#C8C8C8" />
									) : (
										<AntDesign name="eye-invisible" size={24} color="#C8C8C8" />
									)}
								</TouchableOpacity>
							</View>
						</View>
						<View className="ml-1">
							<Text className="text-red-500 text-sm">
								{error.password_confirmation}
							</Text>
						</View>
					</View>
				</View>
				<View className="mb-60">
					<Button
						title="Sign up"
						onPress={handleSubmit}
						disabled={!isFormValid}
					/>
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
