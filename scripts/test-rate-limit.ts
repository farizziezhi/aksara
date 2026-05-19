import { RateLimiter } from "../lib/rate-limit";

let failed = 0;
function expect(name: string, cond: boolean, detail?: string) {
  if (cond) {
    console.log(`  ok  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL ${name}${detail ? " — " + detail : ""}`);
  }
}

function fakeClock(start: number) {
  let t = start;
  return {
    now: () => t,
    advance: (ms: number) => {
      t += ms;
    },
  };
}

console.log("RateLimiter tests");

{
  const c = fakeClock(1000);
  const rl = new RateLimiter({ limit: 3, windowMs: 60_000 }, c.now);
  const r1 = rl.check("ip1");
  expect("first allowed", r1.allowed && r1.remaining === 2);
  rl.check("ip1");
  const r3 = rl.check("ip1");
  expect("third allowed at limit", r3.allowed && r3.remaining === 0);
  const r4 = rl.check("ip1");
  expect("fourth blocked", !r4.allowed && r4.remaining === 0);
  expect("retry-after positive", r4.retryAfterSec > 0);
}

{
  const c = fakeClock(1000);
  const rl = new RateLimiter({ limit: 2, windowMs: 60_000 }, c.now);
  rl.check("ip1");
  rl.check("ip2");
  const r1 = rl.check("ip1");
  const r2 = rl.check("ip2");
  expect("ip1 second still ok", r1.allowed);
  expect("ip2 second still ok", r2.allowed);
  expect("ip1 third blocked", !rl.check("ip1").allowed);
  expect("ip2 not blocked by ip1", rl.check("ip2").allowed === false && rl.check("ip2").allowed === false);
}

{
  const c = fakeClock(1000);
  const rl = new RateLimiter({ limit: 1, windowMs: 1000 }, c.now);
  expect("first allowed", rl.check("ip1").allowed);
  expect("second blocked same window", !rl.check("ip1").allowed);
  c.advance(1100);
  expect("after window allowed again", rl.check("ip1").allowed);
}

{
  const c = fakeClock(1000);
  const rl = new RateLimiter({ limit: 100, windowMs: 1000 }, c.now);
  for (let i = 0; i < 50; i++) rl.check(`ip${i}`);
  expect("50 unique keys tracked", rl.size() === 50);
  c.advance(1500);
  rl.check("ip-new");
  expect("expired keys pruned after window", rl.size() === 1, `size=${rl.size()}`);
}

if (failed > 0) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nall tests passed");
