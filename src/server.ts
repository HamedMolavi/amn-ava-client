import { } from "./types/index";
import { Socket, io } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { loadUser, pgpd, refresh } from "./request";
import { input, printItem, printMessages, setupInteractive } from "./terminal";
import { enableSocket } from "./socket";
import { SignalServerStore, createSignalProtocolManager } from "./crypto/store";
import { Routes, routes } from "./types/my";

process.info = {
  "me": undefined,
  "cookie": undefined,
  "chat": undefined,
  "contact": undefined,
  "chats": [],
  "contacts": [],
  "messages": []
};
process.sockets = {};


export async function act(action: string) {
  switch (true) { // explicit actions
    //------------------------------------------------------------------//
    case action == 'exit':
      console.log("EXITING!");
      process.exit(0);
    //------------------------------------------------------------------//
    case action == 'clear':
      console.clear();
      break;
    //------------------------------------------------------------------//
    case action == 'rs':
      break;
    //------------------------------------------------------------------//
    case action.startsWith("env"): {
      let name = action.split(" ").slice(1).at(-1);
      if (action.split(" ").includes('-i')) console.log((!!name && !name.startsWith("-")) ? process.info[name] : process.info);
      else console.log((!!name && !name.startsWith("-")) ? process.env[name] : process.env);
      break;
    }
    //------------------------------------------------------------------//
    case action === "refresh": {
      await refresh();
      break;
    }
    //------------------------------------------------------------------//
    case ["register", "login"].includes(action): {
      await loadUser(action === "register");
      process.signalServer = new SignalServerStore();
      process.signalProtocolManagerUser = await createSignalProtocolManager(process.info.me?._id, process.info.me?.username, process.signalServer);
      await refresh();
      break;
    }
    //------------------------------------------------------------------//
    case action.startsWith("select"): {
      const selectWhat = action.split(" ").slice(1).at(-1) as Routes | undefined;
      if (!process.info.cookie) {
        console.log("Please login or register first!")
        break;
      } else if (!selectWhat || !routes.includes(selectWhat) || selectWhat === "messages") {
        console.log("Bad selection: ", selectWhat)
        break;
      }
      if (!process.info[selectWhat].length) {
        console.log(`No ${selectWhat}!`);
        break;
      };
      console.log(selectWhat, ":");
      for (const [index, item] of process.info[selectWhat].entries()) console.log(index.toString() + ".", printItem(item));
      let choosenIndex = await input(selectWhat).then(({ [selectWhat]: val }) => parseInt(val));
      let choosenItem = process.info[selectWhat][choosenIndex];
      process.info[selectWhat.slice(0, -1)] = choosenItem;
      if (selectWhat === "chats") {
        let fill: Routes = "messages";
        let list = await pgpd(fill, {
          param: process.info.chat?._id,
          query: "perPage=100000"//"populate[]=chatId&populate[]=senderId"
        });
        process.info[fill] = list ?? [];
        if (!process.info.chat?._id) {
          console.log("Select a chat first!");
          break;
        }
        let that = [process.info.chat.user1Id, process.info.chat.user2Id].find((user) => user._id !== process.info.me?._id);
        console.clear();
        console.log("Entring to chat with", that?.username, ":");
        for (const message of process.info["messages"]) printMessages(message, true)
        enableSocket();
        break;
      };
      console.clear();
      console.log(selectWhat, "selected!");
      break;
    }
    //------------------------------------------------------------------//
    case action.startsWith("new"): {
      const createWhat = action.split(" ")?.[1] as Routes | undefined;
      const arg = action.split(" ")?.[2]?.trim();
      if (!process.info.cookie || !process.info.me?._id) {
        console.log("Please login or register first!");
        break;
      } else if (!createWhat || !["chats", "messages", "contacts"].includes(createWhat)) {
        console.log("Can't create ", createWhat);
        break;
      } else if (!arg && createWhat !== "chats") {
        console.log("Bad create argument: ", arg);
        break;
      } else if ((createWhat === "chats" && !process.info.contact?.userId?._id) || (createWhat === "messages" && !process.info.chat?._id)) {
        console.log("Bad Order");
        break;
      }
      let created = await pgpd(createWhat, {
        data: createWhat === "chats"
          ? { "user2Id": process.info.contact?.userId?._id }
          : createWhat === "messages"
            ? { "msg": arg, "chatId": process.info.chat?._id }
            : { username: arg },
        query: createWhat === "chats" ? "populate[]=user1Id&populate[]=senderId&perPage=100000"
          : createWhat === "contacts" ? "populate[]=userId&populate[]=ownerId&perPage=100000"
            : "perPage=100000"//"populate[]=chatId&populate[]=senderId"
      });
      if (!process.info[createWhat]) process.info[createWhat] = [created];
      else process.info[createWhat].push(created);
      break;
    }
    //------------------------------------------------------------------//
    // case action === "chat": {
    //   if (!process.info.chat?._id) {
    //     console.log("Select a chat first!");
    //     break;
    //   }
    //   let that = [process.info.chat.user1Id, process.info.chat.user2Id].find((user) => user._id !== process.info.me?._id);
    //   console.clear();
    //   console.log("Entring to chat with", that?.username, ":");
    //   for (const message of process.info["messages"]) printMessages(message, true)
    //   enableSocket();
    //   break;
    // }
    //------------------------------------------------------------------//
    default:
      console.log(`Unknown command (${action})!`);
      console.log("List of commands:");
      console.log("\texit");
      console.log("\tclear");
      console.log("\trs");
      console.log("\tenv [name]");
      console.log("\tregister");
      break;
  };
};


setupInteractive().then(_ => {
  console.log("Application started");
})
  .catch(console.error)