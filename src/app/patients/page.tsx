"use client";

import { Mail, Phone, Plus, Search, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getPatientsQuery, Patient } from "@/lib/queries/patient";

export default function PatientsPage() {
  const { data: patients } = getPatientsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSex, setSelectedSex] = useState<"all" | "MALE" | "FEMALE">(
    "all"
  );

  const filteredPatients = patients?.filter((patient: Patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);

    const matchesSex = selectedSex === "all" || patient.sex === selectedSex;

    return matchesSearch && matchesSex;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getSexBadge = (sex?: "MALE" | "FEMALE") => {
    if (sex === "MALE") {
      return (
        <Badge className="bg-blue-500/15 text-blue-700 border-blue-300/50">
          Masculino
        </Badge>
      );
    }
    return (
      <Badge className="bg-pink-500/15 text-pink-700 border-pink-300/50">
        Feminino
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
        <p className="text-muted-foreground mt-2">
          Gestão e histórico de pacientes registrados
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Pacientes
              </CardTitle>
              <User className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients?.length}</div>
              <p className="text-xs text-muted-foreground">
                Registrados no sistema
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
              <CardTitle className="text-sm font-medium">Idade Média</CardTitle>
              <User className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patients
                  ? Math.round(
                      patients?.reduce((acc, p) => acc + p.age, 0) /
                        patients?.length
                    )
                  : ""}
              </div>
              <p className="text-xs text-muted-foreground">Anos</p>
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
                Cadastrados Este Mês
              </CardTitle>
              <User className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  patients?.filter((p) => {
                    const createdDate = new Date(p.createdAt);
                    const now = new Date();
                    return createdDate.getMonth() === now.getMonth();
                  }).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Novembro</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedSex === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSex("all")}
          >
            Todos
          </Button>
          <Button
            variant={selectedSex === "MALE" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedSex("MALE")}
          >
            Masculino
          </Button>
          <Button
            variant={selectedSex === "FEMALE" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedSex("FEMALE")}
          >
            Feminino
          </Button>
        </div>
        <Button className="sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      <div className="space-y-3">
        {filteredPatients?.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum paciente encontrado
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedSex !== "all"
                    ? "Tente ajustar os filtros"
                    : "Clique em Novo Paciente para começar"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPatients?.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {getInitials(patient.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold truncate">
                            {patient.name}
                          </h3>
                          {getSexBadge(patient?.sex as Patient["sex"])}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {patient.age} anos • ID: {patient.id.slice(0, 8)}...
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            <a
                              href={`mailto:${patient.email}`}
                              className="hover:text-primary truncate"
                            >
                              {patient.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            <a
                              href={`tel:${patient.phone}`}
                              className="hover:text-primary"
                            >
                              {patient.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Cadastro
                        </p>
                        <p className="text-sm font-medium">
                          {formatDate(patient.createdAt)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Visualizar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
