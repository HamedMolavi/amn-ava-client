import { enableActions } from "../terminal";

export async function enableSocket() {
  let chatId = process.info["chat"]?._id ?? "";
  let socket = process.sockets[chatId];
  process.stdin.removeAllListeners("data");
  process.stdin.on('data', function (text: string) {
    text = text.trim();
    switch (text) {
      case "!back":
        process.stdin.removeAllListeners("data");
        enableActions();
        process.info["chat"] = undefined;
        console.log("back to main!");
        break;
      default:
        socket?.emit("message", JSON.stringify({ msg: text, chatId, senderId: process.info["me"]?._id, sentAt: Date.now() }))
        break;
    }
  });
}