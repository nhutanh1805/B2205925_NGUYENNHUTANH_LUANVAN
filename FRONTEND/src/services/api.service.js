import axios from "axios";

const commonConfig = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export default function createApiClient(baseURL) {
  return axios.create({
    baseURL,
    ...commonConfig,
  });
}
