import Back from '@/components/back';
import {Text} from '@/components/text';
import React from 'react';
import {View} from 'react-native';

const Card = () => {
	return (
		<View className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="Card" />
			<View className="my-20 justify-center items-center gap-y-2">
				<Text className="text-2xl font-semibold">Coming soon!!</Text>
				<Text>This service is coming soon</Text>
			</View>
		</View>
	);
};

export default Card;
