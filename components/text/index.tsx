import React from 'react';
import {Text as RnText} from 'react-native';

import {TextProps} from './text.types';

export function Text(props: TextProps) {
	return (
		<RnText
			className={
				props.className +
				(props.className?.includes('font-') ? '' : ' font-medium')
			}
			numberOfLines={props.noWrap ? 1 : props.numberOfLines}
		>
			{props.children}
		</RnText>
	);
}
