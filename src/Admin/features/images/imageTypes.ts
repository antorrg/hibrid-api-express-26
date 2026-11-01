export interface StoredImage {
  id: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationInfo {
  total: number;
  currentPage: number;
  totalPages?: number;
  limit?: number;
}

export interface GetImagesResponse {
  info: PaginationInfo;
  data: StoredImage[];
}

export interface ImageQueries {
  page?: number;
  limit?: number;
  order?: 'ASC' | 'DESC';
}
