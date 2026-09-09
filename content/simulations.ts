export type SimulationIcon = "plane" | "helicopter" | "car" | "drone";

export type Simulation = {
  slug: string;
  title: string;
  icon: SimulationIcon;
  summary: string;
  paragraphs: string[];
};

const LOREM_SHORT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.";

const LOREM_LONG = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
];

export const simulations: Simulation[] = [
  {
    slug: "pilotage-avion",
    title: "Pilotage d'avion",
    icon: "plane",
    summary: LOREM_SHORT,
    paragraphs: LOREM_LONG,
  },
  {
    slug: "pilotage-helicoptere",
    title: "Pilotage d'hélicoptère",
    icon: "helicopter",
    summary: LOREM_SHORT,
    paragraphs: LOREM_LONG,
  },
  {
    slug: "course-automobile",
    title: "Course automobile",
    icon: "car",
    summary: LOREM_SHORT,
    paragraphs: LOREM_LONG,
  },
  {
    slug: "vol-de-drone",
    title: "Vol de drone",
    icon: "drone",
    summary: LOREM_SHORT,
    paragraphs: LOREM_LONG,
  },
];
