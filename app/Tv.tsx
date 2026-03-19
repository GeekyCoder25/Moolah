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
	dstv: require('@/assets/images/dstv-icon.png'),
	gotv: require('@/assets/images/gotv-icon.png'),
	startimes: require('@/assets/images/startimes-logo.png'),
};

const ProviderIcon = ({name, size = 32}: {name: string; size?: number}) => {
	const key = name.toLowerCase().replace(/[^a-z]/g, '');
	const img = PROVIDER_IMAGES[key];
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
				{name ? name.charAt(0).toUpperCase() : '📺'}
			</Text>
		</View>
	);
};

// Top-level API response
export interface ApiResponse {
	status: number;
	message: string;
	data: Data;
}

export interface Data {
	subscription_type: string[];
	cableTv: CableTvProvider[];
}

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

const PLAN_TABS = ['HOT', 'Premium'] as const;
type PlanTab = (typeof PLAN_TABS)[number];

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
	const [showTypeModal, setShowTypeModal] = useState(false);
	const [providers, setProviders] = useState<CableTvProvider[]>([]);
	const [types, setTypes] = useState<string[]>([]);
	const [activePlanTab, setActivePlanTab] = useState<PlanTab>('HOT');

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

	const currentProvider = providers.find(p => p.id === formData.provider);
	const allPlans = currentProvider?.relationships.plan ?? [];

	// HOT = cheaper/shorter plans, Premium = more expensive
	const filteredPlans =
		activePlanTab === 'HOT'
			? allPlans.filter(p => Number(p.attributes.price) <= 5000)
			: allPlans.filter(p => Number(p.attributes.price) > 5000);

	const handleVerify = async () => {
		setLoading(true);
		try {
			if (!formData.provider) throw new Error('Please select a provider');
			if (!formData.iuc_no) throw new Error('Please input your decoder number');

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
		} finally {
			setLoading(false);
		}
	};

	const handleBuy = async (pin?: string) => {
		try {
			if (!formData.provider) throw new Error('Please select a provider');
			if (!formData.plan_id)
				throw new Error('Please select a subscription plan');
			if (!formData.type) throw new Error('Please select subscription type');
			if (!formData.iuc_no) throw new Error('Please input your decoder number');

			setLoading(true);
			const axiosClient = new AxiosClient();
			if (!pin) return setShowPin(true);

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
					text2: 'Cable TV subscription successful',
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
			<View className="px-[5%] pt-5 bg-[#F5F5F5]">
				<Back title="Tv" />
			</View>

			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				{/* Provider Selector */}
				<TouchableOpacity
					onPress={() => setShowProviderModal(true)}
					className="mx-[5%] mt-4 mb-4 bg-white border border-[#E8E8E8] rounded-xl px-4 h-14 flex-row items-center justify-between"
				>
					<View className="flex-row items-center gap-x-3">
						<ProviderIcon name={formData.name} />
						<Text className="text-base font-medium text-[#111]">
							{formData.name || 'Select Provider'}
						</Text>
					</View>
					<Text className="text-[#7D7D7D] text-xs">▼</Text>
				</TouchableOpacity>

				{/* IUC Number Card */}
				<View className="mx-[5%] mb-4 bg-white rounded-xl px-4 pt-4 pb-5">
					<View className="flex-row justify-between items-center mb-3">
						<Text className="text-base font-bold text-[#111]">IUC Number</Text>
						<TouchableOpacity>
							<Text className="text-[#1A73E8] text-sm font-medium">
								Beneficiaries
							</Text>
						</TouchableOpacity>
					</View>

					{/* Underline-style input */}
					<TextInput
						className="border-b border-[#E0E0E0] py-2 text-base text-[#111]"
						inputMode="numeric"
						value={formData.iuc_no.replace(/[<>"'&/]/g, '')}
						onChangeText={text =>
							setFormData(prev => ({
								...prev,
								iuc_no: text.replace(/[<>"'&/]/g, ''),
								account_name: '',
							}))
						}
						placeholder="Enter your number"
						placeholderTextColor={'#999'}
						onEndEditing={() => {
							if (formData.provider && formData.iuc_no) handleVerify();
						}}
					/>

					{/* Verified account name */}
					{formData.account_name ? (
						<Text className="text-[#1A73E8] font-semibold mt-3 text-sm">
							{formData.account_name}
						</Text>
					) : null}
				</View>

				{/* Subscription Type selector (shown after IUC verified) */}
				{formData.account_name ? (
					<TouchableOpacity
						onPress={() => setShowTypeModal(true)}
						className="mx-[5%] mb-4 bg-white border border-[#E8E8E8] rounded-xl px-4 h-14 flex-row items-center justify-between"
					>
						<Text className="text-base text-[#111]">
							{formData.type || 'Select subscription type'}
						</Text>
						<Text className="text-[#7D7D7D] text-xs">▼</Text>
					</TouchableOpacity>
				) : null}

				{/* Plans section — only shown when provider selected */}
				{formData.provider ? (
					<View className="mx-[5%] bg-white rounded-xl px-4 pt-4 pb-5 mb-6">
						<Text className="text-xl font-bold text-[#111] mb-4">
							Buy Subscription
						</Text>

						{/* HOT / Premium sub-tabs */}
						<View className="flex-row gap-x-6 mb-4">
							{PLAN_TABS.map(tab => (
								<TouchableOpacity
									key={tab}
									onPress={() => setActivePlanTab(tab)}
									className="pb-2"
								>
									<Text
										className={`text-base font-medium ${
											activePlanTab === tab ? 'text-[#111]' : 'text-[#999]'
										}`}
									>
										{tab}
									</Text>
									{activePlanTab === tab && (
										<View className="h-[2.5px] bg-[#0D1B4B] rounded-full mt-1" />
									)}
								</TouchableOpacity>
							))}
						</View>

						{/* Plan Cards Grid */}
						{filteredPlans.length > 0 ? (
							<View className="flex-row flex-wrap gap-3">
								{filteredPlans.map(plan => {
									const isSelected = formData.plan_id === plan.id;
									return (
										<TouchableOpacity
											key={plan.id}
											onPress={() =>
												setFormData(prev => ({
													...prev,
													plan_id: plan.id,
													plan_name: plan.attributes.name,
													price: plan.attributes.price,
												}))
											}
											style={{width: '47%'}}
											className={`rounded-xl p-4 border ${
												isSelected
													? 'border-secondary bg-[#EEF1FA]'
													: 'border-[#E8E8E8] bg-[#F8F9FB]'
											}`}
										>
											<Text className="text-[#888] text-xs mb-1">
												{plan.attributes.day}{' '}
												{Number(plan.attributes.day) > 1 ? 'days' : 'day'}
											</Text>
											<Text
												className="text-base font-bold text-[#111] leading-tight"
												numberOfLines={2}
											>
												{plan.attributes.name}
											</Text>
											<Text className="text-[#1A73E8] font-semibold mt-1 text-sm">
												₦{Number(plan.attributes.price).toLocaleString()}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						) : (
							<Text className="text-[#999] text-sm">
								No plans available in this category
							</Text>
						)}
					</View>
				) : null}

				{/* Note banner */}
				<View className="mx-[5%] mb-8 bg-[#dee8f6] px-4 py-4 rounded-xl flex-row gap-x-3">
					<InfoIcon />
					<Text className="text-[#444] text-xs leading-5 flex-1">
						Contact DSTV/GOtv on 01-2703232 / 08039003788 or toll free:
						08149860333, 07080630333, 09090630333. STARTIMES: 094618888,
						014618888.
					</Text>
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
											provider: provider.id,
											name: provider.attributes.name,
											plan_id: 0,
											plan_name: '',
											price: '',
											account_name: '',
										}));
										setShowProviderModal(false);
									}}
								>
									<ProviderIcon name={provider.attributes.name} />
									<Text className="text-xl">{provider.attributes.name}</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				</Modal>
			)}

			{/* Subscription Type Modal */}
			{showTypeModal && (
				<Modal transparent animationType="slide">
					<Pressable
						className="flex-1 bg-black/40"
						onPress={() => setShowTypeModal(false)}
					/>
					<View className="bg-white w-full py-8 px-[5%] rounded-t-2xl">
						<Text className="text-2xl font-bold mb-5">Subscription Type</Text>
						{types.map(type => (
							<TouchableOpacity
								key={type}
								className="py-4 border-b border-[#F0F0F0]"
								onPress={() => {
									setFormData(prev => ({...prev, type}));
									setShowTypeModal(false);
								}}
							>
								<Text className="text-xl">{type}</Text>
							</TouchableOpacity>
						))}
					</View>
				</Modal>
			)}

			{/* Bottom Buy / Verify Button */}
			<View className="px-[5%] pb-8 pt-3 bg-[#F5F5F5]">
				{formData.plan_id && formData.account_name ? (
					<View className="flex-row justify-between items-center mb-3">
						<Text className="text-[#555] text-sm">Selected:</Text>
						<Text className="font-semibold text-[#111] text-sm">
							{formData.plan_name} — ₦{Number(formData.price).toLocaleString()}
						</Text>
					</View>
				) : null}
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
		</KeyboardAvoidingView>
	);
};

export default TV;
