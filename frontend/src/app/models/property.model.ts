export interface PropertyModel {
  id: string;
  title: string;
  location: string;
  pricePerNight: number;
  coverUrl?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests?: number | null;


  description?: string;
  ownerEmail?: string | null;

  createdAt: string;
  updatedAt?: string | null;
}


export interface PropertyDetail extends PropertyModel {}
