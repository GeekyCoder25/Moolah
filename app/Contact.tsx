import {View} from 'react-native';
import React from 'react';
import {Text} from '@/components/text';
import Back from '@/components/back';

const Contact = () => {
	return (
		<View className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="Contact" />
			<Text>Contact</Text>
		</View>
	);
};

export default Contact;
