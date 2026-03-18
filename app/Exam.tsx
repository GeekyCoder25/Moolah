import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {globalStyles} from '@/styles';
import {AxiosClient} from '@/utils/axios';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {router} from 'expo-router';
import React, {useEffect, useState} from 'react';
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
import Button from './components/button';
import PinModal from './components/PinModal';

export interface ExamProviderAttributes {
	name: string;
	price: number;
	providerStatus: string;
}

export interface ExamProvider {
	type: string; // You can also set this as a literal type "exam_provider" if it won't change
	id: number;
	attributes: ExamProviderAttributes;
}

export interface ExamApiResponse {
	status: number;
	message: string;
	data: ExamProvider[];
}

interface ExamHistoryRecord {
	orderid: string;
	provider: string;
	product_name: string;
	statuscode: string;
	status: string;
	pins: string;
	amount: string;
	date: string;
}

interface ExamHistoryResponse {
	status: number;
	message: string;
	data: {
		current_page: number;
		data: ExamHistoryRecord[];
		last_page: number;
		next_page_url: string | null;
		prev_page_url: string | null;
		total: number;
	};
}

const Exam = () => {
	const {setLoading} = useGlobalStore();
	const [showPin, setShowPin] = useState(false);
	const [formData, setFormData] = useState({
		provider: 0,
		name: '',
		quantity: '',
		amount: 0,
	});
	const [showProviderModal, setShowProviderModal] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [history, setHistory] = useState<ExamHistoryRecord[]>([]);
	const [providers, setProviders] = useState<ExamProvider[]>([]);

	useEffect(() => {
		const getProviders = async () => {
			try {
				const axiosClient = new AxiosClient();

				const response = await axiosClient.get<ExamApiResponse>('/exam-card');

				if (response.status === 200) {
					setProviders(response.data.data);
					// setMeters(response.data.data.meter_type);
				}
			} catch (error) {
				console.log(error);
			}
		};
		getProviders();
	}, []);

	const fetchHistory = async () => {
		try {
			setHistoryLoading(true);
			const axiosClient = new AxiosClient();
			const response =
				await axiosClient.get<ExamHistoryResponse>('/exam-card/history');
			if (response.status === 200) {
				setHistory(response.data.data.data);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setHistoryLoading(false);
		}
	};

	const handleBuy = async (pin?: string) => {
		try {
			if (!formData.provider) {
				throw new Error('Please select exam type');
			} else if (!formData.quantity) {
				throw new Error('Please input quantity');
			} else if (!formData.amount) {
				throw new Error('Please input airtime amount');
			}
			setLoading(true);
			const axiosClient = new AxiosClient();

			if (!pin) {
				return setShowPin(true);
			}
			const response = await axiosClient.post<{
				provider_id: number;
				quantity: string;
				price: number;
				pin: string;
			}>('/exam-card', {
				provider_id: formData.provider,
				quantity: formData.quantity,
				price: Number(formData.amount),
				pin,
			});
			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Exam card purchase successful',
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
				<Back title="Exam Pins" />
				<TouchableOpacity
					className="self-end mt-2"
					onPress={() => {
						setShowHistory(true);
						fetchHistory();
					}}
				>
					<Text className="text-[#1A73E8] text-sm font-medium">History</Text>
				</TouchableOpacity>
				<View className="flex-1">
					<View className="my-10">
						<Text className="text-3xl font-semibold">Exam Pins</Text>
						{/* <Text className="text-secondary mt-2 rounded-tl-2xl"></Text> */}
					</View>

					<View className="gap-y-5">
						<View>
							<View className="gap-y-5">
								<Text className="text-xl font-bold">Exam type</Text>
								<TouchableOpacity
									onPress={() => setShowProviderModal(true)}
									className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								>
									<Text className="text-lg">
										{formData.name || 'Select Exam Type'}
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
												{providers.map(provider => (
													<TouchableOpacity
														key={provider.attributes.name}
														className="py-5"
														onPress={() => {
															setFormData(prev => ({
																...prev,
																provider: provider.id,
																name: provider.attributes.name,
																amount: provider.attributes.price,
															}));
															setShowProviderModal(false);
														}}
													>
														<Text className="text-2xl">
															{provider.attributes.name}
														</Text>
													</TouchableOpacity>
												))}
											</ScrollView>
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

							<TextInput
								className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								inputMode="numeric"
								value={
									formData.amount
										? `₦${(
												formData.amount * Number(formData.quantity || 1)
											).toLocaleString()}`
										: ''
								}
								// placeholder="Amount"
								// placeholderTextColor={'#7D7D7D'}
								editable={false}
							/>
						</View>
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
				{/* History Modal */}
				{showHistory && (
					<Modal transparent animationType="slide">
						<Pressable
							className="flex-1 bg-black/40"
							onPress={() => setShowHistory(false)}
						/>
						<View
							className="bg-[#F5F5F5] w-full rounded-t-2xl"
							style={{maxHeight: '80%'}}
						>
							<View className="px-[5%] pt-6 pb-4 bg-white rounded-t-2xl flex-row justify-between items-center">
								<Text className="text-2xl font-bold">Purchase History</Text>
								<TouchableOpacity onPress={() => setShowHistory(false)}>
									<Text className="text-[#666] text-base">✕</Text>
								</TouchableOpacity>
							</View>
							{historyLoading ? (
								<View className="py-16 items-center">
									<Text className="text-[#666] text-base">Loading...</Text>
								</View>
							) : history.length === 0 ? (
								<View className="py-16 items-center">
									<Text className="text-[#666] text-base">
										No history found
									</Text>
								</View>
							) : (
								<ScrollView
									className="px-[5%] py-4"
									showsVerticalScrollIndicator={false}
								>
									{history.map(record => (
										<View
											key={record.orderid}
											className="bg-white rounded-xl px-4 py-4 mb-3"
										>
											<View className="flex-row justify-between items-center mb-2">
												<Text className="font-bold text-base text-[#111]">
													{record.product_name}
												</Text>
												<View
													className={`px-2 py-0.5 rounded-full ${
														record.status === 'SUCCESS'
															? 'bg-green-100'
															: 'bg-red-100'
													}`}
												>
													<Text
														className={`text-xs font-semibold ${
															record.status === 'SUCCESS'
																? 'text-green-700'
																: 'text-red-600'
														}`}
													>
														{record.status}
													</Text>
												</View>
											</View>
											<Text className="font-semibold text-secondary text-sm mb-2">
												₦{Number(record.amount).toLocaleString()}
											</Text>
											{record.pins.split('<=>').map((pin, i) => (
												<Text
													key={i}
													className="text-[#1A73E8] text-sm font-medium mb-0.5"
												>
													PIN {i + 1}: {pin.trim()}
												</Text>
											))}
											<Text className="text-[#999] text-xs mt-1">
												{record.date}
											</Text>
										</View>
									))}
								</ScrollView>
							)}
						</View>
					</Modal>
				)}
			</View>
		</TouchableWithoutFeedback>
	);
};

export default Exam;
