
import { getAuthUrl } from './auth.js';
import { reject, getUrl } from '../public/util.js';

/**
 * Handles the redirect from Affinidi and generates a session token.
 */
export async function generateAuthUrl(baseUrl) {
    try {
        const response = await getAuthUrl(baseUrl);
        return response;
    } catch (error) {
        return reject('generateAuthUrl', error);
    }
}

