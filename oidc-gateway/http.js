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

module.exports = {
    parseJson,
    defaultErrorHandler,
    buildUrlWithParams
}