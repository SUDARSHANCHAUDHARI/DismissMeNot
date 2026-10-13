const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

function readProjectFile(fileName) {
  return fs.readFileSync(path.join(projectRoot, fileName), "utf8");
}

test("standard project metadata is valid JSON", () => {
  const packageMetadata = JSON.parse(readProjectFile("package.json"));
  const webManifest = JSON.parse(readProjectFile("site.webmanifest"));

  assert.equal(packageMetadata.private, true);
  assert.equal(packageMetadata.scripts.check, "node --check script.js && node --test");
  assert.equal(webManifest.name, "DismissMeNot");
  assert.equal(webManifest.icons[0].src, "favicon.svg");
});

test("HTML references only present local project assets", () => {
  const html = readProjectFile("index.html");
  const localReferences = Array.from(
    html.matchAll(/(?:href|src)="(?!https?:|#)([^"?]+)"/g),
    (match) => match[1],
  );

  for (const reference of localReferences) {
    const normalizedReference = reference === "./" ? "index.html" : reference;
    assert.equal(
      fs.existsSync(path.join(projectRoot, normalizedReference)),
      true,
      `Missing local asset: ${normalizedReference}`,
    );
  }
});

test("the accessible completion and control contract is present", () => {
  const html = readProjectFile("index.html");
  const css = readProjectFile("styles.css");

  assert.match(html, /Thank you for your patience\./);
  assert.match(html, /id="sound-toggle"[^>]+aria-pressed="true"/s);
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /max="10"/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /forced-colors: active/);
});

test("production security metadata blocks unnecessary browser capabilities", () => {
  const html = readProjectFile("index.html");

  assert.match(html, /http-equiv="Content-Security-Policy"/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /form-action 'none'/);
  assert.match(html, /object-src 'none'/);
  assert.match(html, /name="referrer" content="no-referrer"/);
  assert.doesNotMatch(html, /<(?:script|link)[^>]+(?:src|href)="https?:/i);
});

test("repository readiness documentation is present", () => {
  for (const fileName of ["AGENTS.md", "CHANGELOG.md", "LICENSE", "README.md", "SECURITY.md"]) {
    assert.equal(fs.existsSync(path.join(projectRoot, fileName)), true, `Missing ${fileName}`);
  }

  const agentGuide = readProjectFile("AGENTS.md");
  assert.match(agentGuide, /Run `pnpm check` before committing\./);
  assert.match(agentGuide, /Do not change repository visibility/);

  const readme = readProjectFile("README.md");
  assert.match(readme, /## Author/);
  assert.match(readme, /Sudarshan Chaudhari/);
  assert.match(readme, /SudarshanTechLabs/);
  assert.match(readme, /SUDARSHANCHAUDHARI/);
  assert.match(readme, /sunny\.sudarshan@gmail\.com/);
  assert.match(readme, /sudarshantechlabs@gmail\.com/);
});
