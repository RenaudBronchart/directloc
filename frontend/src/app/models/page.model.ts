export interface PageModel<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;         // current page (0-based)
  size: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}
