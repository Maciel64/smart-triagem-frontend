"use client";

import {
  Activity,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Heart,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { getScreeningsQuery, type Screening } from "@/lib/queries/screening";
import type { TriageData } from "@/types/medical";
import TriageDetailModal from "./triage/triage-details-modal";

interface MedicalDashboardProps {
  currentView: string;
}

export default function MedicalDashboard({
  currentView,
}: MedicalDashboardProps) {
  const { data: screenings } = getScreeningsQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const [selectedTriage, setSelectedTriage] = useState<Screening | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateTriageStatus = (id: string, newStatus: TriageData["status"]) => {
    if (selectedTriage?.id === id) {
      setSelectedTriage({ ...selectedTriage, status: newStatus });
    }
  };

  const openTriageDetail = (triage: Screening) => {
    setSelectedTriage(triage);
    setIsModalOpen(true);
  };

  const urgencyStats = {
    alta: screenings?.filter((t) => t.severity === "HIGH").length,
    media: screenings?.filter((t) => t.severity === "MEDIUM").length,
    baixa: screenings?.filter((t) => t.severity === "LOW").length,
  };

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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("pt-BR");
  };

  const exportData = () => {
    const dataStr = JSON.stringify(screenings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `triagens_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alta</CardTitle>
              <Clock className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-4">
                {urgencyStats.alta}
              </div>
              <p className="text-xs text-muted-foreground">
                Atendimento prioritário
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média</CardTitle>
              <Users className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">
                {urgencyStats.media}
              </div>
              <p className="text-xs text-muted-foreground">Ordem de chegada</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Baixa</CardTitle>
              <CheckCircle className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {urgencyStats.baixa}
              </div>
              <p className="text-xs text-muted-foreground">
                Agendamento flexível
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou sintomas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterUrgency === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterUrgency("all")}
          >
            Todos
          </Button>
          <Button
            variant={filterUrgency === "critica" ? "destructive" : "outline"}
            size="sm"
            onClick={() => setFilterUrgency("critica")}
          >
            Crítica
          </Button>
          <Button
            variant={filterUrgency === "alta" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilterUrgency("alta")}
          >
            Alta
          </Button>
          <Button
            variant={filterUrgency === "media" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilterUrgency("media")}
          >
            Média
          </Button>
          <Button
            variant={filterUrgency === "baixa" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilterUrgency("baixa")}
          >
            Baixa
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {screenings?.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhuma triagem encontrada
                </h3>
                <p className="text-muted-foreground">
                  {screenings.length === 0
                    ? "Aguardando novos pacientes..."
                    : "Tente ajustar os filtros de busca."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          screenings?.map((triage, index) => (
            <motion.div
              key={triage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="bg-muted text-sm">
                          {triage.patient?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base truncate">
                          {triage.patient?.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          Protocolo: {triage.id.slice(0, 8)}... •{" "}
                          {formatDate(new Date(triage.createdAt))}
                        </CardDescription>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {triage.aiScreening ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Badge className="bg-blue-500/15 text-blue-700 border-blue-300/50 gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          Relatório IA
                        </Badge>
                      </motion.div>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground gap-1.5"
                      >
                        Sem relatório IA
                      </Badge>
                    )}
                    <Badge
                      className={`${getUrgencyColor(triage.severity || "LOW")}`}
                    >
                      {triage.severity?.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
                        <Activity className="h-4 w-4 text-primary" />
                        Sintomas
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {triage.symptoms.join(", ") || "Não informado"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
                        <Heart className="h-4 w-4 text-destructive" />
                        Medicamentos
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {triage.medications.length > 0
                          ? triage.medications.join(", ")
                          : "Nenhum"}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => openTriageDetail(triage)}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <TriageDetailModal
        triage={selectedTriage}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={updateTriageStatus}
      />
    </>
  );
}
