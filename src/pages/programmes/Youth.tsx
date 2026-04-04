import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import HeroIllustration from "@/components/shared/HeroIllustration";
import FlagImg from "@/components/shared/FlagImg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, Lightbulb, Users, MapPin, Calendar, Target, Trophy,
  Cpu, Stethoscope, Landmark, Leaf, GraduationCap, ArrowRight, Rocket, Star,
  BrainCircuit, ArrowDown,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import parliament25Logo from "@/assets/parliament-25-logo.png";

const Youth = () => {
  const { t } = useTranslation();
  const detailsRef = useRef<HTMLDivElement>(null);

  const scrollToDetails = () => {
    detailsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const phases = [
    { step: "01", title: t("youth.phase1.title"), desc: t("youth.phase1.desc"), icon: <Rocket className="h-6 w-6" /> },
    { step: "02", title: t("youth.phase2.title"), desc: t("youth.phase2.desc"), icon: <Star className="h-6 w-6" /> },
    { step: "03", title: t("youth.phase3.title"), desc: t("youth.phase3.desc"), icon: <Trophy className="h-6 w-6" /> },
  ];

  const tracks = [
    { title: t("youth.track.agritech"), desc: t("youth.track.agritechDesc"), icon: <Leaf className="h-5 w-5" /> },
    { title: t("youth.track.healthtech"), desc: t("youth.track.healthtechDesc"), icon: <Stethoscope className="h-5 w-5" /> },
    { title: t("youth.track.fintech"), desc: t("youth.track.fintechDesc"), icon: <Landmark className="h-5 w-5" /> },
    { title: t("youth.track.cleanenergy"), desc: t("youth.track.cleanenergyDesc"), icon: <Lightbulb className="h-5 w-5" /> },
    { title: t("youth.track.edtech"), desc: t("youth.track.edtechDesc"), icon: <GraduationCap className="h-5 w-5" /> },
  ];

  const countries = [
    { name: "Nigeria", status: t("common.registering") },
    { name: "Ghana", status: t("common.registering") },
    { name: "Côte d'Ivoire", status: t("common.upcoming") },
    { name: "Senegal", status: t("common.upcoming") },
    { name: "Cabo Verde", status: t("common.upcoming") },
    { name: "Togo", status: t("common.upcoming") },
    { name: "Sierra Leone", status: t("common.upcoming") },
  ];

  const prizes = [
    { tier: t("youth.gold"), color: "bg-accent text-accent-foreground", amount: "$10,000", benefits: [t("youth.benefit.mentorship"), t("youth.benefit.incubation"), t("youth.benefit.policyPresentation")] },
    { tier: t("youth.silver"), color: "bg-muted text-foreground", amount: "$5,000", benefits: [t("youth.benefit.mentorship"), t("youth.benefit.networking"), t("youth.benefit.mediaFeature")] },
    { tier: t("youth.bronze"), color: "bg-secondary/20 text-secondary", amount: "$2,500", benefits: [t("youth.benefit.mentorship"), t("youth.benefit.certificate"), t("youth.benefit.alumni")] },
  ];

  const objectives = [t("youth.obj1"), t("youth.obj2"), t("youth.obj3"), t("youth.obj4"), t("youth.obj5")];

  return (
    <Layout>
      {/* Bold Split-Screen Landing */}
      <section className="relative min-h-[90vh] flex flex-col overflow-hidden">
        {/* Back button */}
        <div className="absolute top-6 left-6 z-20">
          <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />{t("common.backToHome")}</Link>
          </Button>
        </div>

        <div className="flex-1 grid md:grid-cols-2 relative">
          {/* Left: Innovators Challenge */}
          <div className="relative flex flex-col items-center justify-center p-8 md:p-12 bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-primary-foreground min-h-[45vh] md:min-h-0">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, hsl(152 100% 40% / 0.3) 20px, hsl(152 100% 40% / 0.3) 21px)"
            }} />
            <div className="relative z-10 text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-3">{t("youth.innovatorsTitle")}</h2>
              <p className="text-primary-foreground/70 text-sm leading-relaxed mb-8">
                {t("youth.innovatorsDesc")}
              </p>
              <Button
                onClick={scrollToDetails}
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-lg"
              >
                {t("youth.learnMore")} <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right: Smart Challenge Quiz */}
          <div className="relative flex flex-col items-center justify-center p-8 md:p-12 bg-gradient-to-bl from-accent via-accent/95 to-accent/80 text-accent-foreground min-h-[45vh] md:min-h-0">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 20px, hsl(50 87% 55% / 0.3) 20px, hsl(50 87% 55% / 0.3) 21px)"
            }} />
            <div className="relative z-10 text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-black/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <BrainCircuit className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-3">{t("youth.smartTitle")}</h2>
              <p className="text-accent-foreground/70 text-sm leading-relaxed mb-8">
                {t("youth.smartDesc")}
              </p>
              <Button
                onClick={scrollToDetails}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg"
              >
                {t("youth.learnMore")} <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Center: 25th Anniversary Logo overlapping the dividing line */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex">
            <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 border-4 border-white shadow-2xl flex items-center justify-center">
              <img
                src={parliament25Logo}
                alt="Parliament @25"
                className="h-28 lg:h-36 w-auto object-contain drop-shadow-lg"
              />
            </div>
          </div>

          {/* Mobile center logo */}
          <div className="absolute left-1/2 top-[45vh] -translate-x-1/2 -translate-y-1/2 z-20 md:hidden">
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 border-4 border-white shadow-2xl flex items-center justify-center">
              <img
                src={parliament25Logo}
                alt="Parliament @25"
                className="h-20 w-auto object-contain"
              />
            </div>
          </div>
              </div>
            </section>
          </Layout>
        );
      };
      
      export default Youth;

 