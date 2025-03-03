import {
	AppState,
	AppStateStatus,
	Keyboard,
	Pressable,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Logo from '@/assets/icons/logo';
import {Text} from '@/components/text';
import Button from './components/button';
import {router, useLocalSearchParams} from 'expo-router';
import BackIcon from '@/assets/icons/back-icon';
import * as Clipboard from 'expo-clipboard';
import {MemoryStorage} from '@/utils/storage';
import {IS_LOGGED_IN, LAST_OTP} from '@/constants';
import Toast from 'react-native-toast-message';
import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';

interface EmailVerificationResponse {
	data: {
		email_verified: boolean;
	};
	message: string;
}
const VerifyOTP = () => {
	const axiosClient = new AxiosClient();
	const {email}: {email: string} = useLocalSearchParams();
	const {setLoading} = useGlobalStore();
	const [timeLeft, setTimeLeft] = useState(10);
	const [focusedBox, setFocusedBox] = useState(0);
	const [isError1, setIsError1] = useState(false);
	const [isError2, setIsError2] = useState(false);
	const [isError3, setIsError3] = useState(false);
	const [isError4, setIsError4] = useState(false);
	const [otpCode1, setOtpCode1] = useState('');
	const [otpCode2, setOtpCode2] = useState('');
	const [otpCode3, setOtpCode3] = useState('');
	const [otpCode4, setOtpCode4] = useState('');
	const inputRef = useRef<TextInput>(null);
	const inputRef2 = useRef<TextInput>(null);
	const inputRef3 = useRef<TextInput>(null);
	const inputRef4 = useRef<TextInput>(null);
	const [hasAutoPasted, setHasAutoPasted] = useState(false);
	const [retry, setRetry] = useState(1);
	const appState = useRef<AppStateStatus>(AppState.currentState);
	const endTime = useRef<number | null>(null);

	useEffect(() => {
		const subscription = AppState.addEventListener(
			'change',
			handleAppStateChange
		);

		startTimer();

		return () => {
			clearInterval(timerRef.current!);
			subscription.remove();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const startTimer = () => {
		const endTimestamp = Date.now() + timeLeft * 1000; // Calculate target end time
		endTime.current = endTimestamp;

		timerRef.current = setInterval(() => {
			const currentTime = Date.now();
			const remainingTime = Math.round((endTime.current! - currentTime) / 1000);
		}, 1000);
	};

	const handleAppStateChange = (nextAppState: AppStateStatus) => {
		if (
			appState.current.match(/inactive|background/) &&
			nextAppState === 'active'
		) {
			const currentTime = Date.now();
			const remainingTime = Math.round((endTime.current! - currentTime) / 1000);
			setTimeLeft(remainingTime > 0 ? remainingTime : 0);
		}

		appState.current = nextAppState;
	};

	useEffect(() => {
		let interval;
		setInterval(() => {
			interval = setTimeLeft(prev => (prev >= 1 ? prev - 1 : prev));
		}, 1000);
		return clearInterval(interval);
	}, []);

	useEffect(() => {
		const storage = new MemoryStorage();
		const getLastSaved = async () => {
			const savedOTP = await storage.getItem(LAST_OTP);
			return savedOTP;
		};

		const getClipboard = async () => {
			const clipboard = await Clipboard.getStringAsync();
			const savedOTP = await getLastSaved();
			const hasPasted = clipboard === savedOTP;
			if (!hasPasted && clipboard.length === 4 && !isNaN(Number(clipboard))) {
				setOtpCode1(clipboard[0]);
				setOtpCode2(clipboard[1]);
				setOtpCode3(clipboard[2]);
				setOtpCode4(clipboard[3]);
				setHasAutoPasted(hasPasted);
				Keyboard.dismiss();

				await storage.setItem(LAST_OTP, clipboard);

				setTimeout(() => {
					setFocusedBox(0);
					inputRef.current?.blur();
				});
				await handleSubmit(true);
			}
		};

		getLastSaved().then(savedOTP => {
			Clipboard.getStringAsync().then(clipboard => {
				const hasPasted = clipboard === savedOTP;

				setHasAutoPasted(hasPasted);

				if (!hasPasted) {
					getClipboard();
				}
			});
		});

		const interval = setInterval(() => {
			if (!hasAutoPasted) {
				getClipboard();
			}
			setRetry(prev => prev + 1);
		}, 5000);

		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [retry, hasAutoPasted]);

	useEffect(() => {
		setLoading(false);
	}, []);

	const handleSubmit = async (isClipboard: boolean) => {
		try {
			const storage = new MemoryStorage();
			const clipboard = await Clipboard.getStringAsync();
			let otp;
			if (isClipboard) {
				otp = clipboard[0] + clipboard[1] + clipboard[2] + clipboard[3];
			} else {
				if (!otpCode1) {
					setIsError1(true);
				}
				if (!otpCode2) {
					setIsError2(true);
				}
				if (!otpCode3) {
					setIsError3(true);
				}
				if (!otpCode4) {
					setIsError4(true);
				}

				if (!otpCode1 || !otpCode2 || !otpCode3 || !otpCode4) {
					return;
				}
				otp = otpCode1 + otpCode2 + otpCode3 + otpCode4;
			}
			setLoading(true);
			const response = await axiosClient.post<
				{code: string},
				EmailVerificationResponse
			>(`/verify-email?email=${email}`, {
				code: otp,
			});
			if (response.status === 200) {
				console.log(response.data);
				await storage.setItem(IS_LOGGED_IN, 'true');
				router.navigate('/SetPin');
			}
		} catch (error: any) {
			setIsError1(true);
			setIsError2(true);
			setIsError3(true);
			setIsError4(true);
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
			setTimeout(() => {
				clearOTP();
				inputRef.current?.focus();
			}, 1500);
		}
	};

	const clearOTP = () => {
		setOtpCode1('');
		setOtpCode2('');
		setOtpCode3('');
		setOtpCode4('');
		setIsError1(false);
		setIsError2(false);
		setIsError3(false);
		setIsError4(false);
	};

	const handleResend = async () => {
		try {
			setLoading(true);
			const response = await axiosClient.post('/resend-verify/email', {email});

			if (response.status === 200) {
				setTimeLeft(60);
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: `OTP sent to ${email} successfully`,
				});
			}
		} catch (error: any) {
			console.log('err', error.response?.data);
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
				<Text className="text-3xl mt-10 mb-2" fontWeight={700}>
					Verify your Email address
				</Text>
				<Text className="text-[#222222] text-lg">
					Enter code sent to your email
					<Text className="text-secondary font-bold"> {email}</Text>
				</Text>

				<View className="my-20 gap-y-5 flex-1">
					<View className="flex-row justify-between gap-x-3 mt-5 max-w-[350px]">
						<TouchableOpacity onPress={() => inputRef.current?.focus()}>
							<TextInput
								onChangeText={text => {
									text && inputRef2.current?.focus();
									setOtpCode1(text);
									setIsError1(false);
								}}
								onFocus={() => setFocusedBox(1)}
								inputMode="numeric"
								ref={inputRef}
								maxLength={1}
								textAlign="center"
								value={otpCode1}
								autoFocus
								className={`border-[1px] w-20 h-20 rounded-2xl text-4xl p-1 font-bold ${
									isError1 ? 'text-red-500' : ''
								} ${
									focusedBox === 1
										? 'border-secondary'
										: isError1
										? 'border-red-500'
										: 'border-[#C8C8C8]'
								}`}
							/>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => inputRef2.current?.focus()}>
							<TextInput
								onChangeText={text => {
									text ? inputRef3.current?.focus() : inputRef.current?.focus();
									setOtpCode2(text);
									setIsError2(false);
								}}
								onFocus={() => setFocusedBox(2)}
								inputMode="numeric"
								ref={inputRef2}
								maxLength={1}
								textAlign="center"
								value={otpCode2}
								className={`border-[1px] w-20 h-20 rounded-2xl text-4xl p-1 font-bold ${
									isError2 ? 'text-red-500' : ''
								} ${
									focusedBox === 2
										? 'border-secondary'
										: isError2
										? 'border-red-500'
										: 'border-[#C8C8C8]'
								}`}
							/>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => inputRef3.current?.focus()}>
							<TextInput
								onChangeText={text => {
									text
										? inputRef4.current?.focus()
										: inputRef2.current?.focus();
									setOtpCode3(text);
									setIsError3(false);
								}}
								onFocus={() => setFocusedBox(3)}
								inputMode="numeric"
								ref={inputRef3}
								maxLength={1}
								textAlign="center"
								value={otpCode3}
								className={`border-[1px] w-20 h-20 rounded-2xl text-4xl p-1 font-bold ${
									isError3 ? 'text-red-500' : ''
								} ${
									focusedBox === 3
										? 'border-secondary'
										: isError3
										? 'border-red-500'
										: 'border-[#C8C8C8]'
								}`}
							/>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => inputRef4.current?.focus()}>
							<TextInput
								onChangeText={text => {
									setOtpCode4(text);
									setIsError4(false);
									if (!text) {
										return inputRef3.current?.focus();
									}
									Keyboard.dismiss();
									setFocusedBox(0);
								}}
								onFocus={() => setFocusedBox(4)}
								inputMode="numeric"
								ref={inputRef4}
								maxLength={1}
								textAlign="center"
								value={otpCode4}
								className={`border-[1px] w-20 h-20 rounded-2xl text-4xl p-1 font-bold ${
									isError4 ? 'text-red-500' : ''
								} ${
									focusedBox === 4
										? 'border-secondary'
										: isError4
										? 'border-red-500'
										: 'border-[#C8C8C8]'
								}`}
							/>
						</TouchableOpacity>
					</View>
					<View className="flex-row justify-center">
						<View>
							<Text>Didn't get code{''} </Text>
						</View>
						{timeLeft ? (
							<Text className="text-secondary"> Resend ({timeLeft})s</Text>
						) : (
							<TouchableOpacity onPress={handleResend}>
								<Text className="text-secondary" fontWeight={600}>
									{' '}
									Resend OTP
								</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>
				<Button title="Continue" onPress={() => handleSubmit(false)} />
			</View>
		</TouchableWithoutFeedback>
	);
};

export default VerifyOTP;
