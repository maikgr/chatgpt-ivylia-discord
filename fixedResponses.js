const ivyliaResponses = [
  "Paw-lease hold on, I'm doing some kitty calculations (=^-ω-^=)",
  "Hang on a sec, I'm chasing my thoughts! (=^･ｪ･^=)",
  "A moment please, catching that elusive mouse of an idea! ヽ(=^･ω･^=)丿",
  "Hold your paws, I'm pawndering! o(^・x・^)o",
  "Purr-haps you could wait? My kitty brain is working hard! (ฅ'ω'ฅ)",
  "Just a meow-ment, I'm thinking! (=｀ω´=)",
  "Wait a whisker! I'm getting the fur-mation. (=^･_･^=)",
  "One sec, hunting down that answer like a laser point! (=^‥^=)/",
  "Paws for a moment, I'm scratching my head over this, meow! (=^・ｪ・^=)",
  "Give my whiskers a second, I'm catching the red dot of knowledge, nya! (＾• ω •＾)",
  "Fur-real, I need a moment to pounce on this info, purr-lease hold on! (=^-ω-^=)",
  "Please wait, I've got my tail in a twist thinking! ヾ(=`ω´=)ノ”",
  "Just a paw-sitivity moment, I’m rolling in catnip ideas. (=^･ｪ･^=)",
  "Sit and stay, like a good hooman! I'm prowling for the answer, nyaa! ヽ(^‥^=ゞ)",
  "Shhh...be quiet as a mouse while I hunt down this info, meeow! ~(=^–^)",
  "Let me just dig in the litter box of data, one sec, meow! (＾• ω •＾)",
  "Cat got your info? Just a moment while I retrieve it! ヽ(^◇^*)/",
  "Fetching info is like chasing laser pointers, hang on tight! ／(^ × ^)＼",
  "You've got me chasing my tail with that one, please wait! ヽ(=^･ω･^=)丿",
  "Whisker me this, need a moment to think! (=^-ω-^=)",
  "Now where did I bury that information...one second, purr-lease! (=ↀωↀ=)✧",
  "Mroww, let me look out the window at that, wait for a moment, nya! o(^・x・^)o",
  "Keep your fur on, I'm still hunting down those details, meow! (ﾐΦ ﻌ Φﾐ)",
  "I'm just pawndering over that, give me a second... ( =①ω①=)",
  "One moment please, I'm having a little catnap while I think... zzz (^._.^)ﾉ",
  "Need to sharpen my claws on this one, hang on a sec, miaow! ฅ(^・ω・^ฅ)",
  "Be patient like a cat watching a fishbowl, still fetching the info, mew! └(=^‥^=)┐",
  "Hold on, I'm working my feline magic to get you the answer! ヽ(=^･ω･^=)丿",
  "Patience, my dear, I'm still purring over your request! (.=^・ェ・^=)",
  "Purr-lease hold on, I'm still kneading through this data... (／(=✪ x ✪=)＼)",
  "Like a cat with a ball of yarn, I'm untangling this info, wait up! (=^･ω･^=))",
  "Me-wow, this needs some thought! I'll be back in a jiffy, purromise! (￣∇￣)",
  "Hold your horses... or should I say, hold your cats! Still thinking, mew! ヾ(=ﾟ･ﾟ=)ﾉ"
];

export const getRandomIvyliaResponse = () => {
  const randomIndex = Math.floor(Math.random() * ivyliaResponses.length);
  return ivyliaResponses[randomIndex];
}