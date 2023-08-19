const plugin = require("tailwindcss/plugin");
const {
	themeFromSourceColor,
	argbFromHex,
	hexFromArgb
} = require("@importantimport/material-color-utilities");
const Color = require("color");

const brandColor = "#5d9684";

const theme = themeFromSourceColor(argbFromHex(brandColor), [
	{
		name: "warning",
		value: argbFromHex("#f7ae00"),
		blend: true
	},
	{
		name: "success",
		value: argbFromHex("#28b461"),
		blend: true
	},
	{
		name: "favorite",
		value: argbFromHex("#ff0000"),
		blend: true
	}
]);
const defaultMode = "dark";

const surfaceElevations = [0.05, 0.08, 0.11, 0.12, 0.14];
const toneStops = [0, 1, 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];
const surfaceColor = {
	DEFAULT: new Color(hexFromArgb(theme.schemes[defaultMode].surface)),
	light: new Color(hexFromArgb(theme.schemes.light.surface)),
	dark: new Color(hexFromArgb(theme.schemes.dark.surface))
};
const primaryColor = {
	DEFAULT: new Color(hexFromArgb(theme.schemes[defaultMode].primary)),
	light: new Color(hexFromArgb(theme.schemes.light.primary)),
	dark: new Color(hexFromArgb(theme.schemes.dark.primary))
};
const surfaceTones = {
	keys: [
		"Dim",
		"Bright",
		"ContainerLowest",
		"ContainerLow",
		"Container",
		"ContainerHigh",
		"ContainerHighest"
	],
	dark: [6, 24, 4, 10, 12, 17, 22],
	light: [87, 98, 100, 96, 94, 92, 90]
};

const colors = Object.fromEntries([
	// generate the colors from the theme.
	...Object.keys(theme.schemes.light.props).map((key) => [
		key,
		{
			DEFAULT: hexFromArgb(theme.schemes[defaultMode][key]),
			light: hexFromArgb(theme.schemes.light[key]),
			dark: hexFromArgb(theme.schemes.dark[key]),
			...(theme.palettes[key]
				? Object.fromEntries(toneStops.map((e) => [e, hexFromArgb(theme.palettes[key].tone(e))]))
				: {})
		}
	]),
	...theme.customColors.reduce(
		(acc, e) =>
			acc.concat(
				Object.keys(e.light).map((key) => [
					`${key.replace(/[cC]olor/, e.color.name)}`,
					{
						DEFAULT: hexFromArgb(e[defaultMode][key]),
						light: hexFromArgb(e.light[key]),
						dark: hexFromArgb(e.dark[key])
					}
				])
			),
		[]
	),
	...surfaceTones.keys.map((key, i) => [
		`surface${key}`,
		{
			DEFAULT: hexFromArgb(theme.palettes.neutral.tone(surfaceTones[defaultMode][i])),
			light: hexFromArgb(theme.palettes.neutral.tone(surfaceTones.light[i])),
			dark: hexFromArgb(theme.palettes.neutral.tone(surfaceTones.dark[i]))
		}
	]),
	// generate the surface tones.
	// https://m3.material.io/styles/color/the-color-system/color-roles#0abbf8b7-61e1-49ee-9f97-4967beb1e4fe
	...["primary", "secondary", "tertiary", "error"].reduce(
		(acc, key) =>
			acc.concat(
				surfaceElevations.map((v, i) => [
					`surface-${key}-${i + 1}`,
					{
						DEFAULT: new Color(hexFromArgb(theme.schemes[defaultMode][key]))
							.mix(surfaceColor.DEFAULT, 1 - v)
							.hex(),
						light: new Color(hexFromArgb(theme.schemes.light[key]))
							.mix(surfaceColor.light, 1 - v)
							.hex(),
						dark: new Color(hexFromArgb(theme.schemes.dark[key]))
							.mix(surfaceColor.dark, 1 - v)
							.hex()
					}
				])
			),
		[]
	),
	...surfaceElevations.map((v, i) => [
		`primaryOnSecondaryContainer-${i + 1}`,
		{
			DEFAULT: new Color(hexFromArgb(theme.schemes[defaultMode].secondaryContainer))
				.mix(primaryColor.DEFAULT, v)
				.hex(),
			light: new Color(hexFromArgb(theme.schemes.light.secondaryContainer))
				.mix(primaryColor.light, v)
				.hex(),
			dark: new Color(hexFromArgb(theme.schemes.dark.secondaryContainer))
				.mix(primaryColor.dark, v)
				.hex()
		}
	]),
	...surfaceElevations.map((v, i) => [
		`primaryOnTertiaryContainer-${i + 1}`,
		{
			DEFAULT: new Color(hexFromArgb(theme.schemes[defaultMode].tertiaryContainer))
				.mix(primaryColor.DEFAULT, v)
				.hex(),
			light: new Color(hexFromArgb(theme.schemes.light.tertiaryContainer))
				.mix(primaryColor.light, v)
				.hex(),
			dark: new Color(hexFromArgb(theme.schemes.dark.tertiaryContainer))
				.mix(primaryColor.dark, v)
				.hex()
		}
	]),
	...theme.customColors.reduce(
		(acc, e) =>
			acc.concat(
				surfaceElevations.map((v, i) => [
					`surface-${e.color.name}-${i + 1}`,
					{
						DEFAULT: new Color(hexFromArgb(e[defaultMode].color))
							.mix(surfaceColor.DEFAULT, 1 - v)
							.hex(),
						light: new Color(hexFromArgb(e.light.color)).mix(surfaceColor.light, 1 - v).hex(),
						dark: new Color(hexFromArgb(e.dark.color)).mix(surfaceColor.dark, 1 - v).hex()
					}
				])
			),
		[]
	)
]);

module.exports = {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {
			surfaceElevations,
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))"
			},
			colors,
			opacity: Object.fromEntries(surfaceElevations.map((v, i) => [`z${i + 1}`, `${v}`])),
			fontSize: Object.fromEntries(
				[
					//https://m3.material.io/styles/typography/type-scale-tokens#d74b73c2-ac5d-43c5-93b3-088a2f67723d
					["display-lg", "57px", "64px", "400", "0px"],
					["display-md", "45px", "52px", "400", "0px"],
					["display-sm", "36px", "44px", "400", "0px"],
					["headline-lg", "32px", "40px", "400", "0px"],
					["headline-md", "28px", "36px", "400", "0px"],
					["headline-sm", "24px", "32px", "400", "0px"],
					["title-lg", "22px", "28px", "400", "0px"],
					["title-md", "16px", "24px", "500", "0.15px"],
					["title-sm", "14px", "20px", "500", "0.1px"],
					["label-lg", "14px", "20px", "500", "0.1px"],
					["label-md", "12px", "16px", "500", "0.5px"],
					["label-sm", "11px", "16px", "500", "0.5px"],
					["body-lg", "16px", "24px", "400", "0.5px"],
					["body-md", "14px", "20px", "400", "0.25px"],
					["body-sm", "12px", "16px", "400", "0.4px"]
				].map((e) => [
					e[0],
					[
						e[1],
						{
							lineHeight: e[2],
							fontWeight: e[3],
							letterSpacing: e[4]
						}
					]
				])
			)
		}
	},
	plugins: [
		require("tailwind-gradient-mask-image"),
		require("tailwindcss-scrollbar"),
		require("@tailwindcss/line-clamp"),
		plugin(({ addVariant }) => {
			addVariant("backdrop", "&::backdrop");
		})
	],
	darkMode: "class",
	// The list of classes that are always included in the bundle
	safelist: [
		// {
		// 	// this is for the comment border colors
		// 	pattern: /(bg|text|from)-(primary|tertiary|warning)-(dark|light)/,
		// 	variants: ["dark"]
		// },
		// {
		// 	pattern:
		// 		/(bg|text|from)-(primary|secondary|tertiary|warning)\/\[theme\(surfaceElevations\[1\]\)\]/,
		// 	variants: ["dark", "hover", "hover:dark"]
		// }
	]
};
