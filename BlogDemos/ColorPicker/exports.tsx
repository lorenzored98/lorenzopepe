import dynamic from "next/dynamic";
import { Demo, DemoLoading } from "../../Components/Blog/Demo";
import { StyledAlphaRange, StyledHueRange } from "./StyledRanges";
import { UnstyledRanges } from "./UnstyledRanges";

// move these into colorpicker folder at index.js and keep other code in named files
const ColorPicker = dynamic(
	() => import("./index").then((mod) => mod.ColorPicker as any),
	{
		ssr: false,
		loading: () => <DemoLoading />,
	}
);

export const ColorPickerDemo: React.FC = () => {
	return (
		<Demo
			height="407px"
			href="https://github.com/lorenzored98/lorenzopepe/blob/master/BlogDemos/ColorPicker/index.tsx"
		>
			<ColorPicker />
		</Demo>
	);
};

export const UnstyledRangesDemo: React.FC = () => {
	return (
		<Demo
			height="200px"
			href="https://github.com/lorenzored98/lorenzopepe/blob/master/BlogDemos/ColorPicker/UnstyledRanges.tsx"
		>
			<UnstyledRanges />
		</Demo>
	);
};

export const StyledHueRangeDemo: React.FC = () => {
	return (
		<Demo
			height="100px"
			href="https://github.com/lorenzored98/lorenzopepe/blob/master/BlogDemos/ColorPicker/StyledRanges.tsx#L4"
		>
			<StyledHueRange />
		</Demo>
	);
};

export const StyledAlphaRangeDemo: React.FC = () => {
	return (
		<Demo
			height="100px"
			href="https://github.com/lorenzored98/lorenzopepe/blob/master/BlogDemos/ColorPicker/StyledRanges.tsx#L36"
		>
			<StyledAlphaRange />
		</Demo>
	);
};
