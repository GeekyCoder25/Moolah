import {RefreshControl, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import Back from '@/components/back';
import {Text} from 'react-native';
import {Transaction, TransactionsResponse} from './(tabs)';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CallIcon from '@/assets/icons/call';
import WifiIcon from '@/assets/icons/wifi';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import {AxiosClient} from '@/utils/axios';
import {ScrollView} from 'react-native';
import {GlobalColors} from '@/styles';

const Transactions = () => {
	const [refreshing, setRefreshing] = useState(false);
	const [transactions, setTransactions] = useState<Transaction[]>([]);

	useEffect(() => {
		const getTransactions = async () => {
			try {
				const axiosClient = new AxiosClient();

				const response = await axiosClient.get<TransactionsResponse>(
					'/transactions'
				);

				if (response.status === 200) {
					setTransactions(response.data.data);
				}
			} catch (error) {}
		};
		getTransactions();
	}, [refreshing]);

	const handleRefresh = async () => {
		setRefreshing(true);

		setTimeout(() => {
			setRefreshing(false);
		}, 2000);
	};

	return (
		<View className="py-5 gap-x-4 flex-1 bg-white">
			<View className="px-[5%]">
				<Back title="Transactions" />
			</View>
			<View className="flex-row w-full my-5 px-[5%]">
				<Text className="flex-1">Type</Text>
				<Text className="flex-1">Transaction id</Text>
				<View className="" style={{width: 50}}>
					<Text className="">Price</Text>
				</View>
			</View>
			<ScrollView
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						colors={[GlobalColors.secondary]}
					/>
				}
				className="px-[5%]"
			>
				{transactions.map(transaction => (
					<View
						key={transaction.id}
						className="flex-row flex-1 w-full mb-7 gap-x-5"
					>
						<View className="flex-1 flex-row items-center">
							{transaction.attributes.servicename == 'Wallet Topup' ||
							transaction.attributes.servicename == 'Wallet Credit' ? (
								<MaterialCommunityIcons
									name="wallet-plus"
									size={24}
									color="#7D7D7D"
								/>
							) : transaction.attributes.servicename == 'Airtime' ? (
								<CallIcon color={'#7D7D7D'} />
							) : transaction.attributes.servicename == 'Data' ? (
								<WifiIcon color={'#7D7D7D'} />
							) : (
								transaction.attributes.servicename == 'Wallet Transfer' && (
									<FontAwesome6
										name="money-bill-transfer"
										size={20}
										color="#7D7D7D"
									/>
								)
							)}
							<View className="ml-2">
								<Text className="font-semibold">
									{transaction.attributes.servicename}
								</Text>
								{transaction.attributes.created_at && (
									<Text className="text-sm text-[#4E4E4E]">
										{new Date(transaction.attributes.created_at).toDateString()}
									</Text>
								)}
							</View>
						</View>
						<View className="flex-1">
							<Text>{transaction.attributes.transaction_ref}</Text>
						</View>
						<View className="" style={{width: 50}}>
							<Text className="font-semibold text-secondary">
								₦{transaction.attributes.amount}
							</Text>
						</View>
					</View>
				))}
			</ScrollView>
		</View>
	);
};

export default Transactions;
