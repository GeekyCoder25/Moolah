import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {globalStyles} from '@/styles';
import {AxiosClient} from '@/utils/axios';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {useQuery} from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import {router} from 'expo-router';
import React, {useState} from 'react';
import {
	Keyboard,
	Modal,
	Pressable,
	ScrollView,
	Share,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {networkProvidersIcon} from './(tabs)/airtime';
import Button from './components/button';
import PinModal from './components/PinModal';

interface PriceDiscount {
	amount: number;
	payable: number;
}

interface NetworkDiscount {
	network: string;
	network_id: string;
	prices: PriceDiscount[];
}

interface EPinDiscountsResponse {
	status: number;
	message: string;
	data: {
		discounts: NetworkDiscount[];
	};
}

interface EPinCard {
	transactionid: string;
	transactiondate: string;
	batchno: string;
	mobilenetwork: string;
	sno: string;
	pin: string;
	amount: string;
}

interface EPinPrintResponse {
	status: number;
	message: string;
	data: {
		transaction_ref: string;
		nellobytes_ref: string;
		amount: number;
		balance: number;
		data: {
			TXN_EPIN: EPinCard[];
		};
	};
}

const Printing = () => {
	const {setLoading} = useGlobalStore();
	const [showPin, setShowPin] = useState(false);
	const [formData, setFormData] = useState({
		network: '',
		id: '',
		quantity: '',
		amount: 0,
	});
	const [showNetworkModal, setShowNetworkModal] = useState(false);
	const [showAmountModal, setShowAmountModal] = useState(false);
	const [ePinCards, setEPinCards] = useState<EPinCard[]>([]);

	const handleBuy = async (pin?: string) => {
		try {
			if (!formData.network) {
				throw new Error('Please select a network');
			} else if (!formData.quantity) {
				throw new Error('Please input quantity');
			} else if (!formData.amount) {
				throw new Error('Please select amount');
			}
			setLoading(true);
			const axiosClient = new AxiosClient();

			if (!pin) {
				return setShowPin(true);
			}
			const response = await axiosClient.post<
				{
					mobile_network: string;
					value: number;
					quantity: string;
					pin: string;
				},
				EPinPrintResponse
			>('/v1/nellobytes/epin/buy', {
				mobile_network: formData.id,
				value: formData.amount,
				quantity: formData.quantity,
				pin: pin,
			});
			if (response.status === 200) {
				setEPinCards(response.data.data.data.TXN_EPIN);

				// Toast.show({
				// 	type: 'success',
				// 	text1: 'Success',
				// 	text2: 'EPin purchase successful',
				// });
				// router.back();
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

	const handleCopy = (pin: string) => {
		Keyboard.dismiss();
		Clipboard.setStringAsync(pin);
		Toast.show({
			type: 'success',
			text1: 'Success',
			text2: 'EPin copied to clipboard',
		});
	};

	const {data: ePinData} = useQuery({
		queryKey: ['epin'],
		queryFn: async () => {
			const axiosClient = new AxiosClient();
			const response = await axiosClient.get<EPinDiscountsResponse>(
				'/v1/nellobytes/epin/discounts'
			);
			return response.data;
		},
	});

	return (
		<>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View className="px-[5%] pt-5 pb-10 gap-x-4 flex-1">
					<Back title="Printing" />
					<View className="flex-1">
						<View className="my-10">
							<Text className="text-3xl font-semibold">
								Print recharge card
							</Text>
							{/* <Text className="text-secondary mt-2 rounded-tl-2xl"></Text> */}
						</View>

						<View className="gap-y-5">
							<View>
								<View className="gap-y-5">
									<Text className="text-xl font-bold">Network</Text>
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
												<Text className="text-2xl font-bold">
													Select Network
												</Text>
												<View className="my-5">
													{ePinData?.data?.discounts.map(network => (
														<TouchableOpacity
															key={network.network}
															className="py-5 flex-row items-center gap-x-5"
															onPress={() => {
																setFormData(prev => ({
																	...prev,
																	network: network.network,
																	id: network.network_id,
																}));
																setShowNetworkModal(false);
															}}
														>
															{networkProvidersIcon(
																network.network.toLowerCase()
															)}

															<Text className="text-2xl">
																{network.network}
															</Text>
														</TouchableOpacity>
													))}
												</View>
											</View>
										</View>
									</Modal>
								)}
							</View>

							<View className="gap-y-5">
								<Text className="text-xl font-bold">Quantity</Text>

								<TextInput
									className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
									inputMode="tel"
									maxLength={11}
									value={formData.quantity.replace(/[<>"'&/]/g, '')}
									onChangeText={text =>
										setFormData(prev => ({
											...prev,
											quantity: text.replace(/[<>"'&/]/g, ''),
										}))
									}
									placeholder="Quantity"
									placeholderTextColor={'#7D7D7D'}
								/>
							</View>
							<View className="gap-y-5">
								<Text className="text-xl font-bold">Amount</Text>
								<TouchableOpacity
									onPress={() => setShowAmountModal(true)}
									className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center overflow-hidden"
									disabled={!formData.network}
								>
									{formData.amount ? (
										<View className="flex-row items-center gap-x-5">
											<Text className="text-lg">{formData.amount}</Text>
										</View>
									) : (
										<Text className="text-lg">Select Amount</Text>
									)}

									<FontAwesome name="caret-down" size={24} color="#7D7D7D" />
								</TouchableOpacity>
								{showAmountModal && (
									<Modal transparent>
										<Pressable
											style={globalStyles.overlay}
											onPress={() => setShowAmountModal(false)}
										/>
										<View className="flex-1 justify-end items-end">
											<View className="bg-white w-full h-[70%] py-8 px-[5%] rounded-t-2xl">
												<Text className="text-2xl font-bold">
													Select Amount
												</Text>
												<View className="my-5">
													{ePinData?.data?.discounts
														.find(
															network => network.network === formData.network
														)
														?.prices.map(price => (
															<TouchableOpacity
																key={price.amount}
																className="py-5 flex-row items-center gap-x-5"
																onPress={() => {
																	setFormData(prev => ({
																		...prev,
																		amount: price.amount,
																	}));
																	setShowAmountModal(false);
																}}
															>
																<Text className="text-2xl">{price.amount}</Text>
															</TouchableOpacity>
														))}
												</View>
											</View>
										</View>
									</Modal>
								)}

								{formData.amount > 0 &&
									formData.network &&
									formData.quantity && (
										<View className="bg-[#e9f1fe] p-3">
											<View className="flex-row items-center justify-between">
												<Text className="text-lg text-[#4E4E4E]">Network</Text>
												<View className="flex-row items-center justify-between gap-2">
													{networkProvidersIcon(formData.network.toLowerCase())}
													<Text className="font-semibold">
														{formData.network}
													</Text>
												</View>
											</View>
											<View className="flex-row items-center justify-between mt-2">
												<Text className="text-lg text-[#4E4E4E]">Quantity</Text>
												<Text className="font-semibold">
													{formData.quantity}
												</Text>
											</View>

											<View className="flex-row items-center justify-between mt-3">
												<Text className="text-lg text-[#4E4E4E]">
													Amount per epin
												</Text>
												<Text className="font-semibold">
													₦{formData.amount}
												</Text>
											</View>
											<View className="flex-row items-center justify-between mt-3">
												<Text className="text-lg text-[#4E4E4E]">
													Payable per epin
												</Text>
												<Text className="font-semibold">
													₦
													{ePinData?.data?.discounts
														.find(
															network => network.network === formData.network
														)
														?.prices.find(
															price => price.amount === formData.amount
														)?.payable || 0}
												</Text>
											</View>
											<View className="flex-row items-center justify-between mt-3">
												<Text className="text-lg font-semibold text-[#4E4E4E]">
													Total Discounts
												</Text>
												<Text className="text-green-500 font-semibold">
													-₦
													{(
														formData.amount * Number(formData.quantity) -
														(ePinData?.data?.discounts
															.find(
																network => network.network === formData.network
															)
															?.prices.find(
																price => price.amount === formData.amount
															)?.payable || 0) *
															Number(formData.quantity)
													).toLocaleString()}
												</Text>
											</View>
											<View className="flex-row items-center justify-between mt-5 border-t border-black py-2">
												<Text className="text-xl font-bold flex-1">
													Total Payable
												</Text>
												<Text className="text-xl font-semibold">
													₦
													{(
														(ePinData?.data?.discounts
															.find(
																network => network.network === formData.network
															)
															?.prices.find(
																price => price.amount === formData.amount
															)?.payable || 0) * Number(formData.quantity)
													).toLocaleString()}
												</Text>
											</View>
										</View>
									)}
							</View>
						</View>
					</View>
					<Button
						title={`Pay ${
							formData.amount && formData.quantity
								? `₦${(
										(ePinData?.data?.discounts
											.find(network => network.network === formData.network)
											?.prices.find(price => price.amount === formData.amount)
											?.payable || 0) * Number(formData.quantity)
								  ).toLocaleString()}`
								: ''
						}`}
						onPress={() => handleBuy()}
					/>
					{showPin && (
						<PinModal
							showPin={showPin}
							setShowPin={setShowPin}
							handleContinue={handleBuy}
						/>
					)}
				</View>
			</TouchableWithoutFeedback>
			<Modal
				transparent
				visible={ePinCards.length > 0}
				animationType="fade"
				onRequestClose={router.back}
			>
				<Pressable
					style={globalStyles.overlay}
					onPress={() => setEPinCards([])}
				/>
				<View className="flex-1 justify-center items-center">
					<View
						className="bg-white w-[80%] max-h-[70%] overflow-hidden py-8 px-5 rounded-2xl items-center "
						// style={{maxHeight: '70%'}}
					>
						<View className="bg-green-500 rounded-full p-2 mb-4">
							<Entypo name="check" size={24} color="white" />
						</View>
						<Text className="text-xl font-bold mb-2">
							Epin purchase successful
						</Text>
						<Text className="text-gray-600 text-center">
							Your epin has been purchased successfully.
						</Text>
						<ScrollView className="w-full">
							{ePinCards.map((card, index) => (
								<View
									className="w-full p-3 bg-[#F3F4F6] rounded-lg mt-6 flex-row items-center"
									key={card.transactionid}
								>
									<Text className="font-bold text-2xl mt-3 flex-1 text-center">
										{card.pin}
									</Text>
									<TouchableOpacity
										onPress={() => handleCopy(card.pin)}
										className="bg-primary p-3 rounded-lg"
									>
										<FontAwesome5 name="copy" size={24} color="white" />
									</TouchableOpacity>
								</View>
							))}
						</ScrollView>

						<View className="flex-row w-full gap-5 mt-10">
							<TouchableOpacity
								onPress={() =>
									Share.share({
										message: ePinCards.map(card => card.pin).join('\n\n'),
									})
								}
								className="bg-primary flex-1 rounded-lg overflow-hidden p-4"
							>
								<Text className=" text-white text-center text-xl font-bold">
									Share
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={router.back}
								className="bg-primary flex-1 rounded-lg overflow-hidden p-4"
							>
								<Text className=" text-white text-center text-xl font-bold">
									Done
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
				<Toast />
			</Modal>
		</>
	);
};

export default Printing;
