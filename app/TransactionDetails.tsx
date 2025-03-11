import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {router, useLocalSearchParams} from 'expo-router';
import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';

const TransactionDetails = () => {
	const {id}: {id: string} = useLocalSearchParams();

	const {transactions} = useGlobalStore();
	const transaction = transactions.find(
		transaction => transaction.id === Number(id)
	);

	if (!transaction) return router.back();

	const handleCopy = async (no: string) => {
		Toast.show({
			type: 'success',
			text1: 'Copied to clipboard',
			text2: no,
		});

		Clipboard.setStringAsync(no);
	};

	return (
		<ScrollView className="px-[5%] pt-5 pb-10 gap-x-4 flex-1 bg-white">
			<Back title="Transaction Details" />

			<View className="my-10 border-[1px] border-[#dee2e6]">
				<View className="flex-row border-b-[1px] border-[#dee2e6] px-2  bg-[#f2f2f2]">
					<Text className="flex-1 py-2">Transaction No</Text>
					<Pressable
						className="flex-1 border-l-[1px] border-[#dee2e6] pl-2 py-3"
						onPress={() => handleCopy(transaction.attributes.transaction_ref)}
					>
						<Text className="">{transaction.attributes.transaction_ref}</Text>
					</Pressable>
				</View>
				<View className="flex-row border-b-[1px] border-[#dee2e6] px-2">
					<Text className="flex-1 py-2">Service</Text>
					<Text className="flex-1 border-l-[1px] border-[#dee2e6] pl-2 py-3">
						{transaction.attributes.servicename}
					</Text>
				</View>
				<View className="flex-row border-b-[1px] border-[#dee2e6] px-2  bg-[#f2f2f2]">
					<Text className="flex-1 py-2">Description</Text>
					<Text className="flex-1 border-l-[1px] border-[#dee2e6] pl-2 py-3">
						{transaction.attributes.servicedesc}
					</Text>
				</View>
				<View className="flex-row border-b-[1px] border-[#dee2e6] px-2">
					<Text className="flex-1 py-2">Amount</Text>
					<Text className="flex-1 border-l-[1px] border-[#dee2e6] pl-2 py-3">
						₦{Number(transaction.attributes.amount).toLocaleString()}
					</Text>
				</View>
				<View className="flex-row border-b-[1px] border-[#dee2e6] px-2 bg-[#f2f2f2]">
					<Text className="flex-1 py-2">Old Balance</Text>
					<Text className="flex-1 border-l-[1px] border-[#dee2e6] pl-2 py-3">
						₦{Number(transaction.attributes.oldbal).toLocaleString()}
					</Text>
				</View>
				<View className="flex-row border-b-[1px] border-[#dee2e6] px-2">
					<Text className="flex-1 py-2">New Balance</Text>
					<Text className="flex-1 border-l-[1px] border-[#dee2e6] pl-2 py-3">
						₦{Number(transaction.attributes.newbal).toLocaleString()}
					</Text>
				</View>
				<View className="flex-row px-2 bg-[#f2f2f2]">
					<Text className="flex-1 py-2">Status</Text>
					{transaction.attributes.status ? (
						<Text
							className="flex-1 border-l-[1px] border-[#dee2e6] pl-2 py-3 text-red-500"
							fontWeight={600}
						>
							Failed Transaction
						</Text>
					) : (
						<Text
							className="flex-1 border-l-[1px] border-[#dee2e6] pl-2 py-3 text-green-500"
							fontWeight={600}
						>
							Successful Transaction
						</Text>
					)}
				</View>
				<View className="flex-row px-2">
					<Text className="flex-1 py-2">Date</Text>
					<Text className="flex-1 border-l-[1px] border-[#dee2e6] pl-2 py-3">
						{new Date(transaction.attributes.date).toDateString()}{' '}
						{new Date(transaction.attributes.date).getHours()}:
						{new Date(transaction.attributes.date).getMinutes()}
					</Text>
				</View>
			</View>
		</ScrollView>
	);
};

export default TransactionDetails;
