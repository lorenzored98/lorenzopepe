import NextImage from "next/image";
interface ImageData {
	src: StaticImageData;
	alt: string;
	width?: number;
	height?: number;
	quality?: number;
}

export const PostImage: React.FC<{ imageData: ImageData }> = ({
	imageData,
	children,
}) => {
	const { src, alt, width = 740, height = 400, quality = 75 } = imageData;

	return (
		<figure className="post-image">
			<div className="image-container">
				<NextImage
					src={src}
					alt={alt}
					layout="responsive"
					width={width}
					height={height}
					loading="lazy"
					className="article-image"
					decoding="async"
					quality={quality}
					placeholder="blur"
				/>
			</div>
			{children ? <figcaption>{children}</figcaption> : null}
		</figure>
	);
};
