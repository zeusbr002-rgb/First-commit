export type Priority = 'LOW' | 'MED' | 'HIGH';
export type Status = 'OPEN' | 'DONE';
export type Role = 'ADMIN' | 'CONTRACTOR';

export interface ServiceOrder {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: Priority;
  status: Status;
  deadline: string;
  evidenceImage?: string; // Base64
}

export interface ScheduleItem {
  id: string;
  imageUrl: string; // Base64
  date: string;
  title: string;
}

export interface AppState {
  serviceOrders: ServiceOrder[];
  scheduleItems: ScheduleItem[];
  currentRole: Role;
}