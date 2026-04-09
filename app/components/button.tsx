import {Text} from '@/components/text';
import React, {FC} from 'react';
import {ActivityIndicator, TouchableOpacity, View} from 'react-native';

interface ButtonProps {
	title: string;
	onPress: () => void;
	disabled?: boolean;
	className?: string;
	loading?: boolean;
}

const Button: FC<ButtonProps> = props => {
	const {disabled, loading, title, onPress, className} = props;

	return (
		<TouchableOpacity
			onPress={!disabled ? onPress : () => {}}
			disabled={disabled}
		>
			{loading ? (
				<ActivityIndicator color={'#FFFFFF'} />
			) : (
				<View
					className={`${
						disabled ? 'bg-[#313a66]' : 'bg-primary'
					} p-6 rounded-xl justify-center items-center ${className}`}
				>
					<Text className="text-white text-center text-xl font-semibold" noWrap>
						{title}
					</Text>
				</View>
			)}
		</TouchableOpacity>
	);
};

export default Button;
