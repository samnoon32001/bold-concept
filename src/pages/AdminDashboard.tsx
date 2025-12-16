import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, LogOut, FolderOpen, MessageSquare, Settings, X, Save, Eye, Users, BarChart3, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ImageCropModal } from '@/components/ImageCropModal';

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
      const token = localStorage.getItem('token');
      const [projectsRes, servicesRes, websiteContactRes] = await Promise.all([
        api.getProjects(),
        api.getServices(),
        api.getWebsiteContact(),
      ]);

      setProjects(projectsRes);
      setServices(servicesRes);
      setWebsiteContact(websiteContactRes);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem('token');
        await api.deleteProject(id, token);
        fetchData();
      } catch (error) {
        console.error('Failed to delete project:', error);
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
      category: '',
      status: 'ongoing',
      location: '',
      client: '',
      featured: false
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
      category: project.category,
      status: project.status,
      location: project.location,
      client: project.client || '',
      featured: project.featured || false
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files);
  };

  const handleDetailedImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedDetailedImages(files);
  };

  const handleManageImages = (project: any) => {
    setManagingImages(project);
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
    
    // Update the managingImages state with the cropped image
    const imageUrl = URL.createObjectURL(croppedFile);
    
    if (currentImageType === 'preview') {
      setManagingImages({ ...managingImages, previewImage: imageUrl });
    } else if (currentImageType === 'banner') {
      setManagingImages({ ...managingImages, detailBannerImage: imageUrl });
    } else if (currentImageType === 'gallery') {
      const currentGallery = managingImages.galleryImages || [];
      setManagingImages({ 
        ...managingImages, 
        galleryImages: [...currentGallery, imageUrl] 
      });
    }
    
    // Reset crop modal state
    setCurrentImageForCrop(null);
    setCurrentImageType(null);
  };

  const getAspectRatio = (imageType: string): number => {
    switch (imageType) {
      case 'preview':
        return 4/3; // Home screen preview
      case 'banner':
        return 16/9; // Detail page banner
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
      const token = localStorage.getItem('token');
      
      // Validate required fields
      if (!editForm.title || !editForm.description || !editForm.category) {
        alert('Please fill in all required fields (Title, Description, Category)');
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
      
      setIsEditModalOpen(false);
      setEditingProject(null);
      setEditForm({});
      setSelectedImages([]);
      fetchData();
    } catch (error) {
      console.error('Failed to save project:', error);
      alert(`Failed to save project: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSaveService = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Validate required fields
      if (!editForm.title || !editForm.description) {
        alert('Please fill in all required fields (Title, Description)');
        return;
      }
      
      // For Netlify compatibility, send JSON instead of FormData
      const serviceData = {
        ...editForm,
        // Convert arrays and booleans properly
        features: Array.isArray(editForm.features) ? editForm.features : [],
        order: parseInt(editForm.order) || 0,
        active: editForm.active === true || editForm.active === 'true',
        // Keep existing icon or use empty string
        icon: selectedIcon ? 'new-icon-uploaded' : (editForm.icon || '')
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
      
      setIsEditModalOpen(false);
      setEditingService(null);
      setEditForm({});
      setSelectedIcon(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save service:', error);
      alert(`Failed to save service: ${error.message || 'Unknown error'}`);
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
      setIsEditModalOpen(false);
      setEditingWebsiteContact(false);
      setEditForm({});
      fetchData();
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
          <Button onClick={handleLogout} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
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
                          <p className="text-sm text-stone-600">{project.category}</p>
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
              {projects.map((project: any) => (
                <Card key={project._id} className="border-stone-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className=" usable">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-serif font-semibold text-stone-900">{project.title}</h3>
                            <p className="text-stone-600 mt-1">{project.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditProject(project)}
                              className="border-stone-300 text-stone-700 hover:bg-stone-50"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit Details
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleManageImages(project)}
                              className="border-green-300 text-green-700 hover:bg-green-50"
                            >
                              <ImageIcon className="w-4 h-4 mr-1" />
                              Manage Images
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteProject(project._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 text-sm bg-stone-100 text-stone-700 rounded-full">
                            {project.category}
                          </span>
                          <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
                            {project.status}
                          </span>
                          <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                            {project.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              {services.map((service: any) => (
                <Card key={service._id} className="border-stone-200 bg-white shadow-sm hover:shadow-md transition-shadow">
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
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                service.active 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-stone-100 text-stone-700'
                              }`}>
                                {service.active ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-sm text-stone-600">Order: {service.order}</span>
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
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              <div>
                <Label htmlFor="category" className="text-stone-700">Category</Label>
                <Input 
                  id="category"
                  value={editForm.category || ''}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
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
    </div>
  );
};

export default AdminDashboard;
