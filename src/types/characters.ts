export interface CharacterInfo {
  Character: string;
  Colors: string[];
}

export function DefaultCharacter() {
  return { Character: "Unknown", Colors: ["Default"] };
}

export const Characters: CharacterInfo[] = [
  { Character: "Doc", Colors: ["Default", "Black", "Blue", "Green", "Red"] },
  {
    Character: "Mario",
    Colors: ["Default", "Black", "Blue", "Green", "Yellow"],
  },
  {
    Character: "Luigi",
    Colors: ["Default", "Blue", "Red", "White"],
  },
  {
    Character: "Bowser",
    Colors: ["Default", "Black", "Blue", "Red"],
  },
  {
    Character: "Peach",
    Colors: ["Default", "Blue", "Daisy", "Green", "White"],
  },
  {
    Character: "Yoshi",
    Colors: ["Default", "Blue", "Cyan", "Pink", "Red", "Yellow"],
  },
  {
    Character: "DK",
    Colors: ["Default", "Black", "Blue", "Green", "Red"],
  },
  {
    Character: "Falcon",
    Colors: ["Default", "Black", "Blue", "Green", "Red", "White"],
  },
  {
    Character: "Ganon",
    Colors: ["Default", "Blue", "Green", "Purple", "Red"],
  },

  {
    Character: "Falco",
    Colors: ["Default", "Blue", "Green", "Red"],
  },
  { Character: "Fox", Colors: ["Default", "Blue", "Green", "Red"] },
  {
    Character: "Ness",
    Colors: ["Default", "Blue", "Green", "Yellow"],
  },
  { Character: "ICs", Colors: ["Default", "Green", "Orange", "Red"] },
  {
    Character: "Kirby",
    Colors: ["Default", "Blue", "Green", "Red", "White", "Yellow"],
  },
  {
    Character: "Samus",
    Colors: ["Default", "Black", "Green", "Pink", "Purple"],
  },
  {
    Character: "Zelda",
    Colors: ["Default", "Blue", "Green", "Red", "White"],
  },
  {
    Character: "Link",
    Colors: ["Default", "Black", "Blue", "Red", "White"],
  },
  {
    Character: "YLink",
    Colors: ["Default", "Black", "Blue", "Red", "White"],
  },

  {
    Character: "Pichu",
    Colors: ["Default", "Blue", "Green", "Red"],
  },
  {
    Character: "Pikachu",
    Colors: ["Default", "Cowboy Hat", "Party Hat", "Red"],
  },
  {
    Character: "Puff",
    Colors: ["Default", "Blue", "Crown", "Headband", "Red"],
  },
  {
    Character: "Mewtwo",
    Colors: ["Default", "Blue", "Green", "Red"],
  },
  { Character: "G&W", Colors: ["Default", "Blue", "Green", "Red"] },

  {
    Character: "Marth",
    Colors: ["Default", "Black", "Green", "Red", "White"],
  },
  {
    Character: "Roy",
    Colors: ["Default", "Blue", "Green", "Red", "Yellow"],
  },

  { Character: "Unknown", Colors: ["Default"] },
  {
    Character: "Sheik",
    Colors: ["Default", "Blue", "Green", "Red", "White"],
  },
];
