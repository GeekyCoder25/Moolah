import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {formatNaira} from '@/utils';
import {AxiosClient} from '@/utils/axios';
import {router} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {
	KeyboardAvoidingView,
	Modal,
	Pressable,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Button from '../components/button';
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
	type: string;
	id: number;
	attributes: NetworkAttributes;
}

export interface NetworkAttributes {
	network: string;
	network_status: string;
	vtuStatus: string;
	sharesellStatus: string;
	airtimepinStatus: string;
	smeStatus: string;
	giftingStatus: string;
	corporateStatus: string;
	datapinStatus: string;
	dataplans: DataPlan[];
}

export interface DataPlan {
	type: string;
	id: number;
	attributes: DataPlanAttributes;
}

export interface DataPlanAttributes {
	name: string;
	price: string;
	discounted_price?: number;
	discount_percentage?: number;
	type: string;
	day: string;
	network: string;
}

const PLAN_TABS = ['HOT', 'Daily', 'Weekly', 'Monthly', 'Yearly'] as const;
type PlanTab = (typeof PLAN_TABS)[number];

// Data plan category chips.
//
// A plan belongs to a product chip when its `type` matches one of `types`
// (normalized) OR its `name` contains one of `keywords`.
//
// `Others` is a catch-all for plans that match no product chip, so no plan is
// ever hidden.
interface DataCategory {
	label: string;
	types?: string[];
	keywords?: string[];
}

const OTHERS_CATEGORY = 'Others';
const DIRECT_DATA_CATEGORY = 'Direct Data';

const DATA_CATEGORIES: DataCategory[] = [
	{label: DIRECT_DATA_CATEGORY, types: ['Direct-Data', 'Direct', 'VTU']},
	{
		label: 'Router Data',
		types: ['Router', 'Router-Data'],
		keywords: ['router'],
	},
	{label: 'Mifi Data', types: ['Mifi', 'Mifi-Data'], keywords: ['mifi']},
	{label: 'Broadband', types: ['Broadband']},
	{label: 'YouTube', keywords: ['youtube']},
	{label: 'Mega', types: ['Mega']},
	{label: 'TV', types: ['TV']},
	{label: 'Social', types: ['Social'], keywords: ['social']},
	{label: 'Weekend', types: ['Weekend'], keywords: ['weekend']},
	{label: 'Extra Value', types: ['Extra-Value']},
	{label: 'HypernetFlex', types: ['HypernetFlex']},
	{label: 'Special', types: ['Special']},
	{label: 'Glo MyG', types: ['Glo-MyG']},
	{label: 'Campus', types: ['Campus']},
	{label: 'Night', types: ['Night'], keywords: ['night']},
	{label: 'Hourly', types: ['Hourly'], keywords: ['hour']},
	{label: OTHERS_CATEGORY},
];

const normalizeType = (value?: string) =>
	(value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// Does a plan match a specific (non-Others) category?
const planMatchesCategory = (plan: DataPlan, category: DataCategory) => {
	const type = normalizeType(plan.attributes.type);
	const name = plan.attributes.name?.toLowerCase() ?? '';
	const typeMatch = (category.types ?? []).some(t => normalizeType(t) === type);
	const keywordMatch = (category.keywords ?? []).some(k => name.includes(k));
	return typeMatch || keywordMatch;
};

const networks = [
	{label: 'MTN', id: 1},
	{label: 'GLO', id: 2},
	{label: 'T2mobile', id: 3},
	{label: 'Airtel', id: 4},
];

const Data = () => {
	const {setLoading, user} = useGlobalStore();
	const [formData, setFormData] = useState({
		network: '',
		id: 1,
		plan: '',
		plan_id: 0,
		price: '',
		discounted_price: 0,
		phone_number: user?.phone_number ?? '',
		type: '',
	});
	const [showPin, setShowPin] = useState(false);
	const [showNetworkModal, setShowNetworkModal] = useState(false);
	const [activeCategory, setActiveCategory] = useState<string>(
		DATA_CATEGORIES[0].label,
	);
	const [activePlanTab, setActivePlanTab] = useState<PlanTab>('HOT');
	const [plans, setPlans] = useState<NetworkData[]>([]);

	useEffect(() => {
		const getDataPlans = async () => {
			try {
				const axiosClient = new AxiosClient();
				const response = await axiosClient.get<DataResponse>('/data');
				if (response.status === 200) {
					setPlans(response.data.data.data);
				}
			} catch (error) {
				console.log(error);
			}
		};
		getDataPlans();
	}, []);

	const networkAttributes = plans.find(p => p.id === formData.id)?.attributes;
	const networkPlans = networkAttributes?.dataplans ?? [];

	// A plan is "Other" when it matches no product category.
	const isOtherPlan = (plan: DataPlan) =>
		!DATA_CATEGORIES.some(
			c => c.label !== OTHERS_CATEGORY && planMatchesCategory(plan, c),
		);

	// Product chips filter by their own matcher; Others catches the rest.
	const plansForCategory = (plan: DataPlan, category?: DataCategory) => {
		if (!category) return true;
		if (category.label === OTHERS_CATEGORY) return isOtherPlan(plan);
		return planMatchesCategory(plan, category);
	};

	// A chip is visible when it's Others and the network has unmatched plans, or
	// a product chip the network actually has plans for.
	const visibleCategories = DATA_CATEGORIES.filter(category => {
		if (category.label === OTHERS_CATEGORY)
			return networkPlans.some(isOtherPlan);
		return networkPlans.some(plan => planMatchesCategory(plan, category));
	});

	// Fall back to the first available chip when the active one isn't offered by
	// the selected network (e.g. after switching from GLO to MTN).
	const effectiveCategory = visibleCategories.some(
		c => c.label === activeCategory,
	)
		? activeCategory
		: (visibleCategories[0]?.label ?? activeCategory);

	const activeCategoryDef = DATA_CATEGORIES.find(
		c => c.label === effectiveCategory,
	);
	const currentNetworkPlans = networkPlans.filter(plan =>
		plansForCategory(plan, activeCategoryDef),
	);

	// HOT = all plans; others filter by validity window
	const filteredPlans = currentNetworkPlans.filter(plan => {
		const day = Number(plan.attributes.day);
		if (activePlanTab === 'HOT') return true;
		if (activePlanTab === 'Daily') return day <= 2;
		if (activePlanTab === 'Weekly') return day >= 3 && day <= 13;
		if (activePlanTab === 'Monthly') return day >= 14 && day < 300;
		if (activePlanTab === 'Yearly') return day >= 300;
		return true;
	});

	const handleBuy = async (pin?: string) => {
		try {
			if (!formData.network) throw new Error('Please select a network');
			if (!formData.plan) throw new Error('Please select a plan to buy');
			if (!formData.phone_number)
				throw new Error('Please input your phone number');

			setLoading(true);
			const axiosClient = new AxiosClient();

			if (!pin) return setShowPin(true);

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
					discounted_price: 0,
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
		} finally {
			if (pin) setShowPin(false);
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-white"
			behavior="padding"
			keyboardVerticalOffset={20}
		>
			{/* Header */}
			<View className="px-[5%] pt-5">
				<Back title="Data" />
			</View>

			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				{/* Phone Number Row */}
				<View className="mx-[5%] mt-4 mb-5 flex-row items-center justify-between border border-[#E0E0E0] rounded-xl px-4 h-14 overflow-hidden">
					<View className="flex-row items-center gap-x-3 flex-1">
						<Text className="text-[#888] text-base">Number:</Text>
						<TextInput
							className="flex-1 text-base text-[#111] font-medium"
							inputMode="tel"
							maxLength={11}
							value={formData.phone_number.replace(/[<>"'&/]/g, '')}
							onChangeText={text =>
								setFormData(prev => ({
									...prev,
									phone_number: text.replace(/[<>"'&/]/g, ''),
								}))
							}
							placeholder="Phone number"
							placeholderTextColor={'#999'}
						/>
					</View>

					{/* Divider + Network Selector */}
					<View className="flex-row items-center gap-x-2">
						<View className="w-[1px] h-8 bg-[#E0E0E0] mx-2" />
						<TouchableOpacity
							onPress={() => setShowNetworkModal(true)}
							className="flex-row items-center gap-x-1"
						>
							{networkProvidersIcon(formData.network.toLowerCase()) || (
								<Text>Select Network </Text>
							)}
							{/* Caret */}
							<View className="ml-1">
								<Text className="text-[#7D7D7D] text-xs">▼</Text>
							</View>
						</TouchableOpacity>
					</View>
				</View>

				{/* Buy Data heading + subtitle */}
				<View className="px-[5%] flex-row justify-between items-center mb-4">
					<Text className="text-xl font-bold text-[#111]">Buy Data</Text>
					<Text className="text-[#1A73E8] text-sm">Data for all Network</Text>
				</View>

				{/* Data plan category chips */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="px-[5%] mb-1"
					contentContainerStyle={{gap: 8, paddingRight: 50}}
				>
					{visibleCategories.map(category => (
						<TouchableOpacity
							key={category.label}
							onPress={() => {
								setActiveCategory(category.label);
								setFormData(prev => ({
									...prev,
									plan: '',
									plan_id: 0,
									price: '',
									discounted_price: 0,
									type: '',
								}));
							}}
							className={`px-4 py-2 rounded-full border ${
								effectiveCategory === category.label
									? 'bg-secondary border-secondary'
									: 'bg-white border-[#D0D0D0]'
							}`}
						>
							<Text
								className={`text-sm font-semibold ${
									effectiveCategory === category.label
										? 'text-white'
										: 'text-[#555]'
								}`}
							>
								{category.label}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>

				{/* Plan Sub-tabs (HOT, Daily, Weekly, Monthly, SME) */}
				<View className="px-[5%] mt-4 mb-3">
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{gap: 24}}
					>
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
					</ScrollView>
				</View>

				{/* Data Plan Grid */}
				{filteredPlans.length > 0 ? (
					<View className="px-[5%] flex-row flex-wrap gap-3 mb-6">
						{filteredPlans.map(plan => {
							const isSelected = formData.plan_id === plan.id;
							const originalPrice = Number(plan.attributes.price);
							const discountedPrice =
								plan.attributes.discounted_price ?? originalPrice;
							const hasDiscount = discountedPrice < originalPrice;
							return (
								<TouchableOpacity
									key={plan.id}
									onPress={() =>
										setFormData(prev => ({
											...prev,
											plan: plan.attributes.name,
											price: plan.attributes.price,
											discounted_price: discountedPrice,
											type: plan.attributes.type,
											plan_id: plan.id,
										}))
									}
									style={{width: '47%'}}
									className={`rounded-xl p-4 border ${
										isSelected
											? 'border-secondary bg-[#EEF1FA]'
											: 'border-[#E8E8E8] bg-white'
									}`}
								>
									<Text className="text-[#888] text-xs mb-1">
										{plan.attributes.day}{' '}
										{Number(plan.attributes.day) > 1 ? 'days' : 'day'}
									</Text>

									{/* Data size - parse name like "1 GB" or "500 MB" */}
									<Text className="text-2xl font-bold text-[#111] leading-tight">
										{plan.attributes.name}
									</Text>

									{hasDiscount && (
										<Text className="text-[#888] text-xs line-through mt-1">
											{formatNaira(originalPrice)}
										</Text>
									)}
									<Text className="text-[#1A73E8] font-semibold mt-0.5">
										{formatNaira(discountedPrice)}
									</Text>
									{hasDiscount && (
										<Text className="text-[#1F9254] text-xs mt-0.5">
											Save {formatNaira(originalPrice - discountedPrice)}
										</Text>
									)}
								</TouchableOpacity>
							);
						})}
					</View>
				) : (
					/* Fallback placeholder grid when no API data yet */
					<View className="px-[5%] flex-row flex-wrap gap-3 mb-6 justify-center items-center my-20">
						<Text>
							No {effectiveCategory.toLowerCase()} data plans available
						</Text>
					</View>
				)}
			</ScrollView>

			{/* Network Modal */}
			{showNetworkModal && (
				<Modal transparent animationType="slide">
					<Pressable
						className="flex-1 bg-black/40"
						onPress={() => setShowNetworkModal(false)}
					/>
					<View className="bg-white w-full py-8 px-[5%] rounded-t-2xl">
						<Text className="text-2xl font-bold mb-5">Select Network</Text>
						{networks.map(network => (
							<TouchableOpacity
								key={network.label}
								className="py-4 flex-row items-center gap-x-4 border-b border-[#F0F0F0]"
								onPress={() => {
									setFormData(prev => ({
										...prev,
										network: network.label,
										id: network.id,
										plan: '',
										plan_id: 0,
										price: '',
										type: '',
									}));
									setShowNetworkModal(false);
								}}
							>
								{networkProvidersIcon(network.label.toLowerCase())}
								<Text className="text-xl">{network.label}</Text>
							</TouchableOpacity>
						))}
					</View>
				</Modal>
			)}

			{/* Bottom Buy Button */}
			<View className="px-[5%] pb-8 pt-3 bg-white border-t border-[#F0F0F0]">
				{formData.plan ? (
					<View className="flex-row justify-between items-center mb-3">
						<Text className="text-[#555]">Selected:</Text>
						<Text className="font-semibold text-[#111]">
							{formData.plan} — {formatNaira(formData.discounted_price)}
						</Text>
					</View>
				) : null}
				<Button
					title="Buy"
					onPress={() => handleBuy()}
					disabled={
						!formData.plan || !formData.phone_number || !formData.network
					}
				/>
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

export default Data;
