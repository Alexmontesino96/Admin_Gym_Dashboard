import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  authorizationParameters: {
    scope: 'openid profile email read:users read:user_idp_tokens',
    audience: process.env.AUTH0_API_AUDIENCE
  }
}); 