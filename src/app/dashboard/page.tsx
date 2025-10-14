"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  Search,
  Download,
  Eye,
  Calendar,
  Activity,
  Heart,
  Thermometer,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { TriageData } from "@/types/medical";
import TriageDetailModal from "./triage/triage-details-modal";
import MedicalReports from "./triage/medical-reports";

export default function MedicalDashboard() {
  const [triages, setTriages] = useState<TriageData[]>([
    {
      id: "1",
      timestamp: new Date("2025-08-01T10:00:00"),
      urgencyLevel: "critica",
      painLevel: 9,
      status: "em-andamento",
      medications: ["Paracetalmol", "Dipirona"],
      patientName: "Lucia Maria",
      symptoms: ["Tonturas", "Sonolência"],
      responses: {},
    },
    {
      id: "2",
      timestamp: new Date("2025-08-02T12:00:00"),
      urgencyLevel: "alta",
      painLevel: 6,
      status: "concluida",
      medications: ["Paracetalmol", "Dipirona"],
      patientName: "Roberto Silva",
      symptoms: ["Dor de Cabeça", "Febre"],
      responses: {},
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const [selectedTriage, setSelectedTriage] = useState<TriageData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"dashboard" | "reports">(
    "dashboard"
  );

  // useEffect(() => {
  //   const loadTriages = () => {
  //     const savedTriages = JSON.parse(localStorage.getItem("triages") || "[]");
  //     setTriages(savedTriages);
  //   };

  //   loadTriages();
  //   // Atualizar a cada 30 segundos para novos dados
  //   const interval = setInterval(loadTriages, 30000);
  //   return () => clearInterval(interval);
  // }, []);

  const updateTriageStatus = (id: string, newStatus: TriageData["status"]) => {
    const updatedTriages = triages.map((triage) =>
      triage.id === id ? { ...triage, status: newStatus } : triage
    );
    setTriages(updatedTriages);
    localStorage.setItem("triages", JSON.stringify(updatedTriages));

    // Atualizar triagem selecionada se for a mesma
    if (selectedTriage?.id === id) {
      setSelectedTriage({ ...selectedTriage, status: newStatus });
    }
  };

  const openTriageDetail = (triage: TriageData) => {
    setSelectedTriage(triage);
    setIsModalOpen(true);
  };

  const filteredTriages = triages.filter((triage) => {
    const matchesSearch =
      triage.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      triage.symptoms.some((symptom) =>
        symptom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesFilter =
      filterUrgency === "all" || triage.urgencyLevel === filterUrgency;
    return matchesSearch && matchesFilter;
  });

  const urgencyStats = {
    critica: triages.filter((t) => t.urgencyLevel === "critica").length,
    alta: triages.filter((t) => t.urgencyLevel === "alta").length,
    media: triages.filter((t) => t.urgencyLevel === "media").length,
    baixa: triages.filter((t) => t.urgencyLevel === "baixa").length,
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
    const dataStr = JSON.stringify(triages, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `triagens_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-accent" />
              <h1 className="text-xl font-semibold text-foreground">
                Painel Médico
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                DR
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-sidebar min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            <Button
              variant={currentView === "dashboard" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setCurrentView("dashboard")}
            >
              <Users className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={currentView === "reports" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setCurrentView("reports")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Agendamentos
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Heart className="h-4 w-4 mr-2" />
              Pacientes
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {currentView === "reports" ? (
            <MedicalReports />
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Crítica
                      </CardTitle>
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-destructive">
                        {urgencyStats.critica}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Atendimento imediato
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Alta
                      </CardTitle>
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
                      <CardTitle className="text-sm font-medium">
                        Média
                      </CardTitle>
                      <Users className="h-4 w-4 text-chart-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-chart-2">
                        {urgencyStats.media}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ordem de chegada
                      </p>
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
                      <CardTitle className="text-sm font-medium">
                        Baixa
                      </CardTitle>
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

              {/* Filters */}
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
                    variant={
                      filterUrgency === "critica" ? "destructive" : "outline"
                    }
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
                    variant={
                      filterUrgency === "media" ? "secondary" : "outline"
                    }
                    size="sm"
                    onClick={() => setFilterUrgency("media")}
                  >
                    Média
                  </Button>
                  <Button
                    variant={
                      filterUrgency === "baixa" ? "secondary" : "outline"
                    }
                    size="sm"
                    onClick={() => setFilterUrgency("baixa")}
                  >
                    Baixa
                  </Button>
                </div>
              </div>

              {/* Triages List */}
              <div className="space-y-4">
                {filteredTriages.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Nenhuma triagem encontrada
                        </h3>
                        <p className="text-muted-foreground">
                          {triages.length === 0
                            ? "Aguardando novos pacientes..."
                            : "Tente ajustar os filtros de busca."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  filteredTriages.map((triage, index) => (
                    <motion.div
                      key={triage.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-muted">
                                  {triage.patientName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-lg">
                                  {triage.patientName}
                                </CardTitle>
                                <CardDescription>
                                  Protocolo: {triage.id} •{" "}
                                  {formatDate(triage.timestamp)}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getUrgencyColor(triage.urgencyLevel)}
                              >
                                {triage.urgencyLevel.toUpperCase()}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openTriageDetail(triage)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Sintomas
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {triage.symptoms.join(", ") || "Não informado"}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Thermometer className="h-4 w-4" />
                                Nível de Dor
                              </h4>
                              <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-chart-5">
                                  {triage.painLevel}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  /10
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Heart className="h-4 w-4" />
                                Medicamentos
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {triage.medications.length > 0
                                  ? triage.medications.join(", ")
                                  : "Nenhum"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </>
          )}
        </main>
      </div>

      <TriageDetailModal
        triage={selectedTriage}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={updateTriageStatus}
      />
    </div>
  );
}
