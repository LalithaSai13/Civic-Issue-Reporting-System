import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
  .setEndpoint('https://cloud.appwrite.io/v1') // ✅ or your self-hosted URL
  .setProject('67f36b4800144098ad88'); // ✅ your actual project ID

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const getAccount = async () => {
  try {
    const user = await account.get();
    return user;
  } catch (err) {
    return null;
  }
};


export { client, account, databases, storage };
