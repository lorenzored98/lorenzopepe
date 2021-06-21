import { Fragment } from "react";
import Head from "next/head";
import { Socials } from "../Components/Socials";
import { Emoji } from "../Components/Emoji";
import { LinkTo } from "../Components/LinkTo";

const About: React.FC = () => {
	return (
		<Fragment>
			<Head>
				<meta name="description" content="About Me" />
				<meta name="author" content="Lorenzo Pepe" />
				<meta
					name="keywords"
					content="Lorenzo Pepe, Frontend Developer, Web Developer, Italy, Freelance, React.js, Data Visualization, WebGL, Creative Coding"
				/>
				<title>About Me</title>
			</Head>
			<div className="about-title">
				<h2>
					Ciao! I'm Lorenzo{" "}
					<Emoji value="👋" description="Waving hand, hello" />
				</h2>
				<Socials />
			</div>
			<p>
				I'm a <strong>freelance front-end developer</strong> born
				and raised in Italy.
			</p>
			<p>
				I've been surfing the web since I was a child. This made me very
				passionate about <strong>user experience</strong> and{" "}
				<strong>accessibility</strong>.
			</p>
			<p>
				Most of my work has been on building{" "}
				<strong>web applications</strong> but I'm also experienced in
				coding beautiful interactive{" "}
				<strong>data visualizations</strong> and{" "}
				<strong>creative experiences</strong> powered by{" "}
				<LinkTo
					href="https://gl-experiments.vercel.app/"
					className="blog-link"
					label="Link to my webgl experiments website"
				>
					WebGL
				</LinkTo>
				.
			</p>
			<footer>
				<p>
					Feel free to reach out at{" "}
					<LinkTo
						href="mailto:info@lorenzopepe.dev"
						className="blog-link"
					>
						info@lorenzopepe.dev
					</LinkTo>
				</p>
			</footer>
		</Fragment>
	);
};

export default About;
