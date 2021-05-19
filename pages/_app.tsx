import { AppProps } from "next/app";
import { useEffect } from "react";
import { MDXProvider } from "@mdx-js/react";
import { useRouter } from "next/router";
import { Navbar } from "../Components/Navbar";
import CodeBlock from "../Components/Code/CodeBlock";
import { getContentPath } from "../utils/paths";
import { LinkTo } from "../Components/LinkTo";

import "../styles/main.scss";

const mdxComponents = {
	pre: (props: any) => (
		<CodeBlock
			background={props.style.background}
			language={props.children.props.className}
			metastring={props.children.props.metastring}
		>
			{props.children.props.children}
		</CodeBlock>
	),
	a: (props: any) => {
		return (
			<LinkTo href={props.href} className="blog-link">
				{props.children}
			</LinkTo>
		);
	},
	inlineCode: (props: any) => (
		<code className="inline-code">{props.children}</code>
	),
	h2: (props: any) => {
		const id = props.children.replace(/\s/g, "-");
		return (
			<h2 id={`${id}`}>
				<a href={`#${id}`}>{props.children}</a>
			</h2>
		);
	},
	h3: (props: any) => {
		const id = props.children.replace(/\s/g, "-");
		return (
			<h3 id={`${id}`}>
				<a href={`#${id}`}>{props.children}</a>
			</h3>
		);
	},
};

const App: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
	const router = useRouter();
	const contentPath = getContentPath(router.pathname);

	// disable focus ring when using mouse / touch
	useEffect(() => {
		window.addEventListener("pointerdown", isUsingMouse);
		window.addEventListener("touchstart", isUsingMouse);
		window.addEventListener("keydown", isUsingKeyboard);

		return () => {
			window.removeEventListener("pointerdown", isUsingMouse);
			window.removeEventListener("touchstart", isUsingMouse);
			window.removeEventListener("keydown", isUsingKeyboard);
		};
	}, []);

	return (
		<MDXProvider components={mdxComponents}>
			{contentPath !== "missing" && <Navbar contentPath={contentPath} />}
			<main className={`main-${contentPath}`}>
				<Component {...pageProps} />
			</main>
		</MDXProvider>
	);
};

export default App;

const isUsingMouse = (): void => {
	document.body.classList.add("mouse");
};

const isUsingKeyboard = (): void => {
	document.body.classList.remove("mouse");
};
