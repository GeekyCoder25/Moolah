import Logo from '@/assets/icons/logo';
import {Text} from '@/components/text';
import {ACCESS_TOKEN_KEY, IS_LOGGED_IN, LAST_OTP} from '@/constants';
import {useGlobalStore} from '@/context/store';
import {errorFormat} from '@/utils';
import {AxiosClient} from '@/utils/axios';
import {MemoryStorage} from '@/utils/storage';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as Clipboard from 'expo-clipboard';
import {router} from 'expo-router';
import React, {useEffect, useRef, useState} from 'react';
import {
	AppState,
	AppStateStatus,
	Dimensions,
	Keyboard,
	ScrollView,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {UserResponse} from '../types';
import Button from './components/button';

interface SigninRequest {
	sPhone: string;
	password: string;
}

interface SigninResponse {
	status: number;
	message: string;
	data:
		| {
				requires_device_verification: true;
				verification_token: string;
				email: string;
		  }
		| {
				token: string;
				user: {name: string; email: string};
		  };
}

interface VerifyDeviceResponse {
	status: number;
	message: string;
	data: {
		token: string;
		user: {name: string; email: string};
	};
}

const BOX_CLASS = (width: number) =>
	width < 400
		? 'w-12 h-12 text-2xl rounded-xl'
		: width < 450
			? 'w-14 h-14 text-3xl rounded-xl'
			: 'w-16 h-16 text-4xl rounded-2xl';

const Signin = () => {
	const {setLoading, setUser, setAccessToken} = useGlobalStore();
	const [formData, setFormData] = useState({
		sPhone: __DEV__ ? '08027504524' : '',
		password: __DEV__ ? 'PaPa@200' : '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [deviceVerification, setDeviceVerification] = useState<{
		required: boolean;
		token: string;
		email: string;
	}>({required: false, token: '', email: ''});

	// 6-box OTP
	const [otpCode1, setOtpCode1] = useState('');
	const [otpCode2, setOtpCode2] = useState('');
	const [otpCode3, setOtpCode3] = useState('');
	const [otpCode4, setOtpCode4] = useState('');
	const [otpCode5, setOtpCode5] = useState('');
	const [otpCode6, setOtpCode6] = useState('');
	const [isError1, setIsError1] = useState(false);
	const [isError2, setIsError2] = useState(false);
	const [isError3, setIsError3] = useState(false);
	const [isError4, setIsError4] = useState(false);
	const [isError5, setIsError5] = useState(false);
	const [isError6, setIsError6] = useState(false);
	const [focusedBox, setFocusedBox] = useState(0);
	const [timeLeft, setTimeLeft] = useState(60);
	const [hasAutoPasted, setHasAutoPasted] = useState(false);
	const [otpRetry, setOtpRetry] = useState(1);
	const inputRef1 = useRef<TextInput>(null);
	const inputRef2 = useRef<TextInput>(null);
	const inputRef3 = useRef<TextInput>(null);
	const inputRef4 = useRef<TextInput>(null);
	const inputRef5 = useRef<TextInput>(null);
	const inputRef6 = useRef<TextInput>(null);
	const appStateRef = useRef<AppStateStatus>(AppState.currentState);
	const endTime = useRef<number | null>(null);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Timer + AppState tracking for device verification screen
	useEffect(() => {
		if (!deviceVerification.required) return;
		endTime.current = Date.now() + 60 * 1000;
		timerRef.current = setInterval(() => {
			setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
		}, 1000);
		const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
			if (
				appStateRef.current.match(/inactive|background/) &&
				next === 'active'
			) {
				const remaining = Math.round((endTime.current! - Date.now()) / 1000);
				setTimeLeft(remaining > 0 ? remaining : 0);
			}
			appStateRef.current = next;
		});
		return () => {
			clearInterval(timerRef.current!);
			sub.remove();
		};
	}, [deviceVerification.required]);

	// Clipboard auto-paste
	useEffect(() => {
		if (!deviceVerification.required) return;
		const storage = new MemoryStorage();

		const tryPaste = async () => {
			const clipboard = await Clipboard.getStringAsync();
			const saved = await storage.getItem(LAST_OTP);
			if (clipboard === saved) return;
			if (clipboard.length === 6 && !isNaN(Number(clipboard))) {
				setOtpCode1(clipboard[0]);
				setOtpCode2(clipboard[1]);
				setOtpCode3(clipboard[2]);
				setOtpCode4(clipboard[3]);
				setOtpCode5(clipboard[4]);
				setOtpCode6(clipboard[5]);
				setHasAutoPasted(true);
				Keyboard.dismiss();
				await storage.setItem(LAST_OTP, clipboard);
				submitOtp(clipboard);
			}
		};

		if (!hasAutoPasted) tryPaste();
		const interval = setInterval(() => {
			if (!hasAutoPasted) tryPaste();
			setOtpRetry(p => p + 1);
		}, 5000);
		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deviceVerification.required, otpRetry, hasAutoPasted]);

	const clearOTP = () => {
		setOtpCode1('');
		setOtpCode2('');
		setOtpCode3('');
		setOtpCode4('');
		setOtpCode5('');
		setOtpCode6('');
		setIsError1(false);
		setIsError2(false);
		setIsError3(false);
		setIsError4(false);
		setIsError5(false);
		setIsError6(false);
		setHasAutoPasted(false);
	};

	const finalizeLogin = async (authToken: string, email: string) => {
		const storage = new MemoryStorage();
		const axiosClient = new AxiosClient();
		setAccessToken(authToken);
		__DEV__ && (await storage.setItem(ACCESS_TOKEN_KEY, authToken));

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
	};

	const handleSubmit = async () => {
		const axiosClient = new AxiosClient();
		try {
			setLoading(true);
			const response = await axiosClient.post<SigninRequest, SigninResponse>(
				'/login',
				formData,
			);
			if (response.status === 200) {
				const data = response.data.data;
				if (
					'requires_device_verification' in data &&
					data.requires_device_verification
				) {
					setDeviceVerification({
						required: true,
						token: data.verification_token,
						email: data.email,
					});
				} else if ('token' in data) {
					await finalizeLogin(data.token, data.user.email);
				}
			}
		} catch (error: any) {
			console.log(error.response?.status, error.response?.data);
			if (error.response?.status === 403) {
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
					error.response?.data?.message ||
						error.response?.data ||
						error.message,
				),
			});
		} finally {
			setLoading(false);
		}
	};

	const submitOtp = async (rawOtp?: string) => {
		const otp =
			rawOtp ?? otpCode1 + otpCode2 + otpCode3 + otpCode4 + otpCode5 + otpCode6;

		if (!rawOtp) {
			const missing = [
				!otpCode1 && setIsError1,
				!otpCode2 && setIsError2,
				!otpCode3 && setIsError3,
				!otpCode4 && setIsError4,
				!otpCode5 && setIsError5,
				!otpCode6 && setIsError6,
			];
			missing.forEach(fn => fn && fn(true));
			if (otp.length < 6) return;
		}

		const axiosClient = new AxiosClient();
		try {
			setLoading(true);
			const response = await axiosClient.post<
				{verification_token: string; otp_code: string},
				VerifyDeviceResponse
			>('/login/verify-device', {
				verification_token: deviceVerification.token,
				otp_code: otp,
			});
			if (response.status === 200) {
				await finalizeLogin(
					response.data.data.token,
					response.data.data.user.email,
				);
			}
		} catch (error: any) {
			setIsError1(true);
			setIsError2(true);
			setIsError3(true);
			setIsError4(true);
			setIsError5(true);
			setIsError6(true);
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2: errorFormat(
					error.response?.data?.message ||
						error.response?.data ||
						error.message,
				),
			});
			setTimeout(() => {
				clearOTP();
				inputRef1.current?.focus();
			}, 1500);
		} finally {
			setLoading(false);
		}
	};

	const w = Dimensions.get('window').width;
	const boxClass = BOX_CLASS(w);

	if (deviceVerification.required) {
		return (
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View className="bg-white flex-1 px-[3%] py-5 pb-10">
					<Logo />
					<Text className="text-3xl mt-10 mb-2 font-bold">
						Device Verification
					</Text>
					<Text className="text-[#222222] text-lg">
						Enter the code sent to{' '}
						<Text className="text-secondary font-bold">
							{deviceVerification.email}
						</Text>
					</Text>

					<View className="my-20 gap-y-5 flex-1">
						<View className="flex-row justify-between gap-x-3 mt-5 max-w-[350px]">
							{/* Box 1 */}
							<TouchableOpacity onPress={() => inputRef1.current?.focus()}>
								<TextInput
									ref={inputRef1}
									value={otpCode1}
									onChangeText={text => {
										if (text) inputRef2.current?.focus();
										setOtpCode1(text);
										setIsError1(false);
									}}
									onFocus={() => setFocusedBox(1)}
									inputMode="numeric"
									maxLength={1}
									textAlign="center"
									autoFocus
									className={`border-[1px] ${boxClass} p-1 font-bold ${isError1 ? 'text-red-500' : ''} ${focusedBox === 1 ? 'border-secondary' : isError1 ? 'border-red-500' : 'border-[#C8C8C8]'}`}
								/>
							</TouchableOpacity>
							{/* Box 2 */}
							<TouchableOpacity onPress={() => inputRef2.current?.focus()}>
								<TextInput
									ref={inputRef2}
									value={otpCode2}
									onChangeText={text => {
										if (text) inputRef3.current?.focus();
										else inputRef1.current?.focus();
										setOtpCode2(text);
										setIsError2(false);
									}}
									onFocus={() => setFocusedBox(2)}
									inputMode="numeric"
									maxLength={1}
									textAlign="center"
									className={`border-[1px] ${boxClass} p-1 font-bold ${isError2 ? 'text-red-500' : ''} ${focusedBox === 2 ? 'border-secondary' : isError2 ? 'border-red-500' : 'border-[#C8C8C8]'}`}
								/>
							</TouchableOpacity>
							{/* Box 3 */}
							<TouchableOpacity onPress={() => inputRef3.current?.focus()}>
								<TextInput
									ref={inputRef3}
									value={otpCode3}
									onChangeText={text => {
										if (text) inputRef4.current?.focus();
										else inputRef2.current?.focus();
										setOtpCode3(text);
										setIsError3(false);
									}}
									onFocus={() => setFocusedBox(3)}
									inputMode="numeric"
									maxLength={1}
									textAlign="center"
									className={`border-[1px] ${boxClass} p-1 font-bold ${isError3 ? 'text-red-500' : ''} ${focusedBox === 3 ? 'border-secondary' : isError3 ? 'border-red-500' : 'border-[#C8C8C8]'}`}
								/>
							</TouchableOpacity>
							{/* Box 4 */}
							<TouchableOpacity onPress={() => inputRef4.current?.focus()}>
								<TextInput
									ref={inputRef4}
									value={otpCode4}
									onChangeText={text => {
										if (text) inputRef5.current?.focus();
										else inputRef3.current?.focus();
										setOtpCode4(text);
										setIsError4(false);
									}}
									onFocus={() => setFocusedBox(4)}
									inputMode="numeric"
									maxLength={1}
									textAlign="center"
									className={`border-[1px] ${boxClass} p-1 font-bold ${isError4 ? 'text-red-500' : ''} ${focusedBox === 4 ? 'border-secondary' : isError4 ? 'border-red-500' : 'border-[#C8C8C8]'}`}
								/>
							</TouchableOpacity>
							{/* Box 5 */}
							<TouchableOpacity onPress={() => inputRef5.current?.focus()}>
								<TextInput
									ref={inputRef5}
									value={otpCode5}
									onChangeText={text => {
										if (text) inputRef6.current?.focus();
										else inputRef4.current?.focus();
										setOtpCode5(text);
										setIsError5(false);
									}}
									onFocus={() => setFocusedBox(5)}
									inputMode="numeric"
									maxLength={1}
									textAlign="center"
									className={`border-[1px] ${boxClass} p-1 font-bold ${isError5 ? 'text-red-500' : ''} ${focusedBox === 5 ? 'border-secondary' : isError5 ? 'border-red-500' : 'border-[#C8C8C8]'}`}
								/>
							</TouchableOpacity>
							{/* Box 6 */}
							<TouchableOpacity onPress={() => inputRef6.current?.focus()}>
								<TextInput
									ref={inputRef6}
									value={otpCode6}
									onChangeText={text => {
										setOtpCode6(text);
										setIsError6(false);
										if (!text) {
											return inputRef5.current?.focus();
										}
										Keyboard.dismiss();
										setFocusedBox(0);
									}}
									onFocus={() => setFocusedBox(6)}
									inputMode="numeric"
									maxLength={1}
									textAlign="center"
									className={`border-[1px] ${boxClass} p-1 font-bold ${isError6 ? 'text-red-500' : ''} ${focusedBox === 6 ? 'border-secondary' : isError6 ? 'border-red-500' : 'border-[#C8C8C8]'}`}
								/>
							</TouchableOpacity>
						</View>

						<View className="flex-row justify-center mt-2">
							<Text>Didn&apos;t get code? </Text>
							{timeLeft ? (
								<Text className="text-secondary"> Resend ({timeLeft}s)</Text>
							) : (
								<TouchableOpacity onPress={handleSubmit}>
									<Text className="text-secondary font-semibold">
										{' '}
										Resend code
									</Text>
								</TouchableOpacity>
							)}
						</View>
					</View>

					<Button title="Verify" onPress={() => submitOtp()} />
					<TouchableOpacity
						className="mt-5 items-center"
						onPress={() => {
							setDeviceVerification({required: false, token: '', email: ''});
							clearOTP();
							setTimeLeft(60);
						}}
					>
						<Text className="text-primary text-xl font-semibold">
							← Back to Sign in
						</Text>
					</TouchableOpacity>
				</View>
			</TouchableWithoutFeedback>
		);
	}

	return (
		<ScrollView className="bg-white flex-1 px-[3%] py-5">
			<Logo />
			<Text className="text-4xl mt-10 mb-2 font-bold">
				Sign in to your account
			</Text>
			<Text className="text-[#222222] text-xl">
				To get back into more features
			</Text>

			<View className="my-20 gap-y-5">
				<View className="">
					<Text className="text-2xl font-bold">Phone Number / Email</Text>
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
					<Text className="text-2xl font-bold">Password</Text>
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
						<Text className="text-xl text-primary text-right font-semibold">
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
						<Text className="text-primary text-2xl font-bold">Sign up </Text>
					</TouchableOpacity>
				</View>
			</View>
		</ScrollView>
	);
};

export default Signin;
