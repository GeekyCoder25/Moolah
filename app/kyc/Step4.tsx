import SuccessIcon from '@/assets/icons/success';
import {router} from 'expo-router';
import React from 'react';
import {Text, View} from 'react-native';
import Button from '../components/button';

const Step4 = () => {
	const handleContinue = () => {
		router.dismissAll();
	};

	return (
		<View className="flex-1">
			<View className="flex-1 justify-center items-center gap-y-10">
				<SuccessIcon />
				<Text className="font-bold text-2xl">Verification successful</Text>
			</View>
			<View className="px-[5%] my-10">
				<Button title="Continue" onPress={handleContinue} />
			</View>
		</View>
	);
};

export default Step4;
