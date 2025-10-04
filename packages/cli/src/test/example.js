// js-not-baseline.js
const user = { name: "Jon" };

// Optional chaining (ES2020)
console.log(user?.age);

// BroadcastChannel (ES2018+)
const channel = new BroadcastChannel("test");
channel.postMessage("Hello Baseline!");

// BigInt (ES2020)
const bigNumber = 123456789012345678901234567890n;
console.log(bigNumber);