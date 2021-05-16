import { FileInfo } from "./FileInfo";
import React, {
	Children,
	ReactNode,
	useRef,
	useState,
	useEffect,
	createElement,
	CSSProperties,
} from "react";
import { paramsFromMetastring } from "../../utils/code";

const Line: React.FC<{ highlight?: boolean }> = ({ highlight, children }) => (
	<div className={highlight ? "code-line highlighted" : "code-line"}>
		{children}
	</div>
);

const Number: React.FC = ({ children }) => (
	<span className="line-number">{children}</span>
);

interface CodeBlockWrapperProps {
	background: string;
	language: string;
	metastring: string;
}

const CodeBlockWrapper: React.FC<CodeBlockWrapperProps> = ({
	background,
	language,
	metastring,
	children,
}) => {
	const { numbered, linesHighlighted, filePath } =
		paramsFromMetastring(metastring);

	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		let observer: IntersectionObserver;
		if (typeof IntersectionObserver === "function") {
			observer = new IntersectionObserver(
				([entry]) => {
					const target = entry.target.querySelector(
						".code-scrollable code"
					) as HTMLElement;
					if (entry.isIntersecting) {
						target.style.display = "";
					} else {
						target.style.display = "none";
					}
				},
				{ rootMargin: "200px 0px 0px 0px" }
			);
			if (ref.current) {
				observer.observe(ref.current);
			}
		} else {
			if (ref.current) {
				const target = ref.current.querySelector(
					".code-scrollable code"
				) as HTMLElement;

				target.style.display = "";
			}
		}

		return () => {
			if (observer) {
				observer.disconnect();
			}
		};
	}, [ref]);

	return (
		<div className="code-wrapper" ref={ref}>
			<FileInfo
				language={language.replace("language-", "")}
				pathName={filePath}
			/>
			<StaticCodeBlockContent
				element="div"
				className="code-scrollable"
				style={{
					background: background.split(":")[1],
				}}
			>
				<CodeBlockContent
					numbered={numbered}
					linesHighlighted={linesHighlighted}
				>
					{children}
				</CodeBlockContent>
			</StaticCodeBlockContent>
		</div>
	);
};

interface CodeBlockContentProps {
	numbered: boolean;
	linesHighlighted: number[];
}

// Runs server only since it's wrapped around static component
const CodeBlockContent: React.FC<CodeBlockContentProps> = ({
	numbered,
	linesHighlighted,
	children,
}) => {
	// create arrays of arrays wit only spans inside
	const linesArr: ReactNode[][] = [[]];

	Children.forEach(children, (child) => {
		const index = linesArr.length - 1;

		if (typeof child === "string") {
			linesArr.push([]);
		} else {
			if (linesArr[index]) {
				linesArr[index].push(child);
			}
		}
	});

	// transform lines into divs > [span]
	const linesNodes = [];
	for (let i = 0; i < linesArr.length; i++) {
		const lineIndex = i + 1;
		const childs = numbered
			? [
					<Number key={`line-number-${lineIndex}`}>
						{lineIndex}
					</Number>,
					linesArr[i],
			  ]
			: linesArr[i];

		if (linesArr[i].length) {
			linesNodes.push(
				<Line
					key={`line-${lineIndex}`}
					highlight={linesHighlighted.indexOf(lineIndex) > -1}
				>
					{childs}
				</Line>
			);
		}
	}

	return (
		<pre
			style={{
				// Hacky at best
				height: linesNodes.length * 24 + "px",
			}}
		>
			<code style={{ display: "none" }}>{linesNodes}</code>
		</pre>
	);
};

// Try to enforce SSR only with this hack.
// // https://stackoverflow.com/questions/55393226/disable-hydration-only-partially-hydrate-a-next-js-app
interface StaticCodeBlockContent {
	element: string;
	className?: string;
	style?: CSSProperties;
}

const StaticCodeBlockContent: React.FC<StaticCodeBlockContent> = ({
	element,
	className,
	style,
	children,
}) => {
	const ref = useRef<HTMLElement | null>(null);
	const [render, setRender] = useState(typeof window === "undefined");

	useEffect(() => {
		const isEmpty = ref.current?.innerHTML === "";

		if (isEmpty) {
			setRender(true);
		}
	}, [ref]);

	if (render) {
		return createElement(element, { children, className, style });
	}

	return createElement(element, {
		className,
		ref,
		style,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: "" },
	});
};

export default CodeBlockWrapper;
