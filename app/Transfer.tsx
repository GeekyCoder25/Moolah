import {ScrollView, TextInput, View} from 'react-native';
import React, {useState} from 'react';
import Back from '@/components/back';
import {Text} from '@/components/text';
import InfoIcon from '@/assets/icons/info-icon';
import Button from './components/button';
import {useGlobalStore} from '@/context/store';

const Transfer = () => {
	const {setShowPin} = useGlobalStore();
	const [formData, setFormData] = useState({
		email: '',
		amount: '',
	});

	const handleSend = async () => {
		setShowPin(true);
	};

	return (
		<ScrollView className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="Transfer" />

			<View className="gap-y-5 my-20 flex-1">
				<View className="gap-y-5">
					<Text className="text-xl" fontWeight={700}>
						Receiver email
					</Text>

					<TextInput
						className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
						value={formData.email}
						onChangeText={text => setFormData(prev => ({...prev, email: text}))}
						placeholder="Email"
						placeholderTextColor={'#7D7D7D'}
					/>
				</View>
				<View className="gap-y-5">
					<Text className="text-xl" fontWeight={700}>
						Amount
					</Text>

					<TextInput
						className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
						inputMode="numeric"
						value={formData.amount}
						onChangeText={text =>
							setFormData(prev => ({...prev, amount: text}))
						}
						placeholder="Amount"
						placeholderTextColor={'#7D7D7D'}
					/>
				</View>
				<View className="my-10 bg-[#dee8f6] px-10 py-5 rounded-xl gap-y-5">
					<View className="flex-row items-center">
						<Text className="text-secondary">Note </Text>
						<View>
							<InfoIcon />
						</View>
					</View>
					<Text>
						Wallet To Wallet Funds Transfer Attracts A Charges Of ₦50 Only.
					</Text>
				</View>
			</View>

			<Button title="Send" onPress={handleSend} />
		</ScrollView>
	);
};

export default Transfer;
