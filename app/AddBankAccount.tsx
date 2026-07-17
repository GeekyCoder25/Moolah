import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {Bank, BanksResponse, UserResponse, VerifyAccountResponse} from '@/types';
import {AxiosClient} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';
import {Image} from 'expo-image';
import {router} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {
	FlatList,
	Keyboard,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Button from './components/button';

const AddBankAccount = () => {
	const {setUser, setLoading} = useGlobalStore();
	const insets = useSafeAreaInsets();
	const [showBankModal, setShowBankModal] = useState(false);
	const [search, setSearch] = useState('');
	const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
	const [accountNumber, setAccountNumber] = useState('');
	const [accountName, setAccountName] = useState('');
	const [verifying, setVerifying] = useState(false);
	// bank+number combo we've already tried, so a failed verify doesn't loop
	const [attemptedKey, setAttemptedKey] = useState('');

	const {data: banksData} = useQuery({
		queryKey: ['banks'],
		queryFn: async () => {
			const axiosClient = new AxiosClient();
			const res = await axiosClient.get<BanksResponse>('/banks');
			return res.data;
		},
	});

	const banks = banksData?.data ?? [];
	const query = search.trim().toLowerCase();
	const filteredBanks = query
		? banks.filter(b => b.bankName.toLowerCase().includes(query))
		: banks;

	const showError = (error: any, title = 'Error') => {
		Toast.show({
			type: 'error',
			text1: title,
			text2:
				error.response?.data?.message ||
				error.response?.data ||
				error.message,
		});
	};

	// Resolve the account name once a bank + 10-digit account number are set.
	// Guarded by attemptedKey so a failed verify doesn't retry in a loop; a new
	// bank or account number changes the key and allows a fresh attempt.
	useEffect(() => {
		if (!selectedBank || accountNumber.length !== 10) return;
		const key = `${selectedBank.bankCode}:${accountNumber}`;
		if (key === attemptedKey) return;

		const verify = async () => {
			try {
				setAttemptedKey(key);
				setVerifying(true);
				const axiosClient = new AxiosClient();
				const res = await axiosClient.post<
					{bank_code: string; account_number: string},
					VerifyAccountResponse
				>('/banks/verify-account', {
					bank_code: selectedBank.bankCode,
					account_number: accountNumber,
				});
				if (res.status === 200) {
					setAccountName(res.data.data.account_name);
				}
			} catch (error: any) {
				showError(error, 'Verification failed');
			} finally {
				setVerifying(false);
			}
		};
		verify();
	}, [selectedBank, accountNumber, attemptedKey]);

	const handleSave = async () => {
		try {
			if (!selectedBank) throw new Error('Please select a bank');
			if (accountNumber.length !== 10)
				throw new Error('Enter a valid 10-digit account number');
			if (!accountName) throw new Error('Please verify the account first');

			setLoading(true);
			const axiosClient = new AxiosClient();
			const res = await axiosClient.post('/bank-accounts', {
				bank_code: selectedBank.bankCode,
				bank_name: selectedBank.bankName,
				account_number: accountNumber,
				account_name: accountName,
			});
			if (res.status === 200) {
				const userRes = await axiosClient.get<UserResponse>('/user');
				if (userRes.status === 200) {
					setUser(userRes.data.data.attributes);
				}
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Bank account added',
				});
				router.back();
			}
		} catch (error: any) {
			showError(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-[#F5F5F5]"
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			keyboardVerticalOffset={insets.top}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
				<View className="flex-1">
					<View className="px-[5%] pt-5">
						<Back title="Add bank account" />
					</View>

					<View className="flex-1 px-[5%] mt-6 gap-y-5">
						{/* Bank selector */}
						<View className="gap-y-2">
							<Text className="text-base font-semibold text-[#111]">Bank</Text>
							<TouchableOpacity
								onPress={() => setShowBankModal(true)}
								className="bg-white border border-[#E8E8E8] rounded-xl px-4 h-14 flex-row items-center justify-between"
							>
								{selectedBank ? (
									<View className="flex-row items-center gap-x-3 flex-1">
										<Image
											source={{uri: selectedBank.bankUrl}}
											style={{width: 28, height: 28, borderRadius: 6}}
											contentFit="contain"
										/>
										<Text
											className="text-base text-[#111] flex-1"
											numberOfLines={1}
										>
											{selectedBank.bankName}
										</Text>
									</View>
								) : (
									<Text className="text-base text-[#999]">Select bank</Text>
								)}
								<Text className="text-[#7D7D7D] text-xs ml-2">▼</Text>
							</TouchableOpacity>
						</View>

						{/* Account number */}
						<View className="gap-y-2">
							<Text className="text-base font-semibold text-[#111]">
								Account number
							</Text>
							<TextInput
								className="bg-white border border-[#E8E8E8] rounded-xl px-4 h-14 text-[#111]"
								style={{fontSize: 16}}
								inputMode="numeric"
								maxLength={10}
								value={accountNumber}
								onChangeText={text => {
									setAccountNumber(text.replace(/[^0-9]/g, ''));
									setAccountName('');
								}}
								placeholder="0123456789"
								placeholderTextColor={'#999'}
							/>
							{verifying && (
								<Text className="text-[#666] text-sm">Verifying…</Text>
							)}
							{accountName ? (
								<View className="bg-[#E7F1FF] rounded-lg px-4 py-3 mt-1">
									<Text className="text-secondary font-semibold">
										{accountName}
									</Text>
								</View>
							) : null}
						</View>
					</View>
				</View>
			</TouchableWithoutFeedback>

			<View className="px-[5%] pb-8 pt-3">
				<Button
					title="Save bank account"
					onPress={handleSave}
					disabled={!accountName}
				/>
			</View>

			{/* Bank picker modal */}
			{showBankModal && (
				<Modal
					transparent
					animationType="slide"
					onRequestClose={() => setShowBankModal(false)}
				>
					<Pressable
						className="flex-1 bg-black/40"
						onPress={() => setShowBankModal(false)}
					/>
					<View
						className="bg-white w-full rounded-t-2xl"
						style={{height: '75%'}}
					>
						<View className="px-[5%] pt-6 pb-3">
							<Text className="text-2xl font-bold mb-4">Select bank</Text>
							<TextInput
								className="bg-[#F5F6FA] rounded-xl px-4 h-12 text-[#111]"
								style={{fontSize: 16}}
								value={search}
								onChangeText={setSearch}
								placeholder="Search banks"
								placeholderTextColor={'#999'}
							/>
						</View>
						<FlatList
							data={filteredBanks}
							style={{flex: 1}}
							keyExtractor={item => item.bankCode}
							keyboardShouldPersistTaps="handled"
							contentContainerStyle={{
								paddingHorizontal: '5%',
								paddingBottom: 40,
							}}
							renderItem={({item}) => (
								<TouchableOpacity
									className="py-3 flex-row items-center gap-x-3 border-b border-[#F0F0F0]"
									onPress={() => {
										setSelectedBank(item);
										setAccountName('');
										setShowBankModal(false);
										setSearch('');
									}}
								>
									<Image
										source={{uri: item.bankUrl}}
										style={{width: 32, height: 32, borderRadius: 6}}
										contentFit="contain"
									/>
									<Text
										className="text-base text-[#111] flex-1"
										numberOfLines={1}
									>
										{item.bankName}
									</Text>
								</TouchableOpacity>
							)}
						/>
					</View>
				</Modal>
			)}
		</KeyboardAvoidingView>
	);
};

export default AddBankAccount;
