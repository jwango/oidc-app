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

module.exports = {
    parseJson,
    defaultErrorHandler
}