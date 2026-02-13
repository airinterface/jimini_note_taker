import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import * as Config from '@/data/Config';
import { NoteRepository, ApiService, PatientRepository } from '@/types';
import { PatientsRepository, MockNoteRepository, ProductionNoteRepository } from './repositories';
import { HttpApiService } from '@/services/ApiSerivce';

interface ServiceContextType {
  noteRepository: NoteRepository;
  patientsRepository: PatientRepository;
  apiService: ApiService;
}

const ServiceContext = createContext<ServiceContextType | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
  environment?: 'development' | 'production' | 'test';
}


export const ServiceProvider: React.FC<ServiceProviderProps> = ({
  children,
}) => {
  const apiService = new HttpApiService(Config.baseURL);

  const noteRepository = Config.environment === 'development' || Config.environment === 'test'
    ? new MockNoteRepository()
    : new ProductionNoteRepository(apiService);
  const patientsRepository = new PatientsRepository(apiService);

  const services: ServiceContextType = {
    noteRepository,
    patientsRepository,
    apiService
  };

  return (
    <ServiceContext.Provider value={services} >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within ServiceProvider');
  }
  return context;
};