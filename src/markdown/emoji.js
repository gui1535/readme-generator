/* GitHub's emoji database is large, so it loads in the background after the app starts. */

let emojiByName = null;
let emojiList = [];

export const emojiReady = import('gemoji').then(({ gemoji }) => {
  emojiList = gemoji;
  emojiByName = new Map(gemoji.flatMap((entry) => entry.names.map((name) => [name, entry.emoji])));
});

export const getEmoji = (name) => emojiByName?.get(name);

export const getEmojiList = () => emojiList;
