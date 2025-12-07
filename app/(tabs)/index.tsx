import CallIcon from '@/assets/icons/call';
import CameraIcon from '@/assets/icons/camera';
import ElectricityIcon from '@/assets/icons/electricity';
import GraduationCapIcon from '@/assets/icons/graduation';
import Logo from '@/assets/icons/logo';
import MonitorIcon from '@/assets/icons/monitor';
import NotificationIcon from '@/assets/icons/notification';
import ProfileIcon from '@/assets/icons/profile';
import WalletBgIcon from '@/assets/icons/wallet-bg';
import WifiIcon from '@/assets/icons/wifi';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {GlobalColors} from '@/styles';
import {AxiosClient} from '@/utils/axios';
import {MemoryStorage} from '@/utils/storage';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {router, useFocusEffect} from 'expo-router';
import {useCallback, useEffect, useState} from 'react';
import {
	Pressable,
	RefreshControl,
	ScrollView,
	TouchableOpacity,
	View,
} from 'react-native';
import {UserResponse} from '../../types';
// Root API response interface
export interface TransactionsResponse {
	status: number;
	message: string;
	data: Transaction[];
}

// Each transaction entry
export interface Transaction {
	type: string;
	id: number;
	attributes: TransactionAttributes;
}

// Transaction attributes
export interface TransactionAttributes {
	transaction_ref: string;
	servicename: string;
	servicedesc: string;
	amount: string;
	status: number;
	oldbal: string;
	newbal: string;
	profit: number;
	date: string;
	created_at: string | null;
	updated_at: string | null;
}

export default function HomeScreen() {
	const {user, setUser, transactions, setTransactions} = useGlobalStore();
	const [refreshing, setRefreshing] = useState(false);
	const [showBalance, setShowBalance] = useState(true);

	const handleRefresh = () => {
		setRefreshing(true);

		setTimeout(() => {
			setRefreshing(false);
		}, 1500);
	};

	useEffect(() => {
		const storage = new MemoryStorage();
		storage
			.getItem('showBalance')
			.then(res => setShowBalance(res ? JSON.parse(res) : false));
	}, []);

	useEffect(() => {
		const storage = new MemoryStorage();
		storage.setItem('showBalance', `${showBalance}`);
	}, [showBalance]);

	useFocusEffect(
		useCallback(() => {
			const getUser = async () => {
				try {
					const axiosClient = new AxiosClient();

					const response = await axiosClient.get<UserResponse>('/user');
					if (response.status === 200) {
						setUser(response.data.data.attributes);
					}
				} catch (error) {
					console.log(error);
				}
			};
			const getTransactions = async () => {
				try {
					const axiosClient = new AxiosClient();

					const response = await axiosClient.get<TransactionsResponse>(
						'/transactions'
					);

					if (response.status === 200) {
						setTransactions(response.data.data);
					}
				} catch (error) {
					console.log(error);
				}
			};
			getTransactions();
			getUser();
		}, [setTransactions, setUser])
	);

	return (
		<ScrollView
			className="flex-1 px-[3%]"
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={handleRefresh}
					colors={[GlobalColors.secondary]}
				/>
			}
		>
			<View className="bg-[#f5f5f5] py-5">
				<View className="flex-row justify-between items-center">
					<Logo />
					<View className="flex-row gap-x-4">
						<TouchableOpacity onPress={() => router.navigate('/Notification')}>
							<NotificationIcon />
						</TouchableOpacity>
						<TouchableOpacity onPress={() => router.navigate('/Profile')}>
							<ProfileIcon />
						</TouchableOpacity>
					</View>
				</View>
				<View className="bg-primary mt-7 p-7 gap-y-2 rounded-bl-xl rounded-tr-xl overflow-hidden">
					<View className="z-10">
						<View className="flex-row justify-between">
							<View>
								<Text className="text-xl text-white" fontWeight={600}>
									Wallet Balance
								</Text>

								{showBalance ? (
									<Text className="text-white text-2xl" fontWeight={'bold'}>
										₦
										{user?.wallet_balance
											? user.wallet_balance.toLocaleString()
											: '0.00'}
									</Text>
								) : (
									<Text className="text-white text-2xl" fontWeight={'bold'}>
										***
									</Text>
								)}
							</View>
							<TouchableOpacity onPress={() => setShowBalance(prev => !prev)}>
								{showBalance ? (
									<Ionicons name="eye-off" size={24} color="white" />
								) : (
									<Ionicons name="eye" size={24} color="white" />
								)}
							</TouchableOpacity>
						</View>
						<View className="flex-row flex-wrap gap-5 mt-5">
							<TouchableOpacity
								onPress={() => router.navigate('/Fund')}
								className="bg-white py-3 px-5 rounded-md flex-row items-center gap-x-2"
							>
								<Text className="text-secondary text-xl" fontWeight={600}>
									Fund Wallet
								</Text>
								<Entypo
									name="squared-plus"
									size={24}
									color={GlobalColors.secondary}
								/>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => router.navigate('/Transfer')}
								className="bg-white py-3 px-5 rounded-md flex-row items-center gap-x-2"
							>
								<Text className="text-secondary text-xl" fontWeight={600}>
									Wallet Transfer
								</Text>
								<Entypo
									name="wallet"
									size={24}
									color={GlobalColors.secondary}
								/>
							</TouchableOpacity>
						</View>
					</View>
					<View className="bg-secondary w-12 h-12 rounded-full absolute -left-2 -top-2">
						<WalletBgIcon />
					</View>
					<View className="bg-secondary w-12 h-12 rounded-full absolute -right-2 -bottom-2" />
				</View>
			</View>

			<View className="bg-white px-10 py-10 mt-5 rounded-xl gap-10 mb-10">
				<View className="flex-row justify-around flex-wrap gap-10 ">
					<Pressable
						onPress={() => router.navigate('/(tabs)/data')}
						className="bg-[#e7f0ff] w-20 h-20 justify-center items-center rounded-xl gap-y-2"
					>
						<WifiIcon />
						<Text className="text-[#7D7D7D]">Data</Text>
					</Pressable>
					<Pressable
						onPress={() => router.navigate('/(tabs)/airtime')}
						className="bg-[#e7f0ff] w-20 h-20 justify-center items-center rounded-xl gap-y-2"
					>
						<CallIcon />
						<Text className="text-[#7D7D7D]">Airtime</Text>
					</Pressable>
					<Pressable
						onPress={() => router.navigate('/Electricity')}
						className="bg-[#e7f0ff] w-20 h-20 justify-center items-center rounded-xl gap-y-2"
					>
						<ElectricityIcon />
						<Text className="text-[#7D7D7D]">Electricity</Text>
					</Pressable>
					<Pressable
						onPress={() => router.navigate('/Tv')}
						className="bg-[#e7f0ff] w-20 h-20 justify-center items-center rounded-xl gap-y-2"
					>
						<MonitorIcon />
						<Text className="text-[#7D7D7D]">TV</Text>
					</Pressable>
					<Pressable
						onPress={() => router.navigate('/Exam')}
						className="bg-[#e7f0ff] w-20 h-20 justify-center items-center rounded-xl gap-y-2"
					>
						<GraduationCapIcon />
						<Text className="text-[#7D7D7D]">Exam card</Text>
					</Pressable>

					<Pressable
						onPress={() => router.navigate('/')}
						className="bg-[#e7f0ff] w-20 h-20 justify-center items-center rounded-xl gap-y-2"
					>
						<CameraIcon />
						<Text className="text-[#7D7D7D]">Promote</Text>
					</Pressable>

					<Pressable
						onPress={() => router.navigate('/')}
						className="bg-[#e7f0ff] w-20 h-20 justify-center items-center rounded-xl gap-y-2"
					>
						<CameraIcon />
						<Text className="text-[#7D7D7D]">Authorize</Text>
					</Pressable>
				</View>
			</View>
			<View className="mt-5">
				<View className="flex flex-row justify-between items-center">
					<Text className="text-[#313131] text-2xl" fontWeight={600}>
						Recent Transaction
					</Text>
					{transactions.length > 5 && (
						<TouchableOpacity onPress={() => router.navigate('/Transactions')}>
							<Text className="text-secondary text-lg" fontWeight={600}>
								See all
							</Text>
						</TouchableOpacity>
					)}
				</View>

				<View className="flex justify-center items-center">
					{transactions.length ? (
						<>
							<View className="flex-row flex-1 w-full my-5">
								<Text className="flex-1">Type</Text>
								<Text className="flex-1">Transaction status</Text>
								<View className="" style={{width: 50}}>
									<Text className="">Price</Text>
								</View>
							</View>
							{transactions.slice(0, 5).map(transaction => (
								<TouchableOpacity
									onPress={() =>
										router.push(`/TransactionDetails?id=${transaction.id}`)
									}
									key={transaction.id}
									className="flex-row flex-1 w-full mb-7 gap-x-5"
								>
									<View className="flex-1 flex-row items-center">
										<View className="w-10">
											{transaction.attributes.servicename === 'Wallet Topup' ||
											transaction.attributes.servicename === 'Wallet Credit' ? (
												<MaterialCommunityIcons
													name="wallet-plus"
													size={24}
													color="#7D7D7D"
												/>
											) : transaction.attributes.servicename === 'Airtime' ? (
												<CallIcon color={'#7D7D7D'} />
											) : transaction.attributes.servicename === 'Data' ? (
												<WifiIcon color={'#7D7D7D'} />
											) : (
												transaction.attributes.servicename ===
													'Wallet Transfer' && (
													<FontAwesome6
														name="money-bill-transfer"
														size={20}
														color="#7D7D7D"
													/>
												)
											)}
										</View>
										<View className="ml-2">
											<Text className="font-semibold">
												{transaction.attributes.servicename}
											</Text>
											{transaction.attributes.date && (
												<Text className="text-sm text-[#4E4E4E]">
													{new Date(transaction.attributes.date).toDateString()}
												</Text>
											)}
										</View>
									</View>
									<View className="flex-1">
										{transaction.attributes.status ? (
											<Text className="text-red-500" fontWeight={600}>
												Failed
											</Text>
										) : (
											<Text className="text-green-500" fontWeight={600}>
												Successful
											</Text>
										)}
									</View>
									<View className="" style={{width: 50}}>
										<Text className="text-secondary" fontWeight={600}>
											₦{Number(transaction.attributes.amount).toLocaleString()}
										</Text>
									</View>
								</TouchableOpacity>
							))}
						</>
					) : (
						<Text className="text-center text-lg my-20">
							You have no new transactions at the moment
						</Text>
					)}
				</View>
			</View>
		</ScrollView>
	);
}
