function getRelativeTime(old: string): string {
	const date = new Date(old);
	const dateDiff = date.getTime() - Date.now();
	if (isNaN(dateDiff)) {
		throw new Error("Date invalide: " + old);
	} else if (dateDiff > 0) {
		throw new Error("Tu viens du futur mon reuf?");
	}

	const MINUTE = 60 * 1000;
	const HOUR = 60 * MINUTE;
	const DAY = 24 * HOUR;
	const WEEK = 7 * DAY;
	const MONTH = 30 * DAY;
	let value: number;
	let unit: Intl.RelativeTimeFormatUnit;

	// si ça fais moins de [unitée] alors on l'utilise
	if (Math.abs(dateDiff) < HOUR) {
		value = Math.ceil(dateDiff / MINUTE) - 1; // minimum il y a 1 minute (sinon ça affiche "Cette minute-ci, Chelou..")
		unit = "minute";
	} else if (Math.abs(dateDiff) < DAY) {
		value = Math.round(dateDiff / HOUR);
		unit = "hour";
	} else if (Math.abs(dateDiff) < WEEK) {
		value = Math.round(dateDiff / DAY);
		unit = "day";
	} else if (Math.abs(dateDiff) < MONTH) {
		value = Math.round(dateDiff / WEEK);
		unit = "week";
	} else {
		value = Math.round(dateDiff / MONTH);
		unit = "month";
	}

	return new Intl.RelativeTimeFormat("fr", { numeric: "auto" }).format(value, unit);
}

export default getRelativeTime;