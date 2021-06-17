import * as React from "react";
import {
	fillCanvas,
	getPointerPosition,
	hexToHsv,
	hsvToHex,
	hsvToHsl,
	hsvToRgb,
	rgbToHsv,
	toColorInput,
	validateStartColor,
} from "./utils";

import style from "./index.module.scss";

interface ColorPickerProps {
	onChange?: (color: string) => void;
	startColor?: string;
}

export type Color = {
	hue: number;
	saturation: number;
	value: number;
	alpha: number;
};

export const ColorPicker: React.FC<ColorPickerProps> = ({
	onChange,
	startColor,
}) => {
	const [color, setColor] = React.useState<Color>(() =>
		validateStartColor(startColor)
	);

	React.useEffect(() => {
		if (onChange) {
			const hex = hsvToHex(
				color.hue,
				color.saturation,
				color.value,
				color.alpha
			);
			if (hex) {
				onChange("#" + hex);
			}
		}
	}, [color, onChange]);

	const { r, g, b } = hsvToRgb(color.hue, color.saturation, color.value);

	return (
		<div className={style.color_picker}>
			<div className={style.range_inputs_container}>
				<GradientCanvas color={color} setColor={setColor} />
				<HueRangeInput
					hue={color.hue}
					setHue={(h: number) => setColor({ ...color, hue: h })}
				/>
				<AlphaRangeInput
					color={color}
					setAlpha={(a: number) => setColor({ ...color, alpha: a })}
				/>
			</div>
			<div className={style.color_info}>
				<div
					className={style.color_preview}
					style={{
						backgroundColor: `rgba(${r},${g},${b}, ${color.alpha}`,
					}}
				></div>
				<RGBInput color={color} setColor={setColor} />
				<HSVInput color={color} setColor={setColor} />
				<HSLInput color={color} setColor={setColor} />
				<HEXInput color={color} setColor={setColor} />
			</div>
		</div>
	);
};

/**
 *
 *
 *
 *
 *
 */

interface ChildInputProps {
	color: Color;
	setColor: (c: Color) => void;
}

const GradientCanvas: React.FC<ChildInputProps> = ({ color, setColor }) => {
	const [size, setSize] = React.useState<DOMRect | null>(null);
	const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);
	const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

	const { hue, saturation, value, alpha } = color;

	const canvasCursorSize = 20;
	const cursorX = size ? (saturation / 100) * size.width : 0;
	const cursorY = size ? size.height - (value / 100) * size.height : 0;

	const ref = React.useCallback((node: HTMLCanvasElement | null) => {
		if (node !== null) {
			setSize(node.getBoundingClientRect());
			ctxRef.current = node.getContext("2d");
			canvasRef.current = node;
		}
	}, []);

	React.useEffect(() => {
		if (size && ctxRef.current) {
			const { r, g, b } = hsvToRgb(hue, 100, 100);
			fillCanvas(
				ctxRef.current,
				`rgba(${r}, ${g}, ${b}, ${alpha})`,
				size.width,
				size.height
			);
		}
	}, [size, hue, alpha]);

	// non passive listener for ios that does not support pointer events
	React.useEffect(() => {
		const touchMove = (e: globalThis.TouchEvent) => {
			e.preventDefault();
			if (!size) return;
			const [x, y] = getPointerPosition(
				size,
				e.touches[0].clientX,
				e.touches[0].clientY
			);

			setColor({
				hue,
				saturation: (x / size.width) * 100,
				value: 100 - (y / size.height) * 100,
				alpha,
			});
		};

		canvasRef.current?.addEventListener("touchmove", touchMove, {
			passive: false,
		});

		return () => {
			canvasRef.current?.removeEventListener(
				"touchmove",
				touchMove as any
			);
		};
	}, [hue, alpha, size, setColor]);

	return (
		<div className={style.gradient_canvas_container}>
			<div className={style.canvas_bg_checkered} />
			<canvas
				ref={ref}
				width={size?.width}
				height={size?.height}
				onKeyDown={(e) => {
					// don't prevent default here or it may mess up tabbing ecc..
					if (e.key === "ArrowUp") {
						e.preventDefault();
						setColor({
							...color,
							value: Math.min(value + 1, 100),
						});
					} else if (e.key === "ArrowDown") {
						e.preventDefault();
						setColor({
							...color,
							value: Math.max(value - 1, 0),
						});
					} else if (e.key === "ArrowLeft") {
						e.preventDefault();
						setColor({
							...color,
							saturation: Math.max(saturation - 1, 0),
						});
					} else if (e.key === "ArrowRight") {
						e.preventDefault();
						setColor({
							...color,
							saturation: Math.min(saturation + 1, 100),
						});
					}
				}}
				onPointerDown={(e) => {
					const bbox = e.currentTarget.getBoundingClientRect();
					e.currentTarget.setPointerCapture(e.pointerId);

					const [x, y] = getPointerPosition(
						bbox,
						e.clientX,
						e.clientY
					);

					setColor({
						hue,
						saturation: (x / bbox.width) * 100,
						value: 100 - (y / bbox.height) * 100,
						alpha,
					});

					setSize(bbox);
				}}
				onPointerMove={(e) => {
					if (!size) return;
					if (e.buttons === 1) {
						const [x, y] = getPointerPosition(
							size,
							e.clientX,
							e.clientY
						);

						setColor({
							hue,
							saturation: (x / size.width) * 100,
							value: 100 - (y / size.height) * 100,
							alpha,
						});
					}
				}}
				onTouchStart={(e) => {
					const bbox = e.currentTarget.getBoundingClientRect();

					const [x, y] = getPointerPosition(
						bbox,
						e.touches[0].clientX,
						e.touches[0].clientY
					);
					setColor({
						hue,
						saturation: (x / bbox.width) * 100,
						value: 100 - (y / bbox.height) * 100,
						alpha,
					});

					setSize(bbox);
				}}
				tabIndex={0}
			/>
			<div
				className={style.canvas_cursor}
				style={{
					width: `${canvasCursorSize}px`,
					height: `${canvasCursorSize}px`,
					transform: `translate(${cursorX - canvasCursorSize / 2}px,${
						cursorY - canvasCursorSize / 2
					}px)`,
				}}
			>
				<div />
			</div>
		</div>
	);
};

/**
 *
 *
 *
 *
 *
 */

interface HueRangeInputProps {
	hue: number;
	setHue: (h: number) => void;
}

const HueRangeInput: React.FC<HueRangeInputProps> = ({ hue, setHue }) => {
	const inputRef = React.useRef<HTMLInputElement | null>(null);

	React.useEffect(() => {
		if (inputRef.current) {
			inputRef.current.style.setProperty(
				"--thumb-color",
				`hsl(${hue}, 100%, 50%)`
			);
		}
	}, [hue]);

	return (
		<input
			aria-label="Hue"
			className={style.hue_range_input}
			type="range"
			min={0}
			max={360}
			ref={inputRef}
			value={hue}
			onChange={(e) => {
				setHue(Number(e.target.value));
			}}
		/>
	);
};

/**
 *
 *
 *
 *
 *
 */

interface AlphaRangeInputProps {
	color: Color;
	setAlpha: (a: number) => void;
}

const AlphaRangeInput: React.FC<AlphaRangeInputProps> = ({
	color,
	setAlpha,
}) => {
	const inputRef = React.useRef<HTMLInputElement | null>(null);

	React.useEffect(() => {
		if (inputRef.current) {
			const { hue, saturation, lightness } = hsvToHsl(
				color.hue,
				color.saturation,
				color.value
			);
			inputRef.current.style.setProperty(
				"--thumb-color",
				`hsla(${hue}, ${saturation}%, ${lightness}%, ${color.alpha})`
			);
		}
	}, [color]);

	const { r, g, b } = hsvToRgb(color.hue, color.saturation, color.value);

	return (
		<div className={style.alpha_background_checkered}>
			<input
				aria-label="Alpha"
				className={style.alpha_range_input}
				type="range"
				min={0}
				max={1}
				step={0.01}
				ref={inputRef}
				value={color.alpha}
				onChange={(e) => {
					setAlpha(Number(e.target.value));
				}}
				style={{
					background: `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0) 0%, rgb(${r}, ${g}, ${b}, 1) 100%)`,
				}}
			/>
		</div>
	);
};

/**
 *
 *
 *
 *
 *
 */

const RGBInput: React.FC<ChildInputProps> = ({ color, setColor }) => {
	const { r, g, b } = hsvToRgb(color.hue, color.saturation, color.value);
	return (
		<fieldset>
			<legend>RGB</legend>

			<input
				aria-label="Rgb red"
				type="number"
				inputMode="numeric"
				min={0}
				max={255}
				value={toColorInput(r)}
				onChange={(e) => {
					let val = Number(e.target.value) || 0;
					if (val > 255) val = 255;
					const hsv = rgbToHsv(val, g, b);
					setColor({
						hue: hsv.hue,
						saturation: hsv.saturation,
						value: hsv.value,
						alpha: color.alpha,
					});
				}}
			/>

			<input
				aria-label="Rgb green"
				type="number"
				inputMode="numeric"
				min={0}
				max={255}
				value={toColorInput(g)}
				onChange={(e) => {
					let val = Number(e.target.value) || 0;
					if (val > 255) val = 255;
					const hsv = rgbToHsv(r, val, b);
					setColor({
						hue: hsv.hue,
						saturation: hsv.saturation,
						value: hsv.value,
						alpha: color.alpha,
					});
				}}
			/>

			<input
				aria-label="Rgb blue"
				type="number"
				inputMode="numeric"
				min={0}
				max={255}
				value={toColorInput(b)}
				onChange={(e) => {
					let val = Number(e.target.value) || 0;
					if (val > 255) val = 255;
					const hsv = rgbToHsv(r, g, val);
					setColor({
						hue: hsv.hue,
						saturation: hsv.saturation,
						value: hsv.value,
						alpha: color.alpha,
					});
				}}
			/>

			<AlphaInput
				alpha={color.alpha}
				setAlpha={(a) => setColor({ ...color, alpha: a })}
			/>
		</fieldset>
	);
};

/**
 *
 *
 *
 *
 *
 */

const HSVInput: React.FC<ChildInputProps> = ({ color, setColor }) => {
	return (
		<fieldset>
			<legend>HSV</legend>

			<input
				aria-label="HSV Hue"
				type="number"
				inputMode="numeric"
				min={0}
				max={360}
				value={toColorInput(color.hue)}
				onChange={(e) => {
					let val = Number(e.target.value) || 0;
					if (val > 360) val = 360;
					setColor({
						...color,
						hue: val,
					});
				}}
			/>

			<input
				aria-label="HSV Saturation"
				type="number"
				inputMode="numeric"
				min={0}
				max={100}
				value={toColorInput(color.saturation)}
				onChange={(e) => {
					let val = Number(e.target.value) || 0;
					if (val > 100) val = 100;
					setColor({
						...color,
						saturation: val,
					});
				}}
			/>

			<input
				aria-label="HSV Value"
				type="number"
				inputMode="numeric"
				min={0}
				max={100}
				value={toColorInput(color.value)}
				onChange={(e) => {
					let val = Number(e.target.value) || 0;
					if (val > 100) val = 100;
					setColor({
						...color,
						value: val,
					});
				}}
			/>

			<AlphaInput
				alpha={color.alpha}
				setAlpha={(a) => setColor({ ...color, alpha: a })}
			/>
		</fieldset>
	);
};

/**
 *
 *
 *
 *
 *
 */

const HSLInput: React.FC<ChildInputProps> = ({ color, setColor }) => {
	const { hue, saturation, lightness } = hsvToHsl(
		color.hue,
		color.saturation,
		color.value
	);

	return (
		<fieldset>
			<legend>HSL</legend>
			<input
				aria-label="HSL Hue"
				type="number"
				inputMode="numeric"
				min={0}
				max={360}
				value={toColorInput(hue)}
				onChange={(e) => {
					let val = Number(e.target.value) || 0;
					if (val > 360) val = 360;
					setColor({
						...color,
						hue: val,
					});
				}}
			/>

			<input
				aria-label="HSL Saturation"
				type="number"
				inputMode="numeric"
				min={0}
				max={100}
				value={toColorInput(saturation)}
				onChange={(e) => {
					let val = Number(e.target.value) || 0;
					if (val > 100) val = 100;
					const hsv = rgbToHsv(color.hue, val, color.value);
					setColor({
						hue: hsv.hue,
						saturation: hsv.saturation,
						value: hsv.value,
						alpha: color.alpha,
					});
				}}
			/>

			<input
				aria-label="HSL Lightness"
				type="number"
				inputMode="numeric"
				min={0}
				max={100}
				value={toColorInput(lightness)}
				onChange={(e) => {
					let val = Number(e.target.value) || 0;
					if (val > 100) val = 100;
					const hsv = rgbToHsv(color.hue, color.saturation, val);
					setColor({
						hue: hsv.hue,
						saturation: hsv.saturation,
						value: hsv.value,
						alpha: color.alpha,
					});
				}}
			/>

			<AlphaInput
				alpha={color.alpha}
				setAlpha={(a) => setColor({ ...color, alpha: a })}
			/>
		</fieldset>
	);
};

interface AlphaInputProps {
	alpha: number;
	setAlpha: (a: number) => void;
}

const AlphaInput: React.FC<AlphaInputProps> = ({ alpha, setAlpha }) => {
	return (
		<input
			aria-label="Alpha"
			type="number"
			inputMode="decimal"
			step={0.01}
			min={0}
			max={1}
			value={
				alpha !== 0 ? Number(alpha.toString().replace(/^0+/, "")) : 0
			}
			onChange={(e) => {
				const val = Number(e.target.value);
				setAlpha(val);
			}}
		/>
	);
};

/**
 *
 *
 *
 *
 *
 */

const HEXInput: React.FC<ChildInputProps> = ({ color, setColor }) => {
	const hex = hsvToHex(color.hue, color.saturation, color.value, color.alpha);
	const [hexInputValue, setHexInputValue] = React.useState(hex);
	const focusRef = React.useRef(false);

	return (
		<div>
			<label htmlFor="hex-input">HEX</label>
			<div>
				<span>#</span>
				<input
					id="hex-input"
					aria-label="Hex color"
					onFocus={() => {
						focusRef.current = true;
						setHexInputValue(hex);
					}}
					onBlur={() => {
						// check that hex is valid
						if (!hexInputValue.trim() || hexInputValue !== hex) {
							setColor(color);
						}

						focusRef.current = false;
						setHexInputValue(hex);
					}}
					value={focusRef.current ? hexInputValue : hex}
					type="string"
					onChange={(e) => {
						if (e.target.value.length > 8) {
							return;
						}

						setHexInputValue(e.target.value);

						const newHsv = hexToHsv(e.target.value);
						if (newHsv) {
							setColor({ ...newHsv });
						}
					}}
				/>
			</div>
		</div>
	);
};
