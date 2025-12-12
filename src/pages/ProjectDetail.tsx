import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Ruler, Building } from "lucide-react";

// Mock project data
const projectsData: Record<string, {
  title: string;
  category: string;
  location: string;
  year: string;
  area: string;
  description: string;
  scope: string[];
  images: string[];
}> = {
  "1": {
    title: "Azure Residence",
    category: "Residential",
    location: "Palm Jumeirah, Dubai",
    year: "2023",
    area: "8,500 sq ft",
    description: "A stunning waterfront residence featuring contemporary design elements with a warm, inviting atmosphere. The project showcases our expertise in creating luxurious living spaces that perfectly balance aesthetics with functionality.",
    scope: ["Complete Interior Fit-Out", "Custom Joinery", "MEP Coordination", "Landscape Integration", "Smart Home Systems"],
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  "2": {
    title: "Horizon Tower Office",
    category: "Commercial",
    location: "Business Bay, Dubai",
    year: "2023",
    area: "15,000 sq ft",
    description: "A modern corporate headquarters designed to foster collaboration and innovation. The space features open-plan work areas, private executive suites, and state-of-the-art meeting facilities.",
    scope: ["Office Fit-Out", "Partition Systems", "Acoustic Solutions", "IT Infrastructure", "Custom Furniture"],
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  "3": {
    title: "Luxe Boutique Hotel",
    category: "Hospitality",
    location: "Downtown Dubai",
    year: "2022",
    area: "25,000 sq ft",
    description: "An intimate boutique hotel that blends contemporary luxury with local cultural influences. Each space was carefully designed to create memorable guest experiences.",
    scope: ["Full Hotel Fit-Out", "Custom Millwork", "Lighting Design", "FF&E Procurement", "Guest Room Packages"],
    images: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    ],
  },
};

const ProjectDetail = () => {
  const { id } = useParams();
  const project = projectsData[id || "1"] || projectsData["1"];

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
                  {project.scope.map((item) => (
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
                      <span className="text-foreground">{project.year}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Ruler className="w-5 h-5 text-secondary mt-1" />
                    <div>
                      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground block mb-1">Area</span>
                      <span className="text-foreground">{project.area}</span>
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
