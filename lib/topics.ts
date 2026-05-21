export const TOPIC_VALUES = [
  "all",
  "medicine",
  "biology",
  "computer_science",
  "engineering",
  "mathematics",
  "physics",
  "chemistry",
  "social_sciences",
  "psychology",
  "economics",
] as const;

export type Topic = (typeof TOPIC_VALUES)[number];

export interface TopicSpec {
  label: string;
  openalexConcept: string | null;
  keywords: string[];
}

export const TOPICS: Record<Topic, TopicSpec> = {
  all: { label: "Semua topik", openalexConcept: null, keywords: [] },
  medicine: {
    label: "Kedokteran",
    openalexConcept: "C71924100",
    keywords: ["medic", "clinic", "patient", "disease", "diabet", "cancer", "therapy", "pharmac"],
  },
  biology: {
    label: "Biologi",
    openalexConcept: "C86803240",
    keywords: ["biolog", "gene", "protein", "cell", "organism", "evolution", "ecolog"],
  },
  computer_science: {
    label: "Computer Science",
    openalexConcept: "C41008148",
    keywords: ["algorithm", "machine learning", "deep learning", "neural", "comput", "software", "data"],
  },
  engineering: {
    label: "Teknik",
    openalexConcept: "C127413603",
    keywords: ["engineer", "design", "manufactur", "control", "signal", "circuit", "structur"],
  },
  mathematics: {
    label: "Matematika",
    openalexConcept: "C33923547",
    keywords: ["theorem", "equation", "matemat", "topolog", "algebra", "calculus", "manifold"],
  },
  physics: {
    label: "Fisika",
    openalexConcept: "C121332964",
    keywords: ["physic", "quantum", "particle", "relativity", "thermo", "optic", "electromag"],
  },
  chemistry: {
    label: "Kimia",
    openalexConcept: "C185592680",
    keywords: ["chemic", "molecul", "reaction", "synthesis", "catalyst", "polymer"],
  },
  social_sciences: {
    label: "Sosial",
    openalexConcept: "C144024400",
    keywords: ["social", "society", "cultural", "political", "education", "communit"],
  },
  psychology: {
    label: "Psikologi",
    openalexConcept: "C15744967",
    keywords: ["psycholog", "behavior", "cognit", "mental health", "anxiety", "depress"],
  },
  economics: {
    label: "Ekonomi",
    openalexConcept: "C162324750",
    keywords: ["econom", "financ", "market", "trade", "monet", "macroeconom"],
  },
};

export function topicMatches(topic: Topic, text: string): boolean {
  if (topic === "all") return true;
  const spec = TOPICS[topic];
  if (!spec.keywords.length) return true;
  const lower = text.toLowerCase();
  return spec.keywords.some((k) => lower.includes(k));
}
