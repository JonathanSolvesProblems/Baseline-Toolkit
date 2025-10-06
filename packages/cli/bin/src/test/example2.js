// src/test/example.js

const user = {
  name: "Alice",
  settings: {
    theme: "dark",
  },
};

// Optional chaining
console.log(user.settings?.theme);

// Nullish coalescing
const language = user.language ?? "en";
console.log(language);

// Arrow function
const greet = (name) => `Hello, ${name}!`;
console.log(greet(user.name));

// BroadcastChannel usage
const channel = new BroadcastChannel("chat");
channel.postMessage("Hello world!");

// Destructuring
const { theme } = user.settings;
console.log(`Current theme: ${theme}`);

// Template literals
console.log(`User ${user.name} prefers ${theme} mode.`);
