const parseJson = async (fetchResponse, handleError = defaultErrorHandler) => {
    if (fetchResponse.status < 200 || fetchResponse >= 300) {
        handleError(fetchResponse);
    }
    return fetchResponse.json();
}

const defaultErrorHandler = function(response) {
    const err = new Error(response.statusText);
    err.response = response;
    throw err;
}

const buildUrlWithParams = function(url, params) {
    const paramsMapped = Object.keys(params || {}).map(paramKey => paramKey+"="+encodeURIComponent(params[paramKey]));
    if (paramsMapped.length > 0) {
        return url + "?" + paramsMapped.join("&");
    }
    return url;
}

const urlTrailing = function(url) {
    if (url && url.charAt(url.length - 1) != "/") {
        return url + "/";
    }
    return url;
}

const urlStartsWith = function(url, compareWith) {
    if (!url || !compareWith) { return false; }
    const protocolSplit = urlTrailing(url).split("://", 2);
    const routeSplit = protocolSplit[1].split("/");
    return (urlExactlyMatches(protocolSplit[0] + "://" + routeSplit[0], compareWith));
}

const urlExactlyMatches = function(url, compareWith) {
    return (urlTrailing(url) === urlTrailing(compareWith));
}

module.exports = {
    parseJson,
    defaultErrorHandler,
    buildUrlWithParams,
    urlTrailing,
    urlStartsWith,
    urlExactlyMatches
}