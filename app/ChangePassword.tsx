import {TextInput, View} from 'react-native';
import React, {useState} from 'react';
import Back from '@/components/back';
import {Text} from '@/components/text';
import Button from './components/button';

const ChangePassword = () => {
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
			<Back title="Change Password" />
			<View className="flex-1">
				<View className="gap-y-5 my-10">
					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={600}>
							Old Password
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							value={formData.old}
							onChangeText={text => setFormData(prev => ({...prev, old: text}))}
							placeholder="Old password"
						/>
					</View>
					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={600}>
							New Password
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							value={formData.new}
							onChangeText={text => setFormData(prev => ({...prev, new: text}))}
							placeholder="New password"
						/>
					</View>
					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={600}>
							Retype Password
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							value={formData.confirm}
							onChangeText={text =>
								setFormData(prev => ({...prev, confirm: text}))
							}
							placeholder="Retype password"
						/>
					</View>
				</View>
			</View>
			<Button title="Change Password" onPress={handleChange} />
		</View>
	);
};

export default ChangePassword;
