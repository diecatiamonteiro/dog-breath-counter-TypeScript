"use client";

import Container from "@/components/Container";
import Button from "@/components/Button";
import {
  TbLungsFilled,
  TbHeart,
  TbChartLine,
  TbShieldCheck,
  TbStethoscope,
  TbArrowRight,
  TbClock,
  TbTrendingUp,
  TbFileText,
} from "react-icons/tb";
import { useAppContext } from "@/context/Context";

export default function HomePage() {
  const { userState } = useAppContext();
  const { user, isAuthenticated } = userState;

  return (
    <div className="min-h-screen bg-background max-w-5xl">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light via-primary/5 to-accent/10 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
        <Container>
          <div className="text-center max-w-4xl mx-auto relative z-10">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <TbLungsFilled className="text-7xl text-primary animate-pulse" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-8 leading-tight">
              Monitor Your Dog&apos;s
              <span className="block text-accent">Heart Health</span>
              Through Breathing Rate
            </h1>
            <p className="text-xl text-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Your dog&apos;s breathing rate is one of the most important indicators
              of their heart health. Paw Pulse makes it easy to track and
              monitor your dog&apos;s breathing patterns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {user && isAuthenticated ? (
                <Button
                  href="/my-dogs"
                  size="lg"
                  icon={<TbStethoscope />}
                  className="px-8 py-4"
                >
                  Start Monitoring Today
                </Button>
              ) : (
                <Button
                  href="/auth"
                  size="lg"
                  icon={<TbStethoscope />}
                  className="px-8 py-4"
                >
                  Start Monitoring Today
                </Button>
              )}

              <Button
                href="#how-it-works"
                variant="secondary"
                size="lg"
                className="px-8 py-4"
              >
                Learn More
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-dark">
                  1 in 10
                </div>
                <div className="text-sm text-foreground/60">dogs affected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-dark">60%</div>
                <div className="text-sm text-foreground/60">senior risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-dark">75%</div>
                <div className="text-sm text-foreground/60">over 16 years</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Why It Matters - Split Layout */}
      <section className="py-20">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-primary mb-6">
                Why Your Dog&apos;s Heart Health Matters
              </h2>
              <p className="text-lg leading-relaxed text-foreground mb-6">
                Just like humans, dogs have a four-chambered heart that pumps
                blood throughout their body, delivering oxygen and nutrients to
                vital organs. A healthy heart is essential for your dog&apos;s
                overall wellbeing and quality of life.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-foreground/80">
                    Early detection saves lives
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-foreground/80">
                    Breathing rate reveals heart function
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-foreground/80">
                    Proactive monitoring prevents complications
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gradient-to-br from-primary-light to-primary/20 rounded-2xl p-8">
                <TbHeart className="text-6xl text-primary mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-3">
                  The Heart-Breathing Connection
                </h3>
                <p className="text-foreground/80">
                  When the heart isn&apos;t working efficiently, the body compensates
                  by increasing breathing rate to get more oxygen. This makes
                  breathing rate a crucial early indicator of heart problems.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works - Visual Process */}
      <section
        id="how-it-works"
        className="py-20 bg-gradient-to-br from-primary-light/20 to-accent/5"
      >
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">
              How Paw Pulse Works
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Simple, accurate, and reliable breathing rate monitoring in three
              easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="relative">
              <div className="bg-main-text-bg rounded-xl p-6 text-center shadow-sm border border-primary/10">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TbClock className="text-2xl text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  1. Count Breaths
                </h3>
                <p className="text-foreground/70">
                  Choose 15, 30, or 60 seconds and count your dog&apos;s breaths
                  while they&apos;re resting
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-7 transform -translate-y-1/2">
                <TbArrowRight className="text-2xl text-primary/40" />
              </div>
            </div>

            <div className="relative">
              <div className="bg-main-text-bg rounded-xl p-6 text-center shadow-sm border border-primary/10">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TbTrendingUp className="text-2xl text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  2. Get BPM
                </h3>
                <p className="text-foreground/70">
                  Our app automatically calculates breaths per minute and stores
                  the data
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-7 transform -translate-y-1/2">
                <TbArrowRight className="text-2xl text-primary/40" />
              </div>
            </div>

            <div>
              <div className="bg-main-text-bg rounded-xl p-6 text-center shadow-sm border border-primary/10">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TbFileText className="text-2xl text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  3. Track & Share
                </h3>
                <p className="text-foreground/70">
                  Monitor trends over time and share detailed reports with your
                  veterinarian
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            {user && isAuthenticated ? (
              <Button
                href="/my-dogs"
                size="lg"
                icon={<TbStethoscope />}
                className="text-lg"
              >
                Start Monitoring Now
              </Button>
            ) : (
              <Button
                href="/auth"
                size="lg"
                icon={<TbStethoscope />}
                className="text-lg"
              >
                Start Monitoring Now
              </Button>
            )}
          </div>
        </Container>
      </section>

      {/* Statistics - Visual Cards */}
      <section className="py-20">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">
              The Reality of Heart Disease in Dogs
            </h2>
            <p className="text-lg text-foreground/70">
              Understanding the prevalence and importance of early detection
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gradient-to-br from-primary-light to-primary/10 rounded-xl p-8 text-center transform hover:scale-105 transition-transform">
              <TbHeart className="text-5xl text-primary mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-primary mb-2">1 in 10</h3>
              <p className="text-foreground/70 text-lg">
                dogs develops heart disease
              </p>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-8 text-center transform hover:scale-105 transition-transform">
              <TbChartLine className="text-5xl text-accent mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-accent mb-2">60%</h3>
              <p className="text-foreground/70 text-lg">
                increase in heart disease risk for senior dogs
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-dark/10 to-primary-dark/5 rounded-xl p-8 text-center transform hover:scale-105 transition-transform">
              <TbShieldCheck className="text-5xl text-primary-dark mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-primary mb-2">75%</h3>
              <p className="text-foreground/70 text-lg">
                of dogs over 16 years are affected
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary-light/30 to-accent/10 rounded-2xl p-8 border border-primary/20">
            <p className="text-lg leading-relaxed text-foreground text-center">
              According to veterinary research, heart disease affects
              approximately 10% of all dogs. However, this risk increases
              dramatically with age - studies show that up to 75% of dogs over
              16 years old develop heart disease. The good news is that early
              detection and treatment can significantly improve outcomes and
              extend your dog&apos;s life.
            </p>
          </div>
        </Container>
      </section>

      {/* Call to Action - Split Layout */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/90 text-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Don&apos;t Wait for Symptoms to Appear
              </h2>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Early detection of heart problems can make all the difference.
                When caught early, many heart conditions can be managed
                effectively with medication and lifestyle changes, significantly
                improving your dog&apos;s quality of life and longevity.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-white/90">
                    Track breathing rate trends over time
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-white/90">
                    Share detailed reports with your veterinarian
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-white/90">
                    Get peace of mind with proactive monitoring
                  </span>
                </div>
              </div>
              {user && isAuthenticated ? (
                <Button
                  href="/my-dogs"
                  size="lg"
                  icon={<TbStethoscope />}
                  className="text-lg bg-accent hover:bg-accent/80"
                >
                  Start Free Monitoring
                </Button>
              ) : (
                <Button
                  href="/auth"
                  size="lg"
                  icon={<TbStethoscope />}
                  className="text-lg bg-accent hover:bg-accent/80"
                >
                  Start Free Monitoring
                </Button>
              )}
            </div>
            <div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <TbLungsFilled className="text-6xl text-white/80 mb-4" />
                <h3 className="text-2xl font-semibold mb-3">
                  Join Thousands of Pet Parents
                </h3>
                <p className="text-white/80">
                  Responsible pet owners who are proactively monitoring their
                  dog&apos;s heart health with Paw Pulse. Early detection saves
                  lives.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* References Section */}
      <section className="py-12 bg-foreground/5">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              Research Sources
            </h3>
            <p className="text-foreground/60">
              The information we present on canine heart health is grounded in
              peer-reviewed veterinary studies and resources curated by
              Heart2Heart, an educational initiative of Boehringer Ingelheim’s
              animal-health division.
            </p>
            <p className="text-foreground/60 mt-4">
              For further reading and additional materials, visit{" "}
              <a
                href="https://www.heart2hearthome.co.za/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/80 hover:underline"
              >
                Heart2Heart
              </a>
              .
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
