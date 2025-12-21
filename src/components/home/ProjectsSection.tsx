import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { api, Project } from "@/lib/api";
import { useDataCache } from "@/hooks/useDataCache";

export const ProjectsSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { getCachedProjects } = useDataCache();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getCachedProjects() as Project[];
        // Get only featured projects, limit to 4
        const featuredProjects = data
          .filter(project => project.featured)
          .slice(0, 4);
        setProjects(featuredProjects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [getCachedProjects]);

  return (
    <section id="projects" className="py-24 md:py-32 bg-black">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">Portfolio</h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Featured Projects
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore our latest work showcasing excellence in interior design and fit-out execution.
          </p>
        </div>

        {/* Projects Grid - 2x2 on desktop */}
        {loading ? (
          <div className="text-center py-12 text-white">Loading projects...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
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
                  <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <h3 className="font-serif text-2xl text-white mb-2">
                      {project.title}
                    </h3>
                    <p className="text-gray-300">
                      {project.location}
                    </p>
                  </div>
                  <div className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Projects Button */}
        <div className="text-center">
          <Link
            to="/projects"
            className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300 group"
          >
            View All Projects
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
