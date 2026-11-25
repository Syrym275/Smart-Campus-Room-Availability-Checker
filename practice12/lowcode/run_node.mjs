import fs from "node:fs";
import rules from "./rules.js";
const cases = JSON.parse(fs.readFileSync(new URL("./cases.json", import.meta.url)));
const before = JSON.stringify(rules.bookings);
let pass = 0;
for (const c of cases) {
  const r = rules.check(c.start, c.duration, c.blocked);
  const ok = r.available === c.available && r.code === c.code;
  if (ok) pass++;
  console.log(c.id, ok ? "PASS" : "FAIL", "| expected", c.available, c.code, "| observed", r.available, r.code, "|", r.message);
}
const t8 = JSON.stringify(rules.bookings) === before;
console.log("T8", t8 ? "PASS" : "FAIL", "| bookings unchanged after checks:", t8);
console.log("TOTAL", pass + (t8 ? 1 : 0), "/ 8");
// extra input-validation probes (AC6)
for (const [s, d] of [["", "30"], ["abc", "30"], ["12:00", ""], ["12:00", "-5"], ["12:00", "1.5"], ["<script>alert(1)</script>", "30"]]) {
  const r = rules.check(s, d, false); console.log("EXTRA", JSON.stringify(s), JSON.stringify(d), "->", r.code);
}
