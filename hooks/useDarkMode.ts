import { useState, useEffect } from "react";

type ReturnProps = [
	boolean | undefined,
	React.Dispatch<React.SetStateAction<boolean | undefined>>
];

export const useDarkMode = (): ReturnProps => {
	const [darkMode, setDarkMode] = useState<boolean | undefined>(undefined);

	useEffect(() => {
		if (darkMode !== undefined) {
			if (darkMode) {
				document.documentElement.setAttribute("data-theme", "dark");
			} else {
				document.documentElement.setAttribute("data-theme", "light");
			}
			setLocalStorageDarkMode(darkMode);
		}
	}, [darkMode]);

	useEffect(() => {
		let darkModeVal = getLocalStorageDarkMode();
		if (
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches
		) {
			if (darkModeVal === null) {
				darkModeVal = true;
			}
		}

		setDarkMode(!!darkModeVal);
	}, []);

	return [darkMode, setDarkMode];
};

const getLocalStorageDarkMode = (): true | null => {
	const darkMode = window.localStorage.getItem("dark-mode");
	return darkMode ? true : null;
};

const setLocalStorageDarkMode = (isDark: boolean): void => {
	if (isDark) {
		window.localStorage.setItem("dark-mode", "dark-mode-active");
	} else {
		window.localStorage.removeItem("dark-mode");
	}
};
