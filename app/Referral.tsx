import WalletBgIcon from '@/assets/icons/wallet-bg';
import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {UserResponse} from '@/types';
import {AxiosClient} from '@/utils/axios';
import Feather from '@expo/vector-icons/Feather';
import * as Clipboard from 'expo-clipboard';
import React, {useEffect, useState} from 'react';
import {
	ActivityIndicator,
	ScrollView,
	TouchableOpacity,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';

interface LeaderboardEntry {
	rank: number;
	username: string;
	email: string;
	firstname: string;
	lastname: string;
	referral_count: number;
}

interface LeaderboardResponse {
	status: number;
	message: string;
	data: {
		weekly: LeaderboardEntry[];
		monthly: LeaderboardEntry[];
	};
}

const Referral = () => {
	const {user, setUser} = useGlobalStore();
	const [tab, setTab] = useState<'weekly' | 'monthly'>('weekly');
	const [leaderboardLoading, setLeaderboardLoading] = useState(true);
	const [withdrawLoading, setWithdrawLoading] = useState(false);
	const [leaderboard, setLeaderboard] = useState<{
		weekly: LeaderboardEntry[];
		monthly: LeaderboardEntry[];
	}>({weekly: [], monthly: []});

	useEffect(() => {
		const fetch = async () => {
			try {
				setLeaderboardLoading(true);
				const axiosClient = new AxiosClient();
				const response = await axiosClient.get<LeaderboardResponse>(
					'/referral-leaderboard',
				);
				if (response.status === 200) {
					setLeaderboard(response.data.data);
				}
			} catch (error) {
				console.log(error);
			} finally {
				setLeaderboardLoading(false);
			}
		};
		fetch();
	}, []);

	const payoutThreshold = user?.auto_payout_threshold ?? 5000;
	const canWithdraw = (user?.referral_wallet_balance ?? 0) >= payoutThreshold;

	const handleWithdraw = async () => {
		if (withdrawLoading) return;
		setWithdrawLoading(true);
		try {
			const axiosClient = new AxiosClient();
			const response = await axiosClient.post<
				Record<string, never>,
				{status: number; message: string}
			>('/referral/payout', {});
			if (response.status === 200) {
				Toast.show({
					type: 'success',
					text1: 'Withdrawal initiated',
					text2: response.data.message || 'Your payout is being processed.',
				});
				try {
					const userRes = await axiosClient.get<UserResponse>('/user');
					if (userRes.status === 200) {
						setUser(userRes.data.data.attributes);
					}
				} catch {}
			}
		} catch (error: any) {
			Toast.show({
				type: 'error',
				text1: 'Withdrawal failed',
				text2:
					error?.response?.data?.message ||
					error?.message ||
					'Could not process withdrawal.',
			});
		} finally {
			setWithdrawLoading(false);
		}
	};

	const handleCopy = async () => {
		Toast.show({
			type: 'success',
			text1: 'Copied to clipboard',
			text2: user?.referral_link,
		});
		Clipboard.setStringAsync(user?.referral_link || '');
	};

	const entries = leaderboard[tab];

	const rankColor = (rank: number) => {
		if (rank === 1) return '#FFD700';
		if (rank === 2) return '#C0C0C0';
		if (rank === 3) return '#CD7F32';
		return '#E5E7EB';
	};

	return (
		<ScrollView className="flex-1 px-[5%] py-5">
			<Back title="Referral" />
			<View className="bg-primary mt-7 p-7 gap-y-2 rounded-bl-xl rounded-tr-xl overflow-hidden">
				<View className="z-10 flex-row gap-x-10 justify-around">
					<View className="bg-white rounded-xl gap-y-3 py-5 w-36 justify-center items-center">
						<Text className="text-xl font-semibold">Referrals</Text>
						<Text className="text-4xl font-semibold">
							{user?.referral_count ?? 0}
						</Text>
					</View>
					<View className="bg-white rounded-xl gap-y-3 py-5 w-36 justify-center items-center">
						<Text className="text-xl font-semibold">Commission</Text>
						<Text className="text-4xl font-semibold">
							{user?.referral_wallet_balance.toLocaleString()}
						</Text>
					</View>
				</View>
				<View className="bg-secondary w-12 h-12 rounded-full absolute -left-2 -top-2">
					<WalletBgIcon />
				</View>
				<View className="bg-secondary w-12 h-12 rounded-full absolute -right-2 -bottom-2" />
			</View>

			<View className="bg-white rounded-lg my-6 px-5 py-8">
				<Text className="text-xl font-semibold">Referral link</Text>
				<View className="border-[1px] border-[#C8C8C8] rounded-md mt-5 px-5 py-5">
					<Text className="text-[#7D7D7D] font-semibold">
						{user?.referral_link}
					</Text>
				</View>
				<View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-5 flex-row items-start gap-x-2">
					<Feather
						name="info"
						size={16}
						color="#1d4ed8"
						style={{marginTop: 2}}
					/>
					<Text className="text-blue-700 text-sm flex-1">
						Minimum withdrawal amount is ₦{payoutThreshold.toLocaleString()}.
					</Text>
				</View>
				<View className="flex-row gap-x-5 mt-4">
					<TouchableOpacity
						onPress={handleCopy}
						className="bg-secondary px-5 py-4 w-32 rounded-xl flex-row items-center justify-center gap-x-2"
					>
						<Feather name="copy" size={16} color="white" />
						<Text className="text-white text-center">Copy link</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={handleWithdraw}
						disabled={!canWithdraw || withdrawLoading}
						className={`px-5 py-4 w-32 rounded-xl flex-row items-center justify-center gap-x-2 ${
							canWithdraw ? 'bg-secondary' : 'bg-[#C8C8C8]'
						}`}
					>
						{withdrawLoading ? (
							<ActivityIndicator color="white" />
						) : (
							<>
								<Feather name="download" size={16} color="white" />
								<Text className="text-white text-center">Withdraw</Text>
							</>
						)}
					</TouchableOpacity>
				</View>
			</View>

			{/* Leaderboard */}
			<View className="bg-white rounded-lg mb-10 px-5 py-6">
				<Text className="text-xl font-semibold mb-4">Commission list</Text>

				{/* Tabs */}
				<View className="flex-row bg-[#F5F5F5] rounded-xl p-1 mb-5">
					{(['weekly', 'monthly'] as const).map(t => (
						<TouchableOpacity
							key={t}
							onPress={() => setTab(t)}
							className="flex-1 py-2 rounded-lg items-center"
							style={
								tab === t
									? {
											backgroundColor: '#fff',
											shadowColor: '#000',
											shadowOpacity: 0.08,
											shadowRadius: 4,
											elevation: 2,
										}
									: undefined
							}
						>
							<Text
								className="text-sm font-semibold capitalize"
								style={{color: tab === t ? '#111' : '#999'}}
							>
								{t}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{leaderboardLoading ? (
					<View className="py-10 items-center">
						<ActivityIndicator size="large" color="#1A73E8" />
					</View>
				) : entries.length === 0 ? (
					<View className="py-10 items-center gap-y-2">
						<Text className="text-4xl">🏆</Text>
						<Text className="text-[#666] text-base mt-2">No entries yet</Text>
						<Text className="text-[#999] text-sm text-center">
							Be the first to top the {tab} leaderboard!
						</Text>
					</View>
				) : (
					<View className="gap-y-3">
						{entries.map(entry => (
							<View
								key={entry.rank}
								className="flex-row items-center gap-x-3 py-3 border-b border-[#F0F0F0]"
							>
								<View
									className="w-8 h-8 rounded-full items-center justify-center"
									style={{backgroundColor: rankColor(entry.rank)}}
								>
									<Text className="font-bold text-sm text-[#111]">
										{entry.rank}
									</Text>
								</View>
								<View className="flex-1">
									<Text className="font-semibold text-base text-[#111]">
										{entry.firstname} {entry.lastname}
									</Text>
									<Text className="text-xs text-[#999]">@{entry.username}</Text>
								</View>
								<View className="items-end">
									<Text className="font-bold text-sm text-[#111]">
										{entry.referral_count} referrals
									</Text>
								</View>
							</View>
						))}
					</View>
				)}
			</View>
		</ScrollView>
	);
};

export default Referral;
