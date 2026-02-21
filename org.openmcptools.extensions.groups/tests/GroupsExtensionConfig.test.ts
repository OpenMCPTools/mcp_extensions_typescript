import { describe, it, expect } from "vitest";
import {
  EXTENSION_ID,
  SERVER_CAPABILITIES_ID,
  CLIENT_CAPABILITIES_ID,
} from "../src/GroupsExtensionConfig.js";

describe("GroupsExtensionConfig constants", () => {
  it("EXTENSION_ID has the correct value", () => {
    expect(EXTENSION_ID).toBe("org.openmcptools/groups");
  });

  it("SERVER_CAPABILITIES_ID is derived from EXTENSION_ID", () => {
    expect(SERVER_CAPABILITIES_ID).toBe("org.openmcptools/groups/server");
    expect(SERVER_CAPABILITIES_ID).toBe(`${EXTENSION_ID}/server`);
  });

  it("CLIENT_CAPABILITIES_ID is derived from EXTENSION_ID", () => {
    expect(CLIENT_CAPABILITIES_ID).toBe("org.openmcptools/groups/client");
    expect(CLIENT_CAPABILITIES_ID).toBe(`${EXTENSION_ID}/client`);
  });
});
