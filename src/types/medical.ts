export interface TriageData {
  id: string;
  patientName: string;
  symptoms: string[];
  medications: string[];
  painLevel: number;
  urgencyLevel: "baixa" | "media" | "alta" | "critica";
  timestamp: Date;
  status: "em-andamento" | "concluida" | "aguardando-medico";
  responses: Record<string, string>;
}

export interface TriageQuestion {
  id: string;
  question: string;
  type: "text" | "multiple-choice" | "scale";
  options?: string[];
  required: boolean;
  followUp?: string[];
}
