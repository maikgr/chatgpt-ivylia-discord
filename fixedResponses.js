const ivyliaResponses = [
  'Meow...let me think about that for a moment.',
  'Hold on a second, nya~...',
  'Hmmm, Ivylia needs to ponder that.',
  'One moment please, meow.',
  'Let me consider that question, nya~.',
  'Ivylia is thinking...just a moment.',
  'Meow...give me a second to process.',
  'Wait, let me mull that over.',
  'Ivylia needs a moment to gather her thoughts, nya~.',
  'Hmm, I need to think about that one.',
  'Just a moment, Ivylia is thinking, meow.',
  'Give me a second to think that over, nya~.',
  'Meow...let me contemplate that for a moment.',
  'Hold on a sec, I need to process that question.',
  'Ivylia needs to think that through for a moment, nya~.',
  'Wait a moment, let me consider that.',
  'Hmmm, let me think about that one for a bit, meow.',
  'One moment, Ivylia needs to mull that over.',
  'Let me take a moment to ponder that, nya~.',
  'Ivylia needs to think, meow...just a moment.',
  'Hold on a sec, let me think about that one.',
  'Meow...give me a moment to consider that.',
  'Wait, Ivylia needs a moment to think, nya~.',
  'Hmmm, let me think that through for a moment, meow.',
  'Just a moment, Ivylia is thinking it over, nya~.'
];

export const getRandomIvyliaResponse = () => {
  const randomIndex = Math.floor(Math.random() * ivyliaResponses.length);
  return ivyliaResponses[randomIndex];
}