import {Text} from '@/components/text';
import React, {FC} from 'react';
import {TouchableOpacity, View} from 'react-native';

interface ButtonProps {
	title: string;
	onPress: () => void;
}

const Button: FC<ButtonProps> = props => {
	const {title, onPress} = props;
	return (
		<TouchableOpacity onPress={onPress}>
			<View className="bg-primary p-6 rounded-xl justify-center">
				<Text className="text-white text-center text-xl" fontWeight={700}>
					{title}
				</Text>
			</View>
		</TouchableOpacity>
	);
};

export default Button;
