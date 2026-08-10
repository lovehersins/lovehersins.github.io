```js
const crypto = require("crypto");

exports.handler = async function (event) {
  try {
    const params = event.queryStringParameters || {};

    const code = params.code;
    const returnedState = params.state;

    if (!code || !returnedState) {
      return {
        statusCode: 400,
        body: "Missing Discord authorization code or state."
      };
    }

    // Read the state cookie
    const cookies = event.headers.cookie || "";

    const stateCookie = cookies
      .split(";")
      .map(cookie => cookie.trim())
      .find(cookie => cookie.startsWith("discord_oauth_state="));

    if (!stateCookie) {
      return {
        statusCode: 400,
        body: "OAuth state cookie is missing."
      };
    }

    const savedState = decodeURIComponent(
      stateCookie.split("=")[1]
    );

    const [state, signature] = savedState.split(".");

    // Verify the state signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.SESSION_SECRET)
      .update(state)
      .digest("hex");

    if (
      !signature ||
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return {
        statusCode: 400,
        body: "Invalid OAuth state."
      };
    }

    // Make sure the state returned by Discord matches our state
    if (state !== returnedState) {
      return {
        statusCode: 400,
        body: "OAuth state mismatch."
      };
    }

    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;

    const redirectUri =
      "https://taupe-seahorse-7784d8.netlify.app/.netlify/functions/discord-callback";

    // Exchange the authorization code for an access token
    const tokenResponse = await fetch(
      "https://discord.com/api/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri
        })
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();

      console.error("Discord token error:", errorText);

      return {
        statusCode: 400,
        body: "Discord token exchange failed."
      };
    }

    const tokenData = await tokenResponse.json();

    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return {
        statusCode: 400,
        body: "Discord did not provide an access token."
      };
    }

    // Store the Discord access token in an HttpOnly cookie.
    // JavaScript on your website cannot read this cookie.
    const cookie =
      `discord_access_token=${encodeURIComponent(accessToken)}; ` +
      "HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800";

    // Delete the temporary OAuth state cookie
    const clearStateCookie =
      "discord_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0";

    return {
      statusCode: 302,

      headers: {
        Location: "/servers.html",
        "Set-Cookie": [
          cookie,
          clearStateCookie
        ]
      }
    };

  } catch (error) {
    console.error("Discord callback error:", error);

    return {
      statusCode: 500,
      body: "Discord login failed."
    };
  }
};
```
