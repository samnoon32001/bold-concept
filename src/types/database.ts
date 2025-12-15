// MongoDB collection interfaces for BOLD CONCEPT website

export interface Project {
  _id?: string;
  title: string;
  description: string;
  category: 'residential' | 'commercial' | 'renovation' | 'fit-out';
  images: string[];
  completionDate: Date;
  location: string;
  client?: string;
  featured: boolean;
  status: 'completed' | 'ongoing' | 'planned';
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType?: string;
  message: string;
  budget?: string;
  timeline?: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  _id?: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  image?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  _id?: string;
  name: string;
  position: string;
  bio: string;
  image: string;
  email?: string;
  linkedin?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Testimonial {
  _id?: string;
  clientName: string;
  company?: string;
  projectType?: string;
  rating: number; // 1-5
  testimonial: string;
  image?: string;
  featured: boolean;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}
