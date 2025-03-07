import {
	View,
	Modal,
	Pressable,
	TextInput,
	TouchableOpacity,
	Keyboard,
} from 'react-native';
import React, {Dispatch, FC, SetStateAction, useRef, useState} from 'react';
import {Text} from '@/components/text';
import {globalStyles} from '@/styles';
import Button from './button';
import Toast from 'react-native-toast-message';
import Loading from './loading';
import AntDesign from '@expo/vector-icons/AntDesign';
interface PinModalProps {
	showPin: boolean;
	setShowPin: Dispatch<SetStateAction<boolean>>;
	handleContinue: (pin: string) => void;
}

const PinModal: FC<PinModalProps> = props => {
	const {setShowPin, handleContinue} = props;
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

	const handleConfirm = () => {
		const code = otpCode1 + otpCode2 + otpCode3 + otpCode4;
		handleContinue(code);
	};

	return (
		<Modal transparent>
			<Pressable style={globalStyles.overlay} />
			<View className="flex-1 justify-center items-center px-[5%]">
				<View className="bg-white pt-5 pb-8 px-[5%] rounded-xl w-full">
					<TouchableOpacity
						onPress={() => setShowPin(false)}
						className="ml-auto"
					>
						<AntDesign name="close" size={24} color="black" />
					</TouchableOpacity>
					<Text className="text-xl text-center" fontWeight={600}>
						Enter Transaction Pin
					</Text>
					<View className="my-10 gap-y-5">
						<View className="flex-row justify-between mt-5">
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
									className={`border-[1px] w-20 h-20 rounded-2xl text-5xl p-1W font-bold ${
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
										text
											? inputRef3.current?.focus()
											: inputRef.current?.focus();
										setOtpCode2(text);
										setIsError2(false);
									}}
									onFocus={() => setFocusedBox(2)}
									inputMode="numeric"
									ref={inputRef2}
									maxLength={1}
									textAlign="center"
									value={otpCode2}
									className={`border-[1px] w-20 h-20 rounded-2xl text-5xl p-1 font-bold ${
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
									className={`border-[1px] w-20 h-20 rounded-2xl text-5xl p-1 font-bold ${
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
									className={`border-[1px] w-20 h-20 rounded-2xl text-5xl p-1 font-bold ${
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
					</View>
					<View className="mt-10">
						<Button title="Confirm" onPress={handleConfirm} />
					</View>
				</View>
			</View>
			<Loading />
			<Toast />
		</Modal>
	);
};

export default PinModal;
