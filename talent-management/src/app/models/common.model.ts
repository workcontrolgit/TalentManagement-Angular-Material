/**
 * Problem Details - RFC 7807
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: any;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  orderBy?: string;
  fields?: string;
}

/**
 * Paginated response
 */
export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Query parameters for filtering
 */
export interface QueryParams extends PaginationParams {
  [key: string]: any;
}
