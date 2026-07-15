import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {formatNaira} from '@/utils';
import {AxiosClient} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';
import {router} from 'expo-router';
import React, {useMemo, useState} from 'react';
import {
	ActivityIndicator,
	Image,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Button from './components/button';
import PinModal from './components/PinModal';

interface Country {
	code: string;
	flag: string;
	name: string;
	currency: string;
	prefix: string;
}

interface ProductType {
	product_type_id: number;
	name: string;
}

interface Operator {
	operator_id: string;
	name: string;
	operator_image: string;
}

interface Variation {
	variation_code: string;
	name: string;
	fixedPrice: string; // "Yes" | "No"
	variation_amount: string;
	variation_amount_min: string;
	variation_amount_max: string;
	variation_rate: number;
	charged_amount: string;
	charged_currency: string;
}

interface VariationsData {
	ServiceName: string;
	serviceID: string;
	convinience_fee: string;
	currency: string;
	variations: Variation[];
}

interface ApiResponse<T> {
	status: number;
	message: string;
	data: T;
}

const BASE = '/vtpass/international-airtime';

const InternationalAirtime = () => {
	const {setLoading, user} = useGlobalStore();
	const insets = useSafeAreaInsets();

	const [country, setCountry] = useState<Country | null>(null);
	const [productType, setProductType] = useState<ProductType | null>(null);
	const [operator, setOperator] = useState<Operator | null>(null);
	const [variation, setVariation] = useState<Variation | null>(null);
	const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? '');
	const [email, setEmail] = useState(user?.email ?? '');

	const [showCountryModal, setShowCountryModal] = useState(false);
	const [showOperatorModal, setShowOperatorModal] = useState(false);
	const [countrySearch, setCountrySearch] = useState('');
	const [showPin, setShowPin] = useState(false);

	// --- Dependent data fetching ---------------------------------------------
	const {data: countries, isLoading: loadingCountries} = useQuery({
		queryKey: ['intl-airtime', 'countries'],
		queryFn: async () => {
			const axiosClient = new AxiosClient();
			const res = await axiosClient.get<ApiResponse<Country[]>>(
				`${BASE}/countries`,
			);
			return res.data.data;
		},
	});

	const {data: productTypes, isLoading: loadingProductTypes} = useQuery({
		queryKey: ['intl-airtime', 'product-types', country?.code],
		enabled: !!country,
		queryFn: async () => {
			const axiosClient = new AxiosClient();
			const res = await axiosClient.get<ApiResponse<ProductType[]>>(
				`${BASE}/product-types?country_code=${country?.code}`,
			);
			return res.data.data;
		},
	});

	const {data: operators, isLoading: loadingOperators} = useQuery({
		queryKey: [
			'intl-airtime',
			'operators',
			country?.code,
			productType?.product_type_id,
		],
		enabled: !!country && !!productType,
		queryFn: async () => {
			const axiosClient = new AxiosClient();
			const res = await axiosClient.get<ApiResponse<Operator[]>>(
				`${BASE}/operators?country_code=${country?.code}&product_type_id=${productType?.product_type_id}`,
			);
			return res.data.data;
		},
	});

	const {data: variationsData, isLoading: loadingVariations} = useQuery({
		queryKey: [
			'intl-airtime',
			'variations',
			operator?.operator_id,
			productType?.product_type_id,
		],
		enabled: !!operator && !!productType,
		queryFn: async () => {
			const axiosClient = new AxiosClient();
			const res = await axiosClient.get<ApiResponse<VariationsData>>(
				`${BASE}/variations?operator_id=${operator?.operator_id}&product_type_id=${productType?.product_type_id}`,
			);
			return res.data.data;
		},
	});

	const variations = variationsData?.variations ?? [];

	const filteredCountries = useMemo(() => {
		const q = countrySearch.trim().toLowerCase();
		if (!q) return countries ?? [];
		return (countries ?? []).filter(
			c =>
				c.name.toLowerCase().includes(q) ||
				c.code.toLowerCase().includes(q) ||
				c.prefix.includes(q),
		);
	}, [countries, countrySearch]);

	// --- Selection resets -----------------------------------------------------
	const selectCountry = (c: Country) => {
		setCountry(c);
		setProductType(null);
		setOperator(null);
		setVariation(null);
		setShowCountryModal(false);
		setCountrySearch('');
	};

	const selectProductType = (p: ProductType) => {
		setProductType(p);
		setOperator(null);
		setVariation(null);
	};

	const selectOperator = (o: Operator) => {
		setOperator(o);
		setVariation(null);
		setShowOperatorModal(false);
	};

	const handleBuy = async (pin?: string) => {
		try {
			if (!country) throw new Error('Please select a country');
			if (!productType) throw new Error('Please select a product type');
			if (!operator) throw new Error('Please select an operator');
			if (!variation) throw new Error('Please select an amount');
			if (!phoneNumber) throw new Error('Please input the phone number');
			if (!email) throw new Error('Please input an email address');

			setLoading(true);
			if (!pin) return setShowPin(true);

			const axiosClient = new AxiosClient();
			const response = await axiosClient.post(`${BASE}/purchase`, {
				operator_id: operator.operator_id,
				country_code: country.code,
				product_type_id: String(productType.product_type_id),
				variation_code: variation.variation_code,
				phone: phoneNumber,
				amount: variation.variation_amount,
				email,
				pin,
			});

			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'International airtime purchase successful',
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
			if (pin) setShowPin(false);
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-[#F5F5F5]"
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			keyboardVerticalOffset={insets.top}
		>
			<View className="px-[5%] pt-5 bg-[#F5F5F5]">
				<Back title="International Airtime" />
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{paddingBottom: 24}}
			>
				{/* Country selector */}
				<View className="mx-[5%] mt-4 gap-y-2">
					<Text className="text-base font-semibold text-[#111]">Country</Text>
					<TouchableOpacity
						onPress={() => setShowCountryModal(true)}
						className="bg-white border border-[#E8E8E8] rounded-xl px-4 h-14 flex-row items-center justify-between"
					>
						{country ? (
							<View className="flex-row items-center gap-x-3 flex-1">
								<Image
									source={{uri: country.flag}}
									style={{width: 28, height: 20, borderRadius: 3}}
								/>
								<Text className="text-base font-medium text-[#111] flex-1">
									{country.name}
								</Text>
								<Text className="text-[#888] text-sm">+{country.prefix}</Text>
							</View>
						) : (
							<Text className="text-[#999] text-base">Select country</Text>
						)}
						<Text className="text-[#7D7D7D] text-xs ml-2">▼</Text>
					</TouchableOpacity>
				</View>

				{/* Product type selector */}
				{country && (
					<View className="mx-[5%] mt-5 gap-y-2">
						<Text className="text-base font-semibold text-[#111]">Product</Text>
						{loadingProductTypes ? (
							<ActivityIndicator className="py-4" />
						) : (
							<View className="flex-row flex-wrap gap-3">
								{(productTypes ?? []).map(p => {
									const active =
										productType?.product_type_id === p.product_type_id;
									return (
										<TouchableOpacity
											key={p.product_type_id}
											onPress={() => selectProductType(p)}
											className={`px-4 py-3 rounded-xl border ${
												active
													? 'bg-secondary border-secondary'
													: 'bg-white border-[#D0D0D0]'
											}`}
										>
											<Text
												className={`text-sm font-semibold ${
													active ? 'text-white' : 'text-[#555]'
												}`}
											>
												{p.name}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						)}
					</View>
				)}

				{/* Operator selector */}
				{country && productType && (
					<View className="mx-[5%] mt-5 gap-y-2">
						<Text className="text-base font-semibold text-[#111]">
							Operator
						</Text>
						<TouchableOpacity
							onPress={() => setShowOperatorModal(true)}
							disabled={loadingOperators}
							className="bg-white border border-[#E8E8E8] rounded-xl px-4 h-14 flex-row items-center justify-between"
						>
							{loadingOperators ? (
								<ActivityIndicator />
							) : operator ? (
								<View className="flex-row items-center gap-x-3 flex-1">
									<Image
										source={{uri: operator.operator_image}}
										style={{width: 28, height: 28, borderRadius: 6}}
									/>
									<Text className="text-base font-medium text-[#111] flex-1">
										{operator.name}
									</Text>
								</View>
							) : (
								<Text className="text-[#999] text-base">Select operator</Text>
							)}
							<Text className="text-[#7D7D7D] text-xs ml-2">▼</Text>
						</TouchableOpacity>
					</View>
				)}

				{/* Phone number */}
				{country && productType && operator && (
					<View className="mx-[5%] mt-5 gap-y-2">
						<Text className="text-base font-semibold text-[#111]">
							Phone number
						</Text>
						<View className="bg-white border border-[#E8E8E8] rounded-xl px-4 h-14 flex-row items-center">
							<Text className="text-[#111] text-base font-medium mr-2">
								+{country.prefix}
							</Text>
							<View className="w-[1px] h-6 bg-[#E0E0E0] mr-3" />
							<TextInput
								className="flex-1 text-[#111] font-medium"
								style={{fontSize: 16}}
								inputMode="tel"
								value={phoneNumber.replace(/[<>"'&/]/g, '')}
								onChangeText={text =>
									setPhoneNumber(text.replace(/[<>"'&/]/g, ''))
								}
								placeholder="Phone number"
								placeholderTextColor={'#999'}
							/>
						</View>
					</View>
				)}

				{/* Email */}
				{country && productType && operator && (
					<View className="mx-[5%] mt-5 gap-y-2">
						<Text className="text-base font-semibold text-[#111]">Email</Text>
						<View className="bg-white border border-[#E8E8E8] rounded-xl px-4 h-14 flex-row items-center">
							<TextInput
								className="flex-1 text-[#111] font-medium"
								style={{fontSize: 16}}
								inputMode="email"
								autoCapitalize="none"
								keyboardType="email-address"
								value={email}
								onChangeText={setEmail}
								placeholder="Email address"
								placeholderTextColor={'#999'}
							/>
						</View>
					</View>
				)}

				{/* Variations */}
				{country && productType && operator && (
					<View className="mx-[5%] mt-5 gap-y-3">
						<Text className="text-base font-semibold text-[#111]">
							Select amount
						</Text>
						{loadingVariations ? (
							<ActivityIndicator className="py-6" />
						) : variations.length === 0 ? (
							<Text className="text-[#666] text-sm py-4">
								No plans available for this operator.
							</Text>
						) : (
							<View className="flex-row flex-wrap gap-3">
								{variations.map(v => {
									const active = variation?.variation_code === v.variation_code;
									return (
										<TouchableOpacity
											key={v.variation_code}
											onPress={() => setVariation(v)}
											style={{width: '47%'}}
											className={`rounded-xl p-4 border ${
												active
													? 'border-secondary bg-[#EEF1FA]'
													: 'border-[#E8E8E8] bg-white'
											}`}
										>
											<Text className="text-base font-bold text-[#111]">
												{v.name}
											</Text>
											<Text className="text-[#1A73E8] font-semibold mt-1">
												{formatNaira(Number(v.charged_amount))}
											</Text>
											<Text className="text-[#888] text-xs mt-0.5">
												{v.variation_amount} {variationsData?.currency}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						)}
					</View>
				)}
			</ScrollView>

			{/* Country Modal */}
			{showCountryModal && (
				<Modal
					transparent
					animationType="slide"
					onRequestClose={() => setShowCountryModal(false)}
				>
					<Pressable
						className="bg-black/40"
						style={{height: '8%'}}
						onPress={() => setShowCountryModal(false)}
					/>
					<View className="bg-white flex-1 rounded-t-2xl">
						<View className="px-[5%] pt-6 pb-3 flex-row justify-between items-center">
							<Text className="text-2xl font-bold">Select Country</Text>
							<TouchableOpacity onPress={() => setShowCountryModal(false)}>
								<Text className="text-[#666] text-base">✕</Text>
							</TouchableOpacity>
						</View>
						<View className="px-[5%] pb-3">
							<TextInput
								className="bg-[#F5F6FA] rounded-xl px-4 h-12 text-[#111]"
								style={{fontSize: 16}}
								value={countrySearch}
								onChangeText={setCountrySearch}
								placeholder="Search country or code"
								placeholderTextColor={'#999'}
							/>
						</View>
						{loadingCountries ? (
							<ActivityIndicator className="py-10" />
						) : (
							<ScrollView
								className="px-[5%]"
								showsVerticalScrollIndicator={false}
								keyboardShouldPersistTaps="handled"
							>
								{filteredCountries.map(c => (
									<TouchableOpacity
										key={c.code}
										className="py-3 flex-row items-center gap-x-3 border-b border-[#F0F0F0]"
										onPress={() => selectCountry(c)}
									>
										<Image
											source={{uri: c.flag}}
											style={{width: 32, height: 22, borderRadius: 3}}
										/>
										<Text className="text-base text-[#111] flex-1">
											{c.name}
										</Text>
										<Text className="text-[#888] text-sm">+{c.prefix}</Text>
									</TouchableOpacity>
								))}
								<View className="h-10" />
							</ScrollView>
						)}
					</View>
				</Modal>
			)}

			{/* Operator Modal */}
			{showOperatorModal && (
				<Modal
					transparent
					animationType="slide"
					onRequestClose={() => setShowOperatorModal(false)}
				>
					<Pressable
						className="flex-1 bg-black/40"
						onPress={() => setShowOperatorModal(false)}
					/>
					<View className="bg-white w-full py-6 px-[5%] rounded-t-2xl max-h-[70%]">
						<Text className="text-2xl font-bold mb-4">Select Operator</Text>
						<ScrollView showsVerticalScrollIndicator={false}>
							{(operators ?? []).map(o => (
								<TouchableOpacity
									key={o.operator_id}
									className="py-3 flex-row items-center gap-x-4 border-b border-[#F0F0F0]"
									onPress={() => selectOperator(o)}
								>
									<Image
										source={{uri: o.operator_image}}
										style={{width: 36, height: 36, borderRadius: 8}}
									/>
									<Text className="text-lg text-[#111] flex-1">{o.name}</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				</Modal>
			)}

			{/* Bottom Buy Button */}
			<View className="px-[5%] pb-8 pt-3 bg-[#F5F5F5]">
				{variation && (
					<View className="flex-row justify-between items-center mb-3">
						<Text className="text-[#555]">Total</Text>
						<Text className="font-bold text-[#111] text-lg">
							{formatNaira(Number(variation.charged_amount))}
						</Text>
					</View>
				)}
				<Button
					title="Buy"
					onPress={() => handleBuy()}
					disabled={!variation || !phoneNumber}
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

export default InternationalAirtime;
