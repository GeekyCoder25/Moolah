import React from 'react';
import {TextStyle} from 'react-native';

export interface TextProps {
	children: React.ReactNode;
	className?: string;
	style?: TextStyle;
	noWrap?: boolean;
	center?: boolean;
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
	color?: string;
	fontFamily?: 'plusJakartaSans';
	fontWeight?:
		| 'regular'
		| 'medium'
		| 'light'
		| 'bold'
		| 300
		| 400
		| 500
		| 600
		| 700
		| 800
		| 900;
}
