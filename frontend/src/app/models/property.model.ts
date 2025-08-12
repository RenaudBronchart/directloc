export interface Property {
  id: string;
  title: string;
  location: string;
  pricePerNight: number;
  coverUrl?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests?: number | null;
  createdAt: string;
}

/** Détail: ce que /properties/:id peut renvoyer (on rend optionnels pour ne pas casser si back n’envoie pas tout) */
export interface PropertyDetail extends Property {
  description?: string;
  ownerEmail?: string;   // au lieu de owner.email
}

/** Pagination Spring */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}
