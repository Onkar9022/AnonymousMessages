"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  Users,
  Shield,
  ChevronRight,
} from "lucide-react";

// Initialize Swiper modules at runtime inside a component effect (avoids top-level execution warnings)

const SLOGANS = [
  "Say it honestly — anonymously.",
  "Share feelings. Receive truth.",
  "Collect thoughtful messages from friends.",
  "A safe place for honest words.",
];

const FEATURES = [
  {
    title: "Create your link",
    desc: "Sign up and get your unique anonymous message link — share anywhere.",
    icon: <MessageCircle size={36} className="text-indigo-600" />,
  },
  {
    title: "Share with people",
    desc: "Post the link on socials, stories, or profile bios.",
    icon: <Users size={36} className="text-purple-600" />,
  },
  {
    title: "Read privately",
    desc: "All messages land in your secure dashboard — you decide what to keep.",
    icon: <Shield size={36} className="text-emerald-600" />,
  },
];

// testimonials replaced inline in the carousel section below

const STATS = [
  { label: "Messages Sent", value: "120K+" },
  { label: "Active Users", value: "40K+" },
  { label: "Links Created", value: "80K+" },
];

export default function HomePage() {
  const [index, setIndex] = useState(0);
  const controls = useAnimation();
  const [showCTA, setShowCTA] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLOGANS.length), 3600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // small float animation whenever slogan changes
    controls.start({ y: [0, -6, 0], transition: { duration: 1.2 } });
  }, [index, controls]);

  useEffect(() => {
    const onScroll = () => {
      setShowCTA(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // initialize Swiper modules on mount (avoids top-level execution warnings)
  useEffect(() => {
    // dynamically load Swiper module exports and register modules at runtime
    let mounted = true;
    (async () => {
      try {
        const sw = await import("swiper");
        if (!mounted) return;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const anySw: any = sw as any;
        const Autoplay = anySw.Autoplay ?? anySw.default?.Autoplay ?? anySw.default ?? null;
        const Pagination = anySw.Pagination ?? anySw.default?.Pagination ?? null;
        const Navigation = anySw.Navigation ?? anySw.default?.Navigation ?? null;
        const modules = [Autoplay, Pagination, Navigation].filter(Boolean);
        if (modules.length > 0) {
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          (SwiperCore as any)["use"](modules);
        }
      } catch {
        // ignore runtime load errors
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-linear-to-b from-indigo-50 via-white to-purple-50 overflow-hidden">
      {/* Floating background blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 w-[520px] h-[520px] rounded-full bg-indigo-200/40 blur-3xl animate-[pulse_8s_infinite]" />
      <div className="pointer-events-none absolute -right-28 -bottom-28 w-[420px] h-[420px] rounded-full bg-purple-200/30 blur-3xl animate-[float_10s_infinite]" />

      {/* NAV */}
      <nav className="relative z-20 max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md px-3 py-1 bg-white/60 backdrop-blur-sm border border-slate-100">
            <span className="text-lg font-bold text-indigo-700">Anonymous</span>
            <span className="ml-1 text-purple-600 font-semibold">Message</span>
          </div>
          <Badge className="ml-3 hidden sm:inline-flex">Beta</Badge>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-slate-700 hover:underline">
            Sign in
          </Link>
          <Link href="/sign-up">
            <Button className="bg-linear-to-b bg-indigo-950 text-white hover:underline ">Get started</Button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative z-10 max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
      >
        <div>
          <motion.h1
            animate={controls}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight max-w-xl"
          >
            <span className="block mb-3 text-indigo-600">AnonymousMessage</span>
            <span className="inline-block text-slate-800">
              <Typewriter
                words={SLOGANS}
                loop={0}
                cursor
                cursorStyle="|"
                typeSpeed={70}
                deleteSpeed={40}
                delaySpeed={2500}
              />
            </span>
          </motion.h1>

          <p className="mt-6 text-slate-600 max-w-lg">
            Create a private link, share it anywhere, and receive honest anonymous messages from friends and followers — beautifully surfaced in your dashboard.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <Link href="/sign-up">
              <Button className="inline-flex items-center gap-2">
                Start free — get your link <ArrowRight size={16} />
              </Button>
            </Link>

            <a
              href="#how"
              className="inline-flex items-center gap-2 text-sm text-slate-700 hover:underline ml-2"
              aria-label="How it works"
            >
              Learn how <ChevronRight size={14} />
            </a>
          </div>

          {/* quick features row */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FEATURES.map((f, idx) => (
              <div
                key={idx}
                className="bg-white/60 backdrop-blur-sm border border-slate-100 rounded-xl p-4 flex gap-3 items-start hover:scale-[1.02] transition"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm">{f.icon}</div>
                <div>
                  <div className="font-semibold text-slate-800">{f.title}</div>
                  <div className="text-sm text-slate-600">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right side: carousel mockups + testimonials */}
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden shadow-xl">
            <Swiper
              loop
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000 }}
              className="h-80"
            >
              {/* Slide 1 — Dashboard preview (mock) */}
              <SwiperSlide>
                <div className="h-80 bg-linear-to-b from-white to-slate-50 p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">Your Dashboard</div>
                      <div className="text-lg font-semibold text-slate-900">Your Name</div>
                    </div>
                    <div className="text-sm text-slate-500">2 new</div>
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-3">
                    <div className="rounded-lg p-3 bg-white border">
                      <div className="text-sm text-slate-700">You are amazing — keep going!</div>
                    </div>
                    <div className="rounded-lg p-3 bg-white/90 border">
                      <div className="text-sm text-slate-700">Loved your recent post ❤️</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <div>Private • Secure</div>
                    <div>view →</div>
                  </div>
                </div>
              </SwiperSlide>

              {/* Slide 2 — Share link */}
              <SwiperSlide>
                <div className="h-80 p-6 bg-linear-to-b from-indigo-50 to-white flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Share</div>
                    <div className="text-lg font-semibold text-slate-900">your link</div>
                  </div>

                  <div className="mt-4 bg-white p-3 rounded-lg border-dashed border border-slate-200">
                    <div className="text-sm text-slate-700 break-all">https://yourapp.com/u/onkar</div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <div>Copy & share on socials</div>
                    <div>→</div>
                  </div>
                </div>
              </SwiperSlide>

              {/* Slide 3 — Security */}
              <SwiperSlide>
                <div className="h-80 p-6 bg-linear-to-b from-purple-50 to-white flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Privacy</div>
                    <div className="text-lg font-semibold text-slate-900">We prioritize your privacy</div>
                  </div>

                  <div className="mt-4 text-slate-700">
                    Messages are delivered anonymously and stored only for you to view.
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <div>Always in control</div>
                    <div>→</div>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </Card>

          {/* 🌟 Testimonials Carousel with Avatars */}
          <section id="testimonials" className="relative z-10 py-20 bg-linear-to-b from-white via-indigo-50 to-purple-50">
            <div className="max-w-6xl mx-auto px-6">
              <h3 className="text-3xl font-semibold text-center mb-10 text-slate-800">
                What our users say 💬
              </h3>

              <Swiper
                slidesPerView={1}
                spaceBetween={24}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                breakpoints={{
                  640: { slidesPerView: 1 },
                  1024: { slidesPerView: 2 },
                  1440: { slidesPerView: 3 },
                }}
              >
                {[
                  {
                    name: "Rhea Sharma",
                    role: "Student",
                    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
                    text: "I got so many heartfelt messages from my classmates — it felt like a warm hug 🥰",
                  },
                  {
                    name: "Arjun Mehta",
                    role: "Developer",
                    avatar: "https://randomuser.me/api/portraits/men/36.jpg",
                    text: "It’s anonymous, yet safe. I’ve used it to get genuine feedback on my projects.",
                  },
                  {
                    name: "Priya K",
                    role: "Content Creator",
                    avatar: "https://randomuser.me/api/portraits/women/23.jpg",
                    text: "I love how it keeps messages private but still lets me connect with my audience!",
                  },
                  {
                    name: "Rahul Singh",
                    role: "Designer",
                    avatar: "https://randomuser.me/api/portraits/men/53.jpg",
                    text: "Beautiful UI and thoughtful design. The experience feels premium and smooth.",
                  },
                  {
                    name: "Sneha Patel",
                    role: "Entrepreneur",
                    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
                    text: "AnonymousMessage gave me a safe space to receive raw, honest thoughts.",
                  },
                ].map((t, i) => (
                  <SwiperSlide key={i}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.03 }}
                      className="bg-white/60 backdrop-blur-sm border border-slate-100 shadow-md hover:shadow-lg transition rounded-2xl p-6 mx-auto flex flex-col justify-between max-w-md"
                    >
                      {/* Avatar */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full bg-linear-to-b from-indigo-500 to-purple-500 p-0.5">
                            <Image
                              src={t.avatar}
                              alt={t.name}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover rounded-full border-2 border-white"
                              unoptimized
                            />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-slate-800">{t.name}</h4>
                          <p className="text-sm text-slate-500">{t.role}</p>
                        </div>
                      </div>

                      {/* Quote */}
                      <p className="text-slate-700 text-sm italic mb-4">“{t.text}”</p>

                      {/* Stars */}
                      <div className="flex gap-1 text-yellow-400">
                        {Array(5)
                          .fill(0)
                          .map((_, j) => (
                            <motion.span
                              key={j}
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              transition={{ delay: 0.2 + j * 0.05 }}
                            >
                              ⭐
                            </motion.span>
                          ))}
                      </div>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </section>
        </div>
      </section>

      <Separator className="my-12" />

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-12">
        <h3 className="text-2xl font-semibold text-center mb-6">How it works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-sm border"
            >
              <div className="flex items-center gap-4">{f.icon}</div>
              <h4 className="text-lg mt-4 font-semibold">{f.title}</h4>
              <p className="text-sm text-slate-600 mt-2">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      {/* Stats */}
      <section className="bg-linear-to-b from-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-4 items-center">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm opacity-90">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-center text-slate-500">
        © {new Date().getFullYear()} AnonymousMessage — Express freely, stay real.
      </footer>

      {/* Floating CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showCTA ? 1 : 0, y: showCTA ? 0 : 20 }}
        transition={{ duration: 0.35 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Card className="p-2 shadow-lg flex items-center gap-3">
          <div className="px-3">
            <div className="text-sm font-semibold">Get your link</div>
            <div className="text-xs text-slate-500">Create & share in seconds</div>
          </div>
          <Link href="/sign-up">
            <Button className="h-10">Create Link</Button>
          </Link>
        </Card>
      </motion.div>

      {/* tiny helper CSS for animations (if you want them in tailwind.config, you can move them) */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.05); opacity: 0.25; }
          100% { transform: scale(1); opacity: 0.35; }
        }
      `}</style>
    </main>
  );
}
