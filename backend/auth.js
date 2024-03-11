import { response } from 'wix-http-functions';
import { authentication } from 'wix-members-backend';
import { Issuer, generators } from 'openid-client';
import { getSecret } from 'wix-secrets-backend'
import { getPackageConfig } from 'wix-configs-backend';
import { reject, getUrl, urlJoin } from '../public/util.js';

const credentialsName = 'affinidi-sso-credentials';

const getSSOSettings = async (baseUrl) => {

    const credentials = await getSecret(credentialsName);
    let options = JSON.parse(credentials);
    options = { ...options, "redirect_uri": urlJoin(baseUrl, await getPackageConfig('redirectUri')) };

    // const options = {
    //     "client_id": "58b556d5-81fd-44d2-9de9-829beb95bf05",
    //     "client_secret": "SfZ4LLhNGs8DoXUwV_jHe9VZn7",
    //     "issuer": "https://427cc658-ddf8-4e5e-93b3-c038c13fac19.apse1.login.affinidi.io",
    //     "code_verifier": "affinidissoabc-BjG9QYupl0gSZC10OTyCSuZxOskG36uJrlPFKrn858s",
    //     "redirect_uri": urlJoin(baseUrl, await getPackageConfig('redirectUri'))
    // }

    return options;
}

/**
 * @param {string} baseUrl
 */
const getClient = async (baseUrl) => {
    try {

        const options = await getSSOSettings(baseUrl);
        const affinidi = await Issuer.discover(options.issuer);
        const client = new affinidi.Client({
            client_id: options.client_id,
            client_secret: options.client_secret,
            redirect_uris: [options.redirect_uri],
            response_types: ['code'],
            token_endpoint_auth_method: 'client_secret_post',
        })
        return client;

    } catch (error) {
        return reject('getClient', error);
    }
};

export const getAuthUrl = async (baseUrl) => {

    const options = await getSSOSettings(baseUrl);
    const state = generators.state();
    const params = {
        code_challenge: generators.codeChallenge(options.code_verifier),
        code_challenge_method: 'S256',
        response_type: 'code',
        scope: 'openid',
        state,
    }

    const client = await getClient(baseUrl);

    const authorizationUrl = client.authorizationUrl(params);

    return { authorizationUrl, state };
};

/**
 * Handles the redirect from Affinidi and generates a session token.
 * 
 * @param {wix_http_functions.WixHttpFunctionRequest} request 
 * @returns {Promise}
 */
export const getAuth = async (request) => {
    try {

        const baseUrl = request.baseUrl.split('/').slice(0, -1).join('/');

        const { code, state, error, error_description } = request.query;

        if (!code && error) {
            const location = urlJoin(baseUrl, `/?error=${error}&error_description=${error_description}`);
            return response({
                status: 302,
                headers: { location },
            });

        }

        const options = await getSSOSettings(baseUrl);

        const client = await getClient(baseUrl);
        console.log('options', options)

        const tokenSet = await client.callback(options.redirect_uri, { code, state }, { state, code_verifier: options.code_verifier });

        // const tokenSet = await client.grant({
        //     grant_type: 'authorization_code',
        //     code,
        //     redirect_uri: 'http://localhost:3000/login/affinidi/callback',
        //     code_verifier: options.code_verifier,
        // });

        console.log('tokenSet', tokenSet);

        const id_token = tokenSet.id_token;
        const token = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());

        const { email } = token;

        console.log('id_token', token);

        const sessionToken = await authentication.generateSessionToken(email);
        const loggedInPage = await getPackageConfig('loggedInPage');
        const location = urlJoin(baseUrl, `/${loggedInPage}?sessionToken=${sessionToken}&state=${state}`);

        return response({
            status: 302,
            headers: { location },
        });
    } catch (error) {
        return reject('getAuth', error);
    }
}