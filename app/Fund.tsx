import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import Back from '@/components/back';
import {useGlobalStore} from '@/context/store';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';

const Fund = () => {
	const [activeTab, setActiveTab] = useState('bank');
	const {user} = useGlobalStore();
	if (!user) return null;

	const handleCopy = async (no: string) => {
		Toast.show({
			type: 'success',
			text1: 'Copied to clipboard',
			text2: no,
		});

		Clipboard.setStringAsync(no);
	};

	const accNo = user.banks.filter(bank => bank.account_no)[0].account_no;

	return (
		<View className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="Fund Wallet" />

			<View className="flex-row justify-between items-center pt-10 border-b-[#EBEBEB] border-b-[1px]">
				<TouchableOpacity
					onPress={() => setActiveTab('bank')}
					className={
						activeTab === 'bank' ? 'border-b-[1px] border-b-secondary' : ''
					}
				>
					<Text
						className={`${
							activeTab === 'bank'
								? 'text-secondary border-b-[1px] border-b-secondary'
								: 'text-[#7D7D7D]'
						} text-2xl`}
					>
						Bank
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setActiveTab('card')}
					className={
						activeTab === 'card' ? 'border-b-[1px] border-b-secondary' : ''
					}
				>
					<Text
						className={`${
							activeTab === 'card'
								? 'text-secondary border-b-[1px] border-b-secondary'
								: 'text-[#7D7D7D]'
						} text-2xl`}
					>
						Card
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setActiveTab('manual')}
					className={
						activeTab === 'manual' ? 'border-b-[1px] border-b-secondary' : ''
					}
				>
					<Text
						className={`${
							activeTab === 'manual'
								? 'text-secondary border-b-[1px] border-b-secondary'
								: 'text-[#7D7D7D]'
						} text-2xl`}
					>
						Manual
					</Text>
				</TouchableOpacity>
			</View>

			{(activeTab === 'manual' || activeTab === 'bank') && (
				<View>
					<View className="my-10 gap-y-5">
						<Text className="text-[#292D32] font-medium text-xl">
							Bank name: {user.banks.filter(bank => bank.account_no)[0].name}
						</Text>
						<Text className="font-medium text-xl">
							Account name: MFY / PAXI GLOBAL TECH Limited -{user.firstname}
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
								if (accNo) {
									handleCopy(accNo);
								}
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
		</View>
	);
};

export default Fund;
