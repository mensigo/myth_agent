/**
 * Validate every pantheon under content/.
 * Usage: npm run validate:content
 * Exits non-zero if any pantheon is invalid.
 */
import { discoverPantheons, loadPantheon } from "../lib/content";

function main(): void {
  const { pantheons, errors } = discoverPantheons();

  let failed = false;

  for (const err of errors) {
    console.error(`✗ ${err}`);
    failed = true;
  }

  if (pantheons.length === 0 && errors.length === 0) {
    console.error("No pantheons found under content/.");
    process.exit(1);
  }

  for (const summary of pantheons) {
    try {
      const pack = loadPantheon(summary.id);
      console.log(
        `✓ ${pack.manifest.name} (${pack.manifest.id}): ${pack.entities.length} entities`
      );
    } catch (err) {
      console.error(`✗ ${err instanceof Error ? err.message : String(err)}`);
      failed = true;
    }
  }

  if (failed) {
    console.error("\nContent validation failed.");
    process.exit(1);
  }
  console.log("\nAll content packs valid.");
}

main();
