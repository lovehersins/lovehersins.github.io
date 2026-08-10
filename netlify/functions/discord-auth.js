exports.handler = async () => {
  const clientID = process.env.DiscordClient;
 
  const redirect =
  `https://discord.com/oauth2/authorize?client_id=${clientID}&response_type=code&redirect_uri=https://YOUR-SITE.netlify.app/.netlify/functions/discord-auth&scope=identify`;
 
  return {
    statusCode: 302,
    headers: {
      Location: redirect
    }
  };
};
