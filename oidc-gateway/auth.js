const HttpUtils = require('./http');
const FormData = require('form-data');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const AuthClient = function() {
    const WELL_KNOWN_URI = "https://accounts.google.com/.well-known/openid-configuration";
    const REDIRECT_URI = "http://localhost:8080/auth_handler";
    const CLIENT_ID = process.env.CLIENT_ID;
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

    async function resolveJwksClient() {
        if (this.jwksClient != null) {
            return this.jwksClient;
        } else {
            const config = await this.resolveConfig();
            this.jwksClient = jwksClient({
                strictSsl: true,
                jwksUri: config.jwks_uri
            });
            return this.jwksClient;
        }
    }

    async function getAccessTokenUrl(state, nonce) {
        const config = await this.resolveConfig();
        const params = {
            response_type: "code",
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            scope: "openid profile",
            state,
            nonce,
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

    async function verifyToken(idToken, nonce = undefined) {
        const config = await this.resolveConfig();
        const client = await this.resolveJwksClient();

        const getKey = (header, callback) => {
            client.getSigningKey(header.kid, function(err, key) {
                if (err) { callback(err); }
                else {
                    var signingKey = key.getPublicKey() || key.rsaPublicKey;
                    callback(null, signingKey);
                }
            });
        }

        return new Promise((resolve, reject) => {
            jwt.verify(idToken, getKey, {
                algorithms: config.id_token_signing_alg_values_supported,
                audience: CLIENT_ID,
                issuer: config.issuer,
                nonce
            }, (err, decoded) => {
                if (err) { reject(err); }
                else { resolve(decoded); }
            });
        });
    }

    function TokenState(rawTokenState) {
        return {
            access_token: rawTokenState.access_token,
            expires_in: rawTokenState.expires_in,
            id_token: rawTokenState.id_token,
            scope: rawTokenState.scope,
            token_type: rawTokenState.token_type,
            refresh_token: rawTokenState.refresh_token
        };
    }

    return {
        TokenState,
        resolveConfig,
        resolveJwksClient,
        getAccessTokenUrl,
        exchangeCodeForToken,
        verifyToken,
        getUserInfo,
        openIdConfig: OpenIdConfig(null),
        jwksClient: null
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
        grant_types_supported: rawConfig.grant_types_supported,
        jwks_uri: rawConfig.jwks_uri
    }
}

module.exports = AuthClient