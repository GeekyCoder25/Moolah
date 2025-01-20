import {TextInput, View} from 'react-native';
import React, {useState} from 'react';
import Back from '@/components/back';
import {Text} from '@/components/text';
import Button from './components/button';

const ChangePin = () => {
	const [formData, setFormData] = useState({
		old: '',
		new: '',
		confirm: '',
	});

	const handleChange = async () => {
		try {
		} catch (error: any) {
			alert(error.message);
		} finally {
		}
	};

	return (
		<View className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="Change Pin" />
			<View className="flex-1">
				<View className="gap-y-5 my-10">
					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={600}>
							Old Pin
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							value={formData.old}
							onChangeText={text => setFormData(prev => ({...prev, old: text}))}
							placeholder="Old pin"
							inputMode="numeric"
						/>
					</View>
					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={600}>
							New Pin
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							value={formData.new}
							onChangeText={text => setFormData(prev => ({...prev, new: text}))}
							placeholder="New pin"
							inputMode="numeric"
						/>
					</View>
					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={600}>
							Retype Pin
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							value={formData.confirm}
							onChangeText={text =>
								setFormData(prev => ({...prev, confirm: text}))
							}
							placeholder="Retype pin"
							inputMode="numeric"
						/>
					</View>
				</View>
			</View>
			<Button title="Change Pin" onPress={handleChange} />
		</View>
	);
};

export default ChangePin;
