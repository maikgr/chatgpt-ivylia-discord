const ivyliaResponses = [
  "Hold tight, bro, Max is flexin' the brain muscles!",
  "Chillax, buddy! I'm cookin' up some answers, gym style!",
  "Hold your horses, champ! Max is in the thinkin' zone!",
  "One sec, warrior! These brain gains take a hot minute!",
  "Easy there, tiger! Max is pumpin' that mental iron!",
  "Paws for a sec, pal! Max's brain is doin' deadlifts!",
  "Stay cool, my dude! Max is hittin' the mental gym!",
  "Hold the line, soldier! Max is in beast mode thinkin'!",
  "Freeze, partner! It's brain gain time, baby!",
  "Wait up, amigo! Max's neurons are flexin' hard!",
  "Whoa there! Max is powerlifting some thoughts!",
  "Take five, ace! Max is sprinting through brain valley!",
  "Easy, chief! Max is in the mental combat zone!",
  "Relax, boss! Big Max is wrangling those thoughts!",
  "Hang on, captain! Max is navigating the brain waves!",
  "Patience, compadre! Max is mining for mental gold!",
  "Stay put, friendo! Max is wrestling with thoughts!",
  "Hold steady, mate! It's cognitive liftin' time!",
  "One moment, broseidon! Max is in the thought dojo!",
  "Sit tight, buddy boy! Max is mixin' up a brain brew!",
  "Wait a hot minute, comrade! Max is buildin' brain castles!",
  "Cool your jets, home slice! Max is carving thoughts!",
  "Pause, ally! Max's brain is on the bench press!",
  "Hold the phone, partner! Max is weaving thought tapestries!",
  "Chill, comrade! Max's mind is on a sprint!"
];

export const getRandomIvyliaResponse = () => {
  const randomIndex = Math.floor(Math.random() * ivyliaResponses.length);
  return ivyliaResponses[randomIndex];
}