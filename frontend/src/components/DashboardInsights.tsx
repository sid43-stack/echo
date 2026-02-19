import { motion } from 'framer-motion';
import { MessageCircle, Users, Heart } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

/**
 * DashboardInsights Component
 * 
 * Displays visual insights and charts on the dashboard:
 * - Stat cards (Conversation Time, Activities Joined, Mood Score)
 * - Weekly activity line chart
 * - Mood analysis donut chart
 * 
 * Uses mock data for demonstration.
 */

// Mock data for weekly activity
const weeklyActivityData = [
    { day: 'Mon', activity: 45 },
    { day: 'Tue', activity: 62 },
    { day: 'Wed', activity: 58 },
    { day: 'Thu', activity: 72 },
    { day: 'Fri', activity: 95 },
    { day: 'Sat', activity: 68 },
    { day: 'Sun', activity: 52 },
];

// Mock data for mood analysis
const moodData = [
    { name: 'Happy', value: 35, color: '#10b981' },
    { name: 'Calm', value: 30, color: '#3b82f6' },
    { name: 'Anxious', value: 20, color: '#f59e0b' },
    { name: 'Neutral', value: 15, color: '#6b7280' },
];

const chartConfig = {
    activity: {
        label: 'Activity',
        color: 'hsl(var(--primary))',
    },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
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

export function DashboardInsights() {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Stat Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
                {/* Conversation Time */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageCircle className="w-4 h-4 text-primary" />
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                Conversation Time
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-3xl font-bold text-foreground">145<span className="text-sm font-normal text-muted-foreground">m</span></p>
                            <div className="h-1.5 bg-primary/20 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '70%' }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Activities Joined */}
                <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-purple-500" />
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                Activities Joined
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-3xl font-bold text-foreground">12</p>
                            <div className="h-1.5 bg-purple-500/20 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: '60%' }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Mood Score */}
                <Card className="border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Heart className="w-4 h-4 text-accent" />
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                Mood Score
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-3xl font-bold text-foreground">7.2<span className="text-sm font-normal text-muted-foreground">/10</span></p>
                            <div className="h-1.5 bg-accent/20 rounded-full overflow-hidden">
                                <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: '72%' }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Charts Section */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
                {/* Weekly Activity Chart */}
                <Card className="border-border/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-foreground">Weekly Activity</h3>
                            <p className="text-xs text-muted-foreground">Last 7 Days</p>
                        </div>
                        <ChartContainer config={chartConfig} className="h-[180px] w-full">
                            <LineChart data={weeklyActivityData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="day"
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line
                                    type="monotone"
                                    dataKey="activity"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Mood Analysis Chart */}
                <Card className="border-border/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-foreground">Mood Analysis</h3>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                            {/* Donut Chart */}
                            <div className="relative w-[130px] h-[130px] flex-shrink-0">
                                <ChartContainer config={chartConfig} className="w-full h-full">
                                    <PieChart>
                                        <Pie
                                            data={moodData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {moodData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                                {/* Center text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-2xl font-bold text-foreground">7.2</p>
                                    <p className="text-[10px] text-muted-foreground">Avg Mood</p>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex-1 space-y-2.5">
                                {moodData.map((mood) => (
                                    <div key={mood.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: mood.color }}
                                            />
                                            <span className="text-xs text-foreground">{mood.name}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground font-medium">{mood.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
