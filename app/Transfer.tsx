import {ScrollView, TextInput, View} from 'react-native';
import React, {useState} from 'react';
import Back from '@/components/back';
import {Text} from '@/components/text';
import InfoIcon from '@/assets/icons/info-icon';
import Button from './components/button';
import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';
import Toast from 'react-native-toast-message';
import {router} from 'expo-router';
import PinModal from './components/PinModal';

const Transfer = () => {
	const {setLoading} = useGlobalStore();
	const [showPin, setShowPin] = useState(false);
	const [formData, setFormData] = useState({
		email: '',
		amount: '',
	});

	const handleSend = async (pin?: string) => {
		try {
			if (!formData.email) {
				throw new Error("Please input receiver's email address");
			} else if (!formData.amount) {
				throw new Error('Please input amount');
			}
			setLoading(true);
			const axiosClient = new AxiosClient();

			if (!pin) {
				return setShowPin(true);
			}
			const response = await axiosClient.post<{
				email: string;
				amount: number;
				pin: string;
			}>('/wallet-transfer', {
				email: formData.email,
				amount: Number(formData.amount),
				pin,
			});
			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Transfer Successful',
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
			console.log(error.response?.data || error.message);
		} finally {
			if (pin) {
				setShowPin(false);
			}
			setLoading(false);
		}
	};

	return (
		<ScrollView className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="Transfer" />
			<View className="gap-y-5 my-20 flex-1">
				<View className="gap-y-5">
					<Text className="text-xl" fontWeight={700}>
						Receiver email
					</Text>

					<TextInput
						className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
						value={formData.email}
						onChangeText={text =>
							setFormData(prev => ({
								...prev,
								email: text.replace(/[<>"'&/]/g, ''),
							}))
						}
						placeholder="Email"
						placeholderTextColor={'#7D7D7D'}
					/>
				</View>
				<View className="gap-y-5">
					<Text className="text-xl" fontWeight={700}>
						Amount
					</Text>

					<TextInput
						className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
						inputMode="numeric"
						value={formData.amount}
						onChangeText={text =>
							setFormData(prev => ({
								...prev,
								amount: text.replace(/[<>"'&/]/g, ''),
							}))
						}
						placeholder="Amount"
						placeholderTextColor={'#7D7D7D'}
					/>
				</View>
				<View className="my-10 bg-[#dee8f6] px-10 py-5 rounded-xl gap-y-5">
					<View className="flex-row items-center">
						<Text className="text-secondary">Note </Text>
						<View>
							<InfoIcon />
						</View>
					</View>
					<Text>Wallet To Wallet Funds Transfer Is Free Of Charge.</Text>
				</View>
			</View>
			<Button title="Send" onPress={() => handleSend()} />
			{showPin && (
				<PinModal
					showPin={showPin}
					setShowPin={setShowPin}
					handleContinue={handleSend}
				/>
			)}
		</ScrollView>
	);
};

export default Transfer;
