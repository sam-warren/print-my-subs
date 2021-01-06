// import { RefreshableAuthProvider, StaticAuthProvider } from "twitch-auth";
// import { promises as fs } from "fs";
// import { PubSubClient } from "twitch-pubsub-client";
// import { ApiClient } from "twitch";
// import { PubSubSubscriptionMessage } from "twitch-pubsub-client";

// async function main() {
//   const clientId = "dyzlha8t15f4gzc7rv3w5l0gdl3949";
//   const clientSecret = "qnuy8jey3tb3uduj2h6yrshkjaju9p";
//   const tokenData = JSON.parse(await fs.readFile("./tokens.json", "utf-8"));
//   const authProvider = new RefreshableAuthProvider(
//     new StaticAuthProvider(clientId, tokenData.accessToken),
//     {
//       clientSecret,
//       refreshToken: tokenData.refreshToken,
//       expiry:
//         tokenData.expiryTimestamp === null
//           ? null
//           : new Date(tokenData.expiryTimestamp),
//       onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
//         const newTokenData = {
//           accessToken,
//           refreshToken,
//           expiryTimestamp: expiryDate === null ? null : expiryDate.getTime(),
//         };
//         await fs.writeFile(
//           "./tokens.json",
//           JSON.stringify(newTokenData, null, 4),
//           "utf-8"
//         );
//       },
//     }
//   );

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

import express from "express";
import * as dotenv from "dotenv";
import request from "request";
import models, { connectDb } from "./models";
import * as ThermalPrinter from "node-thermal-printer";
import * as mongoose from "mongoose";

dotenv.config();

const app = express();
const port = process.env.PORT; // default port to listen
const Printer = ThermalPrinter.printer;
const PrinterTypes = ThermalPrinter.types;

async function print() {
  let printer = new Printer({
    type: PrinterTypes.EPSON, // 'star' or 'epson' TODO: Maybe change this.
    interface: "printer:Thermal Printer", // TODO: update this with actual printer name
    driver: require("printer"),
    options: {
      timeout: 1000,
    },
    width: 48, // Number of characters in one line - default: 48
    characterSet: "SLOVENIA", // Character set - default: SLOVENIA
    removeSpecialCharacters: false, // Removes special characters - default: false
    lineCharacter: "-", // Use custom character for drawing lines - default: -
  });

  let isConnected = await printer.isPrinterConnected();
  console.log("Printer connected:", isConnected);

  printer.alignCenter();
  printer.println("print my subs for");
  await printer.printImage("./assets/TwitchBlack.png");
  printer.newLine();
  printer.setTextQuadArea();
  printer.println("New Subscriber!");
  printer.setTextNormal();
  printer.drawLine();
  printer.println("Hey Blond Radio,"); // TODO: Add channel name
  printer.setTextQuadArea();
  printer.invert(true);
  printer.println(" sammywarren "); // TODO: Add username that subscribed
  printer.invert(false);
  printer.setTextNormal();
  printer.println("just subscribed to your channel!");
  printer.cut();
  printer.beep();
  try {
    await printer.execute();
    console.log("Print success.");
  } catch (error) {
    console.error("Print error:", error); //TODO: Send error back to user
  }
}

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// define a route handler for the default home page
app.get("/", (req, res) => {
  res.send("PrintMySubs API");
});

app.get("/client-id", (req, res) => {
  res.send({ client_id: process.env.CLIENT_ID });
});

app.get("/print-test-page", (req, res) => {
  print();
  res.send({ message: "Printing test page..." });
});

app.get("/get-token", (req, res) => {
  const requestOptions = {
    url:
      "https://id.twitch.tv/oauth2/token?client_id=" +
      process.env.CLIENT_ID +
      "&client_secret=" +
      process.env.CLIENT_SECRET +
      "&code=" +
      req.query.code +
      "&grant_type=authorization_code&redirect_uri=http://localhost:8080/login-callback",
    method: "POST",
  };
  request(requestOptions, (err, response, body) => {
    if (err) {
      console.error(err);
    } else {
      const raw = JSON.parse(body);
      // console.log("BODY: ", body);
      res.send();
      const newAccessToken = new models.Token({
        accessToken: raw.access_token,
        refreshToken: raw.refresh_token,
        expiresIn: raw.expires_in,
      });
      newAccessToken.save((error) => {
        if (error) {
          console.log("Error: ", error);
        } else {
          console.log("Success. ", response.body);
        }
      });
    }
  });
});

app.get("/get-printers", (req, res) => {});

// start the Express server
connectDb().then(async () => {
  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
});
