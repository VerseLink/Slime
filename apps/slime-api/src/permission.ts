import { SlimeRoles, User } from './user';

export type PermissionUser<TRoles extends string> = {
	readonly roles: readonly TRoles[];
}
type PermissionRule<TData, TUser> = boolean | undefined | ((user: TUser, data: TData) => boolean);
type PermissionMartix<TData, TActions extends string, TUser extends PermissionUser<TRoles>, TRoles extends string> = {
	// TODO: In the future we can allow roles to [Permission.base] off other roles
	[R in TRoles]?: {
		[A in TActions]?: PermissionRule<TData, TUser>;
	};
} & {
	/** The base permission role to inherit from, all permissions are false if no roles are provided */
	[Permission.base]?:
		| TRoles
		| {
				[A in TActions]?: PermissionRule<TData, TUser>;
		  };
};

export class Permission<TData, TActions extends string, TUser extends PermissionUser<TRoles>, TRoles extends string> {
	readonly config: PermissionMartix<TData, TActions, TUser, TRoles>;

	constructor(permissionMartix: PermissionMartix<TData, TActions, TUser, TRoles>) {
		this.config = permissionMartix;
		const basePermission = this.config[Permission.base];
		if (basePermission === undefined) return;
		if (typeof basePermission === 'string') {
			this.config[Permission.base] = this.config[basePermission];
			return;
		}
	}

	withUser(user: TUser) {
		const roles: (typeof Permission.base | TRoles)[] = [Permission.base, ...user.roles];
		return {
			can: (action: TActions) => {
				return {
					all: (data?: TData[]) => {
						return roles.some((role) => {
							let actionRules = this.config[role];
							if (actionRules == null) {
								return false;
							}
							let rule = actionRules[action];
							if (typeof rule === 'boolean') {
								return rule;
							}
							if (rule == null || data == null) {
								return false;
							}
							return data.every((x) => rule(user, x));
						});
					},
					item: (data: TData) => {
						return roles.some((role) => {
							let actionRules = this.config[role as TRoles];
							if (actionRules == null) {
								return false;
							}
							let rule = actionRules[action];
							if (typeof rule === 'boolean') {
								return rule;
							}
							if (rule == null) {
								return false;
							}
							return rule(user, data);
						});
					},
					some: (data: TData[]) => {
						return roles.some((role) => {
							let actionRules = this.config[role as TRoles];
							if (actionRules == null) {
								return false;
							}
							let rule = actionRules[action];
							if (typeof rule === 'boolean') {
								return rule;
							}
							if (rule == null || data == null) {
								return false;
							}
							return data.some((x) => rule(user, x));
						});
					},
				};
			},
		};
	}
}

export namespace Permission {
	export const base = Symbol();
}
