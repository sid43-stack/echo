
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Activity, Shield, Mic, Play, Smile, Heart, User, Star, ChevronDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";

// Updated data for the graph
const chartData = [
    { day: "Mon", mood: 30 },
    { day: "Tue", mood: 45 },
    { day: "Wed", mood: 35 },
    { day: "Thu", mood: 60 },
    { day: "Fri", mood: 75 },
    { day: "Sat", mood: 85 },
    { day: "Sun", mood: 90 },
];

const chartConfig = {
    mood: {
        label: "Emotional State",
        color: "hsl(var(--primary))",
    },
};

// Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const testimonials = [
    {
        name: "Sarah Jenkins",
        role: "Student",
        content: "Echo has helped me understand my anxiety patterns better than any other app. The voice analysis is shockingly accurate.",
        avatar: "S"
    },
    {
        name: "David Chen",
        role: "Software Engineer",
        content: "I love the privacy-first approach. Being able to journal and track my mood without worrying about my data is a game changer.",
        avatar: "D"
    },
    {
        name: "Emily Rodriguez",
        role: "Designer",
        content: "The interface is beautiful and calming. It's become my nightly ritual to check in with Echo before bed.",
        avatar: "E"
    }
];

const faqs = [
    {
        question: "How does the voice analysis work?",
        answer: "Echo uses advanced on-device AI models to analyze the tone, pitch, and cadence of your voice. It detects subtle emotional cues that text alone might miss, providing a deeper understanding of your current state."
    },
    {
        question: "Is my data really private?",
        answer: "Absolutely. All processing happens locally on your device. We do not upload your voice recordings or journal entries to the cloud. Your emotional sanctuary is yours alone."
    },
    {
        question: "Can I use Echo offline?",
        answer: "Yes! Since Echo runs locally, you can use all core features including voice analysis and journaling without an internet connection."
    },
    {
        question: "Is there a student discount?",
        answer: "Echo is currently free for everyone during our beta period. We believe emotional support should be accessible to all."
    }
];

export default function Landing() {
    const { scrollY } = useScroll();
    const headersOpacity = useTransform(scrollY, [0, 100], [0, 1]);
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

    // Floating animation state
    const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

    return (
        <div
            className="min-h-screen w-full bg-[#030712] text-white selection:bg-cyan-500/30 overflow-x-hidden font-sans"
            style={{
                background: 'linear-gradient(135deg, #030712 0%, #0A0F1C 100%)',
                minHeight: '100vh'
            }}
        >
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md bg-[#030712]/70 border-b border-white/5">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Echo</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How it Works</a>
                        <a href="#testimonials" className="hover:text-cyan-400 transition-colors">Stories</a>
                        <a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a>
                    </div>


                    <div className="flex items-center gap-4">
                        <Link to="/login" className="hidden md:block text-sm font-medium text-gray-400 hover:text-white transition-colors">
                            Log in
                        </Link>
                        <Button
                            asChild
                            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-full px-6 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300"
                        >
                            <Link to="/register">Register</Link>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden text-center">
                {/* Dynamic Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-b from-blue-600/20 to-purple-600/20 rounded-full blur-[120px] opacity-40 animate-pulse-soft" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] animate-float" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
                </div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    style={{ opacity: heroOpacity }}
                    className="relative z-10 max-w-5xl mx-auto flex flex-col items-center"
                >
                    <motion.div variants={fadeInUp} className="mb-8 relative group cursor-default">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                        <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-[#030712]/80 backdrop-blur-xl text-xs font-medium text-cyan-200">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            Now 2.0 with Advanced Voice Analysis
                        </div>
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.1] mb-8"
                    >
                        Your Personal AI <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x pb-4">
                            Emotional Sanctuary
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={fadeInUp}
                        className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
                    >
                        Echo isn't just a chatbot. It's an intelligent companion that <span className="text-cyan-400/90 font-normal">listens to your voice</span>, understands your mood, and helps you find clarity in a chaotic world.
                    </motion.p>


                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto h-14 px-10 text-lg rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/25 border-0 transition-transform hover:scale-105"
                            asChild
                        >
                            <Link to="/register">
                                Get Started <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto h-14 px-10 text-lg rounded-full border-gray-700 hover:bg-white/5 hover:text-white bg-transparent/50 backdrop-blur-sm transition-all hover:border-gray-500"
                            asChild
                        >
                            <Link to="/login">
                                Log In
                            </Link>
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 text-sm"
                >
                    <span className="opacity-50">Scroll to explore</span>
                    <ChevronDown className="w-4 h-4 animate-bounce opacity-50" />
                </motion.div>
            </section>

            {/* Visual / Graph Section */}
            <section className="relative py-32 px-6" id="how-it-works">
                <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#050914] to-[#030712] -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="container max-w-6xl mx-auto"
                >
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative">
                            {/* Decorative elements behind graphic */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-50" />

                            <div className="relative rounded-2xl border border-white/10 bg-[#0A0F1C]/60 backdrop-blur-xl shadow-2xl overflow-hidden p-6 md:p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                                            <Activity className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold">Resilience Tracking</h4>
                                            <p className="text-xs text-gray-400">Weekly Progress</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-cyan-400">+14%</span>
                                        <p className="text-xs text-gray-400">vs last week</p>
                                    </div>
                                </div>

                                <div className="h-[300px] w-full">
                                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                            <XAxis
                                                dataKey="day"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={12}
                                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                            />
                                            <Tooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-[#030712] border border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md">
                                                                <p className="font-medium text-gray-200 mb-1">{payload[0].payload.day}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                                                    <p className="text-cyan-400 font-bold">{payload[0].value}% <span className="text-gray-500 font-normal text-xs">Mood Score</span></p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="mood"
                                                stroke="#22d3ee"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorMood)"
                                            />
                                        </AreaChart>
                                    </ChartContainer>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                Visualize Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                    Emotional Growth
                                </span>
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                Track your emotional resilience over time with beautiful, real-time analytics. Unlike standard journals, Echo quantifies your well-being journey, showing you how your mood improves as you engage with daily sessions.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    { text: "Real-time voice sentiment analysis", icon: Mic },
                                    { text: "Privacy-first local processing", icon: Shield },
                                    { text: "Personalized mood insights", icon: Sparkles }
                                ].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + (i * 0.1) }}
                                        className="flex items-center gap-3 text-gray-300"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-cyan-400">
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        {item.text}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6 relative" id="features">
                <div className="container max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                            Why Choose Echo?
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Built with privacy at its core, designed for your peace of mind.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Mic,
                                title: "Voice Analysis",
                                desc: "Our advanced AI detects subtle emotional nuances in your voice tone to provide deeper empathy.",
                                color: "from-blue-500/20 to-cyan-500/20",
                                iconColor: "text-blue-400"
                            },
                            {
                                icon: Shield,
                                title: "100% Private",
                                desc: "All processing happens locally on your device. Your secrets stay with you, always.",
                                color: "from-purple-500/20 to-pink-500/20",
                                iconColor: "text-purple-400"
                            },
                            {
                                icon: Smile,
                                title: "Mood Tracking",
                                desc: "Visualise your emotional journey with beautiful charts and daily check-ins.",
                                color: "from-cyan-500/20 to-teal-500/20",
                                iconColor: "text-cyan-400"
                            },
                            {
                                icon: Heart,
                                title: "Adaptive Empathy",
                                desc: "Echo learns your communication style to provide the most comforting responses.",
                                color: "from-red-500/20 to-orange-500/20",
                                iconColor: "text-red-400"
                            },
                            {
                                icon: User,
                                title: "Safe Space",
                                desc: "A judgment-free zone where you can express yourself openly at any time.",
                                color: "from-indigo-500/20 to-violet-500/20",
                                iconColor: "text-indigo-400"
                            },
                            {
                                icon: Star,
                                title: "Daily Insights",
                                desc: "Get actionable advice tailored to your current emotional state every morning.",
                                color: "from-yellow-500/20 to-amber-500/20",
                                iconColor: "text-yellow-400"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                onMouseEnter={() => setHoveredFeature(i)}
                                onMouseLeave={() => setHoveredFeature(null)}
                                className="relative p-8 rounded-3xl bg-[#0A0F1C] border border-white/5 overflow-hidden group hover:border-white/10 transition-colors"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                <div className="relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl bg-[#030712]/50 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-300 ${feature.iconColor}`}>
                                        <feature.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed font-light">
                                        {feature.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-6 bg-[#050914] border-y border-white/5" id="testimonials">
                <div className="container max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Loved by Thousands</h2>
                        <p className="text-gray-400">Join a community of people finding emotional clarity.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="bg-[#0A0F1C] p-8 rounded-2xl border border-white/5 relative"
                            >
                                <div className="absolute top-8 right-8 opacity-20">
                                    <Sparkles className="w-8 h-8 text-cyan-400" />
                                </div>
                                <p className="text-gray-300 italic mb-8 relative z-10">"{testimonial.content}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">{testimonial.name}</h4>
                                        <p className="text-xs text-gray-500">{testimonial.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-6" id="faq">
                <div className="container max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                    </div>

                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border border-white/5 rounded-xl bg-[#0A0F1C] px-6 data-[state=open]:border-cyan-500/30 transition-colors">
                                <AccordionTrigger className="text-lg text-gray-200 hover:text-cyan-400 hover:no-underline py-6">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-400 text-base pb-6 leading-relaxed">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* CTA / Footer */}
            <footer className="relative bg-[#02040a] pt-24 pb-12 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                <div className="absolute inset-0 bg-blue-900/5 pointer-events-none" />

                <div className="container max-w-5xl mx-auto px-6 relative z-10 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
                        Start your journey to <br />
                        <span className="text-cyan-400">better mental health</span>
                    </h2>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        No subscription required for the beta. completely free, forever private.
                    </p>

                    <div className="flex justify-center mb-20">
                        <Button
                            size="lg"
                            className="h-14 px-12 text-lg rounded-full bg-white text-black hover:bg-gray-100 shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105 font-bold"
                            asChild
                        >
                            <Link to="/register">
                                Get Echo Now - It's Free
                            </Link>
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 text-left border-t border-white/5 pt-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xl font-bold">Echo</span>
                            </div>
                            <p className="text-gray-500 text-sm max-w-xs">
                                Your compassionate AI companion for emotional well-being and growth.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-cyan-400">Features</a></li>
                                <li><a href="#" className="hover:text-cyan-400">Security</a></li>
                                <li><a href="#" className="hover:text-cyan-400">Roadmap</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-cyan-400">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-cyan-400">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-cyan-400">Cookie Data</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="text-center text-gray-600 text-sm mt-12">
                        © 2026 Echo AI Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
