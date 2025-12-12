import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/home/Hero";
import { ServicesSection } from "@/components/home/ServicesSection";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ContactCTA } from "@/components/home/ContactCTA";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <ServicesSection />
      <ProjectsSection />
      <AboutSection />
      <ContactCTA />
    </Layout>
  );
};

export default Index;
