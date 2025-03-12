import axios from "axios";
import { getAccessToken, refreshToken } from "../services/authService.js";

const departmentId = "87418000000718100";

export const retrieveTickets = async () => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get("https://desk.zoho.com/api/v1/tickets", {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        orgId: Number(814785537),
      },
    });

    response.data.data.forEach((item, index) => {
        console.log({dis: item.departmentId});
        console.log(`Item ${index + 1}:`, item);
        
      if (item.departmentId == 87418000000718100) {
        console.log(`Item ${index + 1}:`, item);
      }
    });

    return response.data;
  } catch (error: any) {
    console.error("Error retrieving tickets:", error.response?.data);

    if (error.response.data.errorCode === "INVALID_OAUTH") {
      await refreshToken();
      return retrieveTickets();
    }

    throw error;
  }
};

retrieveTickets();
