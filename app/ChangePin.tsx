import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';
import Ionicons from '@expo/vector-icons/Ionicons';
import {router} from 'expo-router';
import React, {useState} from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {PasswordInput} from './ChangePassword';
import Button from './components/button';

const ChangePin = () => {
	const {setLoading} = useGlobalStore();
	const insets = useSafeAreaInsets();
	const [formData, setFormData] = useState({
		old_pin: '',
		new_pin: '',
		new_pin_confirmation: '',
	});
	const [showOld, setShowOld] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	const pin = formData.new_pin;
	const requirements = [
		{label: 'Exactly 4 digits', met: /^\d{4}$/.test(pin)},
		{
			label: 'Different from current PIN',
			met: pin.length === 4 && pin !== formData.old_pin,
		},
	];
	const allMet = requirements.every(r => r.met);
	const confirmMatches =
		formData.new_pin_confirmation.length > 0 &&
		formData.new_pin === formData.new_pin_confirmation;
	const canSubmit = formData.old_pin.length === 4 && allMet && confirmMatches;

	const handleChange = async () => {
		try {
			if (
				!formData.new_pin ||
				!formData.new_pin_confirmation ||
				!formData.old_pin
			) {
				throw new Error('Please input all fields');
			}
			setLoading(true);
			const axiosClient = new AxiosClient();
			const response = await axiosClient.post<{
				old_pin: string;
				new_pin: string;
				new_pin_confirmation: string;
			}>('/changepin', formData);
			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Transaction pin updated successfully',
				});
				router.back();
			}
		} catch (error: any) {
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2:
					error.response?.data?.message ||
					error.response?.data ||
					error.message,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-white"
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			keyboardVerticalOffset={insets.top}
		>
			<View className="px-[5%] py-5">
				<Back title="Change Pin" />
			</View>

			<ScrollView
				className="flex-1 px-[5%]"
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="on-drag"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{paddingBottom: 24}}
			>
				<View className="gap-y-5 mt-4 mb-8">
					<View className="gap-y-3">
						<Text className="text-xl font-semibold">Current Password</Text>
						<PasswordInput
							value={formData.old_pin}
							onChangeText={text =>
								setFormData(prev => ({
									...prev,
									old_pin: text.replace(/[<>"'&/]/g, ''),
								}))
							}
							placeholder="Current Password"
							visible={showOld}
							onToggle={() => setShowOld(p => !p)}
						/>
					</View>

					<View className="gap-y-3">
						<Text className="text-xl font-semibold">New Pin</Text>
						<PinInput
							value={formData.new_pin}
							onChangeText={text =>
								setFormData(prev => ({
									...prev,
									new_pin: text.replace(/[^0-9]/g, ''),
								}))
							}
							placeholder="New pin"
							visible={showNew}
							onToggle={() => setShowNew(p => !p)}
						/>

						{/* Live requirements checklist */}
						<View className="gap-y-1.5 mt-1">
							{requirements.map(req => (
								<View key={req.label} className="flex-row items-center gap-x-2">
									<Ionicons
										name={req.met ? 'checkmark-circle' : 'ellipse-outline'}
										size={16}
										color={req.met ? '#1F9254' : '#B0B0B0'}
									/>
									<Text
										className={`text-sm ${
											req.met ? 'text-[#1F9254]' : 'text-[#888]'
										}`}
									>
										{req.label}
									</Text>
								</View>
							))}
						</View>
					</View>

					<View className="gap-y-3">
						<Text className="text-xl font-semibold">Retype Pin</Text>
						<PinInput
							value={formData.new_pin_confirmation}
							onChangeText={text =>
								setFormData(prev => ({
									...prev,
									new_pin_confirmation: text.replace(/[^0-9]/g, ''),
								}))
							}
							placeholder="Retype pin"
							visible={showConfirm}
							onToggle={() => setShowConfirm(p => !p)}
						/>
						{formData.new_pin_confirmation.length > 0 && !confirmMatches && (
							<Text className="text-sm text-red-500">PINs do not match</Text>
						)}
					</View>
				</View>
			</ScrollView>

			<View className="px-[5%] pb-8 pt-3">
				<Button
					title="Change Pin"
					onPress={handleChange}
					disabled={!canSubmit}
				/>
			</View>
		</KeyboardAvoidingView>
	);
};

const PinInput = ({
	value,
	onChangeText,
	placeholder,
	visible,
	onToggle,
}: {
	value: string;
	onChangeText: (text: string) => void;
	placeholder: string;
	visible: boolean;
	onToggle: () => void;
}) => (
	<View className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row items-center">
		<TextInput
			className="flex-1 text-[#111]"
			style={{fontSize: 16}}
			secureTextEntry={!visible}
			inputMode="numeric"
			maxLength={4}
			autoCapitalize="none"
			autoCorrect={false}
			value={value}
			onChangeText={onChangeText}
			placeholder={placeholder}
			placeholderTextColor={'#999'}
		/>
		<TouchableOpacity onPress={onToggle} className="pl-3" hitSlop={8}>
			<Ionicons name={visible ? 'eye-off' : 'eye'} size={22} color="#7D7D7D" />
		</TouchableOpacity>
	</View>
);

export default ChangePin;
