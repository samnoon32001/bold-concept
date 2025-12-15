const API_BASE_URL = 'http://localhost:5000/api';

// API types
export interface Project {
  _id?: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  completionDate: string;
  location: string;
  client?: string;
  featured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id?: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget?: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// API functions
export const api = {
  // Projects
  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  async createProject(projectData: FormData, token: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: projectData,
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },

  async updateProject(id: string, projectData: FormData, token: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: projectData,
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  },

  async deleteProject(id: string, token: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete project');
    return response.json();
  },

  // Services
  async getServices(): Promise<Service[]> {
    const response = await fetch(`${API_BASE_URL}/services`);
    if (!response.ok) throw new Error('Failed to fetch services');
    return response.json();
  },

  async createService(serviceData: Partial<Service>, token: string): Promise<Service> {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(serviceData),
    });
    if (!response.ok) throw new Error('Failed to create service');
    return response.json();
  },

  // Contacts
  async submitContact(contactData: Partial<Contact>): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });
    if (!response.ok) throw new Error('Failed to submit contact');
    return response.json();
  },

  async getContacts(token: string): Promise<Contact[]> {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch contacts');
    return response.json();
  },

  // Auth
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },
};
