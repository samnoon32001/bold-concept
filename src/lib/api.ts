const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

// Debug console
console.log('=== API DEBUG INFO ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('Window location:', typeof window !== 'undefined' ? window.location.origin : 'SSR');
console.log('Netlify detected:', typeof window !== 'undefined' && window.location.hostname.includes('netlify.app'));

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

export interface WebsiteContact {
  _id?: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  mapEmbed?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
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

  async getProjectById(id: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!response.ok) throw new Error('Failed to fetch project');
    return response.json();
  },

  async createProject(projectData: any, token: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create project');
    }
    return response.json();
  },

  async updateProject(id: string, projectData: any, token: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update project');
    }
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

  async updateContact(id: string, status: string, token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update contact');
    return response.json();
  },

  // Services
  async getServices(): Promise<Service[]> {
    const response = await fetch(`${API_BASE_URL}/services`);
    if (!response.ok) throw new Error('Failed to fetch services');
    return response.json();
  },

  async createService(serviceData: any, token: string): Promise<Service> {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(serviceData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create service');
    }
    return response.json();
  },

  async updateService(id: string, serviceData: any, token: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(serviceData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update service');
    }
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

  // Website Contact Information
  async getWebsiteContact(): Promise<WebsiteContact> {
    const response = await fetch(`${API_BASE_URL}/website-contact`);
    if (!response.ok) throw new Error('Failed to fetch website contact');
    return response.json();
  },

  async updateWebsiteContact(contactData: Partial<WebsiteContact>, token: string): Promise<WebsiteContact> {
    const response = await fetch(`${API_BASE_URL}/website-contact`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(contactData),
    });
    if (!response.ok) throw new Error('Failed to update website contact');
    return response.json();
  },

  // Auth
  async login(email: string, password: string) {
    console.log('=== LOGIN API CALL ===');
    console.log('Endpoint:', `${API_BASE_URL}/login`);
    console.log('Method: POST');
    console.log('Headers:', { 'Content-Type': 'application/json' });
    
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      throw new Error('Login failed');
    }
    
    const result = await response.json();
    console.log('Login result:', result);
    return result;
  },
};
