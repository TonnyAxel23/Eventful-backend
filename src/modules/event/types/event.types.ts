export interface CreateEventDto {
  title: string;
  description: string;
  category: string;
  bannerImage?: string;
  venue: string;
  location: string;
  startDate: Date;
  endDate: Date;
  price: number;
  quantity: number;
  reminderSettings?: {
    oneHour?: boolean;
    oneDay?: boolean;
    threeDays?: boolean;
    oneWeek?: boolean;
  };
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
}

export interface EventFilters {
  category?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}
