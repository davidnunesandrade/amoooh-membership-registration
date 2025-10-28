/**
 * API Client for making requests to the backend
 * Handles authentication, error handling, and type-safe requests
 */

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: "An error occurred",
      }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Display Medium (Media) APIs
  async getMedia(params?: {
    page?: number;
    limit?: number;
    type?: string;
    location?: string;
    search?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<any>>(
      `/api/media${query ? `?${query}` : ""}`
    );
  }

  async getMediaById(id: number) {
    return this.request<any>(`/api/media/${id}`);
  }

  async createMedia(data: {
    name: string;
    type: string;
    location?: string;
    contactInfo?: string;
    description?: string;
  }) {
    return this.request<any>("/api/media", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMedia(id: number, data: Partial<any>) {
    return this.request<any>(`/api/media/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteMedia(id: number) {
    return this.request<{ message: string }>(`/api/media/${id}`, {
      method: "DELETE",
    });
  }

  // Agency APIs
  async getAgencies(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<any>>(
      `/api/agencies${query ? `?${query}` : ""}`
    );
  }

  async getAgencyById(id: number) {
    return this.request<any>(`/api/agencies/${id}`);
  }

  async createAgency(data: {
    name: string;
    address?: string;
    contactInfo?: string;
    description?: string;
    website?: string;
  }) {
    return this.request<any>("/api/agencies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAgency(id: number, data: Partial<any>) {
    return this.request<any>(`/api/agencies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAgency(id: number) {
    return this.request<{ message: string }>(`/api/agencies/${id}`, {
      method: "DELETE",
    });
  }

  // Advertiser APIs
  async getAdvertisers(params?: {
    page?: number;
    limit?: number;
    agencyId?: number;
    industry?: string;
    search?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<any>>(
      `/api/advertisers${query ? `?${query}` : ""}`
    );
  }

  async getAdvertiserById(id: number) {
    return this.request<any>(`/api/advertisers/${id}`);
  }

  async createAdvertiser(data: {
    name: string;
    agencyId: number;
    industry?: string;
    contactInfo?: string;
    description?: string;
    website?: string;
  }) {
    return this.request<any>("/api/advertisers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAdvertiser(id: number, data: Partial<any>) {
    return this.request<any>(`/api/advertisers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAdvertiser(id: number) {
    return this.request<{ message: string }>(`/api/advertisers/${id}`, {
      method: "DELETE",
    });
  }

  // Member APIs
  async getMembers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    companyId?: number;
    search?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<any>>(
      `/api/members${query ? `?${query}` : ""}`
    );
  }

  async getMemberById(id: number) {
    return this.request<any>(`/api/members/${id}`);
  }

  async createMember(data: {
    userId: string;
    companyId?: number;
    role?: string;
    phone?: string;
    position?: string;
    bio?: string;
  }) {
    return this.request<any>("/api/members", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMember(id: number, data: Partial<any>) {
    return this.request<any>(`/api/members/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteMember(id: number) {
    return this.request<{ message: string }>(`/api/members/${id}`, {
      method: "DELETE",
    });
  }

  // Member Media APIs
  async getMemberMedia(memberId: number) {
    return this.request<any[]>(`/api/members/${memberId}/media`);
  }

  async addMemberMedia(memberId: number, displayMediumIds: number[]) {
    return this.request<any>(`/api/members/${memberId}/media`, {
      method: "POST",
      body: JSON.stringify({ displayMediumIds }),
    });
  }

  async removeMemberMedia(memberId: number, displayMediumIds: number[]) {
    return this.request<any>(`/api/members/${memberId}/media`, {
      method: "DELETE",
      body: JSON.stringify({ displayMediumIds }),
    });
  }
}

export const apiClient = new ApiClient();
