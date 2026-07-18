const test = require("node:test");
const assert = require("node:assert/strict");

const {
  MAX_ATTEMPTS,
  BEHAVIOR_KEYS,
  pickBehavior,
  getAttemptOutcome,
} = require("../script.js");

test("the refusal engine exposes all ten requested behaviors", () => {
  assert.equal(BEHAVIOR_KEYS.length, 10);
  assert.equal(new Set(BEHAVIOR_KEYS).size, 10);
  assert.deepEqual(BEHAVIOR_KEYS, [
    "move-corner",
    "new-message",
    "split",
    "hide-pointer",
    "shrink-grow",
    "move-close",
    "ask-why",
    "fake-dialog",
    "close-return",
    "dismiss-desktop",
  ]);
});

test("random behavior selection avoids an immediate repeat", () => {
  const previous = "move-corner";
  const selected = pickBehavior(previous, () => 0);

  assert.notEqual(selected, previous);
  assert.ok(BEHAVIOR_KEYS.includes(selected));
});

test("random behavior selection safely clamps unusual random values", () => {
  assert.ok(BEHAVIOR_KEYS.includes(pickBehavior(null, () => 1)));
  assert.ok(BEHAVIOR_KEYS.includes(pickBehavior(null, () => -1)));
});

test("the tenth attempt completes the experience", () => {
  assert.deepEqual(getAttemptOutcome(8), { nextAttempt: 9, isComplete: false });
  assert.deepEqual(getAttemptOutcome(9), { nextAttempt: 10, isComplete: true });
  assert.deepEqual(getAttemptOutcome(10), { nextAttempt: 10, isComplete: true });
  assert.equal(MAX_ATTEMPTS, 10);
});
