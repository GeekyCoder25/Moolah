import {
	KeyboardAvoidingView,
	Modal,
	Pressable,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import React, {useState} from 'react';
import Back from '@/components/back';
import {Text} from '@/components/text';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {globalStyles} from '@/styles';
import Button from '../components/button';
import Toast from 'react-native-toast-message';
import {AxiosClient} from '@/utils/axios';
import {router} from 'expo-router';
import {useGlobalStore} from '@/context/store';
import PinModal from '../components/PinModal';
import GloIcon from '@/assets/icons/glo';
import MTNIcon from '@/assets/icons/mtn';
import AirtelIcon from '@/assets/icons/airtel';
import NineMobileIcon from '@/assets/icons/9mobile';

const Airtime = () => {
	const {setLoading} = useGlobalStore();
	const [formData, setFormData] = useState({
		network: '',
		phone_number: '',
		amount: '',
		id: 0,
	});
	const [showPin, setShowPin] = useState(false);
	const [showNetworkModal, setShowNetworkModal] = useState(false);

	const networks = [
		{
			label: 'MTN',
			id: 1,
		},
		{
			label: 'Glo',
			id: 2,
		},
		{
			label: '9mobile',
			id: 3,
		},
		{
			label: 'Airtel',
			id: 4,
		},
	];

	const handleBuy = async (pin?: string) => {
		try {
			if (!formData.network) {
				throw new Error('Please select a network');
			} else if (!formData.phone_number) {
				throw new Error('Please input your phone number');
			} else if (!formData.amount) {
				throw new Error('Please input airtime amount');
			}
			setLoading(true);
			const axiosClient = new AxiosClient();

			if (!pin) {
				return setShowPin(true);
			}
			const response = await axiosClient.post<{
				network: number;
				type: string;
				phone_number: string;
				amount: number;
				pin: string;
			}>('/airtime', {
				network: formData.id,
				type: 'VTU',
				phone_number: formData.phone_number,
				amount: Number(formData.amount),
				pin,
			});
			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Airtime recharge successful',
				});
				router.back();
				setFormData({network: '', phone_number: '', amount: '', id: 0});
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
		<KeyboardAvoidingView
			className="flex-1"
			behavior="padding"
			keyboardVerticalOffset={20}
		>
			<ScrollView className="px-[5%] pt-5 pb-10 gap-x-4 flex-1">
				<Back title="Airtime" />
				<View className="flex-1">
					<View className="my-10">
						<Text className="text-3xl" fontWeight={600}>
							Buy Airtime
						</Text>
						<Text className="text-secondary mt-2 rounded-tl-2xl">
							Airtime for all Network
						</Text>
					</View>

					<View className="gap-y-5">
						<View>
							<View className="gap-y-5">
								<Text className="text-xl" fontWeight={700}>
									Network
								</Text>
								<TouchableOpacity
									onPress={() => setShowNetworkModal(true)}
									className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center overflow-hidden"
								>
									{formData.network ? (
										<View className="flex-row items-center gap-x-5">
											{networkProvidersIcon(formData.network.toLowerCase())}

											<Text className="text-lg">{formData.network}</Text>
										</View>
									) : (
										<Text className="text-lg">Select Network</Text>
									)}

									<FontAwesome name="caret-down" size={24} color="#7D7D7D" />
								</TouchableOpacity>
							</View>
							{showNetworkModal && (
								<Modal transparent>
									<Pressable
										style={globalStyles.overlay}
										onPress={() => setShowNetworkModal(false)}
									/>
									<View className="flex-1 justify-end items-end">
										<View className="bg-white w-full h-[70%] py-8 px-[5%] rounded-t-2xl">
											<Text className="text-2xl" fontWeight={700}>
												Select Network
											</Text>
											<View className="my-5">
												{networks.map(network => (
													<TouchableOpacity
														key={network.label}
														className="py-5 flex-row items-center gap-x-5"
														onPress={() => {
															setFormData(prev => ({
																...prev,
																network: network.label,
																id: network.id,
															}));
															setShowNetworkModal(false);
														}}
													>
														{networkProvidersIcon(network.label.toLowerCase())}

														<Text className="text-2xl">{network.label}</Text>
													</TouchableOpacity>
												))}
											</View>
										</View>
									</View>
								</Modal>
							)}
						</View>
						<View className="gap-y-5">
							<Text className="text-xl" fontWeight={700}>
								Phone number
							</Text>

							<TextInput
								className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								inputMode="tel"
								maxLength={11}
								value={formData.phone_number.replace(/[<>"'&/]/g, '')}
								onChangeText={text =>
									setFormData(prev => ({
										...prev,
										phone_number: text.replace(/[<>"'&/]/g, ''),
									}))
								}
								placeholder="Phone number"
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
					</View>
				</View>
				<View className="my-10">
					<Button title="Buy" onPress={() => handleBuy()} />
				</View>
				{showPin && (
					<PinModal
						showPin={showPin}
						setShowPin={setShowPin}
						handleContinue={handleBuy}
					/>
				)}
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default Airtime;

export const networkProvidersIcon = (network: string) => {
	switch (network) {
		case 'glo':
			return <GloIcon />;
		case 'mtn':
			return <MTNIcon />;
		case 'airtel':
			return <AirtelIcon />;
		case '9mobile':
			return <NineMobileIcon />;
		default:
			break;
	}
};
