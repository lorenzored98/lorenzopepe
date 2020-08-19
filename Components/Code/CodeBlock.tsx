import Highlight, { defaultProps } from "prism-react-renderer";
import oneDarkPro from "../../themes/OneDarkProTheme";
import { FileInfo } from "./FileInfo";
import { extractPathFromCode } from "../../utils/paths";
import { linesToHighlight } from "../../utils/linesToHighlight";

interface CodeBlockProps {
	className: string;
	metastring: string;
	codeString: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
	codeString,
	className,
	metastring,
}) => {
	const language = className.replace("language-", "");
	const filePath = extractPathFromCode(codeString);
	const code = codeString.replace(`\`@@${filePath}@@\``, "").trim();
	const highlightLinesArr = linesToHighlight(metastring);
	return (
		<div className="code-wrapper">
			<FileInfo language={language} pathName={filePath} code={code} />
			<div className="code-scrollable">
				<Highlight
					{...defaultProps}
					code={code}
					language={language as any}
					theme={oneDarkPro as any}
				>
					{({ style, tokens, getLineProps, getTokenProps }) => (
						<pre
							className={className}
							style={{ ...style, padding: "20px" }}
						>
							{tokens.map((line, i) => (
								<div
									key={i}
									{...getLineProps({
										line,
										key: i,
										className:
											highlightLinesArr.indexOf(i) > -1
												? "highlight-line"
												: undefined,
									})}
								>
									<span
										style={{
											display: "inline-block",
											width: "2rem",
											userSelect: "none",
											opacity: 0.3,
										}}
									>
										{i + 1}
									</span>
									{line.map((token, key) => (
										<span
											key={key}
											{...getTokenProps({ token, key })}
										/>
									))}
								</div>
							))}
						</pre>
					)}
				</Highlight>
			</div>
		</div>
	);
};