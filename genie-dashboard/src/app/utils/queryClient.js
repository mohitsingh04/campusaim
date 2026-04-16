import { QueryClient } from "@tanstack/react-query";
import { reportError } from "./errorReporter";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            onError: (error) => {
                reportError(error);
            }
        },
        mutations: {
            onError: (error) => {
                reportError(error);
            }
        }
    }
});