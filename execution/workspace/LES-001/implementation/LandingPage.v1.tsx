
// ==================================================
// LES-IMP-011
// Landing Experience Scaffold
//
// TODO:
// 1. Hero Section
// 2. Value Proposition
// 3. Programs Overview
// 4. Call To Action
// 5. Footer
// ==================================================

// ==================================================
// LES-IMP-010
// Builder v1.1 Operational Qualification
// Landing Experience implementation begins here.
// ==================================================

import { GrowthLayout } from "../../components/Layout";
import { Hero } from "../../components/Hero";
import { LandingSections } from "./LandingSections";

export function LandingPage() {

  return (

    <GrowthLayout>

      <Hero />

      <LandingSections />

    </GrowthLayout>

  );

}
