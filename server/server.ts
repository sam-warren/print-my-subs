import express from "express";
import * as dotenv from "dotenv";
import request from "request";
import dbModels, { connectDb } from "./dbModels";
import { TokenDocument } from "./dbDocuments/TokenDocument";
import * as ThermalPrinter from "node-thermal-printer";
import { RefreshableAuthProvider, StaticAuthProvider } from "twitch-auth";
import { ApiClient, HelixPrivilegedUser } from "twitch";
import { User } from "./interfaces/user";
import printer from "printer";
import { PubSubClient, PubSubWhisperMessage } from "twitch-pubsub-client";
import { PubSubSubscriptionMessage } from "twitch-pubsub-client";

dotenv.config();

const bodyParser = require("body-parser");
const app = express();
var jsonParser = bodyParser.json();

const port = process.env.PORT; // default port to listen
const Printer = ThermalPrinter.printer;
const PrinterTypes = ThermalPrinter.types;
var authProvider;
var client;
var isAuthenticated = false;
var subListener;
var whisperListener;
var listenForSubs = true;
var listenForWhispers = true;

var user = new dbModels.User({
  id: -1,
  username: "",
});

var currentPrinter = new Printer({
  type: PrinterTypes.EPSON,
  interface: "printer:",
  driver: require("printer"),
  options: {
    timeout: 1000,
  },
  width: 48, // Number of characters in one line - default: 48
  characterSet: "SLOVENIA", // Character set - default: SLOVENIA
  removeSpecialCharacters: false, // Removes special characters - default: false
  lineCharacter: "-", // Use custom character for drawing lines - default: -
});

/*
  printSub()
  Prints a subscriber receipt with a given name
*/
async function printSub(text) {
  console.log("PRINT SUB CALLED");
  let isConnected = await currentPrinter.isPrinterConnected();
  console.log("Printer connected:", isConnected);
  await printHeader();
  await printSubDetails(text);
  // await currentPrinter.clear();
  try {
    await currentPrinter.execute().then(() => {
      currentPrinter.clear();
    });
    console.log("Print success.");
  } catch (error) {
    console.error("Print error:", error);
  }
}

async function printWhisper(text, message) {
  console.log("PRINT WHISPER CALLED");
  let isConnected = await currentPrinter.isPrinterConnected();
  console.log("Printer connected:", isConnected);
  await printHeader();
  await printWhisperDetails(text, message);
  // await currentPrinter.clear();
  try {
    await currentPrinter.execute().then(() => {
      currentPrinter.clear();
    });
    console.log("Print success.");
  } catch (error) {
    console.error("Print error:", error);
  }
}

/*
  printTest()
  Prints a test message to ensure printer is connected
*/
async function printTest(text: string) {
  console.log("PRINT TEST CALLED");
  let isConnected = await currentPrinter.isPrinterConnected();
  console.log("Printer connected:", isConnected);
  await printHeader();
  await printSuccess();
  // await currentPrinter.clear();
  try {
    await currentPrinter.execute().then(() => {
      currentPrinter.clear();
    });
    console.log("Print success.");
  } catch (error) {
    console.error("Print error:", error);
  }
}

async function listen(apiClient) {
  console.log("Listening...", apiClient);
  const pubSubClient = new PubSubClient();
  const userId = await pubSubClient.registerUserListener(apiClient);
  subListener = await pubSubClient.onSubscription(
    userId,
    (message: PubSubSubscriptionMessage) => {
      console.log(`${message.userDisplayName} just subscribed!`);
      printSub(`${message.userDisplayName}`);
    }
  );
  whisperListener = await pubSubClient.onWhisper(
    userId,
    (message: PubSubWhisperMessage) => {
      console.log(`${message.senderDisplayName} just whispered!`);
      printWhisper(`${message.senderDisplayName}`, `${message.text}`);
    }
  );
}

module.exports = {
  printSub: printSub,
  printWhisper: printWhisper,
  listen: listen,
};

/*
  printHeader()
  Prints the header of the receipt
*/
async function printHeader() {
  currentPrinter.alignCenter();
  currentPrinter.println("print my subs for");
  await currentPrinter.printImage("./assets/TwitchBlack.png");
  currentPrinter.newLine();
  currentPrinter.drawLine();
}

/*
  printSuccess()
  Prints a success message after completion of printer setup
*/
async function printSuccess() {
  currentPrinter.setTextQuadArea();
  currentPrinter.println("Success!");
  currentPrinter.setTextNormal();
  currentPrinter.println("Printer set up successfully.");
  currentPrinter.beep();
  currentPrinter.cut();
}

/*
  printSubDetails()
  Takes in the name of the subscriber and prints it on the receipt
*/
async function printSubDetails(text: string) {
  currentPrinter.setTextQuadArea();
  currentPrinter.println("New Subscriber!");
  currentPrinter.setTextNormal();
  currentPrinter.setTextQuadArea();
  currentPrinter.invert(true);
  currentPrinter.println(" " + text + " ");
  currentPrinter.invert(false);
  currentPrinter.setTextNormal();
  currentPrinter.println("just subscribed to your channel.");
  currentPrinter.beep();
  currentPrinter.cut();
}

/*
  printWhisperDetails()
  Takes in the name of the whisperer and prints it on the receipt
*/
async function printWhisperDetails(text: string, message: string) {
  currentPrinter.setTextQuadArea();
  currentPrinter.println("New Whisper!");
  currentPrinter.setTextNormal();
  currentPrinter.setTextQuadArea();
  currentPrinter.invert(true);
  currentPrinter.println(" " + text + " ");
  currentPrinter.invert(false);
  currentPrinter.setTextNormal();
  currentPrinter.println("says:");
  currentPrinter.newLine();
  await cutText(message);
  currentPrinter.beep();
  currentPrinter.cut();
}

async function cutText(message: string) {
  let words = message.split(" ");
  let line = "";
  for (let i = 0; i < words.length; i++) {
    if (line.length + words[i].length + 1 < 46) {
      line = line + words[i] + " ";
    } else {
      await currentPrinter.println(line);
      line = words[i] + " ";
    }
  }
  currentPrinter.println(line);
}

/*
  initApi()
  Initialize auth provider
*/
async function initApi(dbAccessToken, dbRefreshToken, dbExpiresIn) {
  const clientSecret = process.env.CLIENT_SECRET;
  authProvider = new RefreshableAuthProvider(
    new StaticAuthProvider(process.env.CLIENT_ID, dbAccessToken),
    {
      clientSecret,
      refreshToken: dbRefreshToken,
      expiry: dbExpiresIn === null ? null : new Date(dbExpiresIn),
      onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
        const newAccessToken = new dbModels.Token({
          accessToken,
          refreshToken,
          expiryTimestamp: expiryDate === null ? null : expiryDate.getTime(),
          user: new dbModels.User({
            id: this.user.id,
            username: this.user.username,
          }),
        });
        await newAccessToken.save((error) => {
          if (error) {
            console.log("Error updating token.: ", error);
          } else {
            console.log("Token updated. ");
          }
        });
      },
    }
  );
}

async function initAuthProvider(token) {
  const secret = process.env.CLIENT_SECRET;
  authProvider = new RefreshableAuthProvider(
    new StaticAuthProvider(process.env.CLIENT_ID, token.accessToken),
    {
      clientSecret: secret,
      refreshToken: token.refreshToken,
      expiry: token.expiresIn === null ? null : new Date(token.expiresIn),
      onRefresh: async () => {
        const newToken = await new dbModels.Token({
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          expiresIn: token.expiresIn,
          userId: user.id,
        });
        await token.save((error) => {
          if (error) {
            console.log("Error: ", error);
          } else {
            console.log("Successfully saved token");
            checkToken();
          }
        });
      },
    }
  );
}

async function checkToken() {
  const token = await dbModels.Token.findOne({
    userId: user.id,
  });
  if (token) {
    isAuthenticated = true;
    initAuthProvider(token);
  } else {
    isAuthenticated = false;
  }
}

app.use(async function isExpired(req, res, next) {
  if (isAuthenticated) {
    const token: TokenDocument = await dbModels.Token.findOne({
      userId: user.id,
    });
    console.log("ISAUTHENTICATED TOKEN: ", token);
    if (token.expiresIn <= 1000) {
      initAuthProvider(token);
    }
  }
  next();
});

/*
  Enable CORS
*/
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

/*
  Base route. Sends back message.
*/ app.get("/", (req, res) => {
  res.send("PrintMySubs API");
});

/*
  GET user
  Endpoint for retrieving information about the currently
  authenticated user
*/
app.get("/user", (req, res) => {
  res.send({ user: user });
});

/*
  GET client-id
  Sends back client ID from .env file for use in authentication flow
*/
app.get("/client-id", (req, res) => {
  res.send({ client_id: process.env.CLIENT_ID });
});

/*
  GET token
  Begins OAuth 2.0 authentication flow that retrieves an access token from Twitch.
*/
app.get("/token", (req, res) => {
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
  request(requestOptions, async (err, response, body) => {
    if (err) {
      console.error(err);
    } else {
      const raw = JSON.parse(body);
      const authProvider = new StaticAuthProvider(
        process.env.CLIENT_ID,
        raw.access_token
      );
      const apiClient = new ApiClient({ authProvider });
      await apiClient.helix.users.getMe().then((res: HelixPrivilegedUser) => {
        console.log(res);
        user = new dbModels.User({
          id: res.id,
          username: res.name,
        });
        console.log(user);
      });
      res.send({ user: user });
      await user.save((error) => {
        if (error) {
          console.log("Error: ", error);
        } else {
          console.log("Successfully saved new user");
        }
      });
      const token = await new dbModels.Token({
        accessToken: raw.access_token,
        refreshToken: raw.refresh_token,
        expiresIn: raw.expires_in,
        userId: user.id,
      });
      await token.save((error) => {
        if (error) {
          console.log("Error: ", error);
        } else {
          console.log("Successfully saved token");
          checkToken();
        }
      });
      module.exports.listen(apiClient);
      client = apiClient;
    }
  });
});

/*
  GET printers
  Returns a list of printers recognized in Windows
*/
app.get("/printers", (req, res) => {
  const printers = printer.getPrinters();
  console.log(printers);
  res.send({ printers: printers });
});

/*
  POST printers
  Sets the printer to be used
*/
app.post("/printers", jsonParser, async (req, res) => {
  console.log(req.body);
  const printerType =
    req.body.printerType === "EPSON" ? PrinterTypes.EPSON : PrinterTypes.STAR;
  currentPrinter = new Printer({
    type: printerType,
    interface: "printer:" + req.body.printer,
    driver: require("printer"),
    options: {
      timeout: 1000,
    },
    width: 48, // Number of characters in one line - default: 48
    characterSet: "SLOVENIA", // Character set - default: SLOVENIA
    removeSpecialCharacters: false, // Removes special characters - default: false
    lineCharacter: "-", // Use custom character for drawing lines - default: -
  });
  printTest("Printer set up successfully!");
});

/*
  POST print-text
  Prints text specified by user on the webclient
*/
app.post("/print-text", jsonParser, (req, res) => {
  printSub(req.body.text);
});

app.post("/listen-for-subs", jsonParser, async (req, res) => {
  console.log("LISTEN FOR SUBS CALLED");
  console.log(
    "listenForSubs: " +
      listenForSubs +
      " req.body.listenForSubs: " +
      req.body.listenForSubs
  );
  if (listenForSubs == false && req.body.listenForSubs == true) {
    console.log("Recreating sub listener...", client);
    const pubSubClient = new PubSubClient();
    const userId = await pubSubClient.registerUserListener(client);
    subListener = await pubSubClient.onSubscription(
      userId,
      (message: PubSubSubscriptionMessage) => {
        console.log(`${message.userDisplayName} just subscribed!`);
        printSub(`${message.userDisplayName}`);
      }
    );
    listenForSubs = true;
  }
  if (listenForSubs == true && req.body.listenForSubs == false) {
    console.log("Removing sub listener...");
    subListener.remove();
    listenForSubs = false;
  }
});

app.post("/listen-for-whispers", jsonParser, async (req, res) => {
  console.log("LISTEN FOR WHISPERS CALLED");
  console.log(
    "listenForWhispers: " +
      listenForWhispers +
      " req.body.listenForWhispers: " +
      req.body.listenForWhispers
  );
  if (listenForWhispers == false && req.body.listenForWhispers == true) {
    // Start listening for whispers
    console.log("Recreating whisper listener...", client);
    const pubSubClient = new PubSubClient();
    const userId = await pubSubClient.registerUserListener(client);
    whisperListener = await pubSubClient.onWhisper(
      userId,
      (message: PubSubWhisperMessage) => {
        console.log(`${message.senderDisplayName} just whispered!`);
        printWhisper(`${message.senderDisplayName}`, `${message.text}`);
      }
    );
    listenForWhispers = true;
  }
  if (listenForWhispers == true && req.body.listenForWhispers == false) {
    console.log("Removing whisper listener...");
    whisperListener.remove();
    listenForWhispers = false;
  }
});

// start the Express server
connectDb().then(async () => {
  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
});
