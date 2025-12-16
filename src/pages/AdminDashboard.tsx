import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, LogOut, FolderOpen, MessageSquare, Settings, X, Save, Eye, Users, BarChart3, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [websiteContact, setWebsiteContact] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingProject, setEditingProject] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [editingWebsiteContact, setEditingWebsiteContact] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all form fields with proper validation
      Object.keys(editForm).forEach(key => {
        if (key !== 'icon' && editForm[key] !== undefined && editForm[key] !== null) {
          formData.append(key, editForm[key]);
        }
      });
      
      // Add icon if selected
      if (selectedIcon) {
        formData.append('icon', selectedIcon);
      } else if (editForm.icon) {
        formData.append('icon', editForm.icon);
      }
      
      console.log('Saving service:', editingService);
      console.log('Form data entries:', Array.from(formData.entries()));
      
      if (editingService && editingService._id) {
        // Update existing service
        await api.updateService(editingService._id, formData, token);
      } else {
        // Create new service
        await api.createService(formData, token);
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
                              <Edit className="w-4 h-4" />
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
        <DialogContent className="sm:max-w-[600px]">
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
              <div>
                <Label htmlFor="images" className="text-stone-700">Project Images</Label>
                <Input 
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  className="border-stone-300"
                />
                {selectedImages.length > 0 && (
                  <p className="text-sm text-stone-600 mt-2">
                    {selectedImages.length} image(s) selected
                  </p>
                )}
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="address" className="text-stone-700">Address</Label>
                <Textarea 
                  id="address"
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  className="border-stone-300"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-stone-700">Phone</Label>
                <Input 
                  id="phone"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="border-stone-300"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-stone-700">Email</Label>
                <Input 
                  id="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="border-stone-300"
                />
              </div>
              <div>
                <Label htmlFor="workingHours" className="text-stone-700">Working Hours</Label>
                <Textarea 
                  id="workingHours"
                  value={editForm.workingHours || ''}
                  onChange={(e) => setEditForm({...editForm, workingHours: e.target.value})}
                  className="border-stone-300"
                  rows={2}
                />
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
    </div>
  );
};

export default AdminDashboard;
