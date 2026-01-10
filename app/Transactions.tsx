import CallIcon from '@/assets/icons/call';
import WifiIcon from '@/assets/icons/wifi';
import Back from '@/components/back';
import {AxiosClient} from '@/utils/axios';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, {useEffect, useState} from 'react';
import {
	ActivityIndicator,
	ScrollView,
	TouchableOpacity,
	View,
} from 'react-native';
import {TransactionsResponse} from './(tabs)';

import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {GlobalColors} from '@/styles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {router} from 'expo-router';

const Transactions = () => {
	const {transactions, setTransactions} = useGlobalStore();
	const [isLoading, setIsLoading] = useState(!transactions.length);

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
			} catch (error) {
				console.log(error);
			} finally {
				setIsLoading(false);
			}
		};
		getTransactions();
	}, [setTransactions]);

	if (isLoading) {
		return (
			<View className="py-5 gap-x-4 flex-1 bg-white">
				<View className="px-[5%]">
					<Back title="Transactions" />
					<View className="my-10">
						<ActivityIndicator color={GlobalColors.secondary} />
					</View>
				</View>
			</View>
		);
	}
	return (
		<View className="py-5 gap-x-4 flex-1 bg-white">
			<View className="px-[5%]">
				<Back title="Transactions" />
			</View>
			<View className="">
				{transactions.length ? (
					<>
						<View className="flex-row px-[5%] w-full my-5">
							<Text className="flex-1">Type</Text>
							<Text className="flex-1">Transaction status</Text>
							<View className="" style={{width: 50}}>
								<Text className="">Price</Text>
							</View>
						</View>
						<ScrollView className="px-[5%]">
							{transactions.map(transaction => (
								<TouchableOpacity
									onPress={() =>
										router.push(`/TransactionDetails?id=${transaction.id}`)
									}
									key={transaction.id}
									className="flex-row flex-1 w-full mb-7 gap-x-5 border-b-{1px]"
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
											) : transaction.attributes.servicename === 'Airtime' ||
											  transaction.attributes.servicename ===
													'Airtime Purchase' ? (
												<CallIcon color={'#7D7D7D'} />
											) : transaction.attributes.servicename === 'Data' ? (
												<WifiIcon color={'#7D7D7D'} />
											) : transaction.attributes.servicename ===
													'Wallet Transfer' ||
											  transaction.attributes.servicename ===
													'Wallet Debit' ? (
												<FontAwesome6
													name="money-bill-transfer"
													size={20}
													color="#7D7D7D"
												/>
											) : transaction.attributes.servicename ===
											  'EPIN Purchase' ? (
												<WifiIcon color={'#7D7D7D'} />
											) : transaction.attributes.servicename ===
											  'Electricity Bill' ? (
												<MaterialIcons
													name="electric-bolt"
													size={24}
													color="#7D7D7D"
												/>
											) : (
												''
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
											<Text className="text-red-500 font-semibold">Failed</Text>
										) : (
											<Text className="text-green-500 font-semibold">
												Successful
											</Text>
										)}
									</View>
									<View className="" style={{width: 50}}>
										<Text className="text-secondary font-semibold">
											₦{Number(transaction.attributes.amount).toLocaleString()}
										</Text>
									</View>
								</TouchableOpacity>
							))}
							<View className="h-20" />
						</ScrollView>
					</>
				) : (
					<Text className="text-center text-lg my-20">
						You have no new transactions at the moment
					</Text>
				)}
			</View>
		</View>
	);
};

export default Transactions;
