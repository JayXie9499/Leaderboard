# leaderboard

- [Descripton](#description)
- [Installation](#installation)
- [Usage](#usage)

---

## Description
This is the leaderboard generator for Oyster.

---

## Installation

```sh
npm install @jayxie9499/leaderboard
```
```sh
yarn add @jayxie9499/leaderboard
```
```sh
pnpm add @jayxie9499/leaderboard
```

---

## Usage

```js
const { Leaderboard } = require("@jayxie9499/leaderboard");
const leaderboard = new Leaderboard()
  .setUsers([{
    username: "Oyster",
    discriminator: "6440",
    avatar: "avatar url",
    level: 10
  }])
  .build();

channel.send({
  file: [await leaderboard]
});
```