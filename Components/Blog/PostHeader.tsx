import { Fragment } from "react";
import Head from "next/head";
import { PostMetadata } from "../../pages";

interface PostHeaderProps {
	metadata: PostMetadata;
}

export const PostHeader: React.FC<PostHeaderProps> = ({ metadata }) => {
	const { title, description, tags, href, imageSrc, imageAlt } = metadata;

	return (
		<Fragment>
			<Head>
				<title>{title}</title>
				<meta name="description" content={description} />
				<meta name="author" content="Lorenzo Pepe" />
				<meta name="keywords" content={tags.join(" , ")} />
				{/* TWITTER */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:creator" content="@lorenzopepe98" />
				<meta name="twitter:title" content={title} />
				<meta name="twitter:description" content={description} />
				<meta property="twitter:image" content={imageSrc.src} />
				<meta property="twitter:image:alt" content={imageAlt} />

				{/* OPENGRAPH */}
				<meta property="og:title" content={title} />
				<meta property="og:type" content="website" />
				<meta
					property="og:url"
					content={`https://lorenzopepe.dev/blog${href}`}
				/>
				<meta property="og:image" content={imageSrc.src} />
			</Head>
			<header>
				<h1>{title}</h1>
			</header>
		</Fragment>
	);
};
