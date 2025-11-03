import { useQuery } from "@tanstack/react-query";
import { axios } from "../../request/axios";
import type { Patient } from "../patient";

export type Screening = {
  id: string;
  symptoms: Array<string>;
  severity: "LOW" | "HIGH" | "MEDIUM" | null;
  status: string;
  medications: Array<string>;
  createdAt: string;
  updatedAt: string;
  patientId: string;
  aiScreening: string;
  patient?: Patient;
};

export function getScreeningsQuery() {
  return useQuery({
    queryKey: ["screenings"],
    queryFn: async () => {
      const response = await axios.get<Screening[]>("/api/v1/screening");

      return response.data;
    },
  });
}
