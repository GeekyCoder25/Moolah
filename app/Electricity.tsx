import {
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
import Button from './components/button';
import InfoIcon from '@/assets/icons/info-icon';

const Electricity = () => {
	const [formData, setFormData] = useState({
		provider: '',
		type: '',
		meter_number: '',
		amount: '',
	});
	const [showProviderModal, setShowProviderModal] = useState(false);
	const [showTypeModal, setShowTypeModal] = useState(false);

	const providers = [
		{
			label: 'Ikeja Electricity',
		},
		{
			label: 'Eko Electricity',
		},
	];

	const handleBuy = async () => {
		try {
			if (!formData.provider) {
				throw new Error('Please select a provider');
			} else if (!formData.meter_number) {
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
		<View className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="Electricity" />
			<View className="flex-1">
				<View className="my-10">
					<Text className="text-3xl" fontWeight={600}>
						Electricity Bill
					</Text>
					<Text className="text-secondary mt-2 rounded-tl-2xl">
						Electricity Payment
					</Text>
				</View>
				<View className="mb-10 bg-[#dee8f6] px-10 py-5 rounded-xl gap-y-5">
					<View className="flex-row items-center">
						<Text className="text-secondary">
							Note{' '}
							<View className="mt-5">
								<InfoIcon />
							</View>
						</Text>
					</View>
					<Text>Minimum Unit Purchase Is N1000.</Text>
					<Text>Transaction attracts a service charges of N50 only.</Text>
				</View>

				<View className="gap-y-5">
					<View>
						<View className="gap-y-5">
							<Text className="text-xl" fontWeight={700}>
								Provider
							</Text>
							<TouchableOpacity
								onPress={() => setShowProviderModal(true)}
								className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							>
								<Text className="text-lg">
									{formData.provider || 'Select Provider'}
								</Text>

								<FontAwesome name="caret-down" size={24} color="#7D7D7D" />
							</TouchableOpacity>
						</View>
						{showProviderModal && (
							<Modal transparent>
								<Pressable
									style={globalStyles.overlay}
									onPress={() => setShowProviderModal(false)}
								/>
								<View className="flex-1 justify-end items-end">
									<View className="bg-white w-full h-[70%] py-8 px-[5%] rounded-t-2xl">
										<Text className="text-3xl" fontWeight={700}>
											Select Provider
										</Text>
										<View className="my-10">
											{providers.map(provider => (
												<TouchableOpacity
													key={provider.label}
													className="py-5"
													onPress={() => {
														setFormData(prev => ({
															...prev,
															provider: provider.label,
														}));
														setShowProviderModal(false);
													}}
												>
													<Text className="text-2xl">{provider.label}</Text>
												</TouchableOpacity>
											))}
										</View>
									</View>
								</View>
							</Modal>
						)}
					</View>
					<View>
						<View className="gap-y-5">
							<Text className="text-xl" fontWeight={700}>
								Meter Type
							</Text>
							<TouchableOpacity
								onPress={() => setShowTypeModal(true)}
								className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							>
								<Text className="text-lg">
									{formData.type || 'Select Meter type'}
								</Text>

								<FontAwesome name="caret-down" size={24} color="#7D7D7D" />
							</TouchableOpacity>
						</View>
						{showTypeModal && (
							<Modal transparent>
								<Pressable
									style={globalStyles.overlay}
									onPress={() => setShowTypeModal(false)}
								/>
								<View className="flex-1 justify-end items-end">
									<View className="bg-white w-full h-[70%] py-8 px-[5%] rounded-t-2xl">
										<Text className="text-3xl" fontWeight={700}>
											Select Meter Type
										</Text>
										<View className="my-10">
											{providers.map(provider => (
												<TouchableOpacity
													key={provider.label}
													className="py-5"
													onPress={() => {
														setFormData(prev => ({
															...prev,
															network: provider.label,
														}));
														setShowTypeModal(false);
													}}
												>
													<Text className="text-2xl">{provider.label}</Text>
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
							Meter number
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							inputMode="tel"
							maxLength={11}
							value={formData.meter_number}
							onChangeText={text =>
								setFormData(prev => ({...prev, meter_number: text}))
							}
							placeholder="Meter number"
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
						/>
					</View>
				</View>
			</View>
			<Button title="Buy" onPress={handleBuy} />
		</View>
	);
};

export default Electricity;
