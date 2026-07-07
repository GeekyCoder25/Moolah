import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {UserResponse} from '@/types';
import {maskAccountNumber} from '@/utils';
import {AxiosClient} from '@/utils/axios';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {router} from 'expo-router';
import React from 'react';
import {Alert, ScrollView, TouchableOpacity, View} from 'react-native';
import Toast from 'react-native-toast-message';
import Button from './components/button';

const BankAccounts = () => {
	const {user, setUser, setLoading} = useGlobalStore();
	const accounts = user?.bank_accounts ?? [];

	const refreshUser = async () => {
		const axiosClient = new AxiosClient();
		const res = await axiosClient.get<UserResponse>('/user');
		if (res.status === 200) {
			setUser(res.data.data.attributes);
		}
	};

	const showError = (error: any) => {
		Toast.show({
			type: 'error',
			text1: 'Error',
			text2:
				error.response?.data?.message ||
				error.response?.data ||
				error.message,
		});
	};

	const handleSetDefault = async (id: number) => {
		try {
			setLoading(true);
			const axiosClient = new AxiosClient();
			const res = await axiosClient.patch(`/bank-accounts/${id}/default`);
			if (res.status === 200) {
				await refreshUser();
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Default account updated',
				});
			}
		} catch (error: any) {
			showError(error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = (id: number) => {
		Alert.alert(
			'Remove bank account',
			'Are you sure you want to remove this bank account?',
			[
				{text: 'Cancel', style: 'cancel'},
				{
					text: 'Remove',
					style: 'destructive',
					onPress: async () => {
						try {
							setLoading(true);
							const axiosClient = new AxiosClient();
							const res = await axiosClient.delete(`/bank-accounts/${id}`);
							if (res.status === 200) {
								await refreshUser();
								Toast.show({
									type: 'success',
									text1: 'Success',
									text2: 'Bank account removed',
								});
							}
						} catch (error: any) {
							showError(error);
						} finally {
							setLoading(false);
						}
					},
				},
			],
		);
	};

	return (
		<View className="flex-1 bg-[#F5F5F5]">
			<View className="px-[5%] pt-5">
				<Back title="Bank accounts" />
			</View>

			<ScrollView
				className="flex-1 px-[5%]"
				contentContainerStyle={{paddingBottom: 40}}
				showsVerticalScrollIndicator={false}
			>
				<View className="mt-6 gap-y-4">
					{accounts.length > 0 ? (
						accounts.map(account => (
							<View key={account.id} className="bg-white rounded-xl p-4">
								<View className="flex-row items-center justify-between mb-1">
									<Text
										className="text-lg font-bold text-[#111] flex-1"
										numberOfLines={1}
									>
										{account.bank_name}
									</Text>
									{account.is_default && (
										<View className="bg-[#E7F1FF] px-3 py-1 rounded-full ml-2">
											<Text className="text-secondary text-xs font-semibold">
												Default
											</Text>
										</View>
									)}
								</View>
								<Text className="text-[#111] text-base">
									{maskAccountNumber(account.account_number)}
								</Text>
								<Text className="text-[#666] text-sm mt-0.5">
									{account.account_name}
								</Text>

								<View className="flex-row gap-x-3 mt-4">
									{!account.is_default && (
										<TouchableOpacity
											onPress={() => handleSetDefault(account.id)}
											className="flex-1 border border-secondary rounded-lg py-2.5 items-center"
										>
											<Text className="text-secondary font-semibold text-sm">
												Set as default
											</Text>
										</TouchableOpacity>
									)}
									<TouchableOpacity
										onPress={() => handleDelete(account.id)}
										className="flex-row items-center justify-center gap-x-2 border border-[#E0E0E0] rounded-lg py-2.5 px-4"
									>
										<FontAwesome5 name="trash" size={14} color="#E53935" />
										<Text className="text-[#E53935] font-semibold text-sm">
											Remove
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						))
					) : (
						<View className="items-center py-20">
							<Text className="text-[#666] text-base">
								No bank accounts yet
							</Text>
							<Text className="text-[#999] text-sm mt-1">
								Add a payout account to get started
							</Text>
						</View>
					)}
				</View>
			</ScrollView>

			{user?.can_add_bank_account && (
				<View className="px-[5%] pb-8 pt-3 bg-[#F5F5F5]">
					<Button
						title="Add bank account"
						onPress={() => router.navigate('/AddBankAccount')}
					/>
				</View>
			)}
		</View>
	);
};

export default BankAccounts;
