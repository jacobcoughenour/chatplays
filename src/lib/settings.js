// todo use a store

/**
 * @param {string} game
 */
export function loadGameSettings(game) {
	const settings = localStorage.getItem("gameSettings");
	if (settings) {
		const parsed = JSON.parse(settings);
		return parsed[game];
	} else {
		return null;
	}
}

/**
 * @param {string | number} game
 * @param {any} settings
 */
export function saveGameSettings(game, settings) {
	const stored = localStorage.getItem("gameSettings");
	/** @type {Record<string,any>} */
	let parsed = {};
	if (stored) {
		parsed = JSON.parse(stored);
	}
	parsed[game] = settings;
	localStorage.setItem("gameSettings", JSON.stringify(parsed));
}
