
import { slimeApiClient } from "@slime/api/v1/client";

export const client = slimeApiClient(import.meta.env.VITE_ENDPOINT).api.v1;