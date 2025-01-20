import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';
const ElectricityIcon = (props: SvgProps) => (
	<Svg width={24} height={25} fill="none" {...props}>
		<Path
			fill="#0D6EFD"
			d="M15.59 5.5h-.34v-3c0-.41-.34-.75-.75-.75s-.75.34-.75.75v3h-3.5v-3c0-.41-.34-.75-.75-.75s-.75.34-.75.75v3h-.34c-1.05 0-1.91.86-1.91 1.91v5.09c0 2.2 1.5 4 4 4h.75v6c0 .41.34.75.75.75s.75-.34.75-.75v-6h.75c2.5 0 4-1.8 4-4V7.41c0-1.05-.86-1.91-1.91-1.91"
		/>
	</Svg>
);
export default ElectricityIcon;
