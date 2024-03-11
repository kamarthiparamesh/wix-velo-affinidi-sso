/********************
 backend/http-functions.js

Test URL
https://parameshk9.wixsite.com/paramesh-affinidi/_functions/@parameshk9/affinidi-sso-integration-backend/getAuthCallback?code=test&state=mystate

This http function from Custom App is not working, if we move the same to Main site then its working fine

**********************/

import { ok, badRequest } from 'wix-http-functions';
import { getAuth } from './auth.js';

export function get_getAuthCallback(request) {
    console.log('callback called');
    return getAuth(request)
        .catch((error) => {
            console.log(error);
            let options = {
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "error": error.message
                }
            };
            return badRequest(options);

        });
}