"use client";

import {
  Activity,
  AlertCircle,
  FileText,
  Heart,
  Send,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
  type?: "question" | "info" | "summary";
  options?: string[];
}

interface TriageData {
  name: string;
  age: string;
  symptoms: string[];
  symptomDetails: { [key: string]: string };
  painLevel: string;
  urgency: "baixa" | "média" | "alta";
  additionalInfo: string;
}

export default function MedicalTriageChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [waitingForSymptomDetails, setWaitingForSymptomDetails] =
    useState(false);
  const [currentSymptomIndex, setCurrentSymptomIndex] = useState(0);
  const [triageData, setTriageData] = useState<TriageData>({
    name: "",
    age: "",
    symptoms: [],
    symptomDetails: {},
    painLevel: "",
    urgency: "baixa",
    additionalInfo: "",
  });

  const symptomDetailQuestions: { [key: string]: string[] } = {
    "Dor de cabeça": [
      "Há quanto tempo você tem essa dor de cabeça?",
      "A dor é pulsátil, em pressão ou em pontada?",
      "Você tem sensibilidade à luz ou som?",
      "Já teve dores de cabeça similares antes?",
    ],
    Febre: [
      "Qual foi a temperatura mais alta que você mediu?",
      "Há quanto tempo está com febre?",
      "Tem calafrios ou suores?",
      "Tomou algum medicamento para febre?",
    ],
    "Dor no peito": [
      "A dor é em aperto, queimação ou pontada?",
      "A dor irradia para braço, pescoço ou mandíbula?",
      "Piora com respiração ou movimento?",
      "Há quanto tempo começou?",
    ],
    "Falta de ar": [
      "A falta de ar começou de repente ou gradualmente?",
      "Piora quando deita ou melhora sentado?",
      "Tem tosse junto com a falta de ar?",
      "Consegue falar frases completas?",
    ],
    Náusea: [
      "Chegou a vomitar?",
      "A náusea piora com movimento?",
      "Consegue manter líquidos?",
      "Tem dor abdominal junto?",
    ],
    "Dor abdominal": [
      "Onde exatamente é a dor? (parte superior, inferior, lateral)",
      "A dor é constante ou em cólicas?",
      "Piora ou melhora com alguma posição?",
      "Tem alterações no intestino?",
    ],
  };

  const triageQuestions = [
    {
      id: "welcome",
      text: "Olá! Sou o assistente de triagem do Hospital. Vou fazer algumas perguntas para ajudar nossa equipe médica a preparar seu atendimento. Qual é o seu nome completo?",
      type: "question" as const,
    },
    {
      id: "age",
      text: "Obrigado! Qual é a sua idade?",
      type: "question" as const,
    },
    {
      id: "symptoms",
      text: "Quais sintomas você está sentindo hoje? (Selecione todos que se aplicam)",
      type: "question" as const,
      options: [
        "Dor de cabeça",
        "Febre",
        "Dor no peito",
        "Falta de ar",
        "Náusea",
        "Dor abdominal",
        "Outros",
      ],
    },
    {
      id: "pain",
      text: "Em uma escala de 1 a 10, qual é o nível da sua dor ou desconforto?",
      type: "question" as const,
      options: [
        "1-2 (Leve)",
        "3-4 (Moderado)",
        "5-6 (Intenso)",
        "7-8 (Muito intenso)",
        "9-10 (Insuportável)",
      ],
    },
    {
      id: "additional",
      text: "Há algo mais que gostaria de informar sobre seu estado atual? (Medicamentos em uso, alergias, etc.)",
      type: "question" as const,
    },
  ];

  useEffect(() => {
    const initialMessage: Message = {
      id: "1",
      text: triageQuestions[0].text,
      sender: "bot",
      timestamp: new Date(),
      status: "delivered",
      type: "question",
      options: triageQuestions[0].options,
    };

    setTimeout(() => {
      setMessages([initialMessage]);
    }, 500);
  }, []);

  const processTriageResponse = (response: string, step: number) => {
    const newTriageData = { ...triageData };

    switch (step) {
      case 0:
        newTriageData.name = response;
        break;
      case 1:
        newTriageData.age = response;
        break;
      case 2:
        if (response === "Finalizar seleção") {
          if (newTriageData.symptoms.length > 0) {
            setWaitingForSymptomDetails(true);
            setCurrentSymptomIndex(0);
            return newTriageData;
          }
        } else {
          if (newTriageData.symptoms.includes(response)) {
            newTriageData.symptoms = newTriageData.symptoms.filter(
              (s) => s !== response,
            );
          } else {
            newTriageData.symptoms = [...newTriageData.symptoms, response];
          }
        }
        break;
      case 3:
        newTriageData.painLevel = response;
        if (response.includes("9-10") || response.includes("7-8")) {
          newTriageData.urgency = "alta";
        } else if (response.includes("5-6") || response.includes("3-4")) {
          newTriageData.urgency = "média";
        }
        break;
      case 4:
        newTriageData.additionalInfo = response;
        break;
    }

    const highPrioritySymptoms = ["Dor no peito", "Falta de ar"];
    if (
      newTriageData.symptoms.some((symptom) =>
        highPrioritySymptoms.includes(symptom),
      )
    ) {
      newTriageData.urgency = "alta";
    }

    setTriageData(newTriageData);
    return newTriageData;
  };

  const processSymptomDetail = (response: string) => {
    const currentSymptom = triageData.symptoms[currentSymptomIndex];
    const newTriageData = { ...triageData };

    if (!newTriageData.symptomDetails[currentSymptom]) {
      newTriageData.symptomDetails[currentSymptom] = response;
    } else {
      newTriageData.symptomDetails[currentSymptom] += ` | ${response}`;
    }

    setTriageData(newTriageData);
    return newTriageData;
  };

  const generateTriageSummary = (data: TriageData) => {
    let symptomsText = "";
    data.symptoms.forEach((symptom) => {
      symptomsText += `• ${symptom}`;
      if (data.symptomDetails[symptom]) {
        symptomsText += `: ${data.symptomDetails[symptom]}`;
      }
      symptomsText += "\n";
    });

    return `**RESUMO DA TRIAGEM**\n\n👤 **Paciente:** ${
      data.name
    }\n📅 **Idade:** ${
      data.age
    } anos\n🩺 **Sintomas detalhados:**\n${symptomsText}⚡ **Nível de dor:** ${
      data.painLevel
    }\n🚨 **Urgência:** ${data.urgency.toUpperCase()}\n📝 **Informações adicionais:** ${
      data.additionalInfo || "Nenhuma"
    }\n\nEste resumo foi enviado para a equipe médica. Você será chamado em breve de acordo com a prioridade do seu caso.`;
  };

  const sendMessage = (messageText?: string, isOption?: boolean) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: "user",
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      if (waitingForSymptomDetails) {
        const updatedData = processSymptomDetail(textToSend);
        const currentSymptom = triageData.symptoms[currentSymptomIndex];

        const questions = symptomDetailQuestions[currentSymptom] || [];
        const currentQuestionCount = (
          updatedData.symptomDetails[currentSymptom] || ""
        ).split(" | ").length;

        if (currentQuestionCount < questions.length) {
          const nextQuestion: Message = {
            id: (Date.now() + 1).toString(),
            text: questions[currentQuestionCount],
            sender: "bot",
            timestamp: new Date(),
            status: "delivered",
            type: "question",
          };
          setMessages((prev) => [...prev, nextQuestion]);
        } else {
          if (currentSymptomIndex + 1 < triageData.symptoms.length) {
            setCurrentSymptomIndex(currentSymptomIndex + 1);
            const nextSymptom = triageData.symptoms[currentSymptomIndex + 1];
            const nextSymptomQuestions =
              symptomDetailQuestions[nextSymptom] || [];

            if (nextSymptomQuestions.length > 0) {
              const nextQuestion: Message = {
                id: (Date.now() + 1).toString(),
                text: `Agora sobre ${nextSymptom.toLowerCase()}: ${
                  nextSymptomQuestions[0]
                }`,
                sender: "bot",
                timestamp: new Date(),
                status: "delivered",
                type: "question",
              };
              setMessages((prev) => [...prev, nextQuestion]);
            }
          } else {
            setWaitingForSymptomDetails(false);
            setCurrentStep(3);

            const nextQuestion: Message = {
              id: (Date.now() + 1).toString(),
              text: triageQuestions[3].text,
              sender: "bot",
              timestamp: new Date(),
              status: "delivered",
              type: "question",
              options: triageQuestions[3].options,
            };
            setMessages((prev) => [...prev, nextQuestion]);
          }
        }
      } else {
        const updatedData = processTriageResponse(textToSend, currentStep);

        if (currentStep === 2 && isOption) {
          if (textToSend !== "Finalizar seleção") {
            const updatedOptions = [...(triageQuestions[2].options || [])];
            if (
              updatedData.symptoms.length > 0 &&
              !updatedOptions.includes("Finalizar seleção")
            ) {
              updatedOptions.push("Finalizar seleção");
            }

            const updatedQuestion: Message = {
              id: (Date.now() + 1).toString(),
              text: `Sintomas selecionados: ${updatedData.symptoms.join(
                ", ",
              )}. Selecione mais ou finalize.`,
              sender: "bot",
              timestamp: new Date(),
              status: "delivered",
              type: "question",
              options: updatedOptions,
            };
            setMessages((prev) => [...prev, updatedQuestion]);
            return;
          } else {
            if (updatedData.symptoms.length > 0) {
              const firstSymptom = updatedData.symptoms[0];
              const questions = symptomDetailQuestions[firstSymptom] || [];

              if (questions.length > 0) {
                setWaitingForSymptomDetails(true);
                setCurrentSymptomIndex(0);

                const detailQuestion: Message = {
                  id: (Date.now() + 1).toString(),
                  text: `Vou fazer algumas perguntas específicas sobre ${firstSymptom.toLowerCase()}: ${
                    questions[0]
                  }`,
                  sender: "bot",
                  timestamp: new Date(),
                  status: "delivered",
                  type: "question",
                };
                setMessages((prev) => [...prev, detailQuestion]);
                return;
              }
            }
          }
        }

        const nextStep = currentStep + 1;

        if (nextStep < triageQuestions.length) {
          const nextQuestion: Message = {
            id: (Date.now() + 1).toString(),
            text: triageQuestions[nextStep].text,
            sender: "bot",
            timestamp: new Date(),
            status: "delivered",
            type: "question",
            options: triageQuestions[nextStep].options,
          };
          setMessages((prev) => [...prev, nextQuestion]);
          setCurrentStep(nextStep);
        } else {
          const summaryMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: generateTriageSummary(updatedData),
            sender: "bot",
            timestamp: new Date(),
            status: "delivered",
            type: "summary",
          };
          setMessages((prev) => [...prev, summaryMessage]);
        }
      }
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUrgencyBadge = () => {
    switch (triageData.urgency) {
      case "alta":
        return (
          <Badge variant="destructive" className="ml-2">
            <AlertCircle className="w-3 h-3 mr-1" />
            Alta
          </Badge>
        );
      case "média":
        return (
          <Badge
            variant="secondary"
            className="ml-2 bg-yellow-100 text-yellow-800"
          >
            <Activity className="w-3 h-3 mr-1" />
            Média
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="ml-2 bg-green-100 text-green-800"
          >
            <Heart className="w-3 h-3 mr-1" />
            Baixa
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-muted">
      <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/medical-avatar.jpg" />
            <AvatarFallback className="bg-accent text-accent-foreground">
              <Heart className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-sm">Triagem Médica</h2>
            <p className="text-xs opacity-90 flex items-center">
              <Activity className="w-3 h-3 mr-1" />
              Sistema Ativo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {triageData.name && getUrgencyBadge()}
          <FileText className="w-5 h-5" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 shadow-sm ${
                  message.sender === "user"
                    ? "bg-card text-card-foreground rounded-br-sm border border-primary/20"
                    : message.type === "summary"
                      ? "bg-accent/10 text-foreground rounded-bl-sm border border-accent/30"
                      : "bg-popover text-popover-foreground rounded-bl-sm border border-border"
                }`}
              >
                {message.type === "summary" ? (
                  <div className="space-y-2">
                    {message.text.split("\n").map((line, index) => (
                      <p
                        key={index}
                        className={`text-sm ${
                          line.includes("**")
                            ? "font-semibold text-primary"
                            : "leading-relaxed"
                        }`}
                      >
                        {line.replace(/\*\*/g, "")}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{message.text}</p>
                )}

                {message.options && message.sender === "bot" && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.options.map((option, index) => (
                      <Button
                        key={index}
                        variant={
                          triageData.symptoms.includes(option)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => sendMessage(option, true)}
                        className="text-xs"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end gap-1 mt-2">
                  <span className="text-xs opacity-70">
                    {formatTime(message.timestamp)}
                  </span>
                  {message.sender === "user" && (
                    <div className="flex">
                      <div
                        className={`w-1 h-1 rounded-full ${
                          message.status === "sent"
                            ? "bg-muted-foreground"
                            : message.status === "delivered"
                              ? "bg-muted-foreground"
                              : "bg-primary"
                        }`}
                      />
                      <div
                        className={`w-1 h-1 rounded-full ml-0.5 ${
                          message.status === "delivered"
                            ? "bg-muted-foreground"
                            : message.status === "read"
                              ? "bg-primary"
                              : "bg-transparent"
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-start"
          >
            <div className="bg-popover text-popover-foreground rounded-lg rounded-bl-sm px-4 py-3 shadow-sm border border-border">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary animate-pulse" />
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: 0,
                    }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: 0.2,
                    }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: 0.4,
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 bg-background border-t border-border">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Digite sua resposta..."
              className="pr-12 rounded-full border-input focus:border-primary focus:ring-primary"
            />
            <Button
              onClick={() => sendMessage()}
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {triageData.name && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center justify-center">
            <Heart className="w-3 h-3 mr-1" />
            Paciente: {triageData.name} | Progresso:{" "}
            {Math.min(currentStep + 1, triageQuestions.length)}/
            {triageQuestions.length}
          </div>
        )}
      </div>
    </div>
  );
}
