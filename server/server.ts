import { RefreshableAuthProvider, StaticAuthProvider } from "twitch-auth";
import { ChatClient } from "twitch-chat-client";
import { promises as fs } from "fs";
import { PubSubClient } from "twitch-pubsub-client";
import { ApiClient } from "twitch";
import { PubSubSubscriptionMessage } from "twitch-pubsub-client";

async function main() {
  const clientId = "dyzlha8t15f4gzc7rv3w5l0gdl3949";
  const clientSecret = "qnuy8jey3tb3uduj2h6yrshkjaju9p";
  const tokenData = JSON.parse(await fs.readFile("./tokens.json", "utf-8"));
  const authProvider = new RefreshableAuthProvider(
    new StaticAuthProvider(clientId, tokenData.accessToken),
    {
      clientSecret,
      refreshToken: tokenData.refreshToken,
      expiry:
        tokenData.expiryTimestamp === null
          ? null
          : new Date(tokenData.expiryTimestamp),
      onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
        const newTokenData = {
          accessToken,
          refreshToken,
          expiryTimestamp: expiryDate === null ? null : expiryDate.getTime(),
        };
        await fs.writeFile(
          "./tokens.json",
          JSON.stringify(newTokenData, null, 4),
          "utf-8"
        );
      },
    }
  );

  const apiClient = new ApiClient({ authProvider });

  // CHAT CLIENT
  const chatClient = new ChatClient(authProvider, { channels: ["BlondRadio"] });
  await chatClient.connect();

  chatClient.onMessage((channel, user, message) => {
    if (message === "!ping") {
      chatClient.say(channel, "Pong!");
    } else if (message === "!dice") {
      const diceRoll = Math.floor(Math.random() * 6) + 1;
      chatClient.say(channel, `@${user} rolled a ${diceRoll}`);
    }
  });

  chatClient.onSub((channel, user) => {
    chatClient.say(
      channel,
      `Thanks to @${user} for subscribing to the channel!`
    );
  });
  chatClient.onResub((channel, user, subInfo) => {
    chatClient.say(
      channel,
      `Thanks to @${user} for subscribing to the channel for a total of ${subInfo.months} months!`
    );
  });
  chatClient.onSubGift((channel, user, subInfo) => {
    chatClient.say(
      channel,
      `Thanks to ${subInfo.gifter} for gifting a subscription to ${user}!`
    );
  });

  //PUBSUB
  const pubSubClient = new PubSubClient();
  const userId = await pubSubClient.registerUserListener(apiClient);
  const listener = await pubSubClient.onSubscription(
    userId,
    (message: PubSubSubscriptionMessage) => {
      console.log(`${message.userDisplayName} just subscribed!`);
    }
  );
}

main();

// import { ApiClient } from "twitch";
// import { StaticAuthProvider } from "twitch-auth";
// import { promises as fs } from "fs";
// import { PubSubClient } from "twitch-pubsub-client";
// import { PubSubSubscriptionMessage } from "twitch-pubsub-client";

// async function main() {
//   const clientId = "dyzlha8t15f4gzc7rv3w5l0gdl3949";
//   const tokenData = JSON.parse(await fs.readFile("./tokens.json", "utf-8"));

//   const authProvider = new StaticAuthProvider(clientId, tokenData.accessToken);
//   const apiClient = new ApiClient({ authProvider });

//   const pubSubClient = new PubSubClient();
//   const userId = await pubSubClient.registerUserListener(apiClient);

//   const listener = await pubSubClient.onSubscription(
//     userId,
//     (message: PubSubSubscriptionMessage) => {
//       console.log(`${message.userDisplayName} just subscribed!`);
//     }
//   );
// }

// main();
