import { useParams, Link, useEffect, useState } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Ruler, Building } from "lucide-react";
import { api } from "@/lib/api";

interface Project {
  _id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  status: string;
  client?: string;
  featured?: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) {
          setError('Project ID not found');
          return;
        }
        
        const projectData = await api.getProjectById(id);
        setProject(projectData);
      } catch (err) {
        setError('Failed to load project');
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="heading-display mb-4">Project Not Found</h1>
            <p className="text-body mb-8">{error || 'The project you are looking for does not exist.'}</p>
            <Link to="/projects" className="btn-primary">
              Back to Projects
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Map project data to the expected format
  const mappedProject = {
    ...project,
    year: new Date(project.createdAt).getFullYear().toString(),
    area: 'Custom Size', // This could be added to the backend schema
    scope: [
      'Complete Interior Fit-Out',
      'Custom Joinery',
      'MEP Coordination',
      'Quality Assurance'
    ]
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end">
        <div className="absolute inset-0">
          <img
            src={project.images[0]}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
        <div className="relative z-10 container-custom pb-12 md:pb-16">
          <Link
            to="/projects"
            className="inline-flex items-center text-white/70 hover:text-white text-sm uppercase tracking-[0.15em] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-label text-secondary block mb-3">
              {project.category}
            </span>
            <h1 className="heading-display text-white">{project.title}</h1>
          </motion.div>
        </div>
      </section>

      {/* Project Info */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="heading-card text-2xl text-foreground mb-6">Project Overview</h2>
                <p className="text-body mb-8">{project.description}</p>

                <h3 className="text-lg font-medium text-foreground mb-4">Scope of Work</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
                  {mappedProject.scope.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 bg-secondary rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Gallery */}
              <div className="space-y-6">
                {project.images.slice(1).map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <img
                      src={image}
                      alt={`${project.title} - View ${index + 2}`}
                      className="w-full aspect-[16/10] object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="sticky top-32 space-y-8 p-8 bg-card border border-border"
              >
                <h3 className="text-lg font-medium text-foreground">Project Details</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-secondary mt-1" />
                    <div>
                      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground block mb-1">Location</span>
                      <span className="text-foreground">{project.location}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Calendar className="w-5 h-5 text-secondary mt-1" />
                    <div>
                      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground block mb-1">Year</span>
                      <span className="text-foreground">{mappedProject.year}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Ruler className="w-5 h-5 text-secondary mt-1" />
                    <div>
                      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground block mb-1">Area</span>
                      <span className="text-foreground">{mappedProject.area}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Building className="w-5 h-5 text-secondary mt-1" />
                    <div>
                      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground block mb-1">Category</span>
                      <span className="text-foreground">{project.category}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <Link to="/contact" className="btn-primary w-full justify-center">
                    Start Similar Project
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProjectDetail;
