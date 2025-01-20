import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';
const MoreIcon = (props: SvgProps) => (
	<Svg width={22} height={21} fill="none" {...props}>
		<Path
			fill={props.color || '#0D6EFD'}
			d="M.167 4.833A4.667 4.667 0 0 1 4.833.167H9.5V9.5H.167zM12.5.167h4.667a4.667 4.667 0 0 1 4.666 4.666V9.5H12.5zM.167 11.5H9.5v9.333H4.833a4.667 4.667 0 0 1-4.666-4.666zM12.5 11.5h9.333v4.667a4.667 4.667 0 0 1-4.666 4.666H12.5z"
		/>
	</Svg>
);
export default MoreIcon;
