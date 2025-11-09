import { axios } from "@/lib/request/axios";
import { useQuery } from "@tanstack/react-query";

export type Patient = {
  id: string;
  name: string;
  sex: "MALE" | "FEMALE";
  email: string;
  phone: string;
  age: number;
  createdAt: string;
  updatedAt: string;
};

export function getPatientsQuery() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const req = await axios.get<Patient[]>("/api/v1/patient");
      return req.data;
    },
  });
}
