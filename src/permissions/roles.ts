import { AccessControl } from "accesscontrol";
const ac = new AccessControl();

export const roles = (function () {
  ac.grant("basic")
    .readOwn("profile")
    .readOwn("record")
    .readOwn("team")
    .updateOwn("profile", ["*", "!role"]);

  ac.grant("supervisor")
    .extend("basic")
    .readAny("profile")
    .readAny("record")
    .readAny("team");

  ac.grant("admin")
    .extend("basic")
    .extend("supervisor")
    .updateAny("profile")
    .deleteAny("profile")
    .createAny("record")
    .updateAny("record")
    .deleteAny("record")
    .createAny("team")
    .updateAny("team")
    .deleteAny("team");

  return ac;
})();
