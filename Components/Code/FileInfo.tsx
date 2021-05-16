import { useRef, useState } from "react";
import { LanguageToIcon } from "./LanguageToIcon";
import { Emoji } from "../Emoji";

interface FileInfoProps {
	language: string;
	pathName?: string;
}

// https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
function iOS() {
	return (
		[
			"iPad Simulator",
			"iPhone Simulator",
			"iPod Simulator",
			"iPad",
			"iPhone",
			"iPod",
		].includes(navigator.platform) ||
		// iPad on iOS 13 detection
		(navigator.userAgent.includes("Mac") && "ontouchend" in document)
	);
}

export const FileInfo: React.FC<FileInfoProps> = ({ language, pathName }) => {
	const copiedRef = useRef<boolean>(false);
	const [copyMessageRef, setCopyMessageRef] =
		useState<HTMLDivElement | null>(null);

	return (
		<div className="file-info">
			<div className={language} aria-label="File Language">
				<LanguageToIcon language={language} />
			</div>
			{pathName && <span aria-label="File Name">{pathName}</span>}
			<button
				onClick={(e) => {
					const test = extractCode(e.currentTarget);

					if (!copiedRef.current) {
						const textarea = document.createElement("textarea");
						textarea.style.fontSize = "16px";
						textarea.value = test;
						// prevent weird scrolling when focused
						textarea.readOnly = true;
						document.body.appendChild(textarea);
						if (iOS()) {
							const range = document.createRange();
							range.selectNodeContents(textarea);
							const selection = window.getSelection();
							if (selection) {
								selection.removeAllRanges();
								selection.addRange(range);
							}
							textarea.setSelectionRange(0, 999999);
						} else {
							textarea.select();
						}
						const copied = document.execCommand("copy");
						e.currentTarget.focus();
						document.body.removeChild(textarea);
						if (copied) {
							copiedRef.current = true;
							if (copyMessageRef) {
								showNotification(
									copyMessageRef,
									e.currentTarget.getBoundingClientRect()
								);
							}
							setTimeout(() => {
								copiedRef.current = false;
								if (copyMessageRef) {
									hideNotification(copyMessageRef);
								}
							}, 1200);
						}
					}
				}}
			>
				<svg viewBox="0 0 512 512">
					<title>Copy Code</title>
					<desc>Click here to copy</desc>
					<path d="M408,480H184a72,72,0,0,1-72-72V184a72,72,0,0,1,72-72H408a72,72,0,0,1,72,72V408A72,72,0,0,1,408,480Z" />
					<path d="M160,80H395.88A72.12,72.12,0,0,0,328,32H104a72,72,0,0,0-72,72V328a72.12,72.12,0,0,0,48,67.88V160A80,80,0,0,1,160,80Z" />
				</svg>
			</button>
			<CopyNotification setCopyMessageRef={setCopyMessageRef} />
		</div>
	);
};

interface CopyNotificationProps {
	setCopyMessageRef: React.Dispatch<
		React.SetStateAction<HTMLDivElement | null>
	>;
}

const extractCode = (target: HTMLButtonElement): string => {
	const elem = target.parentElement?.parentElement
		?.querySelector("pre")
		?.querySelector("code");

	if (!elem) return "";

	let code = "";

	for (let i = 0; i < elem.childNodes.length; i++) {
		const node = elem.childNodes[i];

		for (let j = 0; j < node.childNodes.length; j++) {
			const elem = node.childNodes[j] as HTMLElement;

			if (elem.className !== "line-number") {
				code += elem.innerText;
			}
		}
		code += "\n";
	}

	return code.trimEnd();
};

const CopyNotification: React.FC<CopyNotificationProps> = ({
	setCopyMessageRef,
}) => {
	return (
		<div
			ref={(elem) => setCopyMessageRef(elem)}
			className="copy-notification"
		>
			Copied <Emoji value="🎉" description="Copied With Success!" />
		</div>
	);
};

const showNotification = (
	elem: HTMLDivElement,
	positionBbox: DOMRect
): void => {
	let x = positionBbox.left + positionBbox.width / 2 - elem.clientWidth / 2;
	const y =
		positionBbox.top +
		positionBbox.height / 2 +
		window.scrollY -
		elem.clientHeight / 2;

	while (x + elem.clientWidth > window.innerWidth) {
		x -= 5;
	}

	// style
	elem.style.left = `${x}px`;
	elem.style.top = `${y}px`;
	elem.style.opacity = "1";

	if (y < window.scrollY + elem.clientHeight) {
		elem.style.transform = "translateY(100%)";
	} else {
		elem.style.transform = "translateY(-100%)";
	}

	// accessibility
	elem.removeAttribute("aria-hidden");
	elem.setAttribute("aria-label", "Code copied succesfully.");
	elem.setAttribute("role", "alert");
};

const hideNotification = (elem: HTMLDivElement): void => {
	// style
	elem.style.left = `$0px`;
	elem.style.top = `$0px`;
	elem.style.opacity = "0";
	elem.style.transform = "translateY(0%)";

	// accessibility
	elem.removeAttribute("role");
	elem.setAttribute("aria-hidden", "true");
};
