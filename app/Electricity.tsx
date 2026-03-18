import InfoIcon from '@/assets/icons/info-icon';
import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';
import {router} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {
	Image,
	KeyboardAvoidingView,
	Modal,
	Pressable,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Button from './components/button';
import PinModal from './components/PinModal';

const PROVIDER_IMAGES: Record<string, any> = {
	IE: require('@/assets/images/ikedc-icon.png'),
	EKEDC: require('@/assets/images/eko-electric.png'),
	KEDCO: require('@/assets/images/kano-electric.png'),
	PHEDC: require('@/assets/images/phedc-icon.png'),
	JED: require('@/assets/images/jos-electric.jpg'),
	IBEDC: require('@/assets/images/ibedc-icon.png'),
	KEDC: require('@/assets/images/kedc-icon.png'),
	AEDC: require('@/assets/images/abuja-electric.png'),
	ENUGU: require('@/assets/images/enugu-electric.jpg'),
	BENIN: require('@/assets/images/bedc-icon.png'),
	YOLA: require('@/assets/images/yola-electric.jpg'),
};

const ProviderIcon = ({
	abbreviation,
	name,
	size = 32,
}: {
	abbreviation: string;
	name: string;
	size?: number;
}) => {
	const img = PROVIDER_IMAGES[abbreviation];
	if (img) {
		return (
			<Image
				source={img}
				style={{width: size, height: size, borderRadius: 6}}
				resizeMode="contain"
			/>
		);
	}
	return (
		<View
			style={{width: size, height: size}}
			className="bg-[#1A73E8] rounded-md items-center justify-center"
		>
			<Text className="text-white font-bold text-sm">
				{name ? name.charAt(0).toUpperCase() : '⚡'}
			</Text>
		</View>
	);
};

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

interface ElectricityHistoryRecord {
	orderid: string;
	provider: string;
	statuscode: string;
	status: string;
	meterno: string;
	metertoken: string;
	amount: string;
	date: string;
}

interface ElectricityHistoryResponse {
	status: number;
	message: string;
	data: {
		current_page: number;
		data: ElectricityHistoryRecord[];
		last_page: number;
		next_page_url: string | null;
		prev_page_url: string | null;
		total: number;
	};
}

// Preset electricity amounts
const PRESET_AMOUNTS = [1000, 2000, 3000, 5000, 10000, 20000];

const Electricity = () => {
	const {setLoading} = useGlobalStore();
	const [showPin, setShowPin] = useState(false);
	const [formData, setFormData] = useState({
		provider_id: 0,
		name: '',
		abbreviation: '',
		meter_no: '',
		meter_type: '',
		amount: '',
		account_name: '',
	});
	const [showProviderModal, setShowProviderModal] = useState(false);
	const [showTypeModal, setShowTypeModal] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [history, setHistory] = useState<ElectricityHistoryRecord[]>([]);
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
			const response = await axiosClient.get<ElectricityHistoryResponse>(
				'/electricity/history',
			);
			if (response.status === 200) {
				setHistory(response.data.data.data);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setHistoryLoading(false);
		}
	};

	const handleVerify = async () => {
		setLoading(true);
		try {
			if (!formData.provider_id) throw new Error('Please select a provider');
			if (!formData.meter_type) throw new Error('Please select meter type');
			if (!formData.meter_no) throw new Error('Please input your meter number');

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
		} finally {
			setLoading(false);
		}
	};

	const handleBuy = async (pin?: string) => {
		try {
			if (!formData.provider_id) throw new Error('Please select a provider');
			if (!formData.meter_no) throw new Error('Please input your meter number');
			if (!formData.amount) throw new Error('Please input an amount');
			if (Number(formData.amount) < 1000)
				throw new Error('Minimum unit purchase is ₦1,000');

			setLoading(true);
			const axiosClient = new AxiosClient();
			if (!pin) return setShowPin(true);

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
					text2: 'Electricity purchase successful',
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
		} finally {
			if (pin) setShowPin(false);
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-[#F5F5F5]"
			behavior="padding"
			keyboardVerticalOffset={20}
		>
			{/* Header */}
			<View className="px-[5%] pt-5 pb-2 bg-[#F5F5F5]">
				<Back title="Electricity" />
				<TouchableOpacity
					className="self-end mt-2"
					onPress={() => {
						setShowHistory(true);
						fetchHistory();
					}}
				>
					<Text className="text-[#1A73E8] text-sm font-medium">History</Text>
				</TouchableOpacity>
			</View>

			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				{/* Provider Selector */}
				<TouchableOpacity
					onPress={() => setShowProviderModal(true)}
					className="mx-[5%] mt-4 mb-4 bg-white border border-[#E8E8E8] rounded-xl px-4 h-14 flex-row items-center justify-between"
				>
					<View className="flex-row items-center gap-x-3">
						<ProviderIcon
							abbreviation={formData.abbreviation}
							name={formData.name}
						/>
						<Text className="text-base font-medium text-[#111]">
							{formData.name || 'Select Provider'}
						</Text>
					</View>
					<Text className="text-[#7D7D7D] text-xs">▼</Text>
				</TouchableOpacity>

				{/* Meter Type selector */}
				<TouchableOpacity
					onPress={() => setShowTypeModal(true)}
					className="mx-[5%] mb-4 bg-white border border-[#E8E8E8] rounded-xl px-4 h-14 flex-row items-center justify-between"
				>
					<Text className="text-base text-[#111]">
						{formData.meter_type || 'Select Meter Type'}
					</Text>
					<Text className="text-[#7D7D7D] text-xs">▼</Text>
				</TouchableOpacity>

				{/* Meter/Account Number Card */}
				<View className="mx-[5%] mb-4 bg-white rounded-xl px-4 pt-4 pb-5">
					<View className="flex-row justify-between items-center mb-3">
						<Text className="text-base font-bold text-[#111]">
							Meter/Account number
						</Text>
						<TouchableOpacity>
							<Text className="text-[#1A73E8] text-sm font-medium">
								Beneficiaries
							</Text>
						</TouchableOpacity>
					</View>

					<TextInput
						className="border-b border-[#E0E0E0] py-2 text-base text-[#111]"
						inputMode="tel"
						value={formData.meter_no.replace(/[<>"'&/]/g, '')}
						onChangeText={text =>
							setFormData(prev => ({
								...prev,
								meter_no: text.replace(/[<>"'&/]/g, ''),
								account_name: '',
							}))
						}
						placeholder="Enter your number"
						placeholderTextColor={'#999'}
						onEndEditing={() => {
							if (
								formData.provider_id &&
								formData.meter_type &&
								formData.meter_no
							) {
								handleVerify();
							}
						}}
					/>

					{formData.account_name ? (
						<Text className="text-[#1A73E8] font-semibold mt-3 text-sm">
							{formData.account_name}
						</Text>
					) : null}
				</View>

				{/* Last payment row with Renew */}
				{formData.account_name ? (
					<View className="mx-[5%] mb-4 bg-white rounded-xl px-4 h-14 flex-row items-center justify-between">
						<Text className="text-[#555] text-base">
							Last payment:{' '}
							<Text className="font-bold text-[#111]">
								{formData.amount
									? `${Number(formData.amount).toLocaleString()}`
									: '—'}
							</Text>
						</Text>
						<TouchableOpacity
							className="bg-[#0D1B4B] px-4 py-2 rounded-lg"
							onPress={() => handleBuy()}
						>
							<Text className="text-white text-sm font-semibold">Renew</Text>
						</TouchableOpacity>
					</View>
				) : null}

				{/* Enter an amount card */}
				<View className="mx-[5%] mb-4 bg-white rounded-xl px-4 pt-4 pb-5">
					<Text className="text-base font-semibold text-[#111] mb-3">
						Enter an amount
					</Text>
					<TextInput
						className="border-b border-[#E0E0E0] py-2 text-base text-[#111]"
						inputMode="numeric"
						value={formData.amount}
						onChangeText={text =>
							setFormData(prev => ({
								...prev,
								amount: text.replace(/[<>"'&/]/g, ''),
							}))
						}
						placeholder="Enter an amount"
						placeholderTextColor={'#999'}
					/>
				</View>

				{/* Pay for your Electricity preset grid */}
				<View className="mx-[5%] bg-white rounded-xl px-4 pt-4 pb-5 mb-4">
					<Text className="text-xl font-bold text-[#111] mb-4">
						Pay for your Electricity
					</Text>
					<View className="flex-row flex-wrap gap-5">
						{PRESET_AMOUNTS.map(amount => {
							const isSelected = formData.amount === String(amount);
							return (
								<TouchableOpacity
									key={amount}
									onPress={() =>
										setFormData(prev => ({...prev, amount: String(amount)}))
									}
									style={{width: '30%'}}
									className={`rounded-xl p-3 ${
										isSelected
											? 'bg-[#EEF2FF] border border-secondary'
											: 'bg-[#F5F6FA]'
									}`}
								>
									<Text className="text-xl font-bold text-[#111] text-center">
										₦{amount.toLocaleString()}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>
				</View>

				{/* Note banner */}
				<View className="mx-[5%] mb-8 bg-[#dee8f6] px-4 py-4 rounded-xl flex-row gap-x-3 items-start">
					<InfoIcon />
					<View className="flex-1">
						<Text className="text-[#444] text-xs leading-5">
							Minimum unit purchase is ₦1,000.
						</Text>
						<Text className="text-[#444] text-xs leading-5">
							Transaction attracts a service charge of ₦50 only.
						</Text>
					</View>
				</View>
			</ScrollView>

			{/* Provider Modal */}
			{showProviderModal && (
				<Modal transparent animationType="slide">
					<Pressable
						className="flex-1 bg-black/40"
						onPress={() => setShowProviderModal(false)}
					/>
					<View className="bg-white w-full py-8 px-[5%] rounded-t-2xl">
						<Text className="text-2xl font-bold mb-5">Select Provider</Text>
						<ScrollView>
							{providers.map(provider => (
								<TouchableOpacity
									key={provider.id}
									className="py-4 border-b border-[#F0F0F0] flex-row items-center gap-x-4"
									onPress={() => {
										setFormData(prev => ({
											...prev,
											provider_id: provider.id,
											name: provider.attributes.provider,
											abbreviation: provider.attributes.abbreviation,
											account_name: '',
										}));
										setShowProviderModal(false);
									}}
								>
									<ProviderIcon
										abbreviation={provider.attributes.abbreviation}
										name={provider.attributes.provider}
									/>
									<Text className="text-xl">
										{provider.attributes.provider}
									</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				</Modal>
			)}

			{/* Meter Type Modal */}
			{showTypeModal && (
				<Modal transparent animationType="slide">
					<Pressable
						className="flex-1 bg-black/40"
						onPress={() => setShowTypeModal(false)}
					/>
					<View className="bg-white w-full py-8 px-[5%] rounded-t-2xl">
						<Text className="text-2xl font-bold mb-5">Select Meter Type</Text>
						{meters.map(meter => (
							<TouchableOpacity
								key={meter}
								className="py-4 border-b border-[#F0F0F0]"
								onPress={() => {
									setFormData(prev => ({
										...prev,
										meter_type: meter,
										account_name: '',
									}));
									setShowTypeModal(false);
								}}
							>
								<Text className="text-xl">{meter}</Text>
							</TouchableOpacity>
						))}
					</View>
				</Modal>
			)}

			{/* Bottom Buy / Verify Button */}
			<View className="px-[5%] pb-8 pt-3 bg-[#F5F5F5]">
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
								<Text className="text-[#666] text-base">No history found</Text>
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
												₦{Number(record.amount).toLocaleString()}
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
										<Text className="text-[#555] text-sm mb-1">
											Meter: {record.meterno}
										</Text>
										<Text
											className="text-[#1A73E8] text-sm font-medium mb-1"
											noWrap
										>
											Token: {record.metertoken}
										</Text>
										<Text className="text-[#999] text-xs">{record.date}</Text>
									</View>
								))}
							</ScrollView>
						)}
					</View>
				</Modal>
			)}
		</KeyboardAvoidingView>
	);
};

export default Electricity;
