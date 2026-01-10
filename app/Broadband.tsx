import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {globalStyles} from '@/styles';
import {AxiosClient} from '@/utils/axios';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {useQuery} from '@tanstack/react-query';
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

export interface Provider {
	type: string; // You can also set this as a literal type "exam_provider" if it won't change
	id: number;
	attributes: ExamProviderAttributes;
}

interface SmilePackage {
	PACKAGE_ID: string;
	PACKAGE_NAME: string;
	PACKAGE_AMOUNT: string;
	PRODUCT_DISCOUNT_AMOUNT: string;
	PRODUCT_DISCOUNT: string;
}

interface BroadbandApiResponse {
	status: number;
	message: string;
	data: {
		MOBILE_NETWORK: {
			[key: string]: {
				ID: string;
				PRODUCT: SmilePackage[];
			}[];
		};
	};
}

const Broadband = () => {
	const {setLoading} = useGlobalStore();
	const [showPin, setShowPin] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		package_code: '',
		package_name: '',
		customer_id: '',
	});
	const [showProviderModal, setShowProviderModal] = useState(false);
	const [showPackagesModal, setShowPackagesModal] = useState(false);
	const [providers, setProviders] = useState<Provider[]>([]);
	const {data: smileData} = useQuery({
		queryKey: ['smile'],
		queryFn: async () => {
			const axiosClient = new AxiosClient();
			const response = await axiosClient.get<BroadbandApiResponse>(
				'/v1/nellobytes/smile/packages'
			);
			return response.data;
		},
		enabled: formData.name === 'Smile',
	});

	const {data: spectranetData} = useQuery({
		queryKey: ['spectranet'],
		queryFn: async () => {
			const axiosClient = new AxiosClient();
			const response = await axiosClient.get<BroadbandApiResponse>(
				'/v1/nellobytes/spectranet/packages'
			);
			return response.data;
		},
		enabled: formData.name === 'Spectranet',
	});

	const {data: verifyData} = useQuery({
		queryKey: ['verify', formData.name, formData.customer_id],
		queryFn: async () => {
			const axiosClient = new AxiosClient();
			const response = await axiosClient.post<
				{mobile_number: string; customer_id: string},
				{status: number; message: string}
			>(`/v1/nellobytes/${formData.name.toLowerCase()}/verify`, {
				mobile_number: formData.customer_id,
				customer_id: formData.customer_id,
			});
			return response.data;
		},
		enabled: !!formData.name && formData.customer_id.length === 11,
	});

	useEffect(() => {
		if (verifyData) {
			Toast.show({
				type: 'success',
				text1: 'Success',
				text2: verifyData.message,
			});
		}
	}, [verifyData]);

	const packageData: BroadbandApiResponse | undefined =
		formData.name === 'Smile'
			? smileData
			: formData.name === 'Spectranet'
			? spectranetData
			: undefined;

	useEffect(() => {
		const getProviders = async () => {
			try {
				// const axiosClient = new AxiosClient();

				// const response = await axiosClient.get<ExamApiResponse>('/');

				// if (response.status === 200) {
				setProviders([
					{
						type: 'broadband_provider',
						id: 1,
						attributes: {
							name: 'Smile',
							price: 5000,
							providerStatus: 'active',
						},
					},
					{
						type: 'broadband_provider',
						id: 2,
						attributes: {
							name: 'Spectranet',
							price: 5000,
							providerStatus: 'active',
						},
					},
				]);
				// setMeters(response.data.data.meter_type);
				// }
			} catch (error) {
				console.log(error);
			}
		};
		getProviders();
	}, []);

	const handleBuy = async (pin?: string) => {
		try {
			if (!formData.name) {
				throw new Error('Please select network provider');
			} else if (!formData.customer_id) {
				throw new Error('Please input customer ID');
			} else if (!formData.package_code) {
				throw new Error('Please select package');
			}
			setLoading(true);
			const axiosClient = new AxiosClient();

			if (!pin) {
				return setShowPin(true);
			}
			const response = await axiosClient.post<{
				customer_id: string;
				package_code: string;
				pin: string;
			}>(`/v1/nellobytes/${formData.name.toLowerCase()}/buy`, {
				customer_id: formData.customer_id,
				package_code: formData.package_code,
				pin,
			});
			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Broadband purchase successful',
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

	{
	}
	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className="px-[5%] pt-5 pb-10 gap-x-4 flex-1">
				<Back title="Broadband" />
				<View className="flex-1">
					<View className="my-10">
						<Text className="text-3xl font-semibold">Buy Broadband Plan</Text>
						{/* <Text className="text-secondary mt-2 rounded-tl-2xl"></Text> */}
					</View>

					<View className="gap-y-5">
						<View>
							<View className="gap-y-5">
								<Text className="text-xl font-bold">Network</Text>
								<TouchableOpacity
									onPress={() => setShowProviderModal(true)}
									className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								>
									<Text className="text-lg">
										{formData.name || 'Select Network'}
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
												Select Broadband Network Provider
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
							<Text className="text-xl font-bold">
								{formData.name || 'Broadband'} number
							</Text>

							<TextInput
								className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								inputMode="tel"
								maxLength={11}
								value={formData.customer_id.replace(/[<>"'&/]/g, '')}
								onChangeText={text =>
									setFormData(prev => ({
										...prev,
										customer_id: text.replace(/[<>"'&/]/g, ''),
									}))
								}
								placeholder="Broadband number"
								placeholderTextColor={'#7D7D7D'}
							/>
						</View>

						<View>
							<View className="gap-y-5">
								<Text className="text-xl font-bold">Data type</Text>
								<TouchableOpacity
									onPress={() => setShowPackagesModal(true)}
									className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
								>
									<Text className="text-lg">
										{formData.package_name || 'Select Data Type'}
									</Text>

									<FontAwesome name="caret-down" size={24} color="#7D7D7D" />
								</TouchableOpacity>
							</View>
							{showPackagesModal && (
								<Modal transparent>
									<Pressable
										style={globalStyles.overlay}
										onPress={() => setShowPackagesModal(false)}
									/>
									<View className="flex-1 justify-end items-end">
										<View className="bg-white w-full h-[70%] py-8 px-[5%] rounded-t-2xl">
											<Text className="text-2xl font-bold">
												Select Data Type
											</Text>
											<ScrollView className="my-5">
												{packageData?.data.MOBILE_NETWORK[
													formData.name === 'Spectranet'
														? 'spectranet'
														: 'smile-direct'
												]?.[0].PRODUCT?.map(product => (
													<TouchableOpacity
														key={product.PACKAGE_ID}
														className="py-5"
														onPress={() => {
															setFormData(prev => ({
																...prev,
																package_code: product.PACKAGE_ID,
																package_name: product.PACKAGE_NAME,
															}));
															setShowPackagesModal(false);
														}}
													>
														<Text className="text-2xl">
															{product.PACKAGE_NAME}
														</Text>
													</TouchableOpacity>
												))}
											</ScrollView>
										</View>
									</View>
								</Modal>
							)}
						</View>
						{/* <View className="gap-y-5">
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
								placeholder="Amount"
								editable={false}
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
			</View>
		</TouchableWithoutFeedback>
	);
};

export default Broadband;
