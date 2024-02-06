import axios from "axios";
import { input, printMessages } from "../terminal";
import { io } from "socket.io-client";
import { Routes } from "../types/my";

export async function loadUser(register: boolean = false) {
  const options = {
    method: 'POST',
    url: `http://${process.env["URL"]}:4000/auth/${register ? "register" : "login"}`,
    headers: {
      'Content-Type': 'application/json'
    },
    data: register ? {
      ...await input(["username", "password", "email", "firstName", "lastName"])
    } : {
      ...await input(["username", "password"]),
      "is_remember": true
    }
  };
  return await new Promise(resolve => axios.request(options)
    .then(function (response) {
      process.info["cookie"] = response?.headers?.["set-cookie"]?.find((el) => el.startsWith("Bearer"))?.split(";")[0];
      process.info["me"] = response.data?.data;
      console.clear();
      console.log(register ? "Register" : "Login", " done!");
      setTimeout(() => resolve(true), 1000);
    })
    .catch((err) => console.error(err?.response?.status, err?.response?.statusText)))
}

export async function pgpd(what: Routes, options?: { data?: { [key: string]: any }, param?: string, query?: string, patch?: boolean }): Promise<Array<any> | any> {
  const opts = {
    method: !!options?.data ? options?.patch ? "PATCH" : 'POST' : 'GET',
    url: `http://${process.env.url}:4000/${what}${!!options?.param ? "/" + options.param : ""}${!!options?.query ? "?" + options.query : ""}`,
    headers: {
      cookie: process.info.cookie,
      'Content-Type': 'application/json'
    },
    data: options?.data
  };
  return await axios.request(opts)
    .then((response) => {
      if (!!options?.data) console.log(what, "created successfully!")
      return response.data?.data
    })
    .catch((err) => console.error(...err.response.status != 404 ? [err.response.status, err.response.statusText] : ['Empty', what]));
}

export async function refresh() {
  for (const empty of ["chat", "contact"]) process.info[empty] = undefined;
  for (const fill of ['chats', 'contacts'] as Routes[]) {
    let list = await pgpd(fill, {
      param: fill === "contacts" ? process.info.me?._id
        // : fill === "messages" ? info.chats?._id
        : undefined,
      query: fill === "contacts" ? "populate[]=userId&populate[]=ownerId&perPage=100000"
        : fill === "chats" ? "populate[]=user2Id&populate[]=user1Id&perPage=100000"
          : "perPage=100000"//"populate[]=chatId&populate[]=senderId"
    });
    process.info[fill] = list;
  }
  for (const chat of process.info["chats"]) {
    const socket = io(`http://${process.env.url}:4000`, {
      extraHeaders: { "authorization": process.info.cookie?.replace("=", " ") as string, "chatId": chat?._id as string },
      // protocols: ["websockets", "polling"],
      autoConnect: false, reconnection: false, retries: 0,
    });
    ['connect_error', 'disconnect'].forEach((k) => socket.on(k, (error) => {
      console.log("connection failed!", error);
      process.sockets[chat._id as string] = undefined;
      delete process.sockets[chat._id as string];
    }));
    socket.on("message", (data) => {
      const message = JSON.parse(data);
      printMessages(message);
      process.info["messages"].push(message);
    });
    socket.on('connect', () => process.sockets[chat._id as string] = socket);
    socket.connect();
    return
  }
};