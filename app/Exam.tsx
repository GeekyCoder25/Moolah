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

const Exam = () => {
	const [formData, setFormData] = useState({
		provider: '',
		quantity: '',
		amount: '',
	});
	const [showProviderModal, setShowProviderModal] = useState(false);

	const providers = [
		{
			label: 'WAEC Scratch Card',
		},
		{
			label: 'NECO Scratch Card',
		},
	];

	const handleBuy = async () => {
		try {
			if (!formData.provider) {
				throw new Error('Please select exam type');
			} else if (!formData.quantity) {
				throw new Error('Please input quantity');
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
			<Back title="Exam Pins" />
			<View className="flex-1">
				<View className="my-10">
					<Text className="text-3xl" fontWeight={600}>
						Exam Pins
					</Text>
					{/* <Text className="text-secondary mt-2 rounded-tl-2xl"></Text> */}
				</View>

				<View className="gap-y-5">
					<View>
						<View className="gap-y-5">
							<Text className="text-xl" fontWeight={700}>
								Exam type
							</Text>
							<TouchableOpacity
								onPress={() => setShowProviderModal(true)}
								className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							>
								<Text className="text-lg">
									{formData.provider || 'Select Exam Type'}
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

					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={700}>
							Quantity
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							inputMode="tel"
							maxLength={11}
							value={formData.quantity}
							onChangeText={text =>
								setFormData(prev => ({...prev, quantity: text}))
							}
							placeholder="Quantity"
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

export default Exam;
