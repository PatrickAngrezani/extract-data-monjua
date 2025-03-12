import axios from "axios";
import { dirname } from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/../../.env` });

let accessToken: string = process.env.ACCESS_TOKEN;
let refresh_token: string = process.env.REFRESH_TOKEN;
const client_id: string = process.env.CLIENT_ID;
const client_secret: string = process.env.CLIENT_SECRET;
let grant_type: string = "";

export const getAccessToken = async () => {
  return accessToken;
};

export const refreshToken = async () => {
  console.log("Refreshing token...");

  grant_type = "refresh_token";

  const response = await axios.post(
    "https://accounts.zoho.com/oauth/v2/token",
    null,
    {
      params: {
        refresh_token,
        client_id,
        client_secret,
        grant_type,
      },
    }
  );
  accessToken = response.data.access_token;
};
