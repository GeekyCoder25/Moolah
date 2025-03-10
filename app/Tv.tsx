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

// Top-level API response
export interface ApiResponse {
	status: number;
	message: string;
	data: Data;
}

// Data object containing subscription types and cable TV providers
export interface Data {
	subscription_type: string[];
	cableTv: CableTvProvider[];
}

// Each cable TV provider
export interface CableTvProvider {
	type: string;
	id: number;
	attributes: {
		name: string;
		providerStatus: string;
	};
	relationships: {
		plan: CableTvPlan[];
	};
}

// Each cable TV plan under a provider
export interface CableTvPlan {
	type: string;
	id: number;
	attributes: {
		name: string;
		price: string;
		day: string;
	};
}
export interface VerifyApiResponse {
	status: number;
	message: string;
	data: {
		status: string;
		Status: string;
		msg: string;
		name: string;
		Customer_Name: string;
	};
}

const TV = () => {
	const {setLoading, user} = useGlobalStore();
	const [showPin, setShowPin] = useState(false);
	const [formData, setFormData] = useState({
		provider: 0,
		name: '',
		type: '',
		plan_id: 0,
		plan_name: '',
		price: '',
		iuc_no: '',
		account_name: '',
	});
	const [showProviderModal, setShowProviderModal] = useState(false);
	const [showPlanModal, setShowPlanModal] = useState(false);
	const [showTypeModal, setShowTypeModal] = useState(false);
	const [providers, setProviders] = useState<CableTvProvider[]>([]);
	const [types, setTypes] = useState<string[]>([]);

	useEffect(() => {
		const getProviders = async () => {
			try {
				const axiosClient = new AxiosClient();

				const response = await axiosClient.get<ApiResponse>('/cable');

				if (response.status === 200) {
					setProviders(response.data.data.cableTv);
					setTypes(response.data.data.subscription_type);
				}
			} catch (error) {}
		};
		getProviders();
	}, []);

	const handleVerify = async () => {
		setLoading(true);
		try {
			if (!formData.provider) {
				throw new Error('Please select a provider');
			} else if (!formData.iuc_no) {
				throw new Error('Please input your decoder number ');
			}
			const axiosClient = new AxiosClient();

			const response = await axiosClient.post<
				{provider_id: number; iuc_no: string},
				VerifyApiResponse
			>('/cable/verify', {
				provider_id: formData.provider,
				iuc_no: formData.iuc_no,
			});

			if (response.status === 200) {
				if (response.data.data.status === 'success') {
					setFormData(prev => ({
						...prev,
						account_name: response.data.data.name,
					}));
				} else {
					throw new Error(response.data.data.msg);
				}
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
			if (!formData.provider) {
				throw new Error('Please select a provider');
			} else if (!formData.plan_id) {
				throw new Error('Please select a subscription plan');
			} else if (!formData.type) {
				throw new Error('Please select subscription type');
			} else if (!formData.iuc_no) {
				throw new Error('Please input your decoder number ');
			}
			setLoading(true);
			const axiosClient = new AxiosClient();

			if (!pin) {
				return setShowPin(true);
			}
			const response = await axiosClient.post<{
				provider_id: number;
				plan_id: number;
				type: string;
				price: number;
				customer_no: string;
				iuc_no: string;
				pin: string;
			}>('/cable', {
				provider_id: formData.provider,
				plan_id: formData.plan_id,
				price: Number(formData.price),
				type: formData.type,
				customer_no: user?.phone_number || '',
				iuc_no: formData.iuc_no,
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
					error.response?.data?.message?.msg ||
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
			<ScrollView className="px-[5%] pt-5 pb-20 gap-x-4 flex-1">
				<Back title="TV" />
				<View className="flex-1">
					<View className="my-10">
						<Text className="text-3xl" fontWeight={600}>
							Cable TV
						</Text>
						<Text className="text-secondary mt-2 rounded-tl-2xl">
							Cable tv subscription
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
						<Text>
							You can contact DSTV/GOtv's customers care unit on
							01-2703232/08039003788 or the toll free lines: 08149860333,
							07080630333, and 09090630333 for assistance. STARTIMES's customers
							care unit on (094618888, 014618888)
						</Text>
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
														key={provider.attributes.name}
														className="py-5"
														onPress={() => {
															setFormData(prev => ({
																...prev,
																provider: provider.id,
																name: provider.attributes.name,
																plan_id:
																	provider.id === prev.provider
																		? prev.plan_id
																		: 0,
																account_name: '',
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
						<View>
							<View className="gap-y-5">
								<Text className="text-xl" fontWeight={700}>
									Plan
								</Text>
								<TouchableOpacity
									onPress={() => setShowPlanModal(true)}
									className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								>
									<Text className="text-lg">
										{formData.plan_id ? (
											<>
												{formData.plan_name} - ₦
												{Number(formData.price).toLocaleString()}
											</>
										) : (
											'Select subscription plan'
										)}
									</Text>

									<FontAwesome name="caret-down" size={24} color="#7D7D7D" />
								</TouchableOpacity>
							</View>
							{showPlanModal && (
								<Modal transparent>
									<Pressable
										style={globalStyles.overlay}
										onPress={() => setShowPlanModal(false)}
									/>
									<View className="flex-1 justify-end items-end">
										<View className="bg-white w-full h-[70%] py-8 px-[5%] rounded-t-2xl">
											<Text className="text-2xl" fontWeight={700}>
												Select subscription plan
											</Text>
											<ScrollView className="my-5">
												{providers
													.find(provider => provider.id === formData.provider)
													?.relationships.plan.map(plan => (
														<TouchableOpacity
															key={plan.id}
															className="py-5"
															onPress={() => {
																setFormData(prev => ({
																	...prev,
																	plan_id: plan.id,
																	plan_name: plan.attributes.name,
																	price: plan.attributes.price,
																}));
																setShowPlanModal(false);
															}}
														>
															<Text className="text-xl">
																{plan.attributes.name} - ₦
																{Number(plan.attributes.price).toLocaleString()}
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
									Subscription Type
								</Text>
								<TouchableOpacity
									onPress={() => setShowTypeModal(true)}
									className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								>
									<Text className="text-lg">
										{formData.type || 'Select subscription type'}
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
											<Text className="text-2xl" fontWeight={700}>
												Select Meter Type
											</Text>
											<View className="my-5">
												{types.map(type => (
													<TouchableOpacity
														key={type}
														className="py-5"
														onPress={() => {
															setFormData(prev => ({
																...prev,
																type,
															}));
															setShowTypeModal(false);
														}}
													>
														<Text className="text-2xl">{type}</Text>
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
								IUC Number
							</Text>

							<TextInput
								className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								inputMode="numeric"
								value={formData.iuc_no}
								onChangeText={text =>
									setFormData(prev => ({
										...prev,
										iuc_no: text,
										account_name: '',
									}))
								}
								placeholder="Decoder Number"
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
				<View className="my-10">
					{formData.account_name ? (
						<Button title="Buy" onPress={() => handleBuy()} />
					) : (
						<Button title="Verify" onPress={handleVerify} />
					)}
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

export default TV;
