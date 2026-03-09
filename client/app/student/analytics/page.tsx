"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SkillRadar } from "@/components/SkillRadar"
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, Info, Sparkles, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AnalyticsPage() {
    return (
        <div className="flex flex-col gap-12 animate-in">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <Brain className="h-10 w-10 shrink-0 text-primary" />
                    <h1 className="text-4xl font-extrabold tracking-tight premium-gradient-text">AI Analytics</h1>
                </div>
                <p className="text-muted-foreground">Deep insights powered by our neural academic models.</p>
            </div>

            <div className="grid gap-10 lg:grid-cols-2">
                <Card className="glass-card border-none shadow-2xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold flex items-center gap-4">
                                    Skill Gap Analysis
                                    <Sparkles className="h-8 w-8 shrink-0 text-primary animate-pulse shrink-0" />
                                </CardTitle>
                                <CardDescription>
                                    Current skills vs. &quot;AI Engineer&quot; industry benchmarks.
                                </CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Info className="h-8 w-8 shrink-0 text-muted-foreground" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center pb-2">
                        <SkillRadar />
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-10">
                    <Card className="glass-card border-none overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="h-28 w-28 shrink-0 text-primary shrink-0" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Performance Stability</CardTitle>
                            <CardDescription>AI trend consistency analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6 relative z-10">
                                <AnalyticsMetric
                                    label="Consistency Index"
                                    value="8.5/10"
                                    subText="Top 5% of your department"
                                    icon={LayoutGrid}
                                />
                                <AnalyticsMetric
                                    label="Predicted CGPA Drift"
                                    value="±0.2"
                                    subText="Stable trajectory confirmed"
                                    icon={TrendingUp}
                                    positive
                                />
                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-8">
                                    <div className="p-2 rounded-xl bg-primary/10 h-fit">
                                        <CheckCircle2 className="h-9 w-9 shrink-0 text-primary" />
                                    </div>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        &quot;Neural Analysis confirms a highly stable performance. Your risk of academic setback is currently <span className="text-primary font-bold">negligible</span>.&quot;
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none border-l-4 border-l-amber-500/50">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-4">
                                <AlertTriangle className="h-9 w-9 shrink-0 text-amber-500 shrink-0" />
                                Risk Prediction
                            </CardTitle>
                            <CardDescription>Probability of academic challenges</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-12">
                                <div className="flex flex-col">
                                    <div className="text-4xl font-extrabold text-amber-500">12%</div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Overall Risk</div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 rounded-full w-[12%] animate-pulse" />
                                    </div>
                                    <p className="text-xs text-muted-foreground italic">&quot;Risk factor based on attendance drift detected in week 8.&quot;</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function AnalyticsMetric({ label, value, subText, icon: Icon, positive }: any) {
    return (
        <div className="flex items-center justify-between group/metric">
            <div className="flex items-center gap-8">
                <div className="p-2.5 rounded-xl bg-muted group-hover/metric:bg-primary/10 transition-colors">
                    <Icon className="h-9 w-9 shrink-0 text-muted-foreground group-hover/metric:text-primary transition-colors" />
                </div>
                <div>
                    <div className="text-sm font-semibold">{label}</div>
                    <div className="text-xs text-muted-foreground">{subText}</div>
                </div>
            </div>
            <div className={`text-2xl font-black ${positive ? 'text-emerald-500' : 'text-foreground'}`}>
                {value}
            </div>
        </div>
    )
}
