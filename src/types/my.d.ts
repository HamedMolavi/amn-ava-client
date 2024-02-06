type Routes = "chats" | "messages" | "contacts";
type User = { _id: string, firstName: string, lastName: string, username: string, password: string, email: string, createdAt: number };
type Chat = { _id: string, type: string, user1Id: string, user2Id: string, createdAt: number }
type Message = { _id: string, msg: string, chatId: string, senderId: string, sentAt: number }
const routes = ["chats", "messages", "contacts"];
