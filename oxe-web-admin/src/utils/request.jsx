import { getApiURL } from "./env.jsx";

export async function getRequest(url, callback, catchBadResponse, catchError) {
	fetch(getApiURL() + url, {
		method: "GET",
		headers: new Headers({
			Accept: "application/json, text/html",
			pragma: "no-cache",
			"cache-control": "no-cache",
			"Access-Control-Allow-Origin": url.startsWith("public") ? "*" : undefined,
			"Access-Control-Allow-Methods": "GET,OPTIONS,HEAD",
		}),
		credentials: url.startsWith("public") ? undefined : "include",
	}).then((response) => {
		if (response.status === 200) {
			return response.json();
		}
		if (response.status === 403) {
			window.location.replace("/?status=expiredSession");
		}
		if (catchBadResponse !== null) {
			catchBadResponse(response);
			throw new Error(null);
		}
		throw new Error("An error happened while requesting the server");
	}).then((jsonBody) => {
		if (typeof jsonBody !== "undefined") callback(jsonBody);
	}).catch((error) => {
		if (error.message !== "null") {
			catchError(error);
		}
	});
}

export async function getNoCorsRequest(url, callback, catchBadResponse, catchError) {
	fetch(getApiURL() + url, {
		method: "GET",
		mode: "cors",
		headers: {
			Accept: "application/json, text/html",
		},
	}).then((response) => {
		if (response.status === 200) {
			return response.json();
		}
		if (response.status === 403) {
			window.location.replace("/?status=expiredSession");
		}
		if (catchBadResponse !== null) {
			catchBadResponse(response);
			throw new Error(response.error);
		}
		throw new Error("An error happened while requesting the server");
	}).then((jsonBody) => {
		if (typeof jsonBody !== "undefined") callback(jsonBody);
	}).catch((error) => {
		catchError(error);
	});
}

export async function postRequestWithFile(url, formData, callback, catchBadResponse, catchError) {
    fetch(getApiURL() + url, {
        method: "POST",
        body: formData,
        headers: new Headers({
            Accept: "application/json, text/html",
            // 'Content-Type' is automatically set to 'multipart/form-data' when sending FormData
        }),
        credentials: "include",
    }).then((response) => {
        if (response.status === 200) {
            return response.json();
        }
        if (response.status === 403) {
            window.location.replace("/?status=expiredSession");
        }
        if (catchBadResponse !== null) {
            catchBadResponse(response);
            throw new Error(null);
        }
        throw new Error("An error happened while requesting the server");
    }).then((jsonBody) => {
        if (typeof jsonBody !== "undefined") callback(jsonBody);
    }).catch((error) => {
        if (error.message !== "null") {
            catchError(error);
        }
    });
}

export async function getBlobRequest(url, callback, catchBadResponse, catchError) {
	fetch(getApiURL() + url, {
		method: "GET",
		headers: new Headers({
			Accept: "application/json, text/html",
			pragma: "no-cache",
			"cache-control": "no-cache",
		}),
		credentials: "include",
	}).then((response) => {
		if (response.status === 200) {
			return response.blob();
		}
		if (response.status === 403) {
			window.location.replace("/?status=expiredSession");
		}
		if (catchBadResponse !== null) {
			catchBadResponse(response);
			throw new Error(null);
		}
		throw new Error("An error happened while requesting the server");
	}).then((blob) => {
		if (typeof blob !== "undefined") callback(blob);
	}).catch((error) => {
		if (error.message !== "null") {
			catchError(error);
		}
	});
}

export async function postRequest(url, params, callback, catchBadResponse, catchError) {
	fetch(getApiURL() + url, {
		method: "POST",
		body: JSON.stringify(params),
		headers: new Headers({
			Accept: "application/json, text/html",
			"Content-Type": "application/json",
		}),
		credentials: "include",
	}).then((response) => {
		if (response.status === 200) {
			return response.json();
		}
		if (response.status === 403) {
			window.location.replace("/?status=expiredSession");
		}
		if (catchBadResponse !== null) {
			catchBadResponse(response);
			throw new Error(null);
		}
		throw new Error("An error happened while requesting the server");
	}).then((jsonBody) => {
		if (typeof jsonBody !== "undefined") callback(jsonBody);
	}).catch((error) => {
		if (error.message !== "null") {
			catchError(error);
		}
	});
}

export async function getForeignRequest(url, callback, catchBadResponse, catchError) {
	fetch(url, {
		method: "GET",
		mode: "cors",
		headers: {
			Accept: "application/json, text/html",
		},
	}).then((response) => {
		if (response.status === 200) {
			return response.json();
		}
		if (response.status === 403) {
			window.location.replace("/?status=expiredSession");
		}
		if (catchBadResponse !== null) {
			catchBadResponse(response);
			throw new Error(response.error);
		}
		throw new Error("An error happened while requesting the server");
	}).then((jsonBody) => {
		if (typeof jsonBody !== "undefined") callback(jsonBody);
	}).catch((error) => {
		catchError(error);
	});
}

export async function getForeignImage(url, callback, catchBadResponse, catchError) {
	fetch(url, {
		method: "GET",
		mode: "cors",
		headers: {
			Accept: "image/png,image/jpg,image/jpeg",
		},
	}).then((response) => {
		if (response.status === 200) {
			return response.blob();
		}
		if (catchBadResponse !== null) {
			catchBadResponse(response);
			throw new Error(response.error);
		}
		throw new Error("An error happened while requesting the server");
	}).then((blob) => {
		if (typeof blob !== "undefined") callback(blob);
	}).catch((error) => {
		catchError(error);
	});
}

export async function getRssFeed(url, callback, catchBadResponse, catchError) {
	fetch("https://api.rss2json.com/v1/api.json?rss_url=" + url, {
		method: "GET",
		mode: "cors",
		headers: {
			Accept: "application/json",
			"cache-control": "no-cache",
		},
	}).then((response) => {
		if (response.status === 200) {
			return response.json();
		}
		if (catchBadResponse !== null) {
			catchBadResponse(response);
			throw new Error(response.error);
		}
		throw new Error("An error happened while requesting the server");
	}).then((jsonBody) => {
		if (typeof jsonBody !== "undefined") callback(jsonBody);
	}).catch((error) => {
		catchError(error);
	});
}
