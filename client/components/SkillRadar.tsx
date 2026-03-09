"use client"

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

const data = [
    { subject: 'Python', A: 120, B: 110, fullMark: 150 },
    { subject: 'Data Science', A: 98, B: 130, fullMark: 150 },
    { subject: 'Machine Learning', A: 86, B: 130, fullMark: 150 },
    { subject: 'Web Dev', A: 99, B: 100, fullMark: 150 },
    { subject: 'Algorithms', A: 85, B: 90, fullMark: 150 },
    { subject: 'Database', A: 65, B: 85, fullMark: 150 },
];

export function SkillRadar() {
    return (
        <div className="h-[500px] w-full p-4">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="hsl(var(--border)/0.5)" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 150]}
                        tick={false}
                        axisLine={false}
                    />
                    <Radar
                        name="Student Progress"
                        dataKey="A"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.5}
                        strokeWidth={2}
                    />
                    <Radar
                        name="Industry Standard"
                        dataKey="B"
                        stroke="hsl(var(--secondary-foreground)/0.3)"
                        fill="hsl(var(--secondary))"
                        fillOpacity={0.1}
                        strokeWidth={1}
                        strokeDasharray="4 4"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background)/0.8)',
                            backdropFilter: 'blur(12px)',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
