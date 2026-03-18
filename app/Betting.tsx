import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';
import {router} from 'expo-router';
import React, {useState} from 'react';
import {
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Modal,
	Pressable,
	ScrollView,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import PinModal from './components/PinModal';
import Button from './components/button';

const PROVIDER_IMAGES: Record<string, any> = {
	msport: require('@/assets/images/m-sport.png'),
	naijabet: require('@/assets/images/naijabet.png'),
	nairabet: require('@/assets/images/nairabet-logo.jpg'),
	'bet9ja-agent': require('@/assets/images/bet9ja-logo.png'),
	bet9ja: require('@/assets/images/bet9ja-logo.png'),
	betland: require('@/assets/images/bet-land.png'),
	supabet: require('@/assets/images/supabet.jpeg'),
	bangbet: require('@/assets/images/bangbet-logo.jpg'),
	'1xbet': require('@/assets/images/1xbet-logo.png'),
	betway: require('@/assets/images/betway-logo.png'),
	merrybet: require('@/assets/images/merry-bet.jpg'),
	mlotto: require('@/assets/images/m-lotto.png'),
	hallabet: require('@/assets/images/halla-bet.png'),
	betbiga: require('@/assets/images/betbiga-logo.jpg'),
	sportybet: require('@/assets/images/sportybet.png'),
	melbet: require('@/assets/images/melbet-logo.png'),
	livescorebet: require('@/assets/images/livescorebet-logo.png'),
	cloudbet: require('@/assets/images/cloudbet-logo.png'),
	paripesa: require('@/assets/images/paripesa-logo.png'),
	mylottohub: require('@/assets/images/mylottohub-logo.png'),
};

const ProviderIcon = ({code, size = 32}: {code: string; size?: number}) => {
	const img = PROVIDER_IMAGES[code];
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
				{code ? code.charAt(0).toUpperCase() : '🎰'}
			</Text>
		</View>
	);
};

interface BettingCompany {
	PRODUCT_CODE: string;
	MINAMOUNT: number;
	MAXAMOUNT: number;
}

interface BettingCompaniesResponse {
	status: number;
	message: string;
	data: {
		BETTING_COMPANY: BettingCompany[];
	};
}

interface VerifyResponse {
	status: number;
	message: string;
	data: {
		customer_name: string;
		status: string;
	};
}

// Preset betting top-up amounts
const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

const Betting = () => {
	const {setLoading} = useGlobalStore();
	const [showPin, setShowPin] = useState(false);
	const [showProviderModal, setShowProviderModal] = useState(false);
	const [formData, setFormData] = useState({
		provider: '',
		providerLabel: '',
		id: '',
		amount: '',
	});

	const {data: bettingProviders} = useQuery({
		queryKey: ['betting-providers'],
		queryFn: async () => {
			const axiosClient = new AxiosClient();
			const response = await axiosClient.get<BettingCompaniesResponse>(
				'/v1/nellobytes/betting/companies',
			);
			return response.data;
		},
	});

	const {data: verifyData} = useQuery({
		queryKey: ['verify', formData.provider, formData.id],
		queryFn: async () => {
			const axiosClient = new AxiosClient();
			const response = await axiosClient.post<
				{company_code: string; customer_id: string},
				VerifyResponse
			>('/v1/nellobytes/betting/verify', {
				company_code: formData.provider,
				customer_id: formData.id,
			});
			return response.data;
		},
		enabled: !!formData.provider && formData.id.length > 6,
	});

	const isVerified =
		!!verifyData?.data.customer_name &&
		!verifyData.data.customer_name.includes('Error');

	const handleBuy = async (pin?: string) => {
		try {
			if (!formData.provider) throw new Error('Please select a bet provider');
			if (!formData.id) throw new Error('Please input your User ID');
			if (!formData.amount) throw new Error('Please input an amount');
			if (verifyData?.data.customer_name.includes('Error'))
				throw new Error('Invalid ID');

			const amountNumber = Number(formData.amount);
			const selectedProvider = bettingProviders?.data.BETTING_COMPANY.find(
				p => p.PRODUCT_CODE === formData.provider,
			);
			if (selectedProvider) {
				if (
					amountNumber < selectedProvider.MINAMOUNT ||
					amountNumber > selectedProvider.MAXAMOUNT
				) {
					throw new Error(
						`Amount must be between ₦${selectedProvider.MINAMOUNT.toLocaleString()} and ₦${selectedProvider.MAXAMOUNT.toLocaleString()}`,
					);
				}
			}

			setLoading(true);
			const axiosClient = new AxiosClient();
			if (!pin) return setShowPin(true);

			const response = await axiosClient.post<{
				company_code: string;
				customer_id: string;
				amount: number;
				pin: string;
			}>('/v1/nellobytes/betting/fund', {
				company_code: formData.provider,
				customer_id: formData.id,
				amount: amountNumber,
				pin,
			});

			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Betting wallet top up successful',
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
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View className="flex-1">
					{/* Header */}
					<View className="px-[5%] pt-5 bg-[#F5F5F5]">
						<Back title="Betting" />
					</View>

					<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
						{/* Provider Selector */}
						<TouchableOpacity
							onPress={() => setShowProviderModal(true)}
							className="mx-[5%] mt-4 mb-4 bg-white border border-[#E8E8E8] rounded-xl px-4 h-14 flex-row items-center justify-between"
						>
							<View className="flex-row items-center gap-x-3">
								<ProviderIcon code={formData.provider} />
								<Text className="text-base font-medium text-[#111]">
									{formData.providerLabel || 'Select Provider'}
								</Text>
							</View>
							<Text className="text-[#7D7D7D] text-xs">▼</Text>
						</TouchableOpacity>

						{/* User ID Card */}
						<View className="mx-[5%] mb-4 bg-white rounded-xl px-4 pt-4 pb-5">
							<View className="flex-row justify-between items-center mb-3">
								<Text className="text-base font-bold text-[#111]">User ID</Text>
								<TouchableOpacity>
									<Text className="text-[#1A73E8] text-sm font-medium">
										Beneficiaries
									</Text>
								</TouchableOpacity>
							</View>

							<TextInput
								className="border-b border-[#E0E0E0] py-2 text-base text-[#111]"
								inputMode="tel"
								value={formData.id.replace(/[<>"'&/]/g, '')}
								onChangeText={text =>
									setFormData(prev => ({
										...prev,
										id: text.replace(/[<>"'&/]/g, ''),
									}))
								}
								placeholder="Enter your ID"
								placeholderTextColor={'#999'}
							/>

							{/* Verified name */}
							{verifyData?.data.customer_name ? (
								<Text
									className={`font-semibold mt-3 text-sm ${
										isVerified ? 'text-[#1A73E8]' : 'text-red-500'
									}`}
								>
									{verifyData.data.customer_name}
								</Text>
							) : null}
						</View>

						{/* Last Deposit row with Deposit button */}
						{isVerified ? (
							<View className="mx-[5%] mb-4 bg-white rounded-xl px-4 h-14 flex-row items-center justify-between">
								<Text className="text-[#555] text-base">
									Last Deposit:{' '}
									<Text className="font-bold text-[#111]">
										{formData.amount
											? Number(formData.amount).toLocaleString()
											: '—'}
									</Text>
								</Text>
								<TouchableOpacity
									className="bg-[#0D1B4B] px-4 py-2 rounded-lg"
									onPress={() => handleBuy()}
								>
									<Text className="text-white text-sm font-semibold">
										Deposit
									</Text>
								</TouchableOpacity>
							</View>
						) : null}

						{/* Enter an amount */}
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

						{/* Preset grid */}
						<View className="mx-[5%] bg-white rounded-xl px-4 pt-4 pb-5 mb-8">
							<Text className="text-xl font-bold text-[#111] mb-4">
								Fund Betting Wallet
							</Text>
							<View className="flex-row flex-wrap gap-3">
								{PRESET_AMOUNTS.map(amount => {
									const isSelected = formData.amount === String(amount);
									return (
										<TouchableOpacity
											key={amount}
											onPress={() =>
												setFormData(prev => ({
													...prev,
													amount: String(amount),
												}))
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
					</ScrollView>

					{/* Bottom Buy Button */}
					<View className="px-[5%] pb-8 pt-3 bg-[#F5F5F5]">
						<Button title="Buy" onPress={() => handleBuy()} />
					</View>

					{showPin && (
						<PinModal
							showPin={showPin}
							setShowPin={setShowPin}
							handleContinue={handleBuy}
						/>
					)}
				</View>
			</TouchableWithoutFeedback>

			{/* Provider Modal */}
			{showProviderModal && (
				<Modal
					transparent
					animationType="slide"
					onRequestClose={() => setShowProviderModal(false)}
				>
					<Pressable
						className="flex-1 bg-black/40"
						onPress={() => setShowProviderModal(false)}
					/>
					<View className="bg-white w-full py-8 px-[5%] rounded-t-2xl -max-h-screen-safe-offset-10 rounded-tl-lg rounded-tr-lg">
						<Text className="text-2xl font-bold mb-5">Select Provider</Text>
						<ScrollView>
							{bettingProviders?.data.BETTING_COMPANY.map(provider => (
								<TouchableOpacity
									key={provider.PRODUCT_CODE}
									className="py-4 border-b border-[#F0F0F0] flex-row items-center gap-x-4"
									onPress={() => {
										setFormData(prev => ({
											...prev,
											provider: provider.PRODUCT_CODE,
											providerLabel: provider.PRODUCT_CODE,
											id: '',
										}));
										setShowProviderModal(false);
									}}
								>
									<ProviderIcon code={provider.PRODUCT_CODE} />
									<Text className="text-xl capitalize">
										{provider.PRODUCT_CODE}
									</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				</Modal>
			)}
		</KeyboardAvoidingView>
	);
};

export default Betting;
