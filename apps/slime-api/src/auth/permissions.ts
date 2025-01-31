import { CommunityCouponTable } from '@/db/store/CommunityCouponTable';
import { DefaultRoles } from './defaultRoles';
import { User } from './User';

export class Permission<TData, TActions extends string, TRoles extends string = DefaultRoles> {
	readonly config: PermissionMartix<TData, TActions, TRoles>;

	constructor(permissionMartix: PermissionMartix<TData, TActions, TRoles>) {
		this.config = permissionMartix;
		const basePermission = this.config[Permission.base];
		if (basePermission === undefined) return;
		if (typeof basePermission === 'string') {
			this.config[Permission.base] = this.config[basePermission];
			return;
		}
	}

	withUser(user: User) {
		const roles = [Permission.base, ...user.roles];
		return {
			can: (action: TActions) => {
				return {
					all: (data?: TData[]) => {
						return roles.some((role) => {
							let actionRules = this.config[role as TRoles];
							if (actionRules == null) return false;
							let rule = actionRules[action];
							if (typeof rule === 'boolean') return rule;
							if (rule == null) return false;
							if (data == null) return false;
							return data.every((x) => rule(user, x));
						});
					},
					item: (data: TData) => {
						return roles.some((role) => {
							let actionRules = this.config[role as TRoles];
							if (actionRules == null) return false;
							let rule = actionRules[action];
							if (typeof rule === 'boolean') return rule;
							if (rule == null) return false;
							return rule(user, data);
						});
					},
					any: (data: TData[]) => {
						return roles.some((role) => {
							let actionRules = this.config[role as TRoles];
							if (actionRules == null) return false;
							let rule = actionRules[action];
							if (typeof rule === 'boolean') return rule;
							if (rule == null) return false;
							if (data == null) return false;
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

type PermissionRule<TData> = boolean | undefined | ((user: User, data: TData) => boolean);
type PermissionMartix<TData, TActions extends string, TRoles extends string> = {
	// TODO: In the future we can allow roles to [Permission.$base] off other roles
	[R in TRoles]?: {
		[A in TActions]?: PermissionRule<TData>;
	};
} & {
	/** The base permission role to inherit from, all permissions are false if no roles are provided */
	[Permission.base]?:
		| TRoles
		| {
				[A in TActions]?: PermissionRule<TData>;
		  };
};

export const communityCouponPermission = new Permission<CommunityCouponTable, 'write' | 'read' | 'delete' | 'update'>({
	[Permission.base]: {
		read: true,
		write: true,
		delete: false,
		update: false,
	},
	moderator: {
		read: true,
		write: true,
		delete: true,
		update: true,
	},
});
