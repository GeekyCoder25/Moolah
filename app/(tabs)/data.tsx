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
import Button from '../components/button';
import {AxiosClient} from '@/utils/axios';
import {useGlobalStore} from '@/context/store';
import Toast from 'react-native-toast-message';
import {router} from 'expo-router';
import PinModal from '../components/PinModal';
import {networkProvidersIcon} from './airtime';

export interface DataResponse {
	status: number;
	message: string;
	data: {
		data_type: string[];
		data: NetworkData[];
	};
}

export interface NetworkData {
	type: string; // e.g. "network"
	id: number;
	attributes: NetworkAttributes;
}

export interface NetworkAttributes {
	network: string; // e.g. "MTN", "GLO", "9MOBILE", "AIRTEL"
	network_status: string; // e.g. "On" or "Off"
	vtuStatus: string; // e.g. "On" or "Off"
	sharesellStatus: string; // e.g. "On" or "Off"
	airtimepinStatus: string; // e.g. "On" or "Off"
	smeStatus: string; // e.g. "On" or "Off"
	giftingStatus: string; // e.g. "On" or "Off"
	corporateStatus: string; // e.g. "On" or "Off"
	datapinStatus: string; // e.g. "On" or "Off"
	dataplans: DataPlan[];
}

export interface DataPlan {
	type: string; // e.g. "data"
	id: number;
	attributes: DataPlanAttributes;
}

export interface DataPlanAttributes {
	name: string; // e.g. "500 MB"
	price: string; // e.g. "380"
	type: string; // e.g. "SME", "Gifting", "Corporate"
	day: string; // e.g. "30"
	network: string; // e.g. "MTN"
}

const Data = () => {
	const {setLoading} = useGlobalStore();
	const [formData, setFormData] = useState({
		network: '',
		id: 0,
		plan: '',
		plan_id: 0,
		price: '',
		phone_number: '',
		type: '',
	});
	const [showPin, setShowPin] = useState(false);
	const [showNetworkModal, setShowNetworkModal] = useState(false);
	const [showPlanModal, setShowPlanModal] = useState(false);
	const [plans, setPlans] = useState<NetworkData[]>([]);

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

	useEffect(() => {
		const getDataPlans = async () => {
			try {
				const axiosClient = new AxiosClient();

				const response = await axiosClient.get<DataResponse>('/data');

				if (response.status === 200) {
					setPlans(response.data.data.data);
				}
			} catch (error) {}
		};
		getDataPlans();
	}, []);

	const handleBuy = async (pin?: string) => {
		try {
			if (!formData.network) {
				throw new Error('Please select a network');
			} else if (!formData.plan) {
				throw new Error('Please select a plan to buy');
			} else if (!formData.phone_number) {
				throw new Error('Please input your phone number');
			}
			setLoading(true);
			const axiosClient = new AxiosClient();

			if (!pin) {
				return setShowPin(true);
			}
			const response = await axiosClient.post<{
				network_id: number;
				data_type: string;
				data_plan: string;
				data_plan_id: number;
				phone_number: string;
				pin: string;
			}>('/data', {
				network_id: formData.id,
				data_type: formData.type,
				data_plan: formData.plan,
				data_plan_id: formData.plan_id,
				phone_number: formData.phone_number,
				pin,
			});
			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Data recharge successful',
				});
				router.back();
				setFormData({
					network: '',
					id: 0,
					plan: '',
					plan_id: 0,
					price: '',
					phone_number: '',
					type: '',
				});
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
				<Back title="Data" />
				<View className="flex-1">
					<View className="my-10">
						<Text className="text-3xl text-red-500" fontWeight={600}>
							Buy Data
						</Text>
						<Text className="text-secondary mt-2 rounded-tl-2xl">
							Data for all Network
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
																plan: '',
																price: '',
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
						<View>
							<View className="gap-y-5">
								<Text className="text-xl" fontWeight={700}>
									Select Plan
								</Text>
								<TouchableOpacity
									onPress={() => {
										if (formData.network) {
											return setShowPlanModal(true);
										}
										Toast.show({type: 'info', text1: 'Select a network first'});
									}}
									className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								>
									<Text className="text-lg">
										{formData.plan ? (
											<>
												{formData.plan} for ₦
												{Number(formData.price).toLocaleString()}
											</>
										) : (
											'Select Plan'
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
										<View className="bg-white w-full h-[70%] pt-8 rounded-t-2xl">
											<Text className="text-2xl px-[5%]" fontWeight={700}>
												Select Data Plan
											</Text>

											{plans.find(plan => plan.id === formData.id)?.attributes
												.dataplans.length ? (
												<ScrollView className="mt-5 px-[5%]">
													{plans
														.filter(plan => plan.id === formData.id)
														.map(plan => (
															<View key={plan.id}>
																{plan.attributes.dataplans.map(plan => (
																	<TouchableOpacity
																		key={plan.id}
																		onPress={() => {
																			setFormData(prev => ({
																				...prev,
																				plan: plan.attributes.name,
																				price: plan.attributes.price,
																				type: plan.attributes.type,
																				plan_id: plan.id,
																			}));
																			setShowPlanModal(false);
																		}}
																		className="py-3 flex-row gap-x-2"
																	>
																		<Text className="text-xl">
																			{plan.attributes.name}{' '}
																			{plan.attributes.type}
																		</Text>
																		<Text className="text-xl">for</Text>
																		<Text className="text-xl">
																			{plan.attributes.day}
																			{Number(plan.attributes.day) > 1
																				? 'days'
																				: 'day'}
																		</Text>
																		<Text className="text-xl">-</Text>
																		<Text className="text-xl">
																			₦
																			{Number(
																				plan.attributes.price
																			).toLocaleString()}
																		</Text>
																	</TouchableOpacity>
																))}
															</View>
														))}
												</ScrollView>
											) : (
												<View className="px-[5%] my-5">
													<Text>No available data plans</Text>
												</View>
											)}
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
								value={formData.phone_number}
								onChangeText={text =>
									setFormData(prev => ({...prev, phone_number: text}))
								}
								placeholder="Phone number"
								placeholderTextColor={'#7D7D7D'}
							/>
						</View>
						{/* <View className="gap-y-5">
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
					</View> */}
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
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default Data;
