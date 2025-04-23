import { StoreBasicData } from "#store/permission";
import { User } from "#user";

export type CodeRequiredVariables = {
    store: StoreBasicData; 
    user: User;
}