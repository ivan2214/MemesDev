// path to a file with schema you want to reset

import { reset } from "drizzle-seed";
import { db } from "./index";
import * as schema from "./schemas";

async function main() {
  await reset(db, schema);
}

main();
