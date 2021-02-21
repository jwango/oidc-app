const HttpUtils = require('./http');

const AuthClient = function() {
    const WELL_KNOWN_URI = "https://accounts.google.com/.well-known/openid-configuration";
    const REDIRECT_URI = "http://localhost:3000";

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

    async function authenticateUser() {
        const config = await this.resolveConfig();
        console.log(config.authorization_endpoint);
        return true;
    }

    return {
        resolveConfig,
        authenticateUser,
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