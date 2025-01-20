import {
	Keyboard,
	Modal,
	Pressable,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import React, {useState} from 'react';
import Back from '@/components/back';
import {Text} from '@/components/text';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {globalStyles} from '@/styles';
import Button from '../components/button';

const Airtime = () => {
	const [formData, setFormData] = useState({
		network: '',
		phone_number: '',
		amount: '',
	});
	const [showNetworkModal, setShowNetworkModal] = useState(false);

	const networks = [
		{
			label: 'MTN',
		},
		{
			label: 'Airtel',
		},
		{
			label: 'Glo',
		},
		{
			label: '9mobile',
		},
	];

	const plans = [{name: `${formData.network} 2gb for ₦200`}];

	const handleBuy = async () => {
		try {
			if (!formData.network) {
				throw new Error('Please select a network');
			} else if (!formData.phone_number) {
				throw new Error('Please input your phone number');
			} else if (!formData.amount) {
				throw new Error('Please input airtime amount');
			}
		} catch (error: any) {
			alert(error.message);
		} finally {
		}
	};

	return (
		<Pressable
			onPress={Keyboard.dismiss}
			className="px-[5%] py-5 gap-x-4 flex-1"
		>
			<Back title="Airtime" />
			<View className="flex-1">
				<View className="my-10">
					<Text className="text-3xl" fontWeight={600}>
						Buy Airtime
					</Text>
					<Text className="text-secondary mt-2 rounded-tl-2xl">
						Airtime for all Network
					</Text>
				</View>

				<View className="gap-y-5">
					<View>
						<View className="gap-y-5">
							<Text className="text-xl" fontWeight={700}>
								Network
							</Text>
							<TouchableOpacity
								onPress={() => setShowNetworkModal(true)}
								className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							>
								<Text className="text-lg">
									{formData.network || 'Select Network'}
								</Text>

								<FontAwesome name="caret-down" size={24} color="#7D7D7D" />
							</TouchableOpacity>
						</View>
						{showNetworkModal && (
							<Modal transparent>
								<Pressable
									style={globalStyles.overlay}
									onPress={() => setShowNetworkModal(false)}
								/>
								<View className="flex-1 justify-end items-end">
									<View className="bg-white w-full h-[70%] py-8 px-[5%] rounded-t-2xl">
										<Text className="text-3xl" fontWeight={700}>
											Select Network
										</Text>
										<View className="my-10">
											{networks.map(network => (
												<TouchableOpacity
													key={network.label}
													className="py-5"
													onPress={() => {
														setFormData(prev => ({
															...prev,
															network: network.label,
														}));
														setShowNetworkModal(false);
													}}
												>
													<Text className="text-2xl">{network.label}</Text>
												</TouchableOpacity>
											))}
										</View>
									</View>
								</View>
							</Modal>
						)}
					</View>
					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={700}>
							Phone number
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							inputMode="tel"
							maxLength={11}
							value={formData.phone_number}
							onChangeText={text =>
								setFormData(prev => ({...prev, phone_number: text}))
							}
							placeholder="Phone number"
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
				</View>
			</View>
			<Button title="Buy" onPress={handleBuy} />
		</Pressable>
	);
};

export default Airtime;
