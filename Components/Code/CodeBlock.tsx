import { FileInfo } from "./FileInfo";
import React, {
	Children,
	ReactNode,
	ReactElement,
	useRef,
	useState,
	useEffect,
	createElement,
	Fragment,
	CSSProperties,
} from "react";
import { paramsFromMetastring } from "../../utils/code";

interface CodeBlockProps {
	background: string;
	language: string;
	metastring: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
	background,
	language,
	metastring,
	children,
}) => {
	const { numbered, linesHighlighted, filePath } =
		paramsFromMetastring(metastring);

	// extract code from nodes ?
	let code = "";

	// create arrays of arrays wit only spans inside
	const linesArr: ReactNode[][] = [[]];

	Children.forEach(children, (child) => {
		const index = linesArr.length - 1;

		if (typeof child === "string") {
			linesArr.push([]);
			// add to code
			code += child;
		} else {
			if (linesArr[index]) {
				linesArr[index].push(child);
			}

			// add content to code
			if (child && typeof child === "object") {
				code += (child as ReactElement).props.children;
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

		linesNodes.push(
			<Line
				key={`line-${lineIndex}`}
				highlight={linesHighlighted.indexOf(lineIndex) > -1}
			>
				{childs}
			</Line>
		);
	}

	return (
		<Fragment>
			{/* <FileInfo
				language={language.replace("language-", "")}
				code={code}
				pathName={filePath}
			/> */}
			<div
				className="code-scrollable"
				style={{ background: background.split(":")[1] }}
			>
				<pre>
					<code>{linesNodes}</code>
				</pre>
			</div>
		</Fragment>
	);
};

const StaticCodeBlock: React.FC<CodeBlockProps> = (props) => {
	return (
		<StaticContent element="div" className="code-wrapper">
			<CodeBlock {...props} />
		</StaticContent>
	);
};

const Line: React.FC<{ highlight?: boolean }> = ({ highlight, children }) => (
	<div className={highlight ? "code-line highlighted" : "code-line"}>
		{children}
	</div>
);

const Number: React.FC = ({ children }) => (
	<span className="line-number">{children}</span>
);

// Try to enforce SSR only with this hack.

// Otherwise calc height for lines + line size which is fixed even on low vieport.
// And set it + add intersection observer to load the content, maybe cached to avoid loading multiple times ?
// but still removing it from the dom if not seen

// Hack to get ssr only generated component
// // https://stackoverflow.com/questions/55393226/disable-hydration-only-partially-hydrate-a-next-js-app
interface StaticContentProps {
	element: string;
	className?: string;
}

const StaticContent: React.FC<StaticContentProps> = ({
	children,
	element = "fragment",
	className,
}) => {
	const ref = useRef<HTMLElement | null>(null);
	const [render, setRender] = useState(typeof window === "undefined");

	useEffect(() => {
		const isEmpty = ref.current?.innerHTML === "";

		if (isEmpty) {
			setRender(true);
		}
	}, []);

	if (render) {
		return createElement(element, { children, className });
	}

	return createElement(element, {
		className,
		ref,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: "" },
	});
};

// Have the hook on here to have the content stored on a ref
// So i can use the interesection observer better

// New
// The idea is to render the code scrollable only ssr
// And the copy code btn will generate on the fly the content to copy by parsing the dom

// Static content prendera la ref dal genitore

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

	// useEffect(() => {}, []);

	return null;

	return (
		<div className="code-wrapper">
			<FileInfo
				language={language.replace("language-", "")}
				pathName={filePath}
			/>
			<StaticCodeBlockContent
				element="div"
				className="code-scrollable"
				style={{
					background: background.split(":")[1],
					// display: "none",
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
	console.log("server");

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

		linesNodes.push(
			<Line
				key={`line-${lineIndex}`}
				highlight={linesHighlighted.indexOf(lineIndex) > -1}
			>
				{childs}
			</Line>
		);
	}
	return (
		<pre>
			<code>{linesNodes}</code>
		</pre>
	);
};

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
