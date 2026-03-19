import NineMobileIcon from '@/assets/icons/9mobile';
import AirtelIcon from '@/assets/icons/airtel';
import GloIcon from '@/assets/icons/glo';
import MTNIcon from '@/assets/icons/mtn';
import ProfileCardIcon from '@/assets/icons/profile-card';
import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';
import {router} from 'expo-router';
import React, {useState} from 'react';
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

// Preset airtime amounts: { face value, discounted pay price }
const PRESET_AMOUNTS = [
	{face: 100},
	{face: 200},
	{face: 500},
	{face: 1000},
	{face: 2000},
	{face: 5000},
];

const networks = [
	{label: 'MTN', id: 1},
	{label: 'Glo', id: 2},
	{label: 'T2-Mobile', id: 3},
	{label: 'Airtel', id: 4},
];

const Airtime = () => {
	const {setLoading, user} = useGlobalStore();
	const [formData, setFormData] = useState({
		network: 'MTN',
		phone_number: user?.phone_number ?? '',
		amount: '',
		id: 1,
	});
	const [showPin, setShowPin] = useState(false);
	const [showNetworkModal, setShowNetworkModal] = useState(false);

	const handleBuy = async (pin?: string) => {
		try {
			if (!formData.network) throw new Error('Please select a network');
			if (!formData.phone_number)
				throw new Error('Please input your phone number');
			if (!formData.amount) throw new Error('Please input airtime amount');

			setLoading(true);
			const axiosClient = new AxiosClient();

			if (!pin) return setShowPin(true);

			const response = await axiosClient.post<{
				network: number;
				type: string;
				phone_number: string;
				amount: number;
				pin: string;
			}>('/airtime', {
				network: formData.id,
				type: 'VTU',
				phone_number: formData.phone_number,
				amount: Number(formData.amount),
				pin,
			});

			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Airtime recharge successful',
				});
				router.back();
				setFormData({network: '', phone_number: '', amount: '', id: 0});
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
			behavior="padding"
			keyboardVerticalOffset={20}
		>
			{/* Header */}
			<View className="px-[5%] pt-5 bg-[#F5F5F5]">
				<Back title="Airtime" />
			</View>

			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				{/* Phone Number Row */}
				<View className="mx-[5%] mt-4 mb-5 flex-row items-center justify-between bg-white border border-[#E8E8E8] rounded-xl px-4 h-14 overflow-hidden">
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
					<View className="flex-row items-center">
						<View className="w-[1px] h-8 bg-[#E0E0E0] mx-3" />
						<TouchableOpacity
							onPress={() => setShowNetworkModal(true)}
							className="flex-row items-center gap-x-1"
						>
							{networkProvidersIcon(formData.network.toLowerCase())}
							<Text className="text-[#7D7D7D] text-xs ml-1">▼</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Verify NIN Banner */}
				{user?.kyc_status !== 'pending' && user?.kyc_status !== 'approved' && (
					<View className="mx-[5%] mb-5 bg-white rounded-xl px-4 py-3 flex-row items-center gap-x-3">
						{/* Icon box */}
						<View className="w-14 h-14 bg-[#EEF2FF] rounded-xl items-center justify-center">
							<ProfileCardIcon />
						</View>
						<View className="flex-1">
							<Text className="font-bold text-[#111] text-sm">
								Verify your NIN
							</Text>
							<Text className="text-[#666] text-xs mt-0.5 leading-4">
								For security and compliance, please verify{'\n'}your NIN before
								making transactions.
							</Text>
						</View>
						<TouchableOpacity className="bg-[#0D1B4B] px-3 py-2 rounded-lg">
							<Text className="text-white text-xs font-semibold">
								Verify NIN
							</Text>
						</TouchableOpacity>
					</View>
				)}

				{/* Buy Airtime section */}
				<View className="mx-[5%] bg-white rounded-xl px-4 pt-5 pb-5 mb-4">
					<Text className="text-xl font-bold text-[#111] mb-4">
						Buy Airtime
					</Text>

					{/* 3-column preset grid */}
					<View className="flex-row flex-wrap gap-3">
						{PRESET_AMOUNTS.map(item => {
							const isSelected = formData.amount === String(item.face);
							return (
								<TouchableOpacity
									key={item.face}
									onPress={() =>
										setFormData(prev => ({...prev, amount: String(item.face)}))
									}
									style={{width: '30%'}}
									className={`rounded-xl p-3 ${
										isSelected
											? 'bg-[#B2CDF6] border border-secondary'
											: 'bg-[#F5F6FA]'
									}`}
								>
									{/* Face value with strikethrough */}
									<Text className="text-xl font-bold text-[#111] text-center">
										₦{item.face.toLocaleString()}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>
				</View>

				{/* Custom amount input */}
				<View className="mx-[5%] bg-white rounded-xl px-4 pt-5 pb-5 mb-6">
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
		</KeyboardAvoidingView>
	);
};

export default Airtime;

export const networkProvidersIcon = (network: string) => {
	switch (network) {
		case 'glo':
			return <GloIcon />;
		case 'mtn':
			return <MTNIcon />;
		case 'airtel':
			return <AirtelIcon />;
		case 't2-mobile':
			return <NineMobileIcon />;
		case '9mobile':
			return <NineMobileIcon />;
		default:
			return null;
	}
};
