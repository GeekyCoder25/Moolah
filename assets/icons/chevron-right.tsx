import * as React from 'react';
import type {SvgProps} from 'react-native-svg';
import Svg, {Path} from 'react-native-svg';
const ChevronRightIcon = (props: SvgProps) => (
	<Svg width={19} height={19} fill="none" {...props}>
		<Path
			stroke="#0D6EFD"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeMiterlimit={10}
			strokeWidth={1.5}
			d="m6.767 3.125 4.919 4.862c.58.574.586 1.519.012 2.1l-4.862 4.918"
		/>
	</Svg>
);
export default ChevronRightIcon;
