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
import * as printer from "printer";
// import Token from "./models/token.";

dotenv.config();

const app = express();
const port = process.env.PORT; // default port to listen
const Printer = ThermalPrinter.printer;
const PrinterTypes = ThermalPrinter.types;

async function print() {
  let printer = new Printer({
    type: PrinterTypes.EPSON, // 'star' or 'epson'
    interface: "printer:Thermal Printer",
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
  printer.alignLeft();
  printer.newLine();
  printer.println("Hello World!");
  printer.drawLine();

  printer.upsideDown(true);
  printer.println("Hello World upside down!");
  printer.upsideDown(false);
  printer.drawLine();

  printer.invert(true);
  printer.println("Hello World inverted!");
  printer.invert(false);
  printer.drawLine();

  printer.println("Special characters: ČčŠšŽžĐđĆćßẞöÖÄäüÜé");
  printer.drawLine();

  printer.setTypeFontB();
  printer.println("Type font B");
  printer.setTypeFontA();
  printer.println("Type font A");
  printer.drawLine();

  printer.alignLeft();
  printer.println("This text is on the left");
  printer.alignCenter();
  printer.println("This text is in the middle");
  printer.alignRight();
  printer.println("This text is on the right");
  printer.alignLeft();
  printer.drawLine();

  printer.setTextDoubleHeight();
  printer.println("This is double height");
  printer.setTextDoubleWidth();
  printer.println("This is double width");
  printer.setTextQuadArea();
  printer.println("This is quad");
  printer.setTextSize(7, 7);
  printer.println("Wow");
  printer.setTextSize(0, 0);
  printer.setTextNormal();
  printer.println("This is normal");
  printer.drawLine();

  try {
    printer.printBarcode("4126570807191");
    printer.code128("4126570807191", {
      height: 50,
      text: 1,
    });
    printer.beep();
  } catch (error) {
    console.error(error);
  }

  printer.pdf417("4126565129008670807191");
  printer.printQR("https://olaii.com");

  printer.newLine();

  printer.leftRight("Left", "Right");

  printer.table(["One", "Two", "Three", "Four"]);

  printer.tableCustom([
    { text: "Left", align: "LEFT", width: 0.5 },
    { text: "Center", align: "CENTER", width: 0.25, bold: true },
    { text: "Right", align: "RIGHT", width: 0.25 },
  ]);

  printer.tableCustom([
    { text: "Left", align: "LEFT", cols: 8 },
    { text: "Center", align: "CENTER", cols: 10, bold: true },
    { text: "Right", align: "RIGHT", cols: 10 },
  ]);

  printer.cut();
  printer.openCashDrawer();

  try {
    await printer.execute();
    console.log("Print success.");
  } catch (error) {
    console.error("Print error:", error);
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
      console.log("BODY: ", body);
      const raw = JSON.parse(body);
      res.send({
        bearer_token: raw.access_token,
        refresh_token: raw.refresh_token,
        expires_in: raw.expires_in,
      });

      const newAccessToken = new models.Token({
        accessToken: raw.access_token,
        refreshToken: raw.refresh_token,
        expiresIn: raw.expires_in,
      });
      newAccessToken.save((error) => {
        if (error) {
          console.log("Error: ", error);
        } else {
          console.log("Success. ", response);
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
