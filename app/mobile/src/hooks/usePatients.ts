import { Patient, PatientRepository } from "@/types";
import { logger } from "@/utils/logger";
import { useEffect, useState } from "react";

const usePatients = (patientProvider: PatientRepository) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const data = await patientProvider.getPatients();
      setPatients(data);
    } catch (error) {
      logger.error("Failed to fetch patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [patientProvider]);

  return { patients, isLoading };
};

export default usePatients;