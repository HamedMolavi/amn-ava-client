export type Routes = "chats" | "messages" | "contacts" | "bundles";
export type User = { _id: string, firstName: string, lastName: string, username: string, password: string, email: string, createdAt: number };
export type Chat = { _id: string, type: string, user1Id: string, user2Id: string, createdAt: number }
export type Message = { _id: string, msg: string, chatId: string, senderId: string, sentAt: number }
export const routes = ["chats", "messages", "contacts", "bundles"];
export const envs = ["URL"]