exports.handler = async () => {
  const clientID = process.env.DiscordClient;
 
  const redirect =
  `https://discord.com/oauth2/authorize?client_id=${clientID}&response_type=code&redirect_uri=https://taupe-seahorse-7784d8.netlify.app/.netlify/functions/discord-auth`;
 
  return {
    statusCode: 302,
    headers: {
      Location: redirect
    }
  };
};
