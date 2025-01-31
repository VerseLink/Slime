import { DefaultRoles } from "./defaultRoles";

export type User = { 
    id: string;
    blockedBy: string[]; 
    roles: DefaultRoles[];
};
