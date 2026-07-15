import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {UserResponse, WithdrawResponse} from '@/types';
import {maskAccountNumber} from '@/utils';
import {AxiosClient} from '@/utils/axios';
import {router} from 'expo-router';
import React, {useState} from 'react';
import {
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

const Withdraw = () => {
	const {user, settings, setUser, setLoading} = useGlobalStore();
	const accounts = user?.bank_accounts ?? [];
	const defaultAccount = accounts.find(a => a.is_default) ?? accounts[0];

	// Withdrawal fee comes from /settings; fall back to 50 if not loaded yet.
	const fee = settings?.bank_transfer_fee ?? 50;

	const [selectedId, setSelectedId] = useState<number | undefined>(
		defaultAccount?.id,
	);
	const [amount, setAmount] = useState('');
	const [showPin, setShowPin] = useState(false);
	const [showAccountModal, setShowAccountModal] = useState(false);

	const selectedAccount =
		accounts.find(a => a.id === selectedId) ?? defaultAccount;
	const amountNum = Number(amount) || 0;
	const total = amountNum + fee;

	const handleWithdraw = async (pin?: string) => {
		try {
			if (!selectedAccount) throw new Error('Please add a bank account first');
			if (amountNum <= 0) throw new Error('Please enter a valid amount');
			if (total > (user?.wallet_balance ?? 0)) {
				throw new Error(
					`Insufficient balance for this amount plus the ₦${fee} fee`,
				);
			}

			if (!pin) return setShowPin(true);

			setLoading(true);
			const axiosClient = new AxiosClient();
			const res = await axiosClient.post<
				{bank_account_id: number; amount: number; pin: string},
				WithdrawResponse
			>('/withdraw', {
				bank_account_id: selectedAccount.id,
				amount: amountNum,
				pin,
			});
			if (res.status === 200) {
				const userRes = await axiosClient.get<UserResponse>('/user');
				if (userRes.status === 200) {
					setUser(userRes.data.data.attributes);
				}
				Toast.show({
					type: 'success',
					text1: 'Withdrawal initiated',
					text2: `₦${res.data.data.amount.toLocaleString()} sent · ₦${res.data.data.fee} fee · Balance ₦${res.data.data.balance.toLocaleString()}`,
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

	// No saved accounts — prompt to add one first.
	if (accounts.length === 0) {
		return (
			<View className="flex-1 bg-[#F5F5F5]">
				<View className="px-[5%] pt-5">
					<Back title="Withdraw" />
				</View>
				<View className="flex-1 items-center justify-center px-[5%]">
					<Text className="text-[#666] text-base text-center mb-5">
						Add a bank account to withdraw your wallet balance.
					</Text>
					{user?.can_add_bank_account && (
						<Button
							title="Add bank account"
							onPress={() => router.replace('/BankAccounts')}
						/>
					)}
				</View>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-[#F5F5F5]">
			<View className="px-[5%] pt-5">
				<Back title="Withdraw" />
			</View>

			<ScrollView
				className="flex-1 px-[5%]"
				contentContainerStyle={{paddingBottom: 40}}
				showsVerticalScrollIndicator={false}
			>
				{/* Destination account */}
				<View className="mt-6 gap-y-2">
					<Text className="text-base font-semibold text-[#111]">
						To bank account
					</Text>
					<TouchableOpacity
						onPress={() => setShowAccountModal(true)}
						className="bg-white border border-[#E8E8E8] rounded-xl px-4 py-3 flex-row items-center justify-between"
					>
						<View className="flex-1">
							<Text
								className="text-base font-semibold text-[#111]"
								numberOfLines={1}
							>
								{selectedAccount?.account_name}
							</Text>
							<Text className="text-[#666] text-sm" numberOfLines={1}>
								{selectedAccount
									? `${selectedAccount.bank_name} · ${maskAccountNumber(
											selectedAccount.account_number,
									  )}`
									: ''}
							</Text>
						</View>
						<Text className="text-[#7D7D7D] text-xs ml-2">▼</Text>
					</TouchableOpacity>
				</View>

				{/* Amount */}
				<View className="mt-5 gap-y-2">
					<Text className="text-base font-semibold text-[#111]">Amount</Text>
					<TextInput
						className="bg-white border border-[#E8E8E8] rounded-xl px-4 h-14 text-[#111]"
						style={{fontSize: 16}}
						inputMode="numeric"
						value={amount}
						onChangeText={text => setAmount(text.replace(/[^0-9]/g, ''))}
						placeholder="Enter amount"
						placeholderTextColor={'#999'}
					/>
					<Text className="text-[#888] text-xs">
						Available balance: ₦
						{(user?.wallet_balance ?? 0).toLocaleString()}
					</Text>
				</View>

				{/* Summary */}
				{amountNum > 0 && (
					<View className="mt-6 bg-white rounded-xl px-4 py-4">
						<View className="flex-row justify-between mb-2">
							<Text className="text-[#666]">Amount</Text>
							<Text className="text-[#111] font-medium">
								₦{amountNum.toLocaleString()}
							</Text>
						</View>
						<View className="flex-row justify-between mb-2">
							<Text className="text-[#666]">Withdrawal fee</Text>
							<Text className="text-[#111] font-medium">
								₦{fee.toLocaleString()}
							</Text>
						</View>
						<View className="flex-row justify-between border-t border-[#EEE] pt-2 mt-1">
							<Text className="text-[#111] font-bold">Total debit</Text>
							<Text className="text-[#111] font-bold">
								₦{total.toLocaleString()}
							</Text>
						</View>
					</View>
				)}
			</ScrollView>

			<View className="px-[5%] pb-8 pt-3">
				<Button
					title="Withdraw"
					onPress={() => handleWithdraw()}
					disabled={amountNum <= 0}
				/>
			</View>

			{/* Account picker modal */}
			{showAccountModal && (
				<Modal
					transparent
					animationType="slide"
					onRequestClose={() => setShowAccountModal(false)}
				>
					<Pressable
						className="flex-1 bg-black/40"
						onPress={() => setShowAccountModal(false)}
					/>
					<View className="bg-white w-full rounded-t-2xl py-6 px-[5%]">
						<Text className="text-2xl font-bold mb-4">Select account</Text>
						{accounts.map(account => (
							<TouchableOpacity
								key={account.id}
								className="py-4 border-b border-[#F0F0F0]"
								onPress={() => {
									setSelectedId(account.id);
									setShowAccountModal(false);
								}}
							>
								<Text className="text-base font-semibold text-[#111]">
									{account.bank_name}
								</Text>
								<Text className="text-[#666] text-sm">
									{maskAccountNumber(account.account_number)} ·{' '}
									{account.account_name}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</Modal>
			)}

			{showPin && (
				<PinModal
					showPin={showPin}
					setShowPin={setShowPin}
					handleContinue={handleWithdraw}
				/>
			)}
		</View>
	);
};

export default Withdraw;
