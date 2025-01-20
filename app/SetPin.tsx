import {
	Keyboard,
	Pressable,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import React, {useRef, useState} from 'react';
import Logo from '@/assets/icons/logo';
import {Text} from '@/components/text';
import Button from './components/button';
import {router} from 'expo-router';
import BackIcon from '@/assets/icons/back-icon';
import {MemoryStorage} from '@/utils/storage';
import {IS_LOGGED_IN} from '@/constants';
import Toast from 'react-native-toast-message';
import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';

const SetPin = () => {
	const axiosClient = new AxiosClient();
	const {setLoading} = useGlobalStore();
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
	const [isErrorConfirm1, setIsErrorConfirm1] = useState(false);
	const [isErrorConfirm2, setIsErrorConfirm2] = useState(false);
	const [isErrorConfirm3, setIsErrorConfirm3] = useState(false);
	const [isErrorConfirm4, setIsErrorConfirm4] = useState(false);
	const [otpCodeConfirm1, setOtpCodeConfirm1] = useState('');
	const [otpCodeConfirm2, setOtpCodeConfirm2] = useState('');
	const [otpCodeConfirm3, setOtpCodeConfirm3] = useState('');
	const [otpCodeConfirm4, setOtpCodeConfirm4] = useState('');
	const inputRefConfirm = useRef<TextInput>(null);
	const inputRefConfirm2 = useRef<TextInput>(null);
	const inputRefConfirm3 = useRef<TextInput>(null);
	const inputRefConfirm4 = useRef<TextInput>(null);

	const handleSubmit = async () => {
		try {
			const storage = new MemoryStorage();

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
			if (!otpCodeConfirm1) {
				setIsErrorConfirm1(true);
			}
			if (!otpCodeConfirm2) {
				setIsErrorConfirm2(true);
			}
			if (!otpCodeConfirm3) {
				setIsErrorConfirm3(true);
			}
			if (!otpCodeConfirm4) {
				setIsErrorConfirm4(true);
			}

			if (
				!otpCode1 ||
				!otpCode2 ||
				!otpCode3 ||
				!otpCode4 ||
				!otpCodeConfirm1 ||
				!otpCodeConfirm2 ||
				!otpCodeConfirm3 ||
				!otpCodeConfirm4
			) {
				return;
			}

			const pin = otpCode1 + otpCode2 + otpCode3 + otpCode4;
			const confirm_pin =
				otpCodeConfirm1 + otpCodeConfirm2 + otpCodeConfirm3 + otpCodeConfirm4;

			if (pin !== confirm_pin) {
				throw new Error("Pin doesn't match");
			}
			setLoading(true);
			const response = await axiosClient.put<{pin: string}>('/auth/user/1', {
				pin,
			});
			if (response.status === 200) {
				await storage.setItem(IS_LOGGED_IN, 'true');

				router.replace('/(tabs)');
			}
		} catch (error: any) {
			setIsError1(true);
			setIsError2(true);
			setIsError3(true);
			setIsError4(true);
			setIsErrorConfirm1(true);
			setIsErrorConfirm2(true);
			setIsErrorConfirm3(true);
			setIsErrorConfirm4(true);
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2:
					error.response?.data?.detail || error.response?.data || error.message,
			});
			setTimeout(() => {
				clearOTP();
				inputRef.current?.focus();
			}, 1500);
			console.log(error.response?.data?.detail);
		} finally {
			router.replace('/(tabs)');
			setLoading(false);
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
		setOtpCodeConfirm1('');
		setOtpCodeConfirm2('');
		setOtpCodeConfirm3('');
		setOtpCodeConfirm4('');
		setIsErrorConfirm1(false);
		setIsErrorConfirm2(false);
		setIsErrorConfirm3(false);
		setIsErrorConfirm4(false);
	};

	return (
		<View className="bg-white flex-1 px-[3%] py-5">
			<Pressable className="pb-5" onPress={router.back}>
				<BackIcon />
			</Pressable>
			<Logo />
			<Text className="text-3xl mt-10 mb-2" fontWeight={700}>
				Set transaction pin
			</Text>
			<Text className="text-[#222222] text-lg">
				To get back into more features
			</Text>

			<View className="my-10 gap-y-5 flex-1">
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
							// style={isError1 ? styles.otpInputError : styles.otpInput}
							textAlign="center"
							value={otpCode1}
							autoFocus
							className={`border-[1px] w-20 h-20 rounded-2xl text-4xl p-1 font-semibold ${
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
							className={`border-[1px] w-20 h-20 rounded-2xl text-4xl p-1 font-semibold ${
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
								text ? inputRef4.current?.focus() : inputRef2.current?.focus();
								setOtpCode3(text);
								setIsError3(false);
							}}
							onFocus={() => setFocusedBox(3)}
							inputMode="numeric"
							ref={inputRef3}
							maxLength={1}
							textAlign="center"
							value={otpCode3}
							className={`border-[1px] w-20 h-20 rounded-2xl text-4xl p-1 font-semibold ${
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
							className={`border-[1px] w-20 h-20 rounded-2xl text-4xl p-1 font-semibold ${
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
				<Text className="text-2xl my-5" fontWeight={600}>
					Confirm Pin
				</Text>
				<View className="flex-row justify-between gap-x-3 mt-5 max-w-[350px]">
					<TouchableOpacity onPress={() => inputRefConfirm.current?.focus()}>
						<TextInput
							onChangeText={text => {
								text && inputRefConfirm2.current?.focus();
								setOtpCodeConfirm1(text);
								setIsErrorConfirm1(false);
							}}
							onFocus={() => setFocusedBox(5)}
							inputMode="numeric"
							ref={inputRefConfirm}
							maxLength={1}
							// style={isError1 ? styles.otpInputError : styles.otpInput}
							textAlign="center"
							value={otpCodeConfirm1}
							className={`border-[1px] w-20 h-20 rounded-2xl text-4xl p-1 font-semibold ${
								isErrorConfirm1 ? 'text-red-500' : ''
							} ${
								focusedBox === 5
									? 'border-secondary'
									: isErrorConfirm1
									? 'border-red-500'
									: 'border-[#C8C8C8]'
							}`}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => inputRefConfirm2.current?.focus()}>
						<TextInput
							onChangeText={text => {
								text
									? inputRefConfirm3.current?.focus()
									: inputRefConfirm.current?.focus();
								setOtpCodeConfirm2(text);
								setIsErrorConfirm2(false);
							}}
							onFocus={() => setFocusedBox(6)}
							inputMode="numeric"
							ref={inputRefConfirm2}
							maxLength={1}
							textAlign="center"
							value={otpCodeConfirm2}
							className={`border-[1px] w-20 h-20 rounded-2xl text-4xl p-1 font-semibold ${
								isErrorConfirm2 ? 'text-red-500' : ''
							} ${
								focusedBox === 6
									? 'border-secondary'
									: isErrorConfirm2
									? 'border-red-500'
									: 'border-[#C8C8C8]'
							}`}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => inputRefConfirm3.current?.focus()}>
						<TextInput
							onChangeText={text => {
								text
									? inputRefConfirm4.current?.focus()
									: inputRefConfirm2.current?.focus();
								setOtpCodeConfirm3(text);
								setIsErrorConfirm3(false);
							}}
							onFocus={() => setFocusedBox(7)}
							inputMode="numeric"
							ref={inputRefConfirm3}
							maxLength={1}
							textAlign="center"
							value={otpCodeConfirm3}
							className={`border-[1px] w-20 h-20 rounded-2xl text-4xl p-1 font-semibold ${
								isErrorConfirm3 ? 'text-red-500' : ''
							} ${
								focusedBox === 7
									? 'border-secondary'
									: isErrorConfirm3
									? 'border-red-500'
									: 'border-[#C8C8C8]'
							}`}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => inputRefConfirm4.current?.focus()}>
						<TextInput
							onChangeText={text => {
								setOtpCodeConfirm4(text);
								setIsErrorConfirm4(false);
								if (!text) {
									return inputRefConfirm3.current?.focus();
								}
								Keyboard.dismiss();
								setFocusedBox(0);
							}}
							onFocus={() => setFocusedBox(8)}
							inputMode="numeric"
							ref={inputRefConfirm4}
							maxLength={1}
							textAlign="center"
							value={otpCodeConfirm4}
							className={`border-[1px] w-20 h-20 rounded-2xl text-4xl p-1 font-semibold ${
								isErrorConfirm4 ? 'text-red-500' : ''
							} ${
								focusedBox === 8
									? 'border-secondary'
									: isErrorConfirm4
									? 'border-red-500'
									: 'border-[#C8C8C8]'
							}`}
						/>
					</TouchableOpacity>
				</View>
			</View>
			<Button title="Continue" onPress={handleSubmit} />
		</View>
	);
};

export default SetPin;
