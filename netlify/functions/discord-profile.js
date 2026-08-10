```js
exports.handler = async function (event) {
  try {
    const cookies = event.headers.cookie || "";

    const tokenCookie = cookies
      .split(";")
      .map(cookie => cookie.trim())
      .find(cookie => cookie.startsWith("discord_access_token="));

    if (!tokenCookie) {
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          loggedIn: false
        })
      };
    }

    const accessToken = decodeURIComponent(
      tokenCookie.substring("discord_access_token=".length)
    );

    // Get the user's Discord profile
    const userResponse = await fetch(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!userResponse.ok) {
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          loggedIn: false
        })
      };
    }

    const profile = await userResponse.json();

    // Get the servers the user has authorized access to
    const guildResponse = await fetch(
      "https://discord.com/api/users/@me/guilds",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    let guilds = [];

    if (guildResponse.ok) {
      guilds = await guildResponse.json();
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({
        loggedIn: true,
        profile: profile,
        guilds: guilds
      })
    };

  } catch (error) {
    console.error("Profile error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        loggedIn: false,
        error: "Unable to retrieve Discord profile."
      })
    };
  }
};
```
