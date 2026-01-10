import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {globalStyles} from '@/styles';
import {AxiosClient} from '@/utils/axios';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {useQuery} from '@tanstack/react-query';
import {router} from 'expo-router';
import React, {useState} from 'react';
import {
	Keyboard,
	Modal,
	Pressable,
	ScrollView,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import PinModal from './components/PinModal';
import Button from './components/button';

interface BettingCompany {
	PRODUCT_CODE: string;
	MINAMOUNT: number;
	MAXAMOUNT: number;
}

interface BettingCompaniesResponse {
	status: number;
	message: string;
	data: {
		BETTING_COMPANY: BettingCompany[];
	};
}
interface VerifyResponse {
	status: number;
	message: string;
	data: {
		customer_name: string;
		status: string;
	};
}

const Betting = () => {
	const {setLoading} = useGlobalStore();
	const [showPin, setShowPin] = useState(false);
	const [formData, setFormData] = useState({
		provider: '',
		id: '',
		amount: '',
	});
	const [showProviderModal, setShowProviderModal] = useState(false);

	const {data: bettingProviders} = useQuery({
		queryKey: ['betting-providers'],
		queryFn: async () => {
			const axiosClient = new AxiosClient();
			const response = await axiosClient.get<BettingCompaniesResponse>(
				'/v1/nellobytes/betting/companies'
			);
			return response.data;
		},
	});

	const {data: verifyData} = useQuery({
		queryKey: ['verify', formData.provider, formData.id],
		queryFn: async () => {
			const axiosClient = new AxiosClient();
			const response = await axiosClient.post<
				{
					company_code: string;
					customer_id: string;
				},
				VerifyResponse
			>('/v1/nellobytes/betting/verify', {
				company_code: formData.provider,
				customer_id: formData.id,
			});
			return response.data;
		},
		enabled: !!formData.provider && formData.id.length > 6,
	});

	const handleBuy = async (pin?: string) => {
		try {
			if (!formData.provider) {
				throw new Error('Please select a bet provider');
			} else if (!formData.id) {
				throw new Error('Please input ID');
			} else if (!formData.amount) {
				throw new Error('Please input betting amount');
			} else if (verifyData?.data.customer_name.includes('Error')) {
				throw new Error('Invalid ID');
			} else {
				const amountNumber = Number(formData.amount);
				const selectedProvider = bettingProviders?.data.BETTING_COMPANY.find(
					provider => provider.PRODUCT_CODE === formData.provider
				);
				if (selectedProvider) {
					if (
						amountNumber < selectedProvider.MINAMOUNT ||
						amountNumber > selectedProvider.MAXAMOUNT
					) {
						throw new Error(
							`Amount must be between ${selectedProvider.MINAMOUNT} and ${selectedProvider.MAXAMOUNT}`
						);
					}
				}
			}

			setLoading(true);
			const axiosClient = new AxiosClient();

			if (!pin) {
				return setShowPin(true);
			}
			const response = await axiosClient.post<{
				company_code: string;
				customer_id: string;
				amount: number;
				pin: string;
			}>('/v1/nellobytes/betting/fund', {
				company_code: formData.provider,
				customer_id: formData.id,
				amount: Number(formData.amount),
				pin,
			});
			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Betting wallet top up successful',
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
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className="px-[5%] pt-5 pb-10 gap-x-4 flex-1">
				<Back title="Betting" />
				<View className="flex-1">
					<View className="my-10">
						<Text className="text-3xl font-semibold">Betting</Text>
						<Text className="text-secondary mt-2 rounded-tl-2xl">
							Betting wallet top up
						</Text>
					</View>

					<View className="gap-y-5">
						<View>
							<View className="gap-y-5">
								<Text className="text-xl font-bold">Select a bet provider</Text>
								<TouchableOpacity
									onPress={() => setShowProviderModal(true)}
									className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								>
									<Text className="text-lg">
										{formData.provider || 'Network'}
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
											<Text className="text-2xl font-bold">
												Select Provider
											</Text>
											<ScrollView className="my-5">
												{bettingProviders?.data.BETTING_COMPANY.map(
													provider => (
														<TouchableOpacity
															key={provider.PRODUCT_CODE}
															className="py-5"
															onPress={() => {
																setFormData(prev => ({
																	...prev,
																	provider: provider.PRODUCT_CODE,
																}));
																setShowProviderModal(false);
															}}
														>
															<Text className="text-2xl">
																{provider.PRODUCT_CODE}
															</Text>
														</TouchableOpacity>
													)
												)}
											</ScrollView>
										</View>
									</View>
								</Modal>
							)}
						</View>

						<View className="gap-y-5">
							<Text className="text-xl font-bold">ID</Text>

							<TextInput
								className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								inputMode="tel"
								value={formData.id.replace(/[<>"'&/]/g, '')}
								onChangeText={text =>
									setFormData(prev => ({
										...prev,
										id: text.replace(/[<>"'&/]/g, ''),
									}))
								}
								placeholder="ID"
								placeholderTextColor={'#7D7D7D'}
							/>
						</View>
						<View className="gap-y-5">
							<Text className="text-xl font-bold">Amount</Text>

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

						<Text
							className={
								verifyData?.data.customer_name.includes('Error')
									? 'text-red-500'
									: 'text-green-500'
							}
						>
							{verifyData?.data.customer_name}
						</Text>
					</View>
				</View>
				<Button title="Buy" onPress={() => handleBuy()} />
				{showPin && (
					<PinModal
						showPin={showPin}
						setShowPin={setShowPin}
						handleContinue={handleBuy}
					/>
				)}
			</View>
		</TouchableWithoutFeedback>
	);
};

export default Betting;
