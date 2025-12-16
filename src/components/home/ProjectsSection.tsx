import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { api, Project } from "@/lib/api";
import { useDataCache } from "@/hooks/useDataCache";

const categories = ["All", "Residential", "Commercial", "Hospitality", "Retail", "Renovation"];

export const ProjectsSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { getCachedProjects, cacheStatus } = useDataCache();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getCachedProjects();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [getCachedProjects]);

  const filteredProjects = selectedCategory === "All" 
    ? projects 
    : projects.filter(project => 
        project.category.toLowerCase() === selectedCategory.toLowerCase()
      );

  return (
    <section id="projects" className="py-24 md:py-32 bg-muted/10">
      <div className="container-custom">
        <SectionHeader
          label="Portfolio"
          title="Our Projects"
          description="Explore our diverse portfolio of completed projects across various sectors."
        />

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 md:px-6 py-2 text-xs md:text-sm uppercase tracking-[0.15em] font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-muted-foreground hover:text-foreground border border-border hover:border-secondary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">Loading projects...</div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link
                    to={`/projects/${project._id}`}
                    className="group block relative aspect-[4/3] overflow-hidden"
                  >
                    <img
                      src={project.previewImage || project.images?.[0] || '/placeholder-project.jpg'}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="text-label text-secondary block mb-2">
                        {project.category}
                      </span>
                      <h3 className="font-serif text-xl text-white mb-1">
                        {project.title}
                      </h3>
                      <p className="text-white/70 text-sm">
                        {project.location}
                      </p>
                    </div>
                    <div className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-secondary text-secondary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
};
