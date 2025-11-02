/**
 * COUNCIL-HADES: Main Component
 * Multi-agent collective intelligence interface
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Brain,
    Loader2,
    Sparkles,
    Zap,
    Shield,
    Hammer,
    ArrowLeft,
    Info,
} from "lucide-react";
import {
    CouncilMode as CouncilModeType,
    CouncilSession,
    COUNCIL_AGENTS,
} from "@/lib/councilTypes";
import { runCouncilSession } from "@/lib/councilEngine";
import { Provider } from "@/lib/aiApi";
import { CouncilAgentCard } from "./CouncilAgentCard";
import { CouncilDebateView } from "./CouncilDebateView";
import { CouncilDecisionView } from "./CouncilDecisionView";
import { useToast } from "@/hooks/use-toast";

interface CouncilModeProps {
    onBack: () => void;
    availableModels: Array<{ id: string; name: string; provider: Provider }>;
}

const MODE_INFO: Record<
    CouncilModeType,
    { icon: any; description: string; color: string }
> = {
    quick: {
        icon: Zap,
        description:
            "Fast decision, minimal debate. Best for simple questions.",
        color: "text-yellow-500",
    },
    deliberative: {
        icon: Brain,
        description:
            "Full debate process with voting and reflection. Best for complex decisions.",
        color: "text-blue-500",
    },
    ethical: {
        icon: Shield,
        description:
            "Ethics-focused with strict veto power. Best for sensitive topics.",
        color: "text-purple-500",
    },
    builder: {
        icon: Hammer,
        description:
            "Implementation-focused. Best for technical and practical problems.",
        color: "text-orange-500",
    },
};

export function CouncilMode({ onBack, availableModels }: CouncilModeProps) {
    const [question, setQuestion] = useState("");
    const [mode, setMode] = useState<CouncilModeType>("deliberative");
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [isRunning, setIsRunning] = useState(false);
    const [currentStage, setCurrentStage] = useState<string>("");
    const [session, setSession] = useState<CouncilSession | null>(null);
    const [activeTab, setActiveTab] = useState("setup");
    const [progressLog, setProgressLog] = useState<
        Array<{ stage: string; data: Record<string, unknown> }>
    >([]);
    const { toast } = useToast();

    useEffect(() => {
        if (availableModels.length > 0 && !selectedModel) {
            setSelectedModel(availableModels[0].id);
        }
    }, [availableModels, selectedModel]);

    const handleRunCouncil = async () => {
        if (!question.trim()) {
            toast({
                title: "Question Required",
                description:
                    "Please enter a question for the Council to deliberate.",
                variant: "destructive",
            });
            return;
        }

        if (!selectedModel) {
            toast({
                title: "Model Required",
                description: "Please select an AI model.",
                variant: "destructive",
            });
            return;
        }

        const model = availableModels.find((m) => m.id === selectedModel);
        if (!model) return;

        setIsRunning(true);
        setProgressLog([]);
        setSession(null);
        setActiveTab("process");

        try {
            const result = await runCouncilSession(
                question,
                mode,
                model.name,
                model.provider,
                (stage, data) => {
                    setCurrentStage(stage);
                    setProgressLog((prev) => [...prev, { stage, data }]);
                },
            );

            setSession(result);
            setActiveTab("decision");
            toast({
                title: "Council Session Complete",
                description: "The Council has reached a decision.",
            });
        } catch (error) {
            console.error("Council session error:", error);
            toast({
                title: "Session Failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "An error occurred during the Council session.",
                variant: "destructive",
            });
        } finally {
            setIsRunning(false);
            setCurrentStage("");
        }
    };

    const handleNewSession = () => {
        setSession(null);
        setQuestion("");
        setProgressLog([]);
        setActiveTab("setup");
    };

    const getStageLabel = (stage: string): string => {
        const labels: Record<string, string> = {
            initial_opinions_start: "Gathering Initial Opinions",
            agent_opinion: "Agent Opinion Received",
            debate_start: "Starting Debate",
            debate_response: "Debate Response",
            proposals_start: "Generating Proposals",
            proposal_created: "Proposal Created",
            voting_start: "Starting Voting",
            vote_cast: "Vote Cast",
            decision_start: "Synthesizing Decision",
            decision_complete: "Decision Complete",
            reflection_start: "Performing Reflection",
            reflection_complete: "Reflection Complete",
        };
        return labels[stage] || stage;
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            {/* Header */}
            <div className="bg-black/40 backdrop-blur-sm border-b border-purple-500/20 p-4">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="text-purple-300 hover:text-purple-100"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-purple-400" />
                            Council-Hades
                        </h1>
                        <p className="text-sm text-purple-300/70">
                            Multi-Agent Collective Intelligence System
                        </p>
                    </div>
                    {session && (
                        <Button
                            onClick={handleNewSession}
                            variant="outline"
                            className="border-purple-500/30"
                        >
                            New Session
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="h-full flex flex-col"
                >
                    <div className="bg-black/30 border-b border-purple-500/20 px-4">
                        <TabsList className="bg-transparent h-12">
                            <TabsTrigger
                                value="setup"
                                disabled={isRunning}
                                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-200"
                            >
                                Setup
                            </TabsTrigger>
                            <TabsTrigger
                                value="agents"
                                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-200"
                            >
                                The Council
                            </TabsTrigger>
                            <TabsTrigger
                                value="process"
                                disabled={
                                    !isRunning && progressLog.length === 0
                                }
                                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-200"
                            >
                                Process
                            </TabsTrigger>
                            <TabsTrigger
                                value="debate"
                                disabled={!session}
                                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-200"
                            >
                                Debate
                            </TabsTrigger>
                            <TabsTrigger
                                value="decision"
                                disabled={!session?.decision}
                                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-200"
                            >
                                Decision
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {/* Setup Tab */}
                        <TabsContent value="setup" className="h-full m-0 p-6">
                            <ScrollArea className="h-full">
                                <div className="max-w-4xl mx-auto space-y-6">
                                    <Card className="bg-black/40 border-purple-500/30">
                                        <CardHeader>
                                            <CardTitle className="text-purple-200">
                                                Question for the Council
                                            </CardTitle>
                                            <CardDescription className="text-purple-300/70">
                                                Ask a complex question that
                                                requires multi-perspective
                                                analysis
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <Textarea
                                                placeholder="What challenge do you want the Council to deliberate on?"
                                                value={question}
                                                onChange={(e) =>
                                                    setQuestion(e.target.value)
                                                }
                                                rows={6}
                                                className="bg-black/30 border-purple-500/30 text-purple-100 placeholder:text-purple-400/50"
                                                disabled={isRunning}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-black/40 border-purple-500/30">
                                        <CardHeader>
                                            <CardTitle className="text-purple-200">
                                                Council Mode
                                            </CardTitle>
                                            <CardDescription className="text-purple-300/70">
                                                Choose how the Council should
                                                operate
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {(
                                                    [
                                                        "quick",
                                                        "deliberative",
                                                        "ethical",
                                                        "builder",
                                                    ] as CouncilModeType[]
                                                ).map((m) => {
                                                    const info = MODE_INFO[m];
                                                    const Icon = info.icon;
                                                    return (
                                                        <button
                                                            key={m}
                                                            onClick={() =>
                                                                setMode(m)
                                                            }
                                                            disabled={isRunning}
                                                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                                                                mode === m
                                                                    ? "border-purple-500 bg-purple-500/20"
                                                                    : "border-purple-500/20 bg-black/20 hover:border-purple-500/40"
                                                            } ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <Icon
                                                                    className={`h-5 w-5 mt-0.5 ${info.color}`}
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="font-semibold text-purple-100 capitalize">
                                                                        {m}{" "}
                                                                        Council
                                                                    </div>
                                                                    <div className="text-sm text-purple-300/70 mt-1">
                                                                        {
                                                                            info.description
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-black/40 border-purple-500/30">
                                        <CardHeader>
                                            <CardTitle className="text-purple-200">
                                                AI Model
                                            </CardTitle>
                                            <CardDescription className="text-purple-300/70">
                                                Select the model to power all
                                                Council agents
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Select
                                                value={selectedModel}
                                                onValueChange={setSelectedModel}
                                                disabled={isRunning}
                                            >
                                                <SelectTrigger className="bg-black/30 border-purple-500/30 text-purple-100">
                                                    <SelectValue placeholder="Select a model" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableModels.map(
                                                        (model) => (
                                                            <SelectItem
                                                                key={model.id}
                                                                value={model.id}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-xs"
                                                                    >
                                                                        {
                                                                            model.provider
                                                                        }
                                                                    </Badge>
                                                                    {model.name}
                                                                </div>
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </CardContent>
                                    </Card>

                                    <Button
                                        onClick={handleRunCouncil}
                                        disabled={
                                            isRunning ||
                                            !question.trim() ||
                                            !selectedModel
                                        }
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                    >
                                        {isRunning ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Council in Session...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-5 w-5" />
                                                Convene the Council
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        {/* Agents Tab */}
                        <TabsContent value="agents" className="h-full m-0 p-6">
                            <ScrollArea className="h-full">
                                <div className="max-w-5xl mx-auto space-y-6">
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-bold text-purple-200 mb-2">
                                            The Five Minds
                                        </h2>
                                        <p className="text-purple-300/70">
                                            Each agent brings a unique
                                            perspective to the deliberation
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(
                                            [
                                                "analyst",
                                                "builder",
                                                "strategist",
                                                "auditor",
                                            ] as const
                                        ).map((role) => (
                                            <CouncilAgentCard
                                                key={role}
                                                agent={COUNCIL_AGENTS[role]}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-center">
                                        <div className="w-full md:w-2/3">
                                            <CouncilAgentCard
                                                agent={COUNCIL_AGENTS.moderator}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        {/* Process Tab */}
                        <TabsContent value="process" className="h-full m-0 p-6">
                            <ScrollArea className="h-full">
                                <div className="max-w-4xl mx-auto space-y-4">
                                    {isRunning && (
                                        <Card className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-500/30">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <Loader2 className="h-6 w-6 animate-spin text-purple-300" />
                                                    <div>
                                                        <div className="font-semibold text-purple-100">
                                                            {getStageLabel(
                                                                currentStage,
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-purple-300/70">
                                                            The Council is
                                                            deliberating...
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {progressLog.map((log, index) => {
                                        const agent =
                                            log.data.role &&
                                            COUNCIL_AGENTS[
                                                log.data
                                                    .role as keyof typeof COUNCIL_AGENTS
                                            ];
                                        return (
                                            <Card
                                                key={index}
                                                className="bg-black/40 border-purple-500/20"
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-3">
                                                        {agent && (
                                                            <span className="text-2xl">
                                                                {agent.icon}
                                                            </span>
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {getStageLabel(
                                                                        log.stage,
                                                                    )}
                                                                </Badge>
                                                                {agent && (
                                                                    <span className="text-sm font-medium text-purple-200">
                                                                        {
                                                                            agent.name
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {log.data
                                                                .opinion && (
                                                                <p className="text-sm text-purple-100/80 mt-2 whitespace-pre-wrap">
                                                                    {
                                                                        log.data
                                                                            .opinion
                                                                            .content
                                                                    }
                                                                </p>
                                                            )}
                                                            {log.data
                                                                .proposal && (
                                                                <div className="text-sm text-purple-100/80 mt-2">
                                                                    <div className="font-semibold">
                                                                        {
                                                                            log
                                                                                .data
                                                                                .proposal
                                                                                .title
                                                                        }
                                                                    </div>
                                                                    <p className="mt-1">
                                                                        {
                                                                            log
                                                                                .data
                                                                                .proposal
                                                                                .description
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        {/* Debate Tab */}
                        <TabsContent value="debate" className="h-full m-0">
                            {session && <CouncilDebateView session={session} />}
                        </TabsContent>

                        {/* Decision Tab */}
                        <TabsContent value="decision" className="h-full m-0">
                            {session?.decision && (
                                <CouncilDecisionView session={session} />
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
