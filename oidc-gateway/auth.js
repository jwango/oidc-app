const HttpUtils = require('./http');
const FormData = require('form-data');

const AuthClient = function() {
    const WELL_KNOWN_URI = "https://accounts.google.com/.well-known/openid-configuration";
    const REDIRECT_URI = "http://localhost:8080/auth_handler";
    const CLIENT_ID = "1057821592187-doj5ba427hi5vl5s8q7ob6h7dh1p45np.apps.googleusercontent.com";
    const CLIENT_SECRET = process.env.CLIENT_SECRET;

    async function resolveConfig() {
        if (this.openIdConfig != null) {
            return this.openIdConfig;
        } else {
            const response = await fetch(WELL_KNOWN_URI);
            const rawConfig = await HttpUtils.parseJson(response);
            this.openIdConfig = OpenIdConfig(rawConfig);
            return this.openIdConfig;
        }
    }

    async function getAccessTokenUrl() {
        const config = await this.resolveConfig();
        const params = {
            response_type: "code",
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            scope: "openid profile",
            state: "state",
            nonce: "nonce",
        };
        return HttpUtils.buildUrlWithParams(config.authorization_endpoint, params);
    }

    async function exchangeCodeForToken(code) {
        const config = await this.resolveConfig();
        const formData = new FormData();
        formData.append("code", code);
        formData.append("redirect_uri", REDIRECT_URI);
        formData.append("client_id", CLIENT_ID);
        formData.append("client_secret", CLIENT_SECRET);
        formData.append("grant_type", "authorization_code");
        return fetch(config.token_endpoint, {
            method: "POST",
            headers: formData.getHeaders(),
            body: formData
        });
    }

    async function getUserInfo(accessToken) {
        const config = await this.resolveConfig();
        const headers = new Headers();
        headers.append("Authorization", "Bearer " + accessToken);
        return fetch(config.userinfo_endpoint, { headers });
    }

    return {
        resolveConfig,
        getAccessTokenUrl,
        exchangeCodeForToken,
        openIdConfig: OpenIdConfig(null)
    };
}

const OpenIdConfig = function(rawConfig) {
    if (!rawConfig) {
        return null;
    }
    return {
        issuer: rawConfig.issuer,
        authorization_endpoint: rawConfig.authorization_endpoint,
        token_endpoint: rawConfig.token_endpoint,
        userinfo_endpoint: rawConfig.userinfo_endpoint,
        revocation_endpoint: rawConfig.revocation_endpoint,
        response_types_supported: rawConfig.response_types_supported,
        subject_types_supported: rawConfig.subject_types_supported,
        id_token_signing_alg_values_supported: rawConfig.id_token_signing_alg_values_supported,
        scopes_supported: rawConfig.scopes_supported,
        claims_supported: rawConfig.claims_supported,
        grant_types_supported: rawConfig.grant_types_supported
    }
}

module.exports = AuthClient