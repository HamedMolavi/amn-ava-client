type InfoType = {
  [key: string]: any
  "me": User | undefined
  "cookie": string | undefined
  "chats": { _id: string, type: string, user1Id: User, user2Id: User, createdAt: number }[]
  "contacts": { _id: string, ownerId: string, userId: User, createdAt: number }[]
  "messages": Message[]
  "chat": { _id: string, type: string, user1Id: User, user2Id: User, createdAt: number } | undefined
  "contact": { _id: string, ownerId: string, userId: User, createdAt: number } | undefined
}
import { Socket, io } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SignalProtocolManager, SignalServerStore } from "../crypto/mystore"

export { };
declare global {
  namespace NodeJS {
    interface Process {
      signalProtocolManagerUser: SignalProtocolManager
      signalServer: SignalServerStore
      info: InfoType
      sockets: { [chatId: string]: Socket<DefaultEventsMap, DefaultEventsMap> | undefined }
    }
    interface ProcessEnv {
      URL: string
    }
  }
}
