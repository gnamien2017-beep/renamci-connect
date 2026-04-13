import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  user_id: string | null;
  nom: string;
  prenoms: string;
  sexe: "Homme" | "Femme";
  grade: "A7" | "A6" | "A5" | "A4" | "A3" | "B3";
  fonction: string | null;
  profession: string | null;
  direction: string | null;
  ministere: string | null;
  contact: string | null;
  email: string | null;
  adresse: string | null;
  specialisation_ena: string | null;
  promotion_ena: string | null;
  formation_initiale: string | null;
  domaines_expertise: string | null;
  valeurs: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export const GRADES = ["A7", "A6", "A5", "A4", "A3", "B3"] as const;

export type Grade = (typeof GRADES)[number];

export const GRADE_LABELS: Record<Grade, string> = {
  A7: "Grade A7",
  A6: "Grade A6",
  A5: "Grade A5",
  A4: "Grade A4",
  A3: "Grade A3",
  B3: "Grade B3",
};

export const GRADE_COLORS: Record<Grade, string> = {
  A7: "bg-grade-a7",
  A6: "bg-grade-a6",
  A5: "bg-grade-a5",
  A4: "bg-grade-a4",
  A3: "bg-grade-a3",
  B3: "bg-grade-b3",
};

/** Hex-based grade colors for inline styles & 3D buttons */
export const GRADE_COLORS_HEX: Record<Grade, { main: string; light: string; dark: string }> = {
  A7: { main: "#2d6a4f", light: "#40916c", dark: "#1b4332" },
  A6: { main: "#2176ae", light: "#3a8fc7", dark: "#155a8a" },
  A5: { main: "#c9a227", light: "#dbb83a", dark: "#a07d12" },
  A4: { main: "#b5365a", light: "#d04a6e", dark: "#8c2645" },
  A3: { main: "#6b3fa0", light: "#8257b5", dark: "#522d80" },
  B3: { main: "#d35400", light: "#e67e22", dark: "#a04000" },
};

/** Unique color per corps de métier */
export const CORPS_COLORS: Record<string, { bg: string; text: string }> = {
  "diplomatie":              { bg: "#1b4332", text: "#fff" },
  "administration-generale": { bg: "#2d6a4f", text: "#fff" },
  "affaires-maritimes":      { bg: "#0077b6", text: "#fff" },
  "travail-affaires-sociales": { bg: "#7b2cbf", text: "#fff" },
  "ressources-humaines":     { bg: "#e85d04", text: "#fff" },
  "impots":                  { bg: "#b5179e", text: "#fff" },
  "tresor":                  { bg: "#c9a227", text: "#000" },
  "douanes":                 { bg: "#d62828", text: "#fff" },
  "finances-generales":      { bg: "#023e8a", text: "#fff" },
  "commerce":                { bg: "#588157", text: "#fff" },
  "sante":                   { bg: "#e36414", text: "#fff" },
};

export type CorpsMetier = {
  id: string;
  label: string;
  abbrev?: string;
  ecole: "EGAD" | "EGEF";
  grades: readonly Grade[];
};

export const CORPS_METIERS: CorpsMetier[] = [
  // EGAD
  { id: "diplomatie", label: "Diplomatie", ecole: "EGAD", grades: ["A4", "A5", "A6", "A7"] },
  { id: "administration-generale", label: "Administration Générale", abbrev: "AG", ecole: "EGAD", grades: ["B3", "A3", "A4", "A5", "A6", "A7"] },
  { id: "affaires-maritimes", label: "Affaires Maritimes et Portuaires", abbrev: "AMP", ecole: "EGAD", grades: ["B3", "A3", "A4", "A5", "A6", "A7"] },
  { id: "travail-affaires-sociales", label: "Travail et Affaires Sociales", abbrev: "TAS", ecole: "EGAD", grades: ["B3", "A3", "A4", "A5", "A6", "A7"] },
  { id: "ressources-humaines", label: "Ressources Humaines", abbrev: "RH", ecole: "EGAD", grades: ["B3", "A3", "A4", "A5", "A6", "A7"] },
  // EGEF
  { id: "impots", label: "Impôts", ecole: "EGEF", grades: ["B3", "A3", "A4", "A5", "A6", "A7"] },
  { id: "tresor", label: "Trésor", ecole: "EGEF", grades: ["B3", "A3", "A4", "A5", "A6", "A7"] },
  { id: "douanes", label: "Douanes", ecole: "EGEF", grades: ["B3", "A3", "A4", "A5", "A6", "A7"] },
  { id: "finances-generales", label: "Finances Générales", ecole: "EGEF", grades: ["B3", "A3", "A4", "A5", "A6", "A7"] },
  { id: "commerce", label: "Commerce", ecole: "EGEF", grades: ["B3", "A3", "A4", "A5", "A6", "A7"] },
  { id: "sante", label: "Santé", ecole: "EGEF", grades: ["B3", "A3", "A4", "A5", "A6", "A7"] },
];

export function getCorpsById(id: string): CorpsMetier | undefined {
  return CORPS_METIERS.find((c) => c.id === id);
}

export async function fetchProfiles(grade?: Grade) {
  let query = supabase.from("profiles_public" as any).select("*");
  if (grade) {
    query = query.eq("grade", grade);
  }
  const { data, error } = await query.order("nom");
  if (error) throw error;
  return (data as unknown) as Profile[];
}

export async function fetchProfilesByCorps(corpsId: string, grade?: Grade) {
  const corps = getCorpsById(corpsId);
  if (!corps) return [];
  
  let query = supabase.from("profiles_public" as any).select("*");
  query = query.eq("specialisation_ena", corps.label);
  if (grade) {
    query = query.eq("grade", grade);
  }
  const { data, error } = await query.order("nom");
  if (error) throw error;
  return (data as unknown) as Profile[];
}

export async function fetchStats() {
  const { data, error } = await supabase.from("profiles_public" as any).select("sexe, grade");
  if (error) throw error;

  const rows = (data as unknown) as { sexe: string; grade: string }[];
  const total = rows.length;
  const hommes = rows.filter((p) => p.sexe === "Homme").length;
  const femmes = rows.filter((p) => p.sexe === "Femme").length;

  const gradeCount: Record<string, number> = {};
  GRADES.forEach((g) => {
    gradeCount[g] = rows.filter((p) => p.grade === g).length;
  });

  return { total, hommes, femmes, gradeCount };
}
