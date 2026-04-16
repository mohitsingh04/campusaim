import { API } from "../API";

export const fetchErrorLogs = async ({ queryKey }) => {
    const [, params] = queryKey;

    const { data } = await API.get("/error-logs", {
        params,
    });

    return data;
};