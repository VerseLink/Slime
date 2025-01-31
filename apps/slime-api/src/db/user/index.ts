import { UserDb } from './schema';
import { DurableObjectSqliteBase, fromSqlite } from '@slime/cf-sqlite';
import migrations from './.drizzle/migrations';

const sqlt = fromSqlite<UserDb>();

export class UserDurableObject extends DurableObjectSqliteBase {

	protected get migrations() { return migrations; }


}
