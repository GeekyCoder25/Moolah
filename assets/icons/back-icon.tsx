import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';
const BackIcon = (props: SvgProps) => (
	<Svg width={18} height={18} fill="none" {...props}>
		<Path
			stroke="#0D6EFD"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeMiterlimit={10}
			strokeWidth={1.5}
			d="m11.25 14.94-4.89-4.89a1.49 1.49 0 0 1 0-2.1l4.89-4.89"
		/>
	</Svg>
);
export default BackIcon;
