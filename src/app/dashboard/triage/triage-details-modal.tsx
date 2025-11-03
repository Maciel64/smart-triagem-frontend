"use client";
import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  Heart,
  Thermometer,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { triageQuestions } from "@/data/triage-questions";
import type { Screening } from "@/lib/queries/screening";
import type { TriageData } from "@/types/medical";

interface TriageDetailModalProps {
  triage: Screening | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: TriageData["status"]) => void;
}

export default function TriageDetailModal({
  triage,
  isOpen,
  onClose,
  onUpdateStatus,
}: TriageDetailModalProps) {
  if (!triage) return null;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critica":
        return "bg-destructive text-destructive-foreground";
      case "alta":
        return "bg-chart-4 text-white";
      case "media":
        return "bg-chart-2 text-white";
      case "baixa":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em-andamento":
        return "bg-chart-4 text-white";
      case "concluida":
        return "bg-accent text-accent-foreground";
      case "aguardando-medico":
        return "bg-chart-2 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("pt-BR");
  };

  const getQuestionText = (questionId: string) => {
    const question = triageQuestions.find((q) => q.id === questionId);
    return question?.question || questionId;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-lg"
          >
            <div className="sticky top-0 bg-background border-b border-border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-muted text-lg">
                      {triage.patient?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {triage.patient?.name}
                    </h2>
                    <p className="text-muted-foreground">
                      Protocolo: {triage.id}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Urgency */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Urgência:</span>
                  <Badge className={getUrgencyColor(triage.status)}>
                    {triage.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={getStatusColor(triage.status)}>
                    {triage.status.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Data:</span>
                  <span className="text-sm">
                    {formatDate(new Date(triage.createdAt))}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Relatório da IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-chart-5">
                      {triage.aiScreening}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Sintomas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {triage.symptoms.length} relatado(s)
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Medicamentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {triage.medications.length} medicamento(s)
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => onUpdateStatus(triage.id, "em-andamento")}
                  disabled={triage.status === "em-andamento"}
                >
                  Marcar como Em Andamento
                </Button>
                <Button
                  variant="default"
                  onClick={() => onUpdateStatus(triage.id, "concluida")}
                  disabled={triage.status === "concluida"}
                >
                  Marcar como Concluída
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
