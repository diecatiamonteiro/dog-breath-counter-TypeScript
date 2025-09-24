/**
 * @file client/src/app/page.tsx
 * @description Landing page for Paw Pulse (homepage)
 *              Includes hero section, feature highlights, educational content
 *              on canine heart health, step-by-step instructions, statistics,
 *              and call-to-action buttons for authentication and dog tracking.
 */

"use client";

import Container from "@/components/Container";
import Button from "@/components/Button";
import { useAppContext } from "@/context/Context";
import {
  TbLungsFilled,
  TbHeart,
  TbChartLine,
  TbShieldCheck,
  TbArrowRight,
  TbClock,
  TbTrendingUp,
  TbFileText,
} from "react-icons/tb";

export default function HomePage() {
  const { userState } = useAppContext();
  const { user, isAuthenticated } = userState;

  return (
    <div className="min-h-screen bg-primary/10 max-w-5xl mb-24 lg:mb-0">
      {/* Hero Section */}
      <section className="relative bg-primary/20">
        <Container>
          <div className="py-5 md:py-10 text-center max-w-4xl mx-auto relative z-10">
            <div className="flex justify-center">
              <div className="relative">
                <TbLungsFilled
                  className="text-7xl text-accent animate-pulse"
                  aria-hidden="true"
                />
              </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-primary my-4 md:my-8 leading-tight max-w-xl mx-auto">
              Track Your Dog&apos;s Heart Health Through Breathing Rate
            </h1>
            <p className="text-base md:text-xl text-foreground/80 max-w-xl mx-auto leading-relaxed">
              Your dog&apos;s breathing rate is one of the most important
              indicators of their heart health. Paw Pulse makes it easy to track
              and monitor your dog&apos;s breathing patterns.
            </p>
            <div className="flex flex-wrap gap-4 justify-center my-7 md:my-12">
              {user && isAuthenticated ? (
                <Button
                  href="/my-dogs"
                  size="md"
                  className="px-4 py-2 md:px-8 md:py-4 w-full sm:w-fit"
                >
                  Start Tracking Breathing{" "}
                </Button>
              ) : (
                <Button
                  href="/auth"
                  size="md"
                  className="px-4 py-2 md:px-8 md:py-4 w-full sm:w-fit"
                >
                  Start Tracking Breathing
                </Button>
              )}

              <Button
                href="#how-it-works"
                variant="secondary"
                size="md"
                ariaLabel="Learn more about how PawPulse works"
                className="px-4 py-2 md:px-8 md:py-4 w-full sm:w-fit"
              >
                Learn More
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">
                  1 in 10
                </div>
                <div className="text-sm text-foreground/60">dogs affected</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">
                  60%
                </div>
                <div className="text-sm text-foreground/60">senior risk</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">
                  75%
                </div>
                <div className="text-sm text-foreground/60">over 16 years</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Why It Matters */}
      <section className="py-5 md:py-10">
        <Container>
          <div className="grid md:grid-cols-2 gap-5 md:gap-12 items-center text-center md:text-left">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
                Why Your Dog&apos;s Heart Health Matters
              </h2>
              <p className="text-base md:text-lg text-foreground/80">
                Just like humans, dogs have a four-chambered heart that pumps
                blood throughout their body, delivering oxygen and nutrients to
                vital organs. A healthy heart is essential for your dog&apos;s
                overall wellbeing and quality of life.
              </p>
            </div>
            <div>
              <div className="border border-primary/10 bg-gradient-to-br from-primary-light to-primary/20 rounded-2xl p-8 flex flex-col items-center md:items-start">
                <TbHeart
                  className="text-5xl md:text-6xl text-primary mb-4"
                  aria-hidden="true"
                />
                <h3 className="text-xl font-semibold text-primary mb-3">
                  The Heart-Breathing Connection
                </h3>
                <p className="text-foreground/80">
                  When the heart isn&apos;t working efficiently, the body
                  compensates by increasing breathing rate to get more oxygen.
                  This makes breathing rate a crucial early indicator of heart
                  problems.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="scroll-mt-6 py-5 md:py-10 bg-primary/20"
      >
        <Container>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 md:mb-14 text-center">
            How Paw Pulse Works
          </h2>

          <div className="grid md:grid-cols-3 gap-5 md:gap-8 mb-12">
            <div className="relative">
              <div className="bg-main-text-bg rounded-xl p-4 xl:p-6 text-center shadow-sm border border-primary/10 h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TbClock
                    className="text-xl md:text-2xl text-primary"
                    aria-hidden="true"
                  />
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
                <TbArrowRight
                  className="text-2xl text-primary"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="relative">
              <div className="bg-main-text-bg rounded-xl p-6 text-center shadow-sm border border-primary/10 h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TbTrendingUp
                    className="text-xl md:text-2xl text-primary"
                    aria-hidden="true"
                  />
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
                <TbArrowRight
                  className="text-2xl text-primary"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div>
              <div className="bg-main-text-bg rounded-xl p-6 text-center shadow-sm border border-primary/10 h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TbFileText
                    className="text-xl md:text-2xl text-primary"
                    aria-hidden="true"
                  />
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
              <Button href="/my-dogs" size="lg" className="text-lg w-full">
                Start Tracking Breathing
              </Button>
            ) : (
              <Button href="/auth" size="lg" className="text-lg w-full">
                Start Tracking Breathing
              </Button>
            )}
          </div>
        </Container>
      </section>

      {/* Statistics */}
      <section className="py-5 md:py-10">
        <Container>
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
              The Reality of Heart Disease in Dogs
            </h2>
            <p className="text-base md:text-lg text-primary font-semibold">
              Understanding the prevalence and importance of early detection
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gradient-to-br from-primary-light to-primary/10 rounded-xl p-6 text-center transform hover:scale-105 transition-transform">
              <TbHeart
                className="text-4xl md:text-5xl text-primary mx-auto mb-4"
                aria-hidden="true"
              />
              <h3 className="text-3xl font-bold text-primary mb-3">1 in 10</h3>
              <p className="text-primary/90 text-lg leading-tight">
                dogs develops heart disease
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-light to-primary/10 rounded-xl p-6 text-center transform hover:scale-105 transition-transform">
              <TbChartLine
                className="text-4xl md:text-5xl text-primary mx-auto mb-4"
                aria-hidden="true"
              />
              <h3 className="text-3xl font-bold text-primary mb-2">60%</h3>
              <p className="text-primary/90 text-lg leading-tight">
                increase in heart disease risk for senior dogs
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-light to-primary/10 rounded-xl p-6 text-center transform hover:scale-105 transition-transform">
              <TbShieldCheck
                className="text-4xl md:text-5xl text-primary mx-auto mb-4"
                aria-hidden="true"
              />
              <h3 className="text-3xl font-bold text-primary mb-2">75%</h3>
              <p className="text-primary/90 text-lg leading-tight">
                of dogs over 16 years are affected
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary-light/30 to-accent/10 rounded-2xl p-4 md:p-8 border border-primary/15">
            <p className="text-lg text-foreground/70 text-center">
              According to veterinary research, heart disease affects
              approximately 10% of all dogs. However, this risk increases
              dramatically with age - studies show that up to 75% of dogs over
              16 years old develop heart disease. The good news is that early
              detection and treatment can significantly improve outcomes and
              extend your dog&apos;s life!
            </p>
          </div>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="py-5 md:py-10 bg-primary/20">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-start text-center md:text-left">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold mb-6 text-primary">
                Don&apos;t Wait for Symptoms to Appear
              </h2>
              <p className="text-base md:text-lg mb-8 text-foreground/80">
                Early detection of heart problems can make all the difference.
                When caught early, many heart conditions can be managed
                effectively with medication and lifestyle changes, significantly
                improving your dog&apos;s quality of life and longevity.
              </p>

              {user && isAuthenticated ? (
                <Button href="/my-dogs" size="md">
                  Start Tracking Breathing
                </Button>
              ) : (
                <Button href="/auth" size="md">
                  Start Tracking Breathing
                </Button>
              )}
            </div>
            <div>
              <div className="flex flex-col items-center md:items-start border border-foreground/50 bg-foreground/10 backdrop-blur-sm rounded-2xl p-8">
                <TbLungsFilled
                  className="text-5xl md:text-6xl text-accent mb-4"
                  aria-hidden="true"
                />
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">
                  Join Other Pet Parents
                </h3>
                <ul className="text-foreground/80 md:list-disc list-outside md:pl-5 leading-none md:leading-tight space-y-2">
                  <li>Track breathing rate trends over time</li>
                  <li>Share detailed reports with your veterinarian</li>
                  <li>Get peace of mind with proactive monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* References Section */}
      <section className="py-12">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-lg md:text-2xl font-semibold mb-2 text-foreground">
              Research Sources
            </h3>
            <p className="text-foreground">
              The information we present on canine heart health is grounded in
              peer-reviewed veterinary studies and resources curated by
              Heart2Heart, an educational initiative of Boehringer Ingelheim’s
              animal-health division.
            </p>
            <p className="text-foreground mt-4">
              For further reading and additional materials, visit{" "}
              <a
                href="https://www.heart2hearthome.co.za/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
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
