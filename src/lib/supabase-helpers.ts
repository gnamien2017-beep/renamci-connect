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

export async function fetchProfiles(grade?: Grade) {
  let query = supabase.from("profiles_public" as any).select("*");
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
