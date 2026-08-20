import Back from '@/components/back';
import {Text} from '@/components/text';
import TransactionItem, {
	groupTransactionsByDay,
} from '@/components/transaction-item';
import {useGlobalStore} from '@/context/store';
import {GlobalColors} from '@/styles';
import {AxiosClient} from '@/utils/axios';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, View} from 'react-native';
import {TransactionsResponse} from './(tabs)';

const Transactions = () => {
	const {transactions, setTransactions} = useGlobalStore();
	const [isLoading, setIsLoading] = useState(!transactions.length);

	useEffect(() => {
		const getTransactions = async () => {
			try {
				const axiosClient = new AxiosClient();
				const response =
					await axiosClient.get<TransactionsResponse>('/transactions');
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
			<View className="py-5 flex-1 bg-white">
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
		<View className="py-5 flex-1 bg-white">
			<View className="px-[5%]">
				<Back title="Transactions" />
			</View>

			{transactions.length ? (
				<ScrollView
					className="px-[5%] mt-2"
					showsVerticalScrollIndicator={false}
				>
					{groupTransactionsByDay(transactions).map(group => (
						<View key={group.key}>
							<Text className="text-[#94A3B8] text-xs font-semibold mt-2 mb-4">
								{group.label}
							</Text>
							{group.items.map(transaction => (
								<TransactionItem
									key={transaction.id}
									transaction={transaction}
								/>
							))}
						</View>
					))}
					<View className="h-20" />
				</ScrollView>
			) : (
				<Text className="text-center text-lg my-20">
					You have no new transactions at the moment
				</Text>
			)}
		</View>
	);
};

export default Transactions;
