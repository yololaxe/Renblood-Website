import { test } from "node:test";
import assert from "node:assert/strict";
import { readDraft, changedFields, draftKey, validateIdentity } from "./profileDraft.js";

const profile = { id: "owner-a", revision: 4, name: "Aliénor", surname: "Du Val", description: "", origin: "", portrait: "wanderer" };
const storage = value => ({ getItem: key => key === draftKey(profile.id) ? value : null });
test("a draft is recovered only for the same account and server revision", () => {
  const saved = JSON.stringify({ revision: 4, fields: { name: "Brouillon", money: "999" } });
  assert.equal(readDraft(storage(saved), profile.id, profile).name, "Brouillon");
  assert.equal(readDraft(storage(saved), "owner-b", profile).name, "Aliénor");
  assert.equal(readDraft(storage(saved), profile.id, { ...profile, revision: 5 }).name, "Aliénor");
  assert.equal("money" in readDraft(storage(saved), profile.id, profile), false);
});
test("corrupted storage cannot block opening the character form", () => {
  assert.equal(readDraft(storage("{broken"), profile.id, profile).name, profile.name);
  assert.equal(readDraft({ getItem() { throw new Error("blocked"); } }, profile.id, profile).portrait, "wanderer");
});
test("only modified profile fields are submitted, with whitespace trimmed", () => {
  assert.deepEqual(changedFields(profile, { ...profile, name: " Aliénor ", origin: " Nord ", rank: "Admin" }), { origin: "Nord" });
});
test("validation follows required fields and enabled portrait choices", () => {
  const settings = { required_fields: ["name", "surname", "origin"], portraits: ["wanderer"] };
  const invalid = validateIdentity({ ...profile, name: " ", portrait: "guard" }, settings);
  assert.ok(invalid.name); assert.ok(invalid.origin); assert.ok(invalid.portrait);
  assert.deepEqual(validateIdentity({ ...profile, origin: "Nord" }, settings), {});
});
