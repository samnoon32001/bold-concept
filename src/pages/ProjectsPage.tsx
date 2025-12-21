import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api, Project } from "@/lib/api";
import { useDataCache } from "@/hooks/useDataCache";

export const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { getCachedProjects } = useDataCache();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getCachedProjects() as Project[];
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [getCachedProjects]);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="py-24 md:py-32">
        <div className="container-custom">
          <div className="text-center">
            <h1 className="font-serif text-4xl md:text-6xl text-white mb-6">All Projects</h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Explore our complete portfolio of interior design and fit-out projects
            </p>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="pb-24">
        <div className="container-custom">
          {loading ? (
            <div className="text-center py-12 text-white">Loading projects...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link
                    to={`/projects/${project._id}`}
                    className="group block relative aspect-[4/3] overflow-hidden rounded-lg"
                  >
                    <img
                      src={project.previewImage || project.images?.[0] || '/placeholder-project.jpg'}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <h3 className="font-serif text-xl text-white mb-2">
                        {project.title}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {project.location}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          project.status === 'completed' 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
