import {Text} from '@/components/text';
import React, {FC} from 'react';
import {TouchableOpacity, View} from 'react-native';

interface ButtonProps {
	title: string;
	onPress: () => void;
	disabled?: boolean;
}

const Button: FC<ButtonProps> = props => {
	const {disabled, title, onPress} = props;

	return (
		<TouchableOpacity onPress={!disabled ? onPress : () => {}}>
			<View
				className={`${
					disabled ? 'bg-[#313a66]' : 'bg-primary'
				} p-6 rounded-xl justify-center`}
			>
				<Text className="text-white text-center text-xl" fontWeight={700}>
					{title}
				</Text>
			</View>
		</TouchableOpacity>
	);
};

export default Button;
