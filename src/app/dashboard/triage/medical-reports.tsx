"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { TriageData } from "@/types/medical";

export default function MedicalReports() {
  const [triages, setTriages] = useState<TriageData[]>([]);
  const [timeRange, setTimeRange] = useState<string>("7d");

  useEffect(() => {
    const loadTriages = () => {
      const savedTriages = JSON.parse(localStorage.getItem("triages") || "[]");
      setTriages(savedTriages);
    };

    loadTriages();
    const interval = setInterval(loadTriages, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredTriages = useMemo(() => {
    const now = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return triages.filter((triage) => new Date(triage.timestamp) >= cutoff);
  }, [triages, timeRange]);

  const urgencyData = useMemo(() => {
    const counts = {
      critica: filteredTriages.filter((t) => t.urgencyLevel === "critica")
        .length,
      alta: filteredTriages.filter((t) => t.urgencyLevel === "alta").length,
      media: filteredTriages.filter((t) => t.urgencyLevel === "media").length,
      baixa: filteredTriages.filter((t) => t.urgencyLevel === "baixa").length,
    };

    return [
      { name: "Crítica", value: counts.critica, color: "#ef4444" },
      { name: "Alta", value: counts.alta, color: "#f59e0b" },
      { name: "Média", value: counts.media, color: "#3b82f6" },
      { name: "Baixa", value: counts.baixa, color: "#10b981" },
    ];
  }, [filteredTriages]);

  const dailyTriages = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayTriages = filteredTriages.filter((triage) => {
        const triageDate = new Date(triage.timestamp)
          .toISOString()
          .split("T")[0];
        return triageDate === dateStr;
      });

      data.push({
        date: date.toLocaleDateString("pt-BR", {
          month: "short",
          day: "numeric",
        }),
        total: dayTriages.length,
        critica: dayTriages.filter((t) => t.urgencyLevel === "critica").length,
        alta: dayTriages.filter((t) => t.urgencyLevel === "alta").length,
        media: dayTriages.filter((t) => t.urgencyLevel === "media").length,
        baixa: dayTriages.filter((t) => t.urgencyLevel === "baixa").length,
      });
    }

    return data;
  }, [filteredTriages, timeRange]);

  const painLevelData = useMemo(() => {
    const levels = Array.from({ length: 10 }, (_, i) => i + 1);
    return levels.map((level) => ({
      level: level.toString(),
      count: filteredTriages.filter((t) => t.painLevel === level).length,
    }));
  }, [filteredTriages]);

  const symptomAnalysis = useMemo(() => {
    const symptomCounts: Record<string, number> = {};

    filteredTriages.forEach((triage) => {
      triage.symptoms.forEach((symptom) => {
        const words = symptom.toLowerCase().split(/\s+/);
        words.forEach((word) => {
          if (word.length > 3) {
            // Ignorar palavras muito pequenas
            symptomCounts[word] = (symptomCounts[word] || 0) + 1;
          }
        });
      });
    });

    return Object.entries(symptomCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([symptom, count]) => ({ symptom, count }));
  }, [filteredTriages]);

  const averageResponseTime = useMemo(() => {
    if (filteredTriages.length === 0) return 0;

    const completedTriages = filteredTriages.filter(
      (t) => t.status === "concluida"
    );
    if (completedTriages.length === 0) return 0;

    // Simulando tempo de resposta baseado na urgência
    const avgTime =
      completedTriages.reduce((acc, triage) => {
        const baseTime =
          {
            critica: 5,
            alta: 15,
            media: 45,
            baixa: 120,
          }[triage.urgencyLevel] || 60;

        return acc + baseTime;
      }, 0) / completedTriages.length;

    return Math.round(avgTime);
  }, [filteredTriages]);

  const exportReport = () => {
    const reportData = {
      periodo: timeRange,
      geradoEm: new Date().toISOString(),
      resumo: {
        totalTriagens: filteredTriages.length,
        tempoMedioResposta: averageResponseTime,
        distribuicaoUrgencia: urgencyData,
      },
      dadosDiarios: dailyTriages,
      analiseNivelDor: painLevelData,
      sintomasFrequentes: symptomAnalysis,
      triagens: filteredTriages,
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_medico_${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios e Análises</h2>
          <p className="text-muted-foreground">
            Visualizações detalhadas dos dados de triagem
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Triagens
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredTriages.length}</div>
              <p className="text-xs text-muted-foreground">
                {timeRange === "7d"
                  ? "Últimos 7 dias"
                  : timeRange === "30d"
                  ? "Últimos 30 dias"
                  : "Últimos 90 dias"}
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
                Tempo Médio de Resposta
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageResponseTime}min</div>
              <p className="text-xs text-muted-foreground">
                Baseado em triagens concluídas
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
                Taxa de Urgência Alta
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredTriages.length > 0
                  ? Math.round(
                      ((urgencyData[0].value + urgencyData[1].value) /
                        filteredTriages.length) *
                        100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                Crítica + Alta urgência
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
                Média Diária
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dailyTriages.length > 0
                  ? Math.round(
                      dailyTriages.reduce((acc, day) => acc + day.total, 0) /
                        dailyTriages.length
                    )
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">Triagens por dia</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Urgência */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Urgência</CardTitle>
            <CardDescription>
              Proporção de casos por nível de urgência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={urgencyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Triagens por Dia */}
        <Card>
          <CardHeader>
            <CardTitle>Triagens por Dia</CardTitle>
            <CardDescription>
              Volume de triagens ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyTriages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="total"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Nível de Dor */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Nível de Dor</CardTitle>
            <CardDescription>
              Frequência de cada nível de dor (1-10)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={painLevelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sintomas Mais Frequentes */}
        <Card>
          <CardHeader>
            <CardTitle>Sintomas Mais Frequentes</CardTitle>
            <CardDescription>
              Palavras-chave mais mencionadas nos sintomas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {symptomAnalysis.map((item, index) => (
                <div
                  key={item.symptom}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {index + 1}
                    </div>
                    <span className="font-medium capitalize">
                      {item.symptom}
                    </span>
                  </div>
                  <Badge variant="secondary">{item.count} menções</Badge>
                </div>
              ))}
              {symptomAnalysis.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum dado de sintomas disponível para o período selecionado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Triagens por Urgência ao Longo do Tempo */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução por Urgência</CardTitle>
          <CardDescription>
            Distribuição de urgências ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={dailyTriages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="critica"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
              />
              <Area
                type="monotone"
                dataKey="alta"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
              />
              <Area
                type="monotone"
                dataKey="media"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
              />
              <Area
                type="monotone"
                dataKey="baixa"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
