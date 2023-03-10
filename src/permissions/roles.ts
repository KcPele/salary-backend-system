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

  return ac;
})();
