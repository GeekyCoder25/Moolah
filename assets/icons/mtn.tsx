import * as React from 'react';
import Svg, {Circle, Ellipse, Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';
const MTNIcon = (props: SvgProps) => (
	<Svg width={50} height={50} fill="none" {...props}>
		<Circle cx={25} cy={25} r={25} fill="#FFF7DD" />
		<Circle cx={25} cy={25} r={15} fill="#FFD54F" />
		<Ellipse cx={25} cy={25.5} fill="#0E153A" rx={15} ry={8.5} />
		<Path
			fill="#fff"
			d="m16.129 29 1.207-5.71h2.023v4.054h.032l1.867-4.055h2.055L22.09 29h-1.371l.457-2.145a28 28 0 0 1 .387-1.59q.066-.23.093-.363h-.031L19.742 29h-1.445v-4.098h-.031l-.121.766q-.06.36-.114.668a18 18 0 0 1-.101.566L17.488 29zm11.687 0 1.207-5.71h1.778l1.117 3.839h.035q.02-.172.055-.438.039-.265.082-.539.047-.273.086-.472l.511-2.39h1.36L32.84 29h-1.778l-1.128-4.016h-.032q-.003.078-.023.27a18 18 0 0 1-.121.922q-.036.246-.078.441L29.176 29z"
		/>
		<Path
			fill="#FFD54F"
			d="m24.195 29 .926-4.45h-1.238l.27-1.26h4.015l-.277 1.26h-1.243L25.723 29z"
		/>
	</Svg>
);
export default MTNIcon;
