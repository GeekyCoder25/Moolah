import Back from '@/components/back';
import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';
import * as Clipboard from 'expo-clipboard';
import {router} from 'expo-router';
import React, {useEffect, useRef, useState} from 'react';
import {
	ActivityIndicator,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';

interface BankTransferData {
	order_id: string;
	bank_name: string;
	account_name: string;
	account_number: string;
	amount: number;
	expire_seconds: number;
}

const Fund = () => {
	const [activeTab, setActiveTab] = useState('bank');
	const {user} = useGlobalStore();

	const [amount, setAmount] = useState('');
	const [loading, setLoading] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [transferData, setTransferData] = useState<BankTransferData | null>(
		null,
	);
	const [transferStatus, setTransferStatus] = useState<string | null>(null);
	const [secondsLeft, setSecondsLeft] = useState(0);

	const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		return () => {
			if (countdownRef.current) clearInterval(countdownRef.current);
			if (pollRef.current) clearInterval(pollRef.current);
		};
	}, []);

	if (!user) return null;

	const handleCopy = async (value: string) => {
		Toast.show({
			type: 'success',
			text1: 'Copied to clipboard',
			text2: value,
		});
		Clipboard.setStringAsync(value);
	};

	const accNo = user.banks.filter(bank => bank.account_no)[0].account_no;

	const startCountdown = (seconds: number) => {
		setSecondsLeft(seconds);
		if (countdownRef.current) clearInterval(countdownRef.current);
		countdownRef.current = setInterval(() => {
			setSecondsLeft(prev => {
				if (prev <= 1) {
					clearInterval(countdownRef.current!);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	const startPolling = (orderId: string) => {
		if (pollRef.current) clearInterval(pollRef.current);
		pollRef.current = setInterval(async () => {
			try {
				const axiosClient = new AxiosClient();
				const response = await axiosClient.get<{
					status: number;
					message: string;
					data: {status: string};
				}>(`/bank-transfer/status/${orderId}`);
				const status = response.data.data.status;
				setTransferStatus(status);
				if (status === 'success' || status === 'completed') {
					clearInterval(pollRef.current!);
					Toast.show({
						type: 'success',
						text1: 'Payment received!',
						text2: 'Your wallet has been funded.',
					});
					router.back();
				}
			} catch {}
		}, 10000);
	};

	const handleInitiateTransfer = async () => {
		const amountNum = Number(amount.replace(/,/g, ''));
		if (!amountNum || amountNum <= 0) {
			Toast.show({
				type: 'error',
				text1: 'Invalid amount',
				text2: 'Please enter a valid amount.',
			});
			return;
		}
		if (amountNum < 100) {
			Toast.show({
				type: 'error',
				text1: 'Amount too low',
				text2: 'Minimum transfer amount is ₦100.',
			});
			return;
		}
		setLoading(true);
		try {
			const axiosClient = new AxiosClient();
			const response = await axiosClient.post<
				{amount: number},
				{status: number; message: string; data: BankTransferData}
			>('/bank-transfer/initiate', {amount: amountNum});
			const data = response.data.data;
			setTransferData(data);
			setTransferStatus('pending');
			startCountdown(data.expire_seconds);
			startPolling(data.order_id);
		} catch (err: any) {
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2: err?.response?.data?.message || 'Failed to initiate transfer.',
			});
		} finally {
			setLoading(false);
		}
	};

	const formatTime = (secs: number) => {
		const m = Math.floor(secs / 60)
			.toString()
			.padStart(2, '0');
		const s = (secs % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	};

	const formatAmount = (text: string) => {
		const digits = text.replace(/[^0-9]/g, '');
		if (!digits) return '';
		return Number(digits).toLocaleString('en-US');
	};

	const handleConfirmSend = async () => {
		if (!transferData) return;
		setConfirmLoading(true);
		try {
			const axiosClient = new AxiosClient();
			const response = await axiosClient.get<{
				status: number;
				data: {status: string};
			}>(`/bank-transfer/status/${transferData.order_id}`);
			const status = response.data.data.status;
			setTransferStatus(status);
			if (status === 'success' || status === 'completed') {
				clearInterval(pollRef.current!);
				Toast.show({
					type: 'success',
					text1: 'Payment received!',
					text2: 'Your wallet has been funded.',
				});
			} else {
				Toast.show({
					type: 'info',
					text1: 'Not yet received',
					text2: 'We have not received your payment yet. Please try again.',
				});
			}
		} catch {
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2: 'Could not verify payment. Please try again.',
			});
		} finally {
			setConfirmLoading(false);
		}
	};

	const resetTransfer = () => {
		if (countdownRef.current) clearInterval(countdownRef.current);
		if (pollRef.current) clearInterval(pollRef.current);
		setTransferData(null);
		setTransferStatus(null);
		setAmount('');
		setSecondsLeft(0);
	};

	const isPaid = transferStatus === 'success' || transferStatus === 'completed';

	return (
		<ScrollView className="flex-1" contentContainerClassName="px-[5%] py-5">
			<Back title="Fund Wallet" />

			<View className="flex-row items-center pt-10 border-b-[#EBEBEB] border-b-[1px] gap-x-8">
				<TouchableOpacity
					onPress={() => setActiveTab('bank')}
					className={
						activeTab === 'bank'
							? 'border-b-[2px] border-b-secondary pb-2'
							: 'pb-2'
					}
				>
					<Text
						className={`${
							activeTab === 'bank' ? 'text-secondary' : 'text-[#7D7D7D]'
						} text-2xl`}
					>
						Bank
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setActiveTab('transfer')}
					className={
						activeTab === 'transfer'
							? 'border-b-[2px] border-b-secondary pb-2'
							: 'pb-2'
					}
				>
					<Text
						className={`${
							activeTab === 'transfer' ? 'text-secondary' : 'text-[#7D7D7D]'
						} text-2xl`}
					>
						Transfer
					</Text>
				</TouchableOpacity>
			</View>

			{activeTab === 'bank' && (
				<View>
					<View className="my-10 gap-y-5">
						<Text className="text-[#292D32] font-medium text-xl">
							Bank name: {user.banks.filter(bank => bank.account_no)[0].name}
						</Text>
						<Text className="font-medium text-xl">
							Account name: MFY / PAXI GLOBAL TECH Limited -{user.firstname}{' '}
							{user.lastname}
						</Text>
						<Text className="font-medium text-xl">
							Account number:{' '}
							{user.banks.filter(bank => bank.account_no)[0].account_no}
						</Text>
					</View>

					<View className="flex-row gap-x-5">
						<TouchableOpacity
							className="bg-secondary py-3 px-3 rounded-lg"
							onPress={() => {
								if (accNo) handleCopy(accNo);
							}}
						>
							<Text className="text-white">Copy Account No</Text>
						</TouchableOpacity>
						<TouchableOpacity className="bg-primary py-3 px-3 rounded-lg">
							<Text className="text-white">Contact Admin</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}

			{activeTab === 'transfer' && (
				<View className="mt-8 gap-y-5">
					{!transferData ? (
						<>
							<Text className="text-[#292D32] {font-extrabold text-2xl tracking-widest">
								Enter amount to fund your wallet
							</Text>
							<TextInput
								className="border border-[#EBEBEB] rounded-lg px-4 py-3 text-xl"
								placeholder="Amount (NGN)"
								placeholderTextColor={'grey'}
								keyboardType="numeric"
								value={amount}
								onChangeText={text => setAmount(formatAmount(text))}
							/>
							<TouchableOpacity
								className="bg-secondary py-4 rounded-lg items-center"
								onPress={handleInitiateTransfer}
								disabled={loading}
							>
								{loading ? (
									<ActivityIndicator color="#fff" />
								) : (
									<Text className="text-white text-lg font-medium">
										Generate Payment Account
									</Text>
								)}
							</TouchableOpacity>
						</>
					) : (
						<View className="gap-y-5">
							<View className="bg-[#F8F8F8] rounded-xl p-5 gap-y-4">
								<Text className="text-[#292D32] font-semibold text-lg text-center">
									Transfer Details
								</Text>

								<View className="gap-y-3">
									<View className="flex-row justify-between">
										<Text className="text-[#7D7D7D]">Bank</Text>
										<Text className="font-medium">
											{transferData.bank_name}
										</Text>
									</View>
									<View className="flex-row justify-between">
										<Text className="text-[#7D7D7D]">Account Name</Text>
										<Text
											className="font-medium flex-1 text-right ml-4"
											numberOfLines={2}
										>
											{transferData.account_name}
										</Text>
									</View>
									<View className="flex-row justify-between items-center">
										<Text className="text-[#7D7D7D]">Account Number</Text>
										<View className="flex-row items-center gap-x-2">
											<Text className="font-extrabold text-2xl tracking-widest">
												{transferData.account_number}
											</Text>
											<TouchableOpacity
												onPress={() => handleCopy(transferData.account_number)}
												className="bg-secondary px-2 py-1 rounded"
											>
												<Text className="text-white text-xs">Copy</Text>
											</TouchableOpacity>
										</View>
									</View>
									<View className="flex-row justify-between">
										<Text className="text-[#7D7D7D]">Amount</Text>
										<Text className="font-semibold text-secondary">
											₦{transferData.amount.toLocaleString()}
										</Text>
									</View>
								</View>

								<View className="border-t border-[#EBEBEB] pt-4 items-center gap-y-1">
									<Text className="text-[#7D7D7D] text-sm">Expires in</Text>
									<Text
										className={`text-3xl font-bold ${
											secondsLeft < 300 ? 'text-red-500' : 'text-secondary'
										}`}
									>
										{formatTime(secondsLeft)}
									</Text>
								</View>

								<View className="items-center pt-1">
									<View
										className={`px-5 py-2 rounded-full ${
											isPaid ? 'bg-green-100' : 'bg-yellow-100'
										}`}
									>
										<Text
											className={`font-medium ${
												isPaid ? 'text-green-600' : 'text-yellow-600'
											}`}
										>
											{isPaid ? '✓ Payment Received' : '⏳ Awaiting Payment'}
										</Text>
									</View>
								</View>
							</View>

							<Text className="text-[#7D7D7D] text-sm text-center">
								Send exactly ₦{transferData.amount.toLocaleString()} to the
								account above. Account expires in {formatTime(secondsLeft)}.
							</Text>

							{!isPaid && (
								<TouchableOpacity
									className="bg-secondary py-4 rounded-lg items-center"
									onPress={handleConfirmSend}
									disabled={confirmLoading}
								>
									{confirmLoading ? (
										<ActivityIndicator color="#fff" />
									) : (
										<Text className="text-white text-lg font-medium">
											I&apos;ve Sent the Money
										</Text>
									)}
								</TouchableOpacity>
							)}

							<TouchableOpacity
								className="border border-secondary py-3 rounded-lg items-center"
								onPress={resetTransfer}
							>
								<Text className="text-secondary font-medium">
									Start New Transfer
								</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>
			)}
		</ScrollView>
	);
};

export default Fund;
