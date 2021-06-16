// eslint-disable-next-line @typescript-eslint/no-var-requires
const rehypeShiki = require("rehype-shiki");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withMDX = require("@next/mdx")({
	extension: /\.mdx?$/,
	options: {
		rehypePlugins: [
			[
				rehypeShiki,
				{
					theme: "./utils/material-theme-palenight.json",
					useBackground: true,
				},
			],
		],
	},
});

module.exports = withBundleAnalyzer(
	withMDX({
		pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
		async redirects() {
			return [
				{
					source: "/blog",
					destination: "/",
					permanent: true,
				},
			];
		}
	}),
	
);
