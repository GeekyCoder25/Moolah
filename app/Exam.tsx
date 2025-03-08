import {
	Keyboard,
	Modal,
	Pressable,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Back from '@/components/back';
import {Text} from '@/components/text';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {globalStyles} from '@/styles';
import Button from './components/button';
import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';
import Toast from 'react-native-toast-message';
import {router} from 'expo-router';
import PinModal from './components/PinModal';
import {ScrollView} from 'react-native';

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
			} catch (error) {}
		};
		getProviders();
	}, []);

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
				<View className="flex-1">
					<View className="my-10">
						<Text className="text-3xl" fontWeight={600}>
							Exam Pins
						</Text>
						{/* <Text className="text-secondary mt-2 rounded-tl-2xl"></Text> */}
					</View>

					<View className="gap-y-5">
						<View>
							<View className="gap-y-5">
								<Text className="text-xl" fontWeight={700}>
									Exam type
								</Text>
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
											<Text className="text-2xl" fontWeight={700}>
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
							<Text className="text-xl" fontWeight={700}>
								Quantity
							</Text>

							<TextInput
								className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								inputMode="tel"
								maxLength={11}
								value={formData.quantity}
								onChangeText={text =>
									setFormData(prev => ({...prev, quantity: text}))
								}
								placeholder="Quantity"
							/>
						</View>
						<View className="gap-y-5">
							<Text className="text-xl" fontWeight={700}>
								Amount
							</Text>

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
								placeholder="Amount"
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
			</View>
		</TouchableWithoutFeedback>
	);
};

export default Exam;
