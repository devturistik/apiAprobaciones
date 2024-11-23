import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import dotenv from 'dotenv';
dotenv.config();

console.log()
// Lee las variables de entorno
const tenantId = process.env.AZURE_TENANT_ID;
const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;

if (!tenantId || !clientId || !clientSecret) {
  throw new Error("Faltan valores en las variables de entorno para la configuración de Azure");
}

// Configura el cliente de Microsoft Graph
const clientSecretCredential = new ClientSecretCredential(tenantId, clientId, clientSecret);

const graphClient = Client.initWithMiddleware({
  authProvider: {
    getAccessToken: async () => {
      const token = await clientSecretCredential.getToken("https://graph.microsoft.com/.default");
      return token.token;
    },
  },
});

export default graphClient;
