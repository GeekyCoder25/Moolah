/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Text as RnText} from 'react-native';

import {globalFonts} from '@/styles';
import {TextProps} from './text.types';

export function Text(props: TextProps) {
	return (
		<RnText
			className={props.className || ''}
			style={[
				{
					fontFamily:
						globalFonts[props?.fontFamily || 'plusJakartaSans'][
							props.fontWeight || 'medium'
						],
				},
			]}
			numberOfLines={props.noWrap ? 1 : undefined}
		>
			{props.children}
		</RnText>
	);
}
