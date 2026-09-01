import BackIcon from '@/assets/icons/back-icon';
import Logo from '@/assets/icons/logo';
import {Text} from '@/components/text';
import {IS_LOGGED_IN} from '@/constants';
import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';
import {MemoryStorage} from '@/utils/storage';
import {router, useLocalSearchParams} from 'expo-router';
import React, {useEffect, useRef, useState} from 'react';
import {
	Dimensions,
	Keyboard,
	Pressable,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {UserResponse} from '../types';
import Button from './components/button';

// SMS code length. Adjust if the backend sends a different length.
const CODE_LENGTH = 6;

const BOX_CLASS = (width: number) =>
	width < 400
		? 'w-12 h-12 rounded-xl'
		: width < 450
			? 'w-14 h-14 rounded-xl'
			: 'w-16 h-16 rounded-2xl';
const BOX_FONT_SIZE = (width: number) =>
	width < 400 ? 24 : width < 450 ? 30 : 36;

// Nigerian local format: 11 digits starting with 0.
const isValidPhone = (phone: string) => /^0\d{10}$/.test(phone);

const VerifyPhone = () => {
	const axiosClient = new AxiosClient();
	const {setLoading, setUser} = useGlobalStore();
	// Phone carried over from the registration flow (may be absent when the user
	// reaches this screen via the login gate).
	const params = useLocalSearchParams<{phone?: string}>();

	const [phone, setPhone] = useState(params.phone ?? '');
	// The exact number the last code was successfully sent to. The code entry
	// only shows while the phone field still matches this.
	const [lastSentPhone, setLastSentPhone] = useState('');
	const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
	const [errors, setErrors] = useState<boolean[]>(
		Array(CODE_LENGTH).fill(false),
	);
	const [focusedBox, setFocusedBox] = useState(-1);
	const [timeLeft, setTimeLeft] = useState(0);
	const inputRefs = useRef<(TextInput | null)[]>([]);
	const autoSent = useRef(false);

	const w = Dimensions.get('window').width;
	const boxClass = BOX_CLASS(w);
	const boxFontSize = BOX_FONT_SIZE(w);

	// Only show the code entry once a code has been sent to the exact number
	// currently typed. Editing the number (or dropping below 11 digits) hides it
	// until a fresh code is sent to the new number.
	const showCodeSection = lastSentPhone !== '' && phone === lastSentPhone;

	// Send an SMS code to the entered number.
	const sendCode = async () => {
		if (!isValidPhone(phone)) {
			Toast.show({
				type: 'error',
				text1: 'Invalid phone number',
				text2: 'Enter an 11-digit number',
			});
			return;
		}
		try {
			setLoading(true);
			Keyboard.dismiss();
			await axiosClient.post<{phone: string}>('/send-sms-code', {phone});
			// Reveal the code entry for this exact number; start fresh.
			setLastSentPhone(phone);
			setCode(Array(CODE_LENGTH).fill(''));
			setErrors(Array(CODE_LENGTH).fill(false));
			setTimeLeft(60);
			Toast.show({
				type: 'success',
				text1: 'Code sent',
				text2: `A verification code was sent to ${phone}`,
			});
		} catch (error: any) {
			Toast.show({
				type: 'error',
				text1: 'Could not send code',
				text2:
					error.response?.data?.message ||
					error.response?.data ||
					error.message,
			});
		} finally {
			setLoading(false);
		}
	};

	// Auto-send once when we arrive with a known phone (registration flow).
	useEffect(() => {
		if (params.phone && isValidPhone(params.phone) && !autoSent.current) {
			autoSent.current = true;
			sendCode();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Resend countdown.
	useEffect(() => {
		if (timeLeft <= 0) return;
		const timer = setInterval(() => {
			setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
		}, 1000);
		return () => clearInterval(timer);
	}, [timeLeft]);

	const setDigit = (index: number, value: string) => {
		const digit = value.replace(/[^0-9]/g, '').slice(-1);
		setCode(prev => {
			const next = [...prev];
			next[index] = digit;
			return next;
		});
		setErrors(prev => {
			const next = [...prev];
			next[index] = false;
			return next;
		});
		if (digit && index < CODE_LENGTH - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyPress = (index: number, key: string) => {
		if (key === 'Backspace' && !code[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleVerify = async () => {
		if (!isValidPhone(phone)) {
			Toast.show({
				type: 'error',
				text1: 'Invalid phone number',
				text2: 'Enter the number you want to verify first.',
			});
			return;
		}
		const otp = code.join('');
		if (otp.length < CODE_LENGTH) {
			setErrors(code.map(c => !c));
			return;
		}
		try {
			setLoading(true);
			Keyboard.dismiss();
			const response = await axiosClient.post<
				{phone: string; code: string},
				UserResponse
			>('/verify-sms-code', {phone, code: otp});
			if (response.status === 200 || response.status === 201) {
				const storage = new MemoryStorage();
				setUser(response.data.data.attributes);
				await storage.setItem(IS_LOGGED_IN, 'true');
				router.replace('/(tabs)');
			}
		} catch (error: any) {
			setErrors(Array(CODE_LENGTH).fill(true));
			Toast.show({
				type: 'error',
				text1: 'Verification failed',
				text2:
					error.response?.data?.message ||
					error.response?.data ||
					error.message,
			});
			setTimeout(() => {
				setCode(Array(CODE_LENGTH).fill(''));
				setErrors(Array(CODE_LENGTH).fill(false));
				inputRefs.current[0]?.focus();
			}, 1500);
		} finally {
			setLoading(false);
		}
	};

	return (
		<ScrollView
			className="bg-white flex-1 px-[3%] py-5"
			keyboardShouldPersistTaps="handled"
			contentContainerStyle={{flexGrow: 1, paddingBottom: 40}}
			showsVerticalScrollIndicator={false}
		>
			<Pressable
				className="pb-5"
				onPress={() =>
					router.canGoBack() ? router.back() : router.replace('/Signin')
				}
			>
				<BackIcon />
			</Pressable>
			<Logo />
			<Text className="text-3xl mt-8 mb-2 font-bold">Verify your phone</Text>
			<Text className="text-[#222222] text-lg">
				We&apos;ll text a {CODE_LENGTH}-digit code to the number below.
			</Text>

			{/* Editable phone number */}
			<View className="mt-8 gap-y-2">
				<Text className="text-xl font-semibold">Phone number</Text>
				<TextInput
					className="border-[1px] border-[#C8C8C8] rounded-lg px-5 h-14 text-[#111]"
					style={{fontSize: 16}}
					inputMode="numeric"
					maxLength={11}
					value={phone}
					onChangeText={text => setPhone(text.replace(/[^0-9]/g, ''))}
					placeholderTextColor={'#999'}
				/>
				<Text className="text-[#888] text-sm">
					This becomes your verified number. Wrong number? Edit it above and
					resend the code.
				</Text>
			</View>

			{/* Code entry — only after a code was sent to this exact number */}
			{showCodeSection && (
				<View className="mt-8 gap-y-4">
					<Text className="text-xl font-semibold">Enter code</Text>
					<View className="flex-row justify-between gap-x-2 max-w-[420px]">
						{code.map((digit, index) => (
							<TouchableOpacity
								key={index}
								onPress={() => inputRefs.current[index]?.focus()}
							>
								<TextInput
									ref={ref => {
										inputRefs.current[index] = ref;
									}}
									value={digit}
									onChangeText={text => setDigit(index, text)}
									onKeyPress={e => handleKeyPress(index, e.nativeEvent.key)}
									onFocus={() => setFocusedBox(index)}
									inputMode="numeric"
									maxLength={1}
									textAlign="center"
									style={{fontSize: boxFontSize}}
									className={`border-[1px] ${boxClass} p-1 font-bold ${
										errors[index] ? 'text-red-500' : ''
									} ${
										focusedBox === index
											? 'border-secondary'
											: errors[index]
												? 'border-red-500'
												: 'border-[#C8C8C8]'
									}`}
								/>
							</TouchableOpacity>
						))}
					</View>

					<View className="flex-row items-center">
						<Text className="text-[#666]">Didn&apos;t get the code? </Text>
						{timeLeft ? (
							<Text className="text-secondary">Resend in {timeLeft}s</Text>
						) : (
							<TouchableOpacity onPress={sendCode}>
								<Text className="text-secondary font-semibold">
									Resend code
								</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>
			)}

			<View className="flex-1" />
			{showCodeSection ? (
				<Button title="Verify" onPress={handleVerify} />
			) : (
				<Button
					title="Send code"
					onPress={sendCode}
					disabled={!isValidPhone(phone)}
				/>
			)}
		</ScrollView>
	);
};

export default VerifyPhone;
