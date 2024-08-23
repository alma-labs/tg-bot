import { Api, TelegramClient } from "telegram";
import dotenv from "dotenv";
import BigInt from "big-integer";

dotenv.config();

async function createTelegramGroup(client: TelegramClient, groupName: string, participants: string[]) {
  try {
    const result = await client.invoke(new Api.messages.CreateChat({ users: participants, title: groupName }));
    console.log(result);
    const updates = result.updates as any;
    const chatParticipants = updates.updates.find((update: any) => update.className === "UpdateChatParticipants");
    return chatParticipants?.participants?.chatId;
  } catch (error) {
    console.error("Error creating group:", error);
    return null;
  }
}

async function generateInviteLink(client: TelegramClient, groupId: string) {
  try {
    const result = await client.invoke(
      new Api.messages.ExportChatInvite({
        peer: new Api.InputPeerChat({ chatId: BigInt(groupId) }),
        legacyRevokePermanent: true,
        requestNeeded: false,
        expireDate: 0,
        usageLimit: 0,
        title: "Permanent Invite Link",
      })
    );
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error generating permanent invite link:", error);
    return null;
  }
}

// This function creates a new group & an invite link
// Gotta get a 2FA when logging in first as an account, after that the session continues working
async function main() {
  const client = new TelegramClient("user_sesh", parseInt(`${process.env.API}`), `${process.env.API_HASH}`, {});
  await client.start({
    phoneCode: async () => `${process.env.CODE}`,
    phoneNumber: `${process.env.PHONE}`,
    password: async () => `${process.env.PASSWORD}`,
    onError: (err) => console.log(err),
  });
  const groupId = await createTelegramGroup(client, "Alma (Bot Testing) 😉", ["@almalabsbot"]);
  await generateInviteLink(client, groupId);
}

main().catch(console.error);
