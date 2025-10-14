import type { TriageQuestion } from "@/types/medical";

export const triageQuestions: TriageQuestion[] = [
  {
    id: "name",
    question: "Qual é o seu nome completo?",
    type: "text",
    required: true,
  },
  {
    id: "symptoms",
    question: "Quais sintomas você está sentindo? (Descreva detalhadamente)",
    type: "text",
    required: true,
  },
  {
    id: "pain-level",
    question: "Em uma escala de 1 a 10, qual é o seu nível de dor atual?",
    type: "scale",
    required: true,
  },
  {
    id: "medications",
    question:
      "Você tomou algum medicamento nas últimas 24 horas? Se sim, quais?",
    type: "text",
    required: true,
  },
  {
    id: "duration",
    question: "Há quanto tempo você está sentindo esses sintomas?",
    type: "multiple-choice",
    options: [
      "Menos de 1 hora",
      "1-6 horas",
      "6-24 horas",
      "Mais de 1 dia",
      "Mais de 1 semana",
    ],
    required: true,
  },
  {
    id: "fever",
    question: "Você está com febre?",
    type: "multiple-choice",
    options: [
      "Sim, acima de 38°C",
      "Sim, mas não sei a temperatura",
      "Não",
      "Não sei",
    ],
    required: true,
  },
  {
    id: "breathing",
    question: "Você está com dificuldade para respirar?",
    type: "multiple-choice",
    options: ["Sim, muita dificuldade", "Sim, um pouco", "Não"],
    required: true,
  },
  {
    id: "allergies",
    question: "Você tem alguma alergia conhecida a medicamentos?",
    type: "text",
    required: false,
  },
];
