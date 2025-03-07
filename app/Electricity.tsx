import {
	KeyboardAvoidingView,
	Modal,
	Pressable,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Back from '@/components/back';
import {Text} from '@/components/text';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {globalStyles} from '@/styles';
import Button from './components/button';
import InfoIcon from '@/assets/icons/info-icon';
import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';
import Toast from 'react-native-toast-message';
import {router} from 'expo-router';
import PinModal from './components/PinModal';

export interface ProviderAttributes {
	provider: string;
	abbreviation: string;
	providerStatus: string;
}

export interface Provider {
	type: string;
	id: number;
	attributes: ProviderAttributes;
}

export interface Data {
	provider: Provider[];
	meter_type: string[];
}

export interface ApiResponse {
	status: number;
	message: string;
	data: Data;
}
export interface VerifyApiResponse {
	status: number;
	message: string;
	data: {customer_name: string; meter_number: string};
}

const Electricity = () => {
	const {setLoading} = useGlobalStore();
	const [showPin, setShowPin] = useState(false);
	const [formData, setFormData] = useState({
		provider_id: 0,
		name: '',
		meter_no: '',
		meter_type: '',
		amount: '',
		account_name: '',
	});
	const [showProviderModal, setShowProviderModal] = useState(false);
	const [showTypeModal, setShowTypeModal] = useState(false);
	const [providers, setProviders] = useState<Provider[]>([]);
	const [meters, setMeters] = useState<string[]>([]);

	useEffect(() => {
		const getProviders = async () => {
			try {
				const axiosClient = new AxiosClient();

				const response = await axiosClient.get<ApiResponse>('/electricity');

				if (response.status === 200) {
					setProviders(response.data.data.provider);
					setMeters(response.data.data.meter_type);
				}
			} catch (error) {}
		};
		getProviders();
	}, []);

	const handleVerify = async () => {
		setLoading(true);
		try {
			if (!formData.provider_id) {
				throw new Error('Please select a provider');
			} else if (!formData.meter_type) {
				throw new Error('Please select meter type');
			} else if (!formData.meter_no) {
				throw new Error('Please input your phone number');
			}
			const axiosClient = new AxiosClient();

			const response = await axiosClient.post<
				{provider_id: string; meter_type: string; meter_no: string},
				VerifyApiResponse
			>('/electricity/verify-meter', {
				provider_id: formData.provider_id.toString(),
				meter_type: formData.meter_type,
				meter_no: formData.meter_no,
			});

			if (response.status === 200) {
				setFormData(prev => ({
					...prev,
					account_name: response.data.data.customer_name,
				}));
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
			console.log(error.response.data || error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleBuy = async (pin?: string) => {
		try {
			if (!formData.provider_id) {
				throw new Error('Please select a provider');
			} else if (!formData.meter_no) {
				throw new Error('Please input your phone number');
			} else if (!formData.amount) {
				throw new Error('Please input airtime amount');
			} else if (Number(formData.amount) < 1000) {
				throw new Error('Minimum unit purchase is ₦1,000');
			}
			setLoading(true);
			const axiosClient = new AxiosClient();

			if (!pin) {
				return setShowPin(true);
			}
			const response = await axiosClient.post<{
				provider_id: string;
				meter_type: string;
				meter_no: string;
				amount: number;
				pin: string;
			}>('/electricity', {
				provider_id: formData.provider_id.toString(),
				meter_type: formData.meter_type,
				meter_no: formData.meter_no,
				amount: Number(formData.amount),
				pin,
			});
			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Data recharge successful',
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
		<KeyboardAvoidingView
			className="flex-1"
			behavior="padding"
			keyboardVerticalOffset={20}
		>
			<ScrollView className="px-[5%] pt-5 pb-10 gap-x-4 flex-1">
				<Back title="Electricity" />
				<View className="flex-1">
					<View className="my-10">
						<Text className="text-3xl" fontWeight={600}>
							Electricity Bill
						</Text>
						<Text className="text-secondary mt-2 rounded-tl-2xl">
							Electricity Payment
						</Text>
					</View>
					<View className="mb-10 bg-[#dee8f6] px-10 py-5 rounded-xl gap-y-5">
						<View className="flex-row items-center">
							<Text className="text-secondary">
								Note{' '}
								<View className="mt-5">
									<InfoIcon />
								</View>
							</Text>
						</View>
						<Text>Minimum Unit Purchase Is ₦1,000.</Text>
						<Text>Transaction attracts a service charges of ₦50 only.</Text>
					</View>

					<View className="gap-y-5">
						<View>
							<View className="gap-y-5">
								<Text className="text-xl" fontWeight={700}>
									Provider
								</Text>
								<TouchableOpacity
									onPress={() => setShowProviderModal(true)}
									className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								>
									<Text className="text-lg">
										{formData.name || 'Select Provider'}
									</Text>

									<FontAwesome name="caret-down" size={24} color="#7D7D7D" />
								</TouchableOpacity>
							</View>
							{showProviderModal && (
								<Modal transparent>
									<Pressable
										style={globalStyles.overlay}
										onPress={() => setShowProviderModal(false)}
									/>
									<View className="flex-1 justify-end items-end">
										<View className="bg-white w-full h-[70%] py-8 px-[5%] rounded-t-2xl">
											<Text className="text-2xl" fontWeight={700}>
												Select Provider
											</Text>
											<ScrollView className="my-5">
												{providers.map(provider => (
													<TouchableOpacity
														key={provider.attributes.provider}
														className="py-3"
														onPress={() => {
															setFormData(prev => ({
																...prev,
																provider_id: provider.id,
																name: provider.attributes.provider,
																account_name: '',
															}));
															setShowProviderModal(false);
														}}
													>
														<Text className="text-xl">
															{provider.attributes.provider}
														</Text>
													</TouchableOpacity>
												))}
											</ScrollView>
										</View>
									</View>
								</Modal>
							)}
						</View>
						<View>
							<View className="gap-y-5">
								<Text className="text-xl" fontWeight={700}>
									Meter Type
								</Text>
								<TouchableOpacity
									onPress={() => setShowTypeModal(true)}
									className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								>
									<Text className="text-lg">
										{formData.meter_type || 'Select Meter type'}
									</Text>

									<FontAwesome name="caret-down" size={24} color="#7D7D7D" />
								</TouchableOpacity>
							</View>
							{showTypeModal && (
								<Modal transparent>
									<Pressable
										style={globalStyles.overlay}
										onPress={() => setShowTypeModal(false)}
									/>
									<View className="flex-1 justify-end items-end">
										<View className="bg-white w-full h-[70%] py-8 px-[5%] rounded-t-2xl">
											<Text className="text-3xl" fontWeight={700}>
												Select Meter Type
											</Text>
											<View className="my-10">
												{meters.map(provider => (
													<TouchableOpacity
														key={provider}
														className="py-5"
														onPress={() => {
															setFormData(prev => ({
																...prev,
																meter_type: provider,
																account_name: '',
															}));
															setShowTypeModal(false);
														}}
													>
														<Text className="text-2xl">{provider}</Text>
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
								Meter number
							</Text>

							<TextInput
								className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								inputMode="tel"
								value={formData.meter_no}
								onChangeText={text =>
									setFormData(prev => ({...prev, meter_no: text}))
								}
								placeholder="Meter number"
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
									setFormData(prev => ({...prev, amount: text}))
								}
								placeholder="Amount"
							/>
						</View>
						{formData.account_name && (
							<View className="gap-y-5">
								<Text className="text-xl" fontWeight={700}>
									Account Name
								</Text>

								<Text className="text-secondary h-14" fontWeight={600}>
									{formData.account_name}
								</Text>
							</View>
						)}
					</View>
				</View>
				{formData.account_name ? (
					<Button title="Buy" onPress={() => handleBuy()} />
				) : (
					<Button title="Verify" onPress={handleVerify} />
				)}
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

export default Electricity;
