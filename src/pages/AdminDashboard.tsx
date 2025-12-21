import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Project, Service, Contact } from '@/lib/api';
import { useDataCache } from '@/hooks/useDataCache';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, LogOut, FolderOpen, MessageSquare, Settings, X, Save, Eye, Users, BarChart3, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ImageCropModal } from '@/components/ImageCropModal';
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

// Skeleton Loader Components
const ProjectSkeleton = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-lg border border-stone-200 p-6 space-y-4"
  >
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-6 bg-stone-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-stone-200 rounded w-1/2 animate-pulse"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-stone-200 rounded animate-pulse"></div>
        <div className="h-8 w-8 bg-stone-200 rounded animate-pulse"></div>
        <div className="h-8 w-8 bg-stone-200 rounded animate-pulse"></div>
      </div>
    </div>
    <div className="h-20 bg-stone-200 rounded animate-pulse"></div>
    <div className="flex gap-2">
      <div className="h-6 bg-stone-200 rounded w-20 animate-pulse"></div>
      <div className="h-6 bg-stone-200 rounded w-16 animate-pulse"></div>
      <div className="h-6 bg-stone-200 rounded w-24 animate-pulse"></div>
    </div>
  </motion.div>
);

const ServiceSkeleton = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-lg border border-stone-200 p-6 space-y-4"
  >
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-6 bg-stone-200 rounded w-2/3 animate-pulse"></div>
        <div className="h-16 w-16 bg-stone-200 rounded-full animate-pulse"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-stone-200 rounded animate-pulse"></div>
        <div className="h-8 w-8 bg-stone-200 rounded animate-pulse"></div>
      </div>
    </div>
    <div className="h-16 bg-stone-200 rounded animate-pulse"></div>
    <div className="space-y-2">
      <div className="h-4 bg-stone-200 rounded w-full animate-pulse"></div>
      <div className="h-4 bg-stone-200 rounded w-3/4 animate-pulse"></div>
      <div className="h-4 bg-stone-200 rounded w-1/2 animate-pulse"></div>
    </div>
  </motion.div>
);

const LoadingSpinner = ({ size = "sm" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };
  
  return (
    <motion.div
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 className={`${sizeClasses[size]} animate-spin`} />
    </motion.div>
  );
};

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [websiteContact, setWebsiteContact] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingProject, setEditingProject] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [editingWebsiteContact, setEditingWebsiteContact] = useState(false);
  const [managingImages, setManagingImages] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [currentImageForCrop, setCurrentImageForCrop] = useState<string | null>(null);
  const [currentImageType, setCurrentImageType] = useState<string | null>(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedDetailedImages, setSelectedDetailedImages] = useState<File[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const detailedImagesInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { invalidateCache } = useDataCache();

  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [isServicesLoading, setIsServicesLoading] = useState(false);
  const [isWebsiteContactLoading, setIsWebsiteContactLoading] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);
  const [isSavingWebsiteContact, setIsSavingWebsiteContact] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState<string | null>(null);
  const [isDeletingService, setIsDeletingService] = useState<string | null>(null);
  
  // Password change state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setIsInitialLoading(true);
      const token = localStorage.getItem('token');
      
      // Simulate smooth loading with staggered timing
      const [projectsRes, servicesRes, websiteContactRes] = await Promise.all([
        api.getProjects().then(res => {
          setTimeout(() => setIsProjectsLoading(false), 300);
          return res;
        }),
        api.getServices().then(res => {
          setTimeout(() => setIsServicesLoading(false), 600);
          return res;
        }),
        api.getWebsiteContact().then(res => {
          setTimeout(() => setIsWebsiteContactLoading(false), 900);
          return res;
        }),
      ]);

      setProjects(projectsRes);
      setServices(servicesRes);
      setWebsiteContact(websiteContactRes);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsInitialLoading(false);
      setIsProjectsLoading(false);
      setIsServicesLoading(false);
      setIsWebsiteContactLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleChangePassword = async () => {
    try {
      setIsChangingPassword(true);
      
      // Validate passwords
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        alert('Please fill in all password fields');
        return;
      }
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('New password and confirmation do not match');
        return;
      }
      
      if (passwordForm.newPassword.length < 6) {
        alert('New password must be at least 6 characters long');
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch('/.netlify/functions/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        setIsPasswordModalOpen(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      alert('Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        setIsDeletingProject(id);
        const token = localStorage.getItem('token');
        await api.deleteProject(id, token);
        fetchData();
      } catch (error) {
        console.error('Failed to delete project:', error);
      } finally {
        setIsDeletingProject(null);
      }
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        setIsDeletingService(id);
        const token = localStorage.getItem('token');
        await api.deleteService(id, token);
        fetchData();
      } catch (error) {
        console.error('Failed to delete service:', error);
      } finally {
        setIsDeletingService(null);
      }
    }
  };

  const handleAddProject = () => {
    setEditingService(null);
    setEditingWebsiteContact(false);
    setEditingProject({ _id: null }); // Use object with null _id for add mode
    setEditForm({
      title: '',
      description: '',
      status: 'ongoing',
      location: '',
      client: '',
      featured: false,
      scope: [],
      area: '',
      completionDate: ''
    });
    setSelectedImages([]);
    setIsEditModalOpen(true);
  };

  const handleEditProject = (project: any) => {
    setEditingService(null);
    setEditingWebsiteContact(false);
    setEditingProject(project);
    setEditForm({
      title: project.title,
      description: project.description,
      status: project.status,
      location: project.location,
      client: project.client || '',
      featured: project.featured || false,
      area: project.area || '',
      completionDate: project.completionDate || '',
      scope: project.scope || []
    });
    setIsEditModalOpen(true);
  };

  const handleAddService = () => {
    setEditingProject(null);
    setEditingWebsiteContact(false);
    setEditingService({ _id: null }); // Use object with null _id for add mode
    setEditForm({
      title: '',
      description: '',
      icon: '',
      features: [],
      order: 0,
      active: true
    });
    setSelectedIcon(null);
    setIsEditModalOpen(true);
  };

  const handleEditService = (service: any) => {
    setEditingProject(null);
    setEditingWebsiteContact(false);
    setEditingService(service);
    setEditForm({
      title: service.title,
      description: service.description,
      icon: service.icon || '',
      features: service.features || [],
      order: service.order || 0,
      active: service.active || true
    });
    setIsEditModalOpen(true);
  };

  const handleIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedIcon(file);
  };

  const handleDetailedImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedDetailedImages(files);
  };

  const handleManageImages = (project: any) => {
    console.log('Managing images for project:', project.title);
    console.log('Current project images:', {
      previewImage: !!project.previewImage,
      detailBannerImage: !!project.detailBannerImage,
      galleryImages: project.galleryImages?.length || 0
    });
    
    // Create a copy of the project to manage
    setManagingImages({ ...project });
    setIsImageModalOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, imageType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`Selected ${imageType} image:`, file.name, file.type, file.size);
      
      // Read the file and open crop modal
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageSrc = event.target?.result as string;
        setCurrentImageForCrop(imageSrc);
        setCurrentImageType(imageType);
        setIsCropModalOpen(true);
        
        // Clear the input
        if (e.target) {
          e.target.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    console.log('Crop completed for:', currentImageType);
    console.log('Cropped file:', croppedFile);
    
    if (!managingImages || !currentImageType) return;
    
    // Convert file to base64 for persistent storage
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      console.log('Converted to base64:', base64Data.substring(0, 50) + '...');
      
      // Update the managingImages state with the base64 image
      if (currentImageType === 'preview') {
        setManagingImages({ ...managingImages, previewImage: base64Data });
      } else if (currentImageType === 'banner') {
        setManagingImages({ ...managingImages, detailBannerImage: base64Data });
      } else if (currentImageType === 'gallery') {
        const currentGallery = managingImages.galleryImages || [];
        setManagingImages({ 
          ...managingImages, 
          galleryImages: [...currentGallery, base64Data] 
        });
      }
      
      // Reset crop modal state
      setCurrentImageForCrop(null);
      setCurrentImageType(null);
    };
    reader.readAsDataURL(croppedFile);
  };

  const getAspectRatio = (imageType: string): number => {
    switch (imageType) {
      case 'preview':
        return 4/3; // Home screen preview
      case 'banner':
        return 16/9; // Detail page banner (reverted from 19:5)
      case 'gallery':
        return 16/10; // Gallery images
      default:
        return 1; // Square fallback
    }
  };

  const getImageTitle = (imageType: string): string => {
    switch (imageType) {
      case 'preview':
        return 'Preview Image';
      case 'banner':
        return 'Banner Image';
      case 'gallery':
        return 'Gallery Image';
      default:
        return 'Image';
    }
  };

  const handleSaveImages = async () => {
    if (!managingImages) return;
    
    setImageUploadLoading(true);
    console.log('Starting image save process...');
    console.log('Current managing images state:', managingImages);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Prepare the update payload with image data
      const updateData = {
        previewImage: managingImages.previewImage || null,
        detailBannerImage: managingImages.detailBannerImage || null,
        galleryImages: managingImages.galleryImages || [],
      };
      
      console.log('Sending image update payload:', updateData);
      
      // Call API to update project images
      const updatedProject = await api.updateProject(managingImages._id, updateData, token);
      console.log('API response:', updatedProject);
      
      // Update local state
      setProjects(projects.map(p => 
        p._id === managingImages._id ? updatedProject : p
      ));
      
      // Show success feedback
      // Invalidate cache to refresh frontend data
      invalidateCache('projects');
      
      alert('Images saved successfully!');
      setIsImageModalOpen(false);
      
    } catch (error) {
      console.error('Failed to save images:', error);
      alert('Failed to save images. Please try again.');
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleRemoveImage = (imageType: string, index?: number) => {
    if (!managingImages) return;
    
    if (imageType === 'preview') {
      setManagingImages({ ...managingImages, previewImage: null });
    } else if (imageType === 'banner') {
      setManagingImages({ ...managingImages, detailBannerImage: null });
    } else if (imageType === 'gallery' && typeof index === 'number') {
      const currentGallery = managingImages.galleryImages || [];
      const newGallery = currentGallery.filter((_, i) => i !== index);
      setManagingImages({ ...managingImages, galleryImages: newGallery });
    }
  };

  const handleSaveProject = async () => {
    try {
      setIsSavingProject(true);
      const token = localStorage.getItem('token');
      
      // Validate required fields
      if (!editForm.title || !editForm.description) {
        alert('Please fill in all required fields (Title, Description)');
        return;
      }
      
      // For Netlify compatibility, send JSON instead of FormData
      // File uploads will need to be handled separately with a service like AWS S3
      const projectData = {
        ...editForm,
        // For now, keep existing images or use empty array
        images: editingProject?.images || [],
        // Convert boolean fields properly
        featured: editForm.featured === true || editForm.featured === 'true'
      };
      
      console.log('Saving project:', editingProject);
      console.log('Project data:', projectData);
      console.log('Data type:', typeof projectData);
      
      if (editingProject && editingProject._id) {
        // Update existing project
        await api.updateProject(editingProject._id, projectData, token);
      } else {
        // Create new project
        await api.createProject(projectData, token);
      }
      
      // Refresh data to show updated list
      fetchData();
      
      // Invalidate cache to refresh frontend data
      invalidateCache('projects');
      
      setIsEditModalOpen(false);
      setEditingProject(null);
      setEditForm({});
      setSelectedImages([]);
    } catch (error) {
      console.error('Failed to save project:', error);
      alert(`Failed to save project: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleSaveService = async () => {
    try {
      setIsSavingService(true);
      const token = localStorage.getItem('token');
      
      // Validate required fields
      if (!editForm.title || !editForm.description) {
        alert('Please fill in all required fields (Title, Description)');
        return;
      }
      
      const serviceData = {
        ...editForm,
        // Convert arrays and booleans properly
        features: Array.isArray(editForm.features) ? editForm.features : [],
        order: parseInt(editForm.order) || 0,
        active: editForm.active === true || editForm.active === 'true',
        // Keep existing icon or use empty string
        icon: editingService?.icon || ''
      };
      
      console.log('Saving service:', editingService);
      console.log('Service data:', serviceData);
      console.log('Data type:', typeof serviceData);
      
      if (editingService && editingService._id) {
        // Update existing service
        await api.updateService(editingService._id, serviceData, token);
      } else {
        // Create new service
        await api.createService(serviceData, token);
      }
      
      // Refresh data to show updated list
      fetchData();
      
      // Invalidate cache to refresh frontend data
      invalidateCache('services');
      
      setIsEditModalOpen(false);
      setEditingService(null);
      setEditForm({});
      setSelectedIcon(null);
    } catch (error) {
      console.error('Failed to save service:', error);
      alert(`Failed to save service: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSavingService(false);
    }
  };

  const handleEditWebsiteContact = () => {
    setEditingProject(null);
    setEditingService(null);
    setEditingWebsiteContact(true);
    setEditForm({
      address: websiteContact?.address || '',
      phone: websiteContact?.phone || '',
      email: websiteContact?.email || '',
      workingHours: websiteContact?.workingHours || '',
      mapEmbed: websiteContact?.mapEmbed || '',
      socialMedia: websiteContact?.socialMedia || {
        facebook: '',
        instagram: '',
        linkedin: '',
        twitter: ''
      }
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateWebsiteContact = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.updateWebsiteContact(editForm, token);
      fetchData();
      
      // Invalidate cache to refresh frontend data
      invalidateCache('websiteContact');
      
      setIsEditModalOpen(false);
      setEditingWebsiteContact(false);
      setEditForm({});
    } catch (error) {
      console.error('Failed to update website contact:', error);
    }
  };

  // Calculate statistics
  const stats = {
    totalProjects: projects.length,
    activeServices: services.filter(s => s.active).length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-stone-600 to-stone-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">BOLD CONCEPT Admin</h1>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setIsPasswordModalOpen(true)}
              variant="outline" 
              className="border-stone-300 text-stone-700 hover:bg-stone-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button onClick={handleLogout} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-stone-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">Total Projects</p>
                  <p className="text-3xl font-bold text-stone-900 mt-2">{stats.totalProjects}</p>
                </div>
                <FolderOpen className="w-8 h-8 text-stone-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">Active Services</p>
                  <p className="text-3xl font-bold text-stone-900 mt-2">{stats.activeServices}</p>
                </div>
                <Settings className="w-8 h-8 text-stone-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">Completed</p>
                  <p className="text-3xl font-bold text-stone-900 mt-2">{stats.completedProjects}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-stone-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-stone-100 border border-stone-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-stone-900">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-white data-[state=active]:text-stone-900">
              <FolderOpen className="w-4 h-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-white data-[state=active]:text-stone-900">
              <Settings className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="website-contact" className="data-[state=active]:bg-white data-[state=active]:text-stone-900">
              <MessageSquare className="w-4 h-4 mr-2" />
              Website Contact
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              <Card className="border-stone-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-serif text-stone-900">Recent Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.slice(0, 3).map((project: any) => (
                      <div key={project._id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-stone-900">{project.title}</h4>
                          <p className="text-sm text-stone-600">{project.location}</p>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-stone-200 text-stone-700">
                          {project.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif text-stone-900">Manage Projects</h2>
              <Button 
                onClick={handleAddProject}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>
            
            <div className="grid gap-6">
              {isProjectsLoading ? (
                // Show skeleton loaders while loading
                Array.from({ length: 3 }).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProjectSkeleton />
                  </motion.div>
                ))
              ) : (
                // Show actual projects when loaded
                projects.map((project: any) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-stone-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-serif font-semibold text-stone-900">{project.title}</h3>
                            <p className="text-stone-600 mt-1">{project.description}</p>
                            {project.scope && project.scope.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-stone-700 mb-2">Scope of Work:</p>
                                <div className="flex flex-wrap gap-1">
                                  {project.scope.slice(0, 3).map((scopeItem: string, idx: number) => (
                                    <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                      {scopeItem}
                                    </span>
                                  ))}
                                  {project.scope.length > 3 && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                      +{project.scope.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditProject(project)}
                              className="border-stone-300 text-stone-700 hover:bg-stone-50"
                              disabled={isDeletingProject === project._id}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit Details
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleManageImages(project)}
                              className="border-green-300 text-green-700 hover:bg-green-50"
                              disabled={isDeletingProject === project._id}
                            >
                              <ImageIcon className="w-4 h-4 mr-1" />
                              Manage Images
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteProject(project._id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={isDeletingProject === project._id}
                            >
                              {isDeletingProject === project._id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
                            {project.status}
                          </span>
                          <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                            {project.location}
                          </span>
                          {project.featured && (
                            <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif text-stone-900">Manage Services</h2>
              <Button 
                onClick={handleAddService}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>
            
            <div className="grid gap-4">
              {isServicesLoading ? (
                // Show skeleton loaders while loading
                Array.from({ length: 3 }).map((_, index) => (
                  <motion.div
                    key={`service-skeleton-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ServiceSkeleton />
                  </motion.div>
                ))
              ) : (
                // Show actual services when loaded
                services.map((service: any) => (
                  <motion.div
                    key={service._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-stone-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-stone-200 rounded-lg flex items-center justify-center">
                                <Settings className="w-5 h-5 text-stone-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-stone-900">{service.title}</h3>
                                <p className="text-stone-600 mt-1">{service.description}</p>
                                <div className="mt-3">
                                  <div className="flex flex-wrap gap-1">
                                    {service.features?.slice(0, 3).map((feature: string, idx: number) => (
                                      <span key={idx} className="text-xs bg-stone-100 text-stone-700 px-2 py-1 rounded">
                                        {feature}
                                      </span>
                                    ))}
                                    {service.features?.length > 3 && (
                                      <span className="text-xs bg-stone-100 text-stone-700 px-2 py-1 rounded">
                                        +{service.features.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditService(service)}
                              className="border-stone-300 text-stone-700 hover:bg-stone-50"
                              disabled={isDeletingService === service._id}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteService(service._id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={isDeletingService === service._id}
                            >
                              {isDeletingService === service._id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 text-sm text-stone-500">
                          <span className="flex items-center gap-1">
                            {service.active ? (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            ) : (
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            )}
                            {service.active ? 'Active' : 'Inactive'}
                          </span>
                          <span>Order: {service.order}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Website Contact Tab */}
          <TabsContent value="website-contact" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif text-stone-900">Website Contact Information</h2>
              <Button 
                onClick={handleEditWebsiteContact}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Contact Info
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-stone-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-serif text-stone-900">Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-700">Address</p>
                      <p className="text-stone-600 whitespace-pre-line">{websiteContact?.address || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-700">Phone</p>
                      <p className="text-stone-600">{websiteContact?.phone || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-700">Email</p>
                      <p className="text-stone-600">{websiteContact?.email || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-700">Working Hours</p>
                      <p className="text-stone-600 whitespace-pre-line">{websiteContact?.workingHours || 'Not set'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-stone-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-serif text-stone-900">Social Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {websiteContact?.socialMedia && (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-stone-700 w-20">Facebook:</span>
                        <span className="text-stone-600">{websiteContact.socialMedia.facebook || 'Not set'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-stone-700 w-20">Instagram:</span>
                        <span className="text-stone-600">{websiteContact.socialMedia.instagram || 'Not set'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-stone-700 w-20">LinkedIn:</span>
                        <span className="text-stone-600">{websiteContact.socialMedia.linkedin || 'Not set'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-stone-700 w-20">Twitter:</span>
                        <span className="text-stone-600">{websiteContact.socialMedia.twitter || 'Not set'}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-stone-900">
              {editingProject ? (editingProject._id ? 'Edit Project' : 'Add Project') : editingService ? (editingService._id ? 'Edit Service' : 'Add Service') : 'Edit Website Contact'}
            </DialogTitle>
            <DialogDescription>
              {editingProject ? (editingProject._id ? 'Edit the project details below.' : 'Add a new project by filling in the details below.') : editingService ? (editingService._id ? 'Edit the service details below.' : 'Add a new service by filling in the details below.') : 'Edit the website contact information below.'}
            </DialogDescription>
          </DialogHeader>
          
          {editingProject && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-stone-700">Title</Label>
                <Input 
                  id="title"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="border-stone-300"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-stone-700">Description</Label>
                <Textarea 
                  id="description"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="border-stone-300"
                />
              </div>
              
              {/* Enhanced Project Detail Fields */}
              <div>
                <Label htmlFor="location" className="text-stone-700">Location</Label>
                <Input 
                  id="location"
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  className="border-stone-300"
                  placeholder="e.g., Business Bay, Dubai"
                />
              </div>
              
              <div>
                <Label htmlFor="completionDate" className="text-stone-700">Completion Date</Label>
                <Input 
                  id="completionDate"
                  type="date"
                  value={editForm.completionDate || ''}
                  onChange={(e) => setEditForm({...editForm, completionDate: e.target.value})}
                  className="border-stone-300"
                />
              </div>
              
              <div>
                <Label htmlFor="area" className="text-stone-700">Project Area</Label>
                <Input 
                  id="area"
                  value={editForm.area || ''}
                  onChange={(e) => setEditForm({...editForm, area: e.target.value})}
                  className="border-stone-300"
                  placeholder="e.g., 15,000 sq ft"
                />
              </div>
              
              <div>
                <Label htmlFor="client" className="text-stone-700">Client (Optional)</Label>
                <Input 
                  id="client"
                  value={editForm.client || ''}
                  onChange={(e) => setEditForm({...editForm, client: e.target.value})}
                  className="border-stone-300"
                  placeholder="e.g., ABC Corporation"
                />
              </div>
              
              <div>
                <Label htmlFor="scope" className="text-stone-700">Scope of Work</Label>
                <Textarea 
                  id="scope"
                  value={editForm.scope ? editForm.scope.join('\n') : ''}
                  onChange={(e) => setEditForm({...editForm, scope: e.target.value.split('\n').filter(item => item.trim())})}
                  className="border-stone-300"
                  rows={4}
                  placeholder="Enter each scope item on a new line:\nComplete Interior Fit-Out\nCustom Joinery\nMEP Coordination"
                />
                <p className="text-xs text-stone-500 mt-1">Enter each scope item on a new line</p>
              </div>
              
              <div>
                <Label htmlFor="status" className="text-stone-700">Status</Label>
                <select 
                  id="status"
                  value={editForm.status || 'completed'}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
                >
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="planning">Planning</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={editForm.featured === true || editForm.featured === 'true'}
                  onChange={(e) => setEditForm({...editForm, featured: e.target.checked})}
                  className="border-stone-300"
                />
                <Label htmlFor="featured" className="text-stone-700">Featured Project</Label>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveProject}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  disabled={isSavingProject}
                >
                  {isSavingProject ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="border-stone-300 text-stone-700"
                  disabled={isSavingProject}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {editingService && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="service-title" className="text-stone-700">Title</Label>
                <Input 
                  id="service-title"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="border-stone-300"
                />
              </div>
              <div>
                <Label htmlFor="service-description" className="text-stone-700">Description</Label>
                <Textarea 
                  id="service-description"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="border-stone-300"
                />
              </div>
              <div>
                <Label htmlFor="service-features" className="text-stone-700">Features/Subservices (one per line)</Label>
                <Textarea 
                  id="service-features"
                  value={Array.isArray(editForm.features) ? editForm.features.join('\n') : (editForm.features || '')}
                  onChange={(e) => setEditForm({...editForm, features: e.target.value.split('\n').filter(f => f.trim())})}
                  placeholder="Enter each feature or subservice on a new line"
                  className="border-stone-300"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="service-icon" className="text-stone-700">Service Icon</Label>
                <Input 
                  id="service-icon"
                  type="file"
                  accept="image/*"
                  ref={iconInputRef}
                  onChange={handleIconSelect}
                  className="border-stone-300"
                />
                {selectedIcon && (
                  <p className="text-sm text-stone-600 mt-2">
                    Icon selected: {selectedIcon.name}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveService}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  disabled={isSavingService}
                >
                  {isSavingService ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="border-stone-300 text-stone-700"
                  disabled={isSavingService}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {editingWebsiteContact && (
            <div className="space-y-3">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-base font-medium text-stone-900">Contact Information</h3>
                
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor="address" className="text-sm text-stone-700">Address</Label>
                    <Textarea 
                      id="address"
                      value={editForm.address || ''}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      className="border-stone-300 text-sm"
                      rows={2}
                      placeholder="Enter your business address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="phone" className="text-sm text-stone-700">Phone</Label>
                      <Input 
                        id="phone"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="border-stone-300 text-sm"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm text-stone-700">Email</Label>
                      <Input 
                        id="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="border-stone-300 text-sm"
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="workingHours" className="text-sm text-stone-700">Working Hours</Label>
                    <Textarea 
                      id="workingHours"
                      value={editForm.workingHours || ''}
                      onChange={(e) => setEditForm({...editForm, workingHours: e.target.value})}
                      className="border-stone-300 text-sm"
                      rows={2}
                      placeholder="Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                    />
                  </div>
                </div>
              </div>
              
              {/* Social Media Links */}
              <div className="space-y-3">
                <h3 className="text-base font-medium text-stone-900">Social Media</h3>
                
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <Label htmlFor="facebook" className="text-sm text-stone-700">Facebook</Label>
                    <Input 
                      id="facebook"
                      placeholder="https://facebook.com/yourpage"
                      value={editForm.socialMedia?.facebook || ''}
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        socialMedia: { ...editForm.socialMedia, facebook: e.target.value }
                      })}
                      className="border-stone-300 text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="instagram" className="text-sm text-stone-700">Instagram</Label>
                    <Input 
                      id="instagram"
                      placeholder="https://instagram.com/yourprofile"
                      value={editForm.socialMedia?.instagram || ''}
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        socialMedia: { ...editForm.socialMedia, instagram: e.target.value }
                      })}
                      className="border-stone-300 text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="linkedin" className="text-sm text-stone-700">LinkedIn</Label>
                    <Input 
                      id="linkedin"
                      placeholder="https://linkedin.com/company/yourcompany"
                      value={editForm.socialMedia?.linkedin || ''}
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        socialMedia: { ...editForm.socialMedia, linkedin: e.target.value }
                      })}
                      className="border-stone-300 text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="twitter" className="text-sm text-stone-700">Twitter</Label>
                    <Input 
                      id="twitter"
                      placeholder="https://twitter.com/yourhandle"
                      value={editForm.socialMedia?.twitter || ''}
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        socialMedia: { ...editForm.socialMedia, twitter: e.target.value }
                      })}
                      className="border-stone-300 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpdateWebsiteContact}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="border-stone-300 text-stone-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Upload Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-stone-900">
              Manage Images - {managingImages?.title}
            </DialogTitle>
            <DialogDescription>
              Upload and manage images for different sections of the project.
            </DialogDescription>
          </DialogHeader>
          
          {managingImages && (
            <div className="space-y-6">
              {/* Preview Image for Home Screen */}
              <div className="space-y-3">
                <h3 className="text-base font-medium text-stone-900">Preview Image (Home Screen)</h3>
                <p className="text-sm text-stone-600">This image appears as a thumbnail on the home/projects listing. Recommended ratio: 4:3</p>
                
                {managingImages.previewImage ? (
                  <div className="space-y-2">
                    <img 
                      src={managingImages.previewImage} 
                      alt="Current preview" 
                      className="w-full max-w-xs aspect-[4/3] object-cover rounded-lg border border-stone-200"
                      onError={(e) => {
                        console.error('Failed to load preview image:', e);
                        console.log('Image src type:', typeof managingImages.previewImage);
                        console.log('Image src length:', managingImages.previewImage?.length);
                      }}
                      onLoad={() => {
                        console.log('Preview image loaded successfully');
                      }}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleRemoveImage('preview')}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove Preview Image
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSelect(e, 'preview')}
                      className="border-stone-300"
                      placeholder="Upload preview image (4:3 ratio)"
                    />
                    <p className="text-xs text-stone-500 mt-1">Upload an image with 4:3 aspect ratio for best results</p>
                  </div>
                )}
              </div>
              
              {/* Detail Banner Image */}
              <div className="space-y-3">
                <h3 className="text-base font-medium text-stone-900">Detail Banner Image</h3>
                <p className="text-sm text-stone-600">This wide image appears at the top of the project detail page. Recommended ratio: 16:9</p>
                
                {managingImages.detailBannerImage ? (
                  <div className="space-y-2">
                    <img 
                      src={managingImages.detailBannerImage} 
                      alt="Current banner" 
                      className="w-full aspect-[16/9] object-cover rounded-lg border border-stone-200"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleRemoveImage('banner')}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove Banner Image
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSelect(e, 'banner')}
                      className="border-stone-300"
                      placeholder="Upload banner image (16:9 ratio)"
                    />
                    <p className="text-xs text-stone-500 mt-1">Upload a wide image with 16:9 aspect ratio for the project header</p>
                  </div>
                )}
              </div>
              
              {/* Gallery Images */}
              <div className="space-y-3">
                <h3 className="text-base font-medium text-stone-900">Gallery Images (Optional)</h3>
                <p className="text-sm text-stone-600">These images appear in the project gallery section. Recommended ratio: 16:10</p>
                
                {managingImages.galleryImages && managingImages.galleryImages.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {managingImages.galleryImages.map((image: string, index: number) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image} 
                            alt={`Gallery ${index + 1}`} 
                            className="w-full aspect-[16/10] object-cover rounded-lg border border-stone-200"
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white border-red-600 hover:bg-red-700"
                            onClick={() => handleRemoveImage('gallery', index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {managingImages.galleryImages.length < 3 && (
                      <div>
                        <Input 
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageSelect(e, 'gallery')}
                          className="border-stone-300"
                          placeholder="Add more gallery images (up to 3 total)"
                        />
                        <p className="text-xs text-stone-500 mt-1">Upload up to 3 images with 16:10 aspect ratio</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <Input 
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageSelect(e, 'gallery')}
                      className="border-stone-300"
                      placeholder="Upload gallery images (16:10 ratio)"
                    />
                    <p className="text-xs text-stone-500 mt-1">Upload 2-3 images with 16:10 aspect ratio for the project gallery</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4 border-t border-stone-200">
                <Button 
                  onClick={handleSaveImages}
                  disabled={imageUploadLoading}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  {imageUploadLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Images
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsImageModalOpen(false)}
                  className="border-stone-300 text-stone-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => {
          setIsCropModalOpen(false);
          setCurrentImageForCrop(null);
          setCurrentImageType(null);
        }}
        imageSrc={currentImageForCrop || ''}
        onCropComplete={handleCropComplete}
        aspectRatio={currentImageType ? getAspectRatio(currentImageType) : 1}
        title={currentImageType ? getImageTitle(currentImageType) : 'Image'}
      />

      {/* Password Change Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-stone-900">Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password to update your credentials.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="text-stone-700">Current Password</Label>
              <Input 
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                className="border-stone-300"
                placeholder="Enter current password"
              />
            </div>
            
            <div>
              <Label htmlFor="newPassword" className="text-stone-700">New Password</Label>
              <Input 
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className="border-stone-300"
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword" className="text-stone-700">Confirm New Password</Label>
              <Input 
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                className="border-stone-300"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleChangePassword}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <LoadingSpinner size="sm" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsPasswordModalOpen(false)}
              className="border-stone-300 text-stone-700"
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
