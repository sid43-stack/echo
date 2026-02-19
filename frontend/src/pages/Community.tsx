import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Users, Calendar, MapPin, Heart } from 'lucide-react';

/**
 * Community Page
 * 
 * Discover and join local activities and events.
 * Encourages real-world human connections as part of wellness journey.
 * 
 * In real app: Would fetch activities from backend API.
 */

const categories = ['All', 'Social', 'Fitness', 'Volunteering', 'Creative', 'Wellness'];

interface Activity {
    id: number;
    title: string;
    category: string;
    location: string;
    date: string;
    attendees: number;
    description: string;
}

const mockActivities: Activity[] = [
    {
        id: 1,
        title: 'Morning Yoga in the Park',
        category: 'Fitness',
        location: 'Central Park',
        date: 'Every Saturday, 8:00 AM',
        attendees: 12,
        description: 'Join us for a peaceful morning yoga session surrounded by nature.',
    },
    {
        id: 2,
        title: 'Community Art Workshop',
        category: 'Creative',
        location: 'Community Center',
        date: 'This Friday, 6:00 PM',
        attendees: 8,
        description: 'Express yourself through painting. All skill levels welcome.',
    },
    {
        id: 3,
        title: 'Book Club Meetup',
        category: 'Social',
        location: 'Local Coffee Shop',
        date: 'Next Tuesday, 7:00 PM',
        attendees: 15,
        description: 'Discuss this month\'s book and connect with fellow readers.',
    },
    {
        id: 4,
        title: 'Beach Cleanup',
        category: 'Volunteering',
        location: 'Sunset Beach',
        date: 'Sunday, 9:00 AM',
        attendees: 20,
        description: 'Help keep our beaches clean while meeting like-minded people.',
    },
    {
        id: 5,
        title: 'Meditation Circle',
        category: 'Wellness',
        location: 'Zen Studio',
        date: 'Every Wednesday, 7:30 PM',
        attendees: 10,
        description: 'Guided meditation in a supportive group setting.',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};

interface CommunityProps {
    onBack: () => void;
}

export function Community({ onBack }: CommunityProps) {
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredActivities =
        selectedCategory === 'All'
            ? mockActivities
            : mockActivities.filter((a) => a.category === selectedCategory);

    return (
        <div className="absolute inset-0 flex flex-col bg-background">
            {/* Header */}
            <div className="shrink-0 z-40 backdrop-blur-lg bg-background/80 border-b border-border">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-serif font-light">Community Activities</h1>
                    <div className="w-10" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-8"
                    >
                        {/* Intro */}
                        <div className="text-center space-y-3 mb-8">
                            <div className="inline-block p-4 rounded-full bg-accent/10 mb-4">
                                <Users className="w-10 h-10 text-accent" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-serif font-light text-foreground">
                                Connect with Real People
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Discover local activities and events. Human connection is at the heart of well-being.
                            </p>
                        </div>

                        {/* Category Filters */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    variant={selectedCategory === category ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(category)}
                                    className="rounded-full"
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>

                        {/* Activities Grid */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid md:grid-cols-2 gap-6"
                        >
                            {filteredActivities.map((activity) => (
                                <motion.div key={activity.id} variants={itemVariants}>
                                    <Card className="border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group h-full">
                                        <CardContent className="p-6 flex flex-col h-full">
                                            <div className="space-y-4 flex-1">
                                                <div className="flex items-start justify-between">
                                                    <h3 className="text-xl font-medium group-hover:text-primary transition-colors">
                                                        {activity.title}
                                                    </h3>
                                                    <Badge variant="secondary" className="ml-2">
                                                        {activity.category}
                                                    </Badge>
                                                </div>

                                                <p className="text-muted-foreground">{activity.description}</p>

                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <MapPin className="w-4 h-4" />
                                                        {activity.location}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Calendar className="w-4 h-4" />
                                                        {activity.date}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Users className="w-4 h-4" />
                                                        {activity.attendees} people interested
                                                    </div>
                                                </div>
                                            </div>

                                            <Button className="w-full mt-6" variant="outline">
                                                Learn More
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Encouragement Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                        >
                            <Card className="border-primary/30 bg-primary/5">
                                <CardContent className="p-8 text-center space-y-4">
                                    <Heart className="w-10 h-10 text-primary mx-auto" strokeWidth={1.5} />
                                    <div>
                                        <h3 className="text-xl font-serif font-light text-foreground mb-2">
                                            Take it at your pace
                                        </h3>
                                        <p className="text-muted-foreground max-w-xl mx-auto">
                                            No pressure to join everything. Start with one that feels right, and go from
                                            there.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
