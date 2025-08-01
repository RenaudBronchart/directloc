import { User } from './user.model';

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  createdAt: string;
  owner: User;
}
