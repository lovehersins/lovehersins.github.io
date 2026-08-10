```js
exports.handler = async function(event) {
  const clientId = "1477546371665105068";

  const redirectUri =
    "https://taupe-seahorse-7784d8.netlify.app/.netlify/functions/discord-callback";

  const discordUrl =
    `https://discord.com/oauth2/authorize?client_id=${clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=identify%20guilds`;

  return {
    statusCode: 302,
    headers: {
      Location: discordUrl
    }
  };
};
```
