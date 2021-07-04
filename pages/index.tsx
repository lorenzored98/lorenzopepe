import Head from "next/head";
import { GetStaticProps } from "next";
import { Fragment } from "react";
import { PostPreview } from "../Components/Blog/PostPreview";
import { extractMetadata } from "../utils/extractMetadata";
interface IndexProps {
	postsMetadata: PostMetadata[];
}

const Index: React.FC<IndexProps> = ({ postsMetadata }) => {
	return (
		<Fragment>
			<Head>
				<title>Blog</title>
				<meta name="description" content="Lorenzo Pepe Blog" />
			</Head>
			<ul className="blog-post-list-preview">
				{postsMetadata
					.sort((a, b) => {
						if (a.timestamp < b.timestamp) {
							return 1;
						} else if (a.timestamp > b.timestamp) {
							return -1;
						} else {
							return 0;
						}
					})
					.map((d) => (
						<PostPreview key={d.timestamp} metadata={d}>
							{d.description}
						</PostPreview>
					))}
			</ul>
		</Fragment>
	);
};

export default Index;

export interface PostMetadata {
	tags: string[];
	timestamp: number;
	href: string;
	title: string;
	description: string;
	imageSrc: StaticImageData;
	imageAlt: string;
}

export const getStaticProps: GetStaticProps = async () => {
	const postsMetadata = await extractMetadata();

	return {
		props: {
			postsMetadata,
		},
	};
};
