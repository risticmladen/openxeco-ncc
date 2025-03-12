const timeAgo = (date) => {
	const now = new Date();
	const givenDate = new Date(date);
	const difference = now - givenDate;

	const minutes = Math.floor(difference / 1000 / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) {
		return `${days} day${days > 1 ? "s" : ""} ago`;
	}
	if (hours > 0) {
		return `${hours} hour${hours > 1 ? "s" : ""} and ${minutes % 60} minute${
			minutes % 60 > 1 ? "s" : ""
		} ago`;
	}
	if (minutes > 0) {
		return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
	}
	return "just now";
};

export default timeAgo;
