import {View} from 'react-native';
import React from 'react';
import Back from '@/components/back';

const Notification = () => {
	return (
		<View className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="Notification" />
			<View className="gap-y-5 my-20"></View>
		</View>
	);
};

export default Notification;
