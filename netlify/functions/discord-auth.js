```js
const crypto = require("crypto");

exports.handler = async function () {
  const clientId = process.env.DISCORD_CLIENT_ID;

  const redirectUri =
    "https://taupe-seahorse-7784d8.netlify.app/.netlify/functions/discord-callback";

  // Create a random OAuth state value
  const state = crypto.randomBytes(32).toString("hex");

  // Sign the state so it can't be modified
  const signature = crypto
    .createHmac("sha256", process.env.SESSION_SECRET)
    .update(state)
    .digest("hex");

  const discordUrl =
    "https://discord.com/oauth2/authorize" +
    `?client_id=${encodeURIComponent(clientId)}` +
    "&response_type=code" +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    "&scope=identify%20guilds" +
    `&state=${state}`;

  return {
    statusCode: 302,
    headers: {
      Location: discordUrl,

      "Set-Cookie":
        `discord_oauth_state=${state}.${signature}; ` +
        "HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600"
    }
  };
};
```
