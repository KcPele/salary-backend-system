import { AccessControl } from "accesscontrol";
const ac = new AccessControl();

export const roles = (function () {
  ac.grant("basic").readOwn("profile").updateOwn("profile", ["*", "!role"]);

  ac.grant("supervisor").extend("basic").readAny("profile");

  ac.grant("admin")
    .extend("basic")
    .extend("supervisor")
    .updateAny("profile")
    .deleteAny("profile");
  ac.grant("basic").readOwn("record");
  ac.grant("supervisor").extend("basic").readAny("record");
  ac.grant("admin")
    .extend("basic")
    .extend("supervisor")
    .createAny("record")
    .updateAny("record")
    .deleteAny("record");
  return ac;
})();
