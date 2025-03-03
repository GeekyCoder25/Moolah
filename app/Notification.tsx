import {View} from 'react-native';
import React from 'react';
import Back from '@/components/back';
import {Text} from 'react-native';

const Notification = () => {
	return (
		<View className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="Notification" />
			<View className="gap-y-5 my-20">
				<Text className="text-2xl text-center">
					You have no new notifications at this time
				</Text>
			</View>
		</View>
	);
};

export default Notification;
