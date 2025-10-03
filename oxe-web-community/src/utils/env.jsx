export function getApiURL() {
	if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "") {
		return "http://localhost:5001/";
	}
	// Check if we're on Railway
	if (window.location.hostname.includes('railway.app')) {
		return "https://openxeco-api-production.up.railway.app/"; // Update this URL after Railway deployment
	}
	// Fallback to Render API
	return "https://openxeco-api.onrender.com/";
}

export function getGlobalAppURL() {
	if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "") {
		return "http://localhost:3002/";
	}
	return "https://" + window.location.hostname.replace("www.", "").split(".").slice(1).join(".") + "/";
}

export function isInternetExplorer() {
	const ua = window.navigator.userAgent;
	const msie = ua.indexOf("MSIE ");

	return msie > 0 || !!navigator.userAgent.match(/Trident.*rv:11\./);
}

export function getCookieOptions() {
	if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "") {
		return { domain: "localhost", path: "/", secure: true };
	}
	return {
		secure: true,
		domain: "." + window.location.hostname.replace("www.", "").split(".").slice(1).join("."),
		path: "/",
	};
}
