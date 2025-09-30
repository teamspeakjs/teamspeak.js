import { describe, it, expect } from 'vitest';

import type { PrivilegeKey } from '../src/structures/privilege-key';
import type { ServerGroup } from '../src/structures/server-group';
import { makeQuery, readEnv, mutationsAllowed as allowMut } from './utils/live';
import { ServerGroupType } from '../src/typings/types';

const env = readEnv();
const describeIf = env && allowMut() ? describe : describe.skip;

describeIf('Live PrivilegeKey Manager CRUD and use', () => {
  it('creates, fetches, uses and deletes privilege keys', { timeout: 60000 }, async () => {
    const q = await makeQuery(env!);

    // Prepare: create a temporary server group for testing
    const groupName = `tjs-pk-${Date.now()}`;
    const sg: ServerGroup = await q.serverGroups.create({
      name: groupName,
      type: ServerGroupType.Regular,
    });

    // create privilege key for server group
    const pk1: PrivilegeKey = await q.privilegeKeys.create({
      serverGroup: sg,
      description: `desc-${Date.now()}`,
      customSet: undefined,
    });

    expect(pk1).toBeTruthy();
    expect(typeof pk1.token).toBe('string');

    // fetch all privilege keys and ensure the created token exists
    const all = await q.privilegeKeys.fetch();
    const hasCreated = Array.from(all.values()).some((k) => k.token === pk1.token);
    expect(hasCreated).toBe(true);

    // delete the created privilege key (by structure)
    await pk1.delete();

    // Ensure it's no longer present
    const afterDelete = await q.privilegeKeys.fetch();
    const stillThere = Array.from(afterDelete.values()).some((k) => k.token === pk1.token);
    expect(stillThere).toBe(false);

    /*
    Can't test this one because serveradmin can't use privilege keys.

    // create another key and use it
    const pk2: PrivilegeKey = await q.privilegeKeys.create({ serverGroup: sg });
    expect(pk2.token).toBeTruthy();

    await q.privilegeKeys.useByToken(pk2.token!);

    // using a key consumes it; it should not be listed afterwards
    const afterUse = await q.privilegeKeys.fetch();
    const usedListed = Array.from(afterUse.values()).some((k) => k.token === pk2.token);
    expect(usedListed).toBe(false);

    // Cleanup server group
    await sg.delete(true);

    */

    await q.logout();
    q.destroy();
  });
});
