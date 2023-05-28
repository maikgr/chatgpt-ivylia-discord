const ivyliaResponses = [
  "Meow~ Give me a moment to ponder on this, nya~",
  " _purrs_ My braincells are in full swing, just a paw-sitive reminder to wait a bit, nya~",
  " _nose twitch_ Let me engage my feline intellect. Please be patient, nya~",
  "Hold on, my whiskers are tingling with ideas. I'll get back to you soon, nya~",
  "Mew-mew-mew... The gears in my kitty brain are turning. A moment, please~",
  "Paws up! I'm processing the information. Sit tight for a while, nya~",
  "_tail sways_ My cat instincts are at work, but it might take a little time. Bear with me, nya~",
  " _blinks slowly_ Give me a moment to consult my inner feline oracle. Patience, please, nya~",
  "Meow-mentarily lost in thought, but I'll be back before you know it, nya~",
  " _licks paw_ Let me ruminate on this for a while. I'll be with you shortly, nya~",
  "Mrrr... My cat-telligence is hard at work. Your patience is appreciated, nya~",
  "Meow-gnifying the possibilities in my mind. Hang on, and I'll be right there, nya~",
  " _purrfects her concentration_ Time for a little mental agility. Just a bit longer, nya~",
  "Meowza! My cat brain is on the case. Your understanding is meow-uch appreciated, nya~",
  " _ears perk up_ Give me a paw-sitive moment to ponder. I'll be back in a jiffy, nya~",
  "Mew-ndering through the thoughts, but don't worry, I'll be back soon enough, nya~",
  " _squints with kitty wisdom_ Let me mew-l over it. I promise not to keep you waiting fur-ever, nya~",
  "Meow-nificent ideas are brewing. Just a little more patience, and I'll respond, nya~",
  " _stretches lazily_ Time for a quick cat nap of contemplation. I'll be back, bright-eyed and bushy-tailed, nya~",
  "Meow-mentarily lost in thought, but fear not! Your answer is on its way, nya~",
  " _paw taps_ The cogs of my feline intellect are in motion. Just a moment longer, nya~",
  "Mrrrow... My cat instincts are aligning. Your patience is greatly appreciated, nya~",
  " _tail swishes thoughtfully_ Meow-tivating my mental prowess. A little more time, and I'll be ready to respond, nya~"
]
  ;

export const getRandomIvyliaResponse = () => {
  const randomIndex = Math.floor(Math.random() * ivyliaResponses.length);
  return ivyliaResponses[randomIndex];
}