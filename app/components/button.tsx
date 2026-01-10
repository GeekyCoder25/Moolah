import {Text} from '@/components/text';
import React, {FC} from 'react';
import {TouchableOpacity, View} from 'react-native';

interface ButtonProps {
	title: string;
	onPress: () => void;
	disabled?: boolean;
	className?: string;
}

const Button: FC<ButtonProps> = props => {
	const {disabled, title, onPress, className} = props;

	return (
		<TouchableOpacity
			onPress={!disabled ? onPress : () => {}}
			disabled={disabled}
		>
			<View
				className={`${
					disabled ? 'bg-[#313a66]' : 'bg-primary'
				} p-6 rounded-xl justify-center ${className}`}
			>
				<Text className="text-white text-center text-xl font-bold">
					{title}
				</Text>
			</View>
		</TouchableOpacity>
	);
};

export default Button;
