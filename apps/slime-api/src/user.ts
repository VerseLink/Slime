import { JWTNamespaceValue } from "@slime/auth/v1";
import { ArrayValue } from "@slime/util";
import { PermissionUser } from "./permission";

export type SlimeRoles = ArrayValue<JWTNamespaceValue["useslime.com"]['roles']>;

export interface User extends PermissionUser<SlimeRoles> {
	readonly id: string;
	hash?: string;
};


