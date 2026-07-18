import {
  ProgramsSection,
  ScholarshipsSection,
  AdmissionsSection,
  FAQSection,
} from "../../components/Sections";

import { CooperativePrinciplesSection } from "../../components/Sections/CooperativePrinciplesSection";
import { JourneyDiscoverySection } from "../../components/Sections/JourneyDiscoverySection";
import { MembershipSection } from "../../components/Sections/MembershipSection";
import { ContactSection } from "../../components/Sections/ContactSection";
import { CallToActionSection } from "../../components/Sections/CallToActionSection";

export function LandingSections() {
  return (
    <>
      <CooperativePrinciplesSection />

      <JourneyDiscoverySection />

      <ProgramsSection />

      <ScholarshipsSection />

      <AdmissionsSection />

      <MembershipSection />

      <FAQSection />

      <ContactSection />

      <CallToActionSection />
    </>
  );
}
