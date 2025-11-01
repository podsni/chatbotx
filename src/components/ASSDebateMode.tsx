import { useState, useEffect, useRef } from "react";
import {
    Send,
    Loader2,
    Trophy,
    Users,
    BarChart3,
    GitBranch,
    Play,
    Settings,
    X,
    ChevronDown,
    ChevronUp,
    Award,
    CheckSquare,
    Square,
    Zap,
    Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
    DebateSession,
    Debater,
    DebateRound,
    DebateFormat,
    VotingSystem,
    PersonalityType,
    PRESET_DEBATERS,
    getDebaterSystemPrompt,
    getVotingPrompt,
    getJudgePrompt,
    calculateConsensus,
    calculateDebateAnalytics,
    getAnalyticsSummary,
    DebateTeam,
    TournamentBracket,
} from "@/lib/assDebate";
import { aiApi } from "@/lib/aiApi";

interface ASSDebateModeProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ASSDebateMode = ({ isOpen, onClose }: ASSDebateModeProps) => {
    const [question, setQuestion] = useState("");
    const [debateMode, setDebateMode] = useState<DebateFormat>("voting");
    const [votingSystem, setVotingSystem] = useState<VotingSystem>("ranked");
    const [selectedPersonalities, setSelectedPersonalities] = useState<
        PersonalityType[]
    >(["optimist", "skeptic", "visionary", "critic"]);
    const [consensusThreshold, setConsensusThreshold] = useState(0.6);
    const [maxIterations, setMaxIterations] = useState(5);
    const [currentSession, setCurrentSession] = useState<DebateSession | null>(
        null,
    );
    const [isDebating, setIsDebating] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [teams, setTeams] = useState<DebateTeam[]>([]);
    const [activeTab, setActiveTab] = useState("debate");
    const [maxTokens, setMaxTokens] = useState(1024);
    const [savedSessions, setSavedSessions] = useState<DebateSession[]>([]);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Load saved sessions on mount
    useEffect(() => {
        const saved = localStorage.getItem("ass_debate_sessions");
        if (saved) {
            try {
                setSavedSessions(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load sessions:", e);
            }
        }
    }, []);

    // Preset questions for quick start
    const presetQuestions = [
        "Haruskah kita mengembangkan AGI secepat mungkin?",
        "Apakah nanas di pizza dapat diterima?",
        "Haruskah media sosial diatur seperti tembakau?",
        "Apakah kehendak bebas adalah ilusi?",
        "Haruskah kita menjajah Mars atau memperbaiki Bumi dulu?",
        "Apakah hot dog adalah sandwich?",
    ];

    // Team colors for team debates
    const teamColors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

    // Character colors for personality types
    const characterColors: Record<PersonalityType, string> = {
        optimist: "#fbbf24", // yellow
        skeptic: "#3b82f6", // blue
        visionary: "#a855f7", // purple
        critic: "#ef4444", // red
        scientist: "#06b6d4", // cyan
        artist: "#ec4899", // pink
        philosopher: "#8b5cf6", // violet
        pragmatist: "#10b981", // green
    };

    useEffect(() => {
        if (currentSession && scrollAreaRef.current) {
            // Auto-scroll to bottom smoothly
            const scrollContainer = scrollAreaRef.current.querySelector(
                "[data-radix-scroll-area-viewport]",
            );
            setTimeout(() => {
                if (scrollContainer) {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;
                }
            }, 100);
        }
    }, [currentSession?.rounds?.length]);

    const initializeDebaters = (): Debater[] => {
        return selectedPersonalities.map((personality, index) => {
            const preset = PRESET_DEBATERS[personality];
            return {
                ...preset,
                id: `debater-${index}`,
                internalBelief: Math.random(),
            };
        });
    };

    const initializeTeams = (debaters: Debater[]): DebateTeam[] => {
        if (debateMode !== "team") return [];

        const numTeams = 2;
        const teams: DebateTeam[] = [];
        const membersPerTeam = Math.ceil(debaters.length / numTeams);

        for (let i = 0; i < numTeams; i++) {
            teams.push({
                id: `team-${i}`,
                name: `Team ${String.fromCharCode(65 + i)}`,
                color: teamColors[i],
                memberIds: debaters
                    .slice(i * membersPerTeam, (i + 1) * membersPerTeam)
                    .map((d) => d.id),
            });
        }

        debaters.forEach((debater, idx) => {
            debater.teamId = teams[Math.floor(idx / membersPerTeam)].id;
        });

        return teams;
    };

    const stopDebateRef = useRef(false);

    const stopDebate = () => {
        stopDebateRef.current = true;
        setIsDebating(false);
        toast({
            title: "Debat Dihentikan",
            description: "Debat telah dihentikan oleh pengguna",
        });
    };

    const saveSession = () => {
        if (!currentSession) return;

        const sessions = [...savedSessions, currentSession];
        setSavedSessions(sessions);
        localStorage.setItem("ass_debate_sessions", JSON.stringify(sessions));

        toast({
            title: "Sesi Tersimpan",
            description: `Debat "${currentSession.question}" telah disimpan`,
        });
    };

    const loadSessions = () => {
        const saved = localStorage.getItem("ass_debate_sessions");
        if (saved) {
            setSavedSessions(JSON.parse(saved));
        }
    };

    const loadSession = (session: DebateSession) => {
        setCurrentSession(session);
        setQuestion(session.question);
        setDebateMode(session.mode);
        setVotingSystem(session.votingSystem);
        toast({
            title: "Sesi Dimuat",
            description: "Sesi debat berhasil dimuat",
        });
    };

    const startDebate = async () => {
        if (!question.trim()) {
            toast({
                title: "Kesalahan",
                description: "Masukkan pertanyaan untuk debat",
                variant: "destructive",
            });
            return;
        }

        if (selectedPersonalities.length < 2) {
            toast({
                title: "Kesalahan",
                description: "Pilih minimal 2 debater",
                variant: "destructive",
            });
            return;
        }

        const debaters = initializeDebaters();
        const debateTeams = initializeTeams(debaters);

        const session: DebateSession = {
            id: `debate-${Date.now()}`,
            question,
            mode: debateMode,
            votingSystem,
            debaters,
            rounds: [],
            consensusThreshold,
            maxIterations,
            teams: debateTeams,
        };

        setCurrentSession(session);
        setTeams(debateTeams);
        setIsDebating(true);
        setActiveTab("debate");

        // Start the debate rounds
        await runDebate(session);
    };

    const runDebate = async (session: DebateSession) => {
        stopDebateRef.current = false;
        try {
            if (session.mode === "tournament") {
                await runTournament(session);
            } else if (session.mode === "team") {
                await runTeamDebate(session);
            } else if (session.mode === "panel") {
                await runPanelDebate(session);
            } else {
                await runStandardDebate(session);
            }
        } catch (error) {
            console.error("Debate error:", error);
            toast({
                title: "Debate Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "An error occurred",
                variant: "destructive",
            });
        } finally {
            setIsDebating(false);
            stopDebateRef.current = false;
        }
    };

    const runStandardDebate = async (session: DebateSession) => {
        const maxRounds =
            session.mode === "classic" ? 3 : session.maxIterations;

        for (let round = 0; round <= maxRounds; round++) {
            if (stopDebateRef.current) {
                toast({
                    title: "Debat Dihentikan",
                    description: `Debat dihentikan pada ronde ${round}`,
                });
                break;
            }
            const roundType =
                session.mode === "classic"
                    ? round === 0
                        ? "opening"
                        : round === maxRounds
                          ? "rebuttal"
                          : "argument"
                    : round === 0
                      ? "opening"
                      : "argument";

            const debateRound: DebateRound = {
                round,
                type: roundType as
                    | "opening"
                    | "argument"
                    | "rebuttal"
                    | "voting"
                    | "judge",
                arguments: [],
            };

            // Get arguments from each debater
            for (const debater of session.debaters) {
                if (stopDebateRef.current) break;

                try {
                    const systemPrompt = getDebaterSystemPrompt(
                        debater,
                        round,
                        session.mode === "classic" ? "classic" : "voting",
                    );

                    const previousArgs = session.rounds.flatMap(
                        (r) => r.arguments,
                    );
                    const context =
                        previousArgs.length > 0
                            ? `\n\nPrevious arguments:\n${previousArgs
                                  .map((arg) => {
                                      const d = session.debaters.find(
                                          (x) => x.id === arg.debaterId,
                                      );
                                      return `${d?.emoji} ${d?.name}: ${arg.content}`;
                                  })
                                  .join("\n\n")}`
                            : "";

                    const userPrompt = `Question: ${session.question}${context}`;

                    const response = await aiApi.sendMessageSync(
                        debater.provider,
                        debater.modelId,
                        [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: userPrompt },
                        ],
                        maxTokens,
                    );

                    // Update internal belief based on arguments
                    const beliefUpdate = calculateBeliefUpdate(
                        debater,
                        previousArgs,
                        response.content,
                    );

                    debateRound.arguments.push({
                        debaterId: debater.id,
                        content: response.content,
                        timestamp: Date.now(),
                        beliefUpdate,
                    });

                    debater.internalBelief = beliefUpdate;

                    // Update session in state
                    setCurrentSession((prev) => {
                        if (!prev) return null;
                        const updatedRounds = [...prev.rounds];
                        if (updatedRounds[round]) {
                            updatedRounds[round] = debateRound;
                        } else {
                            updatedRounds.push(debateRound);
                        }
                        return { ...prev, rounds: updatedRounds };
                    });
                } catch (error) {
                    console.error(
                        `Error getting argument from ${debater.name}:`,
                        error,
                    );
                }
            }

            session.rounds.push(debateRound);

            // Voting phase (except for classic mode or round 0)
            if (session.mode !== "classic" && round > 0) {
                const votes = await conductVoting(session, debateRound);
                debateRound.votes = votes;

                const consensus = calculateConsensus(
                    votes,
                    session.consensusThreshold,
                    session.votingSystem,
                );
                debateRound.consensusReached = consensus.reached;

                setCurrentSession((prev) => {
                    if (!prev) return null;
                    return { ...prev };
                });

                if (consensus.reached) {
                    break;
                }
            }
        }

        // Judge's final decision
        await generateJudgeDecision(session);
    };

    const runTeamDebate = async (session: DebateSession) => {
        // Team debate: alternate between teams
        const maxRounds = session.maxIterations;

        for (let round = 0; round <= maxRounds; round++) {
            const debateRound: DebateRound = {
                round,
                type: round === 0 ? "opening" : "argument",
                arguments: [],
            };

            // Each team coordinates their response
            for (const team of session.teams || []) {
                const teamMembers = session.debaters.filter(
                    (d) => d.teamId === team.id,
                );

                // Team members collaborate
                for (const debater of teamMembers) {
                    const systemPrompt = `${getDebaterSystemPrompt(debater, round, "voting")}

You are part of ${team.name}. Coordinate with your teammates and build upon their arguments.`;

                    const previousArgs = session.rounds.flatMap(
                        (r) => r.arguments,
                    );
                    const teamArgs = previousArgs.filter((arg) =>
                        teamMembers.some((m) => m.id === arg.debaterId),
                    );

                    const context = `\n\nYour team's previous arguments:\n${teamArgs
                        .map((arg) => {
                            const d = session.debaters.find(
                                (x) => x.id === arg.debaterId,
                            );
                            return `${d?.emoji} ${d?.name}: ${arg.content}`;
                        })
                        .join("\n\n")}`;

                    try {
                        const response = await aiApi.sendMessageSync(
                            debater.provider,
                            debater.modelId,
                            [
                                { role: "system", content: systemPrompt },
                                {
                                    role: "user",
                                    content: `Question: ${session.question}${context}`,
                                },
                            ],
                        );

                        debateRound.arguments.push({
                            debaterId: debater.id,
                            content: response.content,
                            timestamp: Date.now(),
                        });

                        setCurrentSession((prev) => {
                            if (!prev) return null;
                            const updatedRounds = [...prev.rounds];
                            if (updatedRounds[round]) {
                                updatedRounds[round] = debateRound;
                            } else {
                                updatedRounds.push(debateRound);
                            }
                            return { ...prev, rounds: updatedRounds };
                        });
                    } catch (error) {
                        console.error(`Error from ${debater.name}:`, error);
                    }
                }
            }

            session.rounds.push(debateRound);

            // Vote between teams
            if (round > 0) {
                const votes = await conductVoting(session, debateRound);
                debateRound.votes = votes;
                const consensus = calculateConsensus(
                    votes,
                    session.consensusThreshold,
                    session.votingSystem,
                );

                if (consensus.reached) break;
            }
        }

        await generateJudgeDecision(session);
    };

    const runPanelDebate = async (session: DebateSession) => {
        // Panel mode: structured discussion with moderator-style flow
        await runStandardDebate(session);
    };

    const runTournament = async (session: DebateSession) => {
        // Tournament: 1v1 elimination brackets
        const debaters = [...session.debaters];
        const bracket: TournamentBracket = {
            rounds: [],
            currentRound: 0,
        };

        let currentRoundDebaters = debaters;
        let roundNum = 0;

        while (currentRoundDebaters.length > 1) {
            const matches = [];

            for (let i = 0; i < currentRoundDebaters.length; i += 2) {
                if (i + 1 < currentRoundDebaters.length) {
                    matches.push({
                        id: `match-${roundNum}-${i}`,
                        debater1Id: currentRoundDebaters[i].id,
                        debater2Id: currentRoundDebaters[i + 1].id,
                    });
                }
            }

            bracket.rounds.push({
                roundNumber: roundNum,
                matches,
            });

            // Run each match
            const winners = [];
            for (const match of matches) {
                const matchDebaters = [
                    session.debaters.find((d) => d.id === match.debater1Id)!,
                    session.debaters.find((d) => d.id === match.debater2Id)!,
                ];

                const matchSession: DebateSession = {
                    ...session,
                    id: match.id,
                    debaters: matchDebaters,
                    rounds: [],
                };

                await runStandardDebate(matchSession);

                // Determine winner
                const lastRound =
                    matchSession.rounds[matchSession.rounds.length - 1];
                if (lastRound?.votes) {
                    const consensus = calculateConsensus(
                        lastRound.votes,
                        0.5,
                        session.votingSystem,
                    );
                    if (consensus.leader) {
                        match.winnerId = consensus.leader;
                        winners.push(
                            matchDebaters.find(
                                (d) => d.id === consensus.leader,
                            )!,
                        );
                    }
                }
            }

            currentRoundDebaters = winners;
            roundNum++;
        }

        session.bracket = bracket;
        if (currentRoundDebaters.length === 1) {
            session.winner = currentRoundDebaters[0].id;
        }

        setCurrentSession({ ...session });
    };

    const conductVoting = async (
        session: DebateSession,
        round: DebateRound,
    ) => {
        const votes = [];

        for (const debater of session.debaters) {
            try {
                const votingPrompt = getVotingPrompt(
                    debater,
                    session.debaters,
                    round.arguments,
                );

                const response = await aiApi.sendMessageSync(
                    debater.provider,
                    debater.modelId,
                    [{ role: "user", content: votingPrompt }],
                );

                // Parse JSON rankings
                const match = response.content.match(/\[.*\]/);
                if (match) {
                    const rankings = JSON.parse(match[0]);
                    votes.push({
                        voterId: debater.id,
                        rankings,
                    });
                }
            } catch (error) {
                console.error(`Voting error from ${debater.name}:`, error);
            }
        }

        return votes;
    };

    const generateJudgeDecision = async (session: DebateSession) => {
        try {
            const allArguments = session.rounds.flatMap((r) => r.arguments);
            const judgePrompt = getJudgePrompt(
                session.question,
                allArguments,
                session.debaters,
            );

            // Use the most capable model as judge
            const response = await aiApi.sendMessageSync(
                "together",
                "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
                [{ role: "user", content: judgePrompt }],
            );

            session.finalDecision = response.content;
            session.analytics = calculateDebateAnalytics(session);

            setCurrentSession({ ...session });
        } catch (error) {
            console.error("Judge error:", error);
        }
    };

    const calculateBeliefUpdate = (
        debater: Debater,
        previousArgs: DebateArgument[],
        newInfo: string,
    ): number => {
        if (debater.internalBelief === undefined) return 0.5;

        const currentBelief = debater.internalBelief;
        const persistence = debater.traits.beliefPersistence;
        const truthSeeking = debater.traits.truthSeeking;

        // Simple heuristic: adjust belief based on new information strength
        const infoStrength = Math.min(newInfo.length / 1000, 0.3);
        const adjustment = infoStrength * truthSeeking * (1 - persistence);

        // Randomly adjust up or down
        const direction = Math.random() > 0.5 ? 1 : -1;
        return Math.max(0, Math.min(1, currentBelief + adjustment * direction));
    };

    const togglePersonality = (personality: PersonalityType) => {
        setSelectedPersonalities((prev) => {
            if (prev.includes(personality)) {
                return prev.filter((p) => p !== personality);
            } else {
                return [...prev, personality];
            }
        });
    };

    const renderDebateContent = () => {
        if (!currentSession) return null;

        return (
            <div className="space-y-2 sm:space-y-3 md:space-y-4 pb-4 w-full">
                {/* Question Header */}
                <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 animate-pulse-slow">
                    <CardHeader className="p-2 sm:p-3">
                        <CardTitle className="text-xs sm:text-sm md:text-base flex items-center gap-1 sm:gap-2 flex-wrap">
                            <span className="text-sm sm:text-base">🎭</span>{" "}
                            Pertanyaan Debat
                            {isDebating && (
                                <Badge
                                    variant="default"
                                    className="animate-pulse"
                                >
                                    Berlangsung
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm font-medium overflow-wrap-anywhere leading-relaxed">
                            {currentSession.question}
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Debaters Overview */}
                <Card>
                    <CardHeader className="p-2 sm:p-3">
                        <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                            Debater
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 sm:p-3">
                        <div className="grid grid-cols-2 gap-2 w-full">
                            {currentSession.debaters.map((debater) => {
                                const team = teams.find(
                                    (t) => t.id === debater.teamId,
                                );
                                return (
                                    <div
                                        key={debater.id}
                                        className="p-1.5 sm:p-2 border rounded transition-smooth w-full min-w-0"
                                        style={
                                            team
                                                ? { borderColor: team.color }
                                                : {}
                                        }
                                    >
                                        <div className="flex items-center gap-1 mb-1 w-full">
                                            <span className="text-sm sm:text-base flex-shrink-0">
                                                {debater.emoji}
                                            </span>
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <div className="font-medium text-[10px] sm:text-xs truncate w-full">
                                                    {debater.name}
                                                </div>
                                            </div>
                                        </div>
                                        {team ? (
                                            <Badge
                                                style={{
                                                    backgroundColor: team.color,
                                                }}
                                                className="text-[9px] sm:text-xs px-1.5 py-0.5 mb-1"
                                            >
                                                {team.name}
                                            </Badge>
                                        ) : (
                                            <div
                                                className="w-full h-1 rounded-full mb-1"
                                                style={{
                                                    backgroundColor:
                                                        characterColors[
                                                            debater
                                                                .personalityType
                                                        ],
                                                }}
                                            />
                                        )}
                                        {debater.internalBelief !==
                                            undefined && (
                                            <Progress
                                                value={
                                                    debater.internalBelief * 100
                                                }
                                                className="h-1 mt-1"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Rounds */}
                {currentSession.rounds.map((round, roundIndex) => (
                    <Card key={roundIndex} className="scroll-mt-4 w-full">
                        <CardHeader className="p-2 sm:p-3 pb-1 sm:pb-2">
                            <CardTitle className="text-[10px] sm:text-xs md:text-sm flex items-center justify-between flex-wrap gap-1 sm:gap-2 w-full">
                                <span className="break-words">
                                    Ronde {round.round}: {round.type}
                                </span>
                                {round.consensusReached && (
                                    <Badge
                                        variant="default"
                                        className="bg-green-500 text-xs px-2 py-0.5 animate-bounce"
                                    >
                                        <Trophy className="h-3 w-3 mr-1" />
                                        Konsensus
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 sm:space-y-3 p-2 sm:p-3 pt-0">
                            {round.arguments.map((arg, argIndex) => {
                                const debater = currentSession.debaters.find(
                                    (d) => d.id === arg.debaterId,
                                );
                                const team = teams.find(
                                    (t) => t.id === debater?.teamId,
                                );

                                return (
                                    <div
                                        key={argIndex}
                                        className="p-2 sm:p-3 rounded-lg bg-muted/30 border border-muted animate-fade-in debate-argument w-full"
                                        style={
                                            team
                                                ? {
                                                      borderLeft: `4px solid ${team.color}`,
                                                  }
                                                : {
                                                      borderLeft: `4px solid ${characterColors[debater?.personalityType || "optimist"]}`,
                                                  }
                                        }
                                    >
                                        <div className="flex items-start gap-1 sm:gap-2 mb-1">
                                            <span className="text-sm sm:text-base md:text-lg flex-shrink-0">
                                                {debater?.emoji}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-[10px] sm:text-xs">
                                                    {debater?.name}
                                                </div>
                                            </div>
                                            {arg.beliefUpdate !== undefined && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] px-1 py-0"
                                                >
                                                    {(
                                                        arg.beliefUpdate * 100
                                                    ).toFixed(0)}
                                                    %
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="prose prose-sm dark:prose-invert max-w-full text-[11px] sm:text-xs md:text-sm overflow-wrap-anywhere w-full">
                                            <MarkdownRenderer
                                                content={arg.content}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Voting Results */}
                            {round.votes && round.votes.length > 0 && (
                                <div className="mt-2 p-2 bg-blue-500/10 rounded border border-blue-500/20 animate-slide-in">
                                    <div className="font-medium mb-1 flex items-center gap-1 text-xs">
                                        <Award className="h-3 w-3" />
                                        Voting ({votingSystem})
                                    </div>
                                    <div className="space-y-1">
                                        {(() => {
                                            const consensus =
                                                calculateConsensus(
                                                    round.votes,
                                                    currentSession.consensusThreshold,
                                                    currentSession.votingSystem,
                                                );
                                            const sortedScores = Object.entries(
                                                consensus.scores || {},
                                            ).sort((a, b) => b[1] - a[1]);

                                            return sortedScores.map(
                                                ([debaterId, score], idx) => {
                                                    const debater =
                                                        currentSession.debaters.find(
                                                            (d) =>
                                                                d.id ===
                                                                debaterId,
                                                        );
                                                    const isLeader =
                                                        debaterId ===
                                                        consensus.leader;

                                                    return (
                                                        <div
                                                            key={debaterId}
                                                            className="flex items-center gap-1 text-xs"
                                                        >
                                                            <span className="w-4">
                                                                {idx + 1}.
                                                            </span>
                                                            <span className="text-sm">
                                                                {debater?.emoji}
                                                            </span>
                                                            <span className="flex-1 truncate">
                                                                {debater?.name}
                                                            </span>
                                                            <span className="font-medium">
                                                                {score}
                                                            </span>
                                                            {isLeader && (
                                                                <Trophy className="h-3 w-3 text-yellow-500" />
                                                            )}
                                                        </div>
                                                    );
                                                },
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {/* Judge's Decision */}
                {currentSession.finalDecision && (
                    <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20 animate-slide-in">
                        <CardHeader className="p-2 sm:p-3">
                            <CardTitle className="flex items-center gap-2 text-xs sm:text-sm md:text-base">
                                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 animate-spin-slow" />
                                Keputusan Juri
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 sm:p-3 pt-0">
                            <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm overflow-wrap-anywhere">
                                <MarkdownRenderer
                                    content={currentSession.finalDecision}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {isDebating && (
                    <Card className="animate-pulse-slow">
                        <CardContent className="flex flex-col items-center justify-center p-6 sm:p-8">
                            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary mb-3" />
                            <span className="text-sm sm:text-base text-muted-foreground text-center">
                                Debat sedang berlangsung...
                            </span>
                            <Button
                                onClick={stopDebate}
                                variant="destructive"
                                size="sm"
                                className="mt-4 animate-pulse"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Stop Debat
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    const renderAnalytics = () => {
        if (!currentSession?.analytics) return null;

        const analytics = currentSession.analytics;

        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Analytics Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                            {getAnalyticsSummary(
                                analytics,
                                currentSession.debaters,
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Metrics */}
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Participation */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">
                                Participation Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {Object.entries(analytics.participationRate)
                                .sort((a, b) => b[1] - a[1])
                                .map(([id, count]) => {
                                    const debater =
                                        currentSession.debaters.find(
                                            (d) => d.id === id,
                                        );
                                    const max = Math.max(
                                        ...Object.values(
                                            analytics.participationRate,
                                        ),
                                    );
                                    return (
                                        <div key={id} className="mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm">
                                                    {debater?.emoji}{" "}
                                                    {debater?.name}
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {count}
                                                </span>
                                            </div>
                                            <Progress
                                                value={(count / max) * 100}
                                                className="h-2"
                                            />
                                        </div>
                                    );
                                })}
                        </CardContent>
                    </Card>

                    {/* Argument Quality */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">
                                Argument Quality
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {Object.entries(analytics.argumentQuality)
                                .sort((a, b) => b[1] - a[1])
                                .map(([id, quality]) => {
                                    const debater =
                                        currentSession.debaters.find(
                                            (d) => d.id === id,
                                        );
                                    return (
                                        <div key={id} className="mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm">
                                                    {debater?.emoji}{" "}
                                                    {debater?.name}
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {(quality * 100).toFixed(0)}
                                                    %
                                                </span>
                                            </div>
                                            <Progress
                                                value={quality * 100}
                                                className="h-2"
                                            />
                                        </div>
                                    );
                                })}
                        </CardContent>
                    </Card>
                </div>

                {/* Consensus Pattern */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">
                            Consensus Evolution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {analytics.consensusPattern.map((pattern, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 border rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">
                                            Round {pattern.round}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {(
                                                pattern.agreementLevel * 100
                                            ).toFixed(1)}
                                            % agreement
                                        </span>
                                    </div>
                                    <Progress
                                        value={pattern.agreementLevel * 100}
                                        className="h-2 mb-2"
                                    />
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>
                                            Polarization:{" "}
                                            {(
                                                pattern.polarization * 100
                                            ).toFixed(0)}
                                            %
                                        </span>
                                        {(() => {
                                            const leader =
                                                currentSession.debaters.find(
                                                    (d) =>
                                                        d.id ===
                                                        pattern.leadingPosition,
                                                );
                                            return leader ? (
                                                <span>
                                                    Leader: {leader.emoji}{" "}
                                                    {leader.name}
                                                </span>
                                            ) : null;
                                        })()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Arguments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Top Arguments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics.keyArguments
                                .slice(0, 5)
                                .map((arg, idx) => {
                                    const debater =
                                        currentSession.debaters.find(
                                            (d) => d.id === arg.debaterId,
                                        );
                                    return (
                                        <div
                                            key={idx}
                                            className="p-3 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-lg">
                                                    {debater?.emoji}
                                                </span>
                                                <span className="font-medium text-sm">
                                                    {debater?.name}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {arg.type}
                                                </Badge>
                                                <span className="ml-auto text-xs text-muted-foreground">
                                                    Strength:{" "}
                                                    {(
                                                        arg.strength * 100
                                                    ).toFixed(0)}
                                                    %
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-3">
                                                {arg.content}
                                            </p>
                                        </div>
                                    );
                                })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderSettings = () => {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">
                            Debate Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Debate Mode */}
                        <div className="space-y-2">
                            <Label>Debate Format</Label>
                            <Select
                                value={debateMode}
                                onValueChange={(v) =>
                                    setDebateMode(v as DebateFormat)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="voting">
                                        🗳️ Voting Mode (Consensus)
                                    </SelectItem>
                                    <SelectItem value="classic">
                                        🎭 Classic (3 Rounds)
                                    </SelectItem>
                                    <SelectItem value="team">
                                        👥 Team Debate
                                    </SelectItem>
                                    <SelectItem value="panel">
                                        🎪 Panel Discussion
                                    </SelectItem>
                                    <SelectItem value="tournament">
                                        🏆 Tournament (Elimination)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Voting System */}
                        <div className="space-y-2">
                            <Label>Voting System</Label>
                            <Select
                                value={votingSystem}
                                onValueChange={(v) =>
                                    setVotingSystem(v as VotingSystem)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ranked">
                                        Ranked Choice (First Place)
                                    </SelectItem>
                                    <SelectItem value="borda">
                                        Borda Count (Points)
                                    </SelectItem>
                                    <SelectItem value="approval">
                                        Approval Voting
                                    </SelectItem>
                                    <SelectItem value="condorcet">
                                        Condorcet Method
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Consensus Threshold */}
                        <div className="space-y-2">
                            <Label>
                                Consensus Threshold:{" "}
                                {(consensusThreshold * 100).toFixed(0)}%
                            </Label>
                            <Slider
                                value={[consensusThreshold * 100]}
                                onValueChange={(v) =>
                                    setConsensusThreshold(v[0] / 100)
                                }
                                min={50}
                                max={100}
                                step={5}
                            />
                        </div>

                        {/* Max Iterations */}
                        <div className="space-y-2">
                            <Label>Maksimum Ronde: {maxIterations}</Label>
                            <Slider
                                value={[maxIterations]}
                                onValueChange={(v) => setMaxIterations(v[0])}
                                min={1}
                                max={15}
                                step={1}
                            />
                        </div>

                        {/* Max Tokens */}
                        <div className="space-y-2">
                            <Label>Max Tokens: {maxTokens}</Label>
                            <Slider
                                value={[maxTokens]}
                                onValueChange={(v) => setMaxTokens(v[0])}
                                min={256}
                                max={6000}
                                step={128}
                            />
                            <p className="text-xs text-muted-foreground">
                                Token lebih rendah = respons lebih cepat &
                                murah. Lebih tinggi = respons lebih detail dan
                                lengkap.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Personality Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Pilih Debater</CardTitle>
                        <CardDescription>
                            Pilih minimal 2 personalitas dan sesuaikan model
                            mereka
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(
                                Object.keys(
                                    PRESET_DEBATERS,
                                ) as PersonalityType[]
                            ).map((personality) => {
                                const preset = PRESET_DEBATERS[personality];
                                const isSelected =
                                    selectedPersonalities.includes(personality);

                                return (
                                    <div
                                        key={personality}
                                        onClick={() =>
                                            togglePersonality(personality)
                                        }
                                        className={cn(
                                            "p-2 border rounded cursor-pointer transition-all",
                                            isSelected
                                                ? "border-primary bg-primary/5"
                                                : "border-muted hover:border-primary/50",
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">
                                                {preset.emoji}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-xs truncate">
                                                    {preset.name}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground truncate">
                                                    {preset.traits.perspective}
                                                </div>
                                            </div>
                                            <div
                                                className={cn(
                                                    "flex-shrink-0",
                                                    isSelected
                                                        ? "text-primary"
                                                        : "text-muted-foreground",
                                                )}
                                            >
                                                {isSelected ? (
                                                    <CheckSquare className="h-4 w-4" />
                                                ) : (
                                                    <Square className="h-4 w-4" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Presets */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Preset Cepat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() =>
                                    setSelectedPersonalities([
                                        "optimist",
                                        "skeptic",
                                        "visionary",
                                        "critic",
                                    ])
                                }
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                Classic Four (Default)
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() =>
                                    setSelectedPersonalities([
                                        "scientist",
                                        "philosopher",
                                        "pragmatist",
                                    ])
                                }
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Panel Akademis
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() =>
                                    setSelectedPersonalities([
                                        "optimist",
                                        "critic",
                                        "scientist",
                                        "artist",
                                        "philosopher",
                                        "pragmatist",
                                    ])
                                }
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Panel Lengkap (6 Debater)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
            <div className="h-full w-full flex flex-col p-2 sm:p-3 md:p-4 max-w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-2 flex-shrink-0 px-1 sm:px-0">
                    <div className="flex-1 min-w-0 mr-2">
                        <h1 className="text-base sm:text-xl md:text-2xl font-bold flex items-center gap-1 sm:gap-2">
                            <span className="text-base sm:text-2xl">🎭</span>
                            <span className="truncate">
                                <span className="hidden sm:inline">
                                    ASS Debate System
                                </span>
                                <span className="sm:hidden">ASS Debate</span>
                            </span>
                        </h1>
                        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">
                            <span className="hidden md:inline">
                                Argumentative System Service -{" "}
                            </span>
                            <span className="hidden sm:inline md:hidden">
                                AI Debates
                            </span>
                            <span className="sm:hidden">AI Expert Debates</span>
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="flex-shrink-0"
                    >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                </div>

                {!currentSession ? (
                    /* Setup Screen */
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scroll-container">
                        <div className="w-full max-w-full sm:max-w-2xl md:max-w-3xl mx-auto space-y-2 sm:space-y-3 md:space-y-4 pb-4 px-1 sm:px-2">
                            {/* Question Input */}
                            <Card className="w-full">
                                <CardHeader className="p-2 sm:p-3 pb-2">
                                    <CardTitle className="text-xs sm:text-sm">
                                        Pertanyaan Debat
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 sm:space-y-3 p-2 sm:p-3 pt-0 w-full">
                                    <Textarea
                                        value={question}
                                        onChange={(e) =>
                                            setQuestion(e.target.value)
                                        }
                                        placeholder="Contoh: Haruskah kita mengembangkan AGI secepat mungkin?"
                                        className="min-h-[80px] sm:min-h-[100px] text-sm resize-none w-full"
                                    />

                                    {/* Preset Questions */}
                                    <div className="space-y-1">
                                        <Label className="text-[10px] sm:text-xs text-muted-foreground">
                                            Pertanyaan Preset:
                                        </Label>
                                        <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto scroll-container">
                                            {presetQuestions.map((q) => (
                                                <Button
                                                    key={q}
                                                    variant="outline"
                                                    className="justify-start text-left h-auto py-2 px-2 text-xs overflow-wrap-anywhere active-scale"
                                                    onClick={() =>
                                                        setQuestion(q)
                                                    }
                                                >
                                                    {q}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Settings */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSettings(!showSettings)}
                                className="w-full text-xs sm:text-sm active-scale"
                            >
                                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                {showSettings ? "Sembunyikan" : "Tampilkan"}{" "}
                                Pengaturan
                                {showSettings ? (
                                    <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                                ) : (
                                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                                )}
                            </Button>

                            {showSettings && renderSettings()}

                            {/* Quick Info */}
                            {!showSettings && (
                                <Card>
                                    <CardContent className="p-2 sm:p-3">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center w-full">
                                            <div className="p-2 rounded bg-muted/20">
                                                <div className="text-base sm:text-lg font-bold text-primary">
                                                    {
                                                        selectedPersonalities.length
                                                    }
                                                </div>
                                                <div className="text-[10px] sm:text-xs text-muted-foreground">
                                                    Debater
                                                </div>
                                            </div>
                                            <div className="p-2 rounded bg-muted/20">
                                                <div className="text-base sm:text-lg font-bold text-primary truncate capitalize">
                                                    {debateMode}
                                                </div>
                                                <div className="text-[10px] sm:text-xs text-muted-foreground">
                                                    Format
                                                </div>
                                            </div>
                                            <div className="p-2 rounded bg-muted/20">
                                                <div className="text-base sm:text-lg font-bold text-primary">
                                                    {(
                                                        consensusThreshold * 100
                                                    ).toFixed(0)}
                                                    %
                                                </div>
                                                <div className="text-[10px] sm:text-xs text-muted-foreground">
                                                    Konsensus
                                                </div>
                                            </div>
                                            <div className="p-2 rounded bg-muted/20">
                                                <div className="text-base sm:text-lg font-bold text-primary">
                                                    {maxIterations}
                                                </div>
                                                <div className="text-[10px] sm:text-xs text-muted-foreground">
                                                    Ronde
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    onClick={startDebate}
                                    disabled={
                                        isDebating ||
                                        !question.trim() ||
                                        selectedPersonalities.length < 2
                                    }
                                    className="flex-1"
                                    size="lg"
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    Mulai Debat
                                </Button>
                                {isDebating && (
                                    <Button
                                        onClick={stopDebate}
                                        variant="destructive"
                                        className="flex-1 animate-pulse"
                                        size="lg"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Stop Debat
                                    </Button>
                                )}
                                {currentSession && !isDebating && (
                                    <Button
                                        onClick={saveSession}
                                        variant="outline"
                                        size="lg"
                                    >
                                        Simpan
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Debate Screen */
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden w-full">
                        {/* Tabs */}
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="flex-1 flex flex-col min-h-0 w-full"
                        >
                            <TabsList className="grid w-full grid-cols-3 max-w-full sm:max-w-md mx-auto flex-shrink-0">
                                <TabsTrigger
                                    value="debate"
                                    className="text-xs sm:text-sm"
                                >
                                    <Users className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">
                                        Debate
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="analytics"
                                    disabled={!currentSession.analytics}
                                    className="text-xs sm:text-sm"
                                >
                                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">
                                        Analytics
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="tree"
                                    disabled={!currentSession.analytics}
                                    className="text-xs sm:text-sm"
                                >
                                    <GitBranch className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">
                                        Tree
                                    </span>
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex-1 min-h-0 overflow-hidden mt-2 sm:mt-3 md:mt-4 w-full">
                                <TabsContent
                                    value="debate"
                                    className="h-full m-0 overflow-hidden"
                                >
                                    <div
                                        className="h-full w-full overflow-y-auto overflow-x-hidden px-1 pr-2 sm:pr-3 scroll-container pb-4"
                                        ref={scrollAreaRef}
                                    >
                                        {renderDebateContent()}
                                    </div>
                                </TabsContent>

                                <TabsContent
                                    value="analytics"
                                    className="h-full m-0 overflow-hidden"
                                >
                                    <div className="h-full w-full overflow-y-auto overflow-x-hidden px-1 pr-2 sm:pr-3 scroll-container pb-4">
                                        {renderAnalytics()}
                                    </div>
                                </TabsContent>

                                <TabsContent
                                    value="tree"
                                    className="h-full m-0 overflow-hidden"
                                >
                                    <div className="h-full w-full overflow-y-auto overflow-x-hidden px-1 pr-2 sm:pr-3 scroll-container pb-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                                                    <GitBranch className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    Debate Tree Structure
                                                </CardTitle>
                                                <CardDescription className="text-xs sm:text-sm">
                                                    Argument relationships and
                                                    flow
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-sm text-muted-foreground text-center py-8">
                                                    <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                    <p>
                                                        Visual debate tree
                                                        coming soon
                                                    </p>
                                                    <p className="text-xs mt-2">
                                                        Will show argument
                                                        connections and debate
                                                        flow
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>

                        {/* Bottom Actions */}
                        <div className="mt-2 sm:mt-3 md:mt-4 flex flex-col sm:flex-row gap-2 flex-shrink-0 safe-bottom px-1 sm:px-0 w-full">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setCurrentSession(null);
                                    setIsDebating(false);
                                    setActiveTab("debate");
                                }}
                                disabled={isDebating}
                                className="w-full sm:w-auto"
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Debat Baru
                            </Button>
                            {isDebating && (
                                <Button
                                    onClick={stopDebate}
                                    variant="destructive"
                                    className="w-full sm:w-auto animate-pulse"
                                    size="default"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Stop Debat
                                </Button>
                            )}
                            {currentSession.analytics && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setShowAnalytics(!showAnalytics)
                                    }
                                    className="w-full sm:w-auto"
                                >
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">
                                        Toggle Analytics
                                    </span>
                                    <span className="sm:hidden">Analytics</span>
                                </Button>
                            )}

                            {/* Saved Sessions */}
                            {savedSessions.length > 0 && !currentSession && (
                                <Card className="mt-4">
                                    <CardHeader>
                                        <CardTitle className="text-sm">
                                            Sesi Tersimpan
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {savedSessions.map((session, idx) => (
                                            <Button
                                                key={idx}
                                                variant="outline"
                                                className="w-full justify-start text-left"
                                                onClick={() =>
                                                    loadSession(session)
                                                }
                                            >
                                                <div className="truncate">
                                                    {session.question}
                                                </div>
                                            </Button>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
