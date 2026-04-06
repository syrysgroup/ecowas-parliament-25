import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  FileText, Image, Download, Calendar, Mic, Shield, Mail, LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function MediaPortal() {
  const { user, profile } = useAuthContext();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container">
          <AnimatedSection>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">
                  <Shield className="h-3 w-3 mr-1" /> Accredited Media
                </Badge>
                <h1 className="text-3xl md:text-4xl font-black">Media Portal</h1>
                <p className="mt-2 text-primary-foreground/70">
                  Welcome back, {profile?.full_name || user?.email}
                </p>
              </div>
              <Button variant="secondary" size="sm" className="gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Press Releases */}
            <AnimatedSection>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Press Releases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Early access to official press releases and statements before public distribution.
                  </p>
                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Photo Gallery */}
            <AnimatedSection delay={80}>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Image className="h-5 w-5 text-primary" /> High-Res Photo Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download high-resolution photographs from all events and programmes.
                  </p>
                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Briefing Documents */}
            <AnimatedSection delay={160}>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" /> Briefing Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Exclusive background briefings, factsheets, and talking points.
                  </p>
                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Interview Scheduling */}
            <AnimatedSection delay={240}>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mic className="h-5 w-5 text-primary" /> Interview Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Schedule interviews with spokespeople and programme leads.
                  </p>
                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Event Calendar */}
            <AnimatedSection delay={320}>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" /> Event Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Full event schedule with media access details and press pass management.
                  </p>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link to="/events">View Events</Link>
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Contact */}
            <AnimatedSection delay={400}>
              <Card className="h-full bg-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" /> Media Liaison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Direct contact with the media team for urgent requests.
                  </p>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <a href="mailto:media@ecowasparliamentinitiatives.org">
                      <Mail className="h-3 w-3" /> Email Media Team
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </Layout>
  );
}
