import * as readline from 'readline';
import { act } from '../server';

export async function setupInteractive(): Promise<void> {
  // Setup Interactive stdin
  enableActions();
  //envs
  const askTheseKeys = Object.keys(process.env).reduce((res, cur) => { if (!process.env[cur]) res.push(cur); return res }, [] as string[]);
  Object.entries(await input(askTheseKeys)).forEach(([key, value]) => process.env[key] = value);
  console.clear();
};

export async function input(keys: Array<string> | string) {
  process.stdin.removeAllListeners("data");
  let results: { [key: string]: string } = {};
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  if (typeof keys === "string") keys = [keys];
  for (const key of keys) {
    await new Promise((resolve, _rej) => {
      rl.question(`${key.toUpperCase()}?\n`, (answer) => {
        results[key] = answer.trim();
        resolve(true);
      });
    })
  };
  rl.close();
  enableActions();
  return results;
};
export function enableActions() {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function hello(key: string) {
    act(key.trim());
  });
};

export function printItem(item: any) {
  let printable = "";
  if (Object.keys(item).includes("userId")) printable = !!item.userId?.username ? item.userId?.username : item.userId
  if (Object.keys(item).includes("user1Id")) {
    let id1 = !!item.user1Id?._id ? item.user1Id?._id : item.user1Id
    if (id1 !== process.info.me?._id) printable = !!item.user1Id?._id ? item.user1Id?.username : item.user1Id;
    else printable = !!item.user2Id?._id ? item.user2Id?.username : item.user2Id;
  }

  return printable;
}

export function printMessages(message: { _id: string, msg: string, chatId: string, senderId: string, sentAt: number }, printMine: boolean = false) {
  if (!!process.info["chat"]?._id && process.info["chat"]?._id == message.chatId) {
    if (message.senderId == process.info["me"]?._id) { if (printMine) console.log(message.msg); }
    else console.log("\t\t\t\t", message.msg);
  } else {
    let chat = process.info["chats"].find((el) => el._id == message.chatId);
    let otherUser = chat?.user1Id._id != process.info["me"]?._id ? chat?.user1Id.username : chat?.user2Id.username;
    console.log(`\t\t\t\t*${otherUser}: ${message.msg}`)
  }
}