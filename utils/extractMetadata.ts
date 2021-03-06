import fs from "fs";
import { PostMetadata } from "../pages";

export const extractMetadata = async (): Promise<PostMetadata[]> => {
	const files = fs.readdirSync("./pages/blog");
	const paths = files.filter((filename) => filename.includes(".mdx"));
	const promiseMetadataArr = [];
	for (let i = 0; i < paths.length; i++) {
		const metadata = import(`../pages/blog/${paths[i]}`).then(
			(mod) => mod.metadata
		);
		promiseMetadataArr.push(metadata);
	}

	return Promise.all(promiseMetadataArr).then((value) => value);
};
