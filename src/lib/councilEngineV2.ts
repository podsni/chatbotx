/**
 * COUNCIL-HADES: Enhanced Core Engine V2
 * Multi-agent collective intelligence system with advanced features
 * - Stop/Pause/Resume support
 * - Multi-model per agent
 * - Token tracking and limits
 * - Session persistence
 */

import {
    AgentRole,
    CouncilMode,
    CouncilSession,
    CouncilConfig,
    AgentOpinion,
    SolutionProposal,
    AgentVote,
    DimensionScore,
    VotingDimension,
    CouncilDecision,
    CouncilReflection,
    COUNCIL_AGENTS,
    COUNCIL_MODE_CONFIGS,
    DEFAULT_WEIGHTING_RULES,
} from "./councilTypes";
import { aiApi, Provider } from "./aiApi";
import { councilDB } from "./councilDB";

// Generate unique IDs
const generateId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Token estimation constants
const AVG_CHARS_PER_TOKEN = 4;
const SYSTEM_PROMPT_OVERHEAD = 200;

/**
 * Enhanced Council Engine Class V2
 */
export class CouncilEngineV2 {
    private session: CouncilSession;
    private config: CouncilConfig;
    private onProgress?: (stage: string, data: Record<string, unknown>) => void;
    private shouldStop = false;
    private isPaused = false;
    private agentModels: Record<AgentRole, { model: string; provider: Provider }>;

    constructor(
        question: string,
        mode: CouncilMode,
        defaultModel: string,
        defaultProvider: Provider,
        onProgress?: (stage: string, data: Record<string, unknown>) => void,
        agentModels?: Record<AgentRole, { model: string; provider: Provider }>,
        customRounds?: number,
    ) {
        this.config = { ...COUNCIL_MODE_CONFIGS[mode] };

        // Custom rounds override
        if (customRounds !== undefined) {
            this.config.maxDebateRounds = customRounds;
        }

        this.onProgress = onProgress;

        // Set up agent models (use default if not specified per agent)
        this.agentModels = agentModels || {
            analyst: { model: defaultModel, provider: defaultProvider },
            builder: { model: defaultModel, provider: defaultProvider },
            strategist: { model: defaultModel, provider: defaultProvider },
            auditor: { model: defaultModel, provider: defaultProvider },
            moderator: { model: defaultModel, provider: defaultProvider },
        };

        this.session = {
            id: generateId(),
            question,
            mode,
            startTime: Date.now(),
            initialOpinions: [],
            debateRounds: [],
            proposals: [],
            votes: [],
            modelUsed: defaultModel,
            provider: defaultProvider,
            agentModels: this.agentModels,
            status: "running",
            tokensUsed: 0,
            estimatedTokens: 0,
        };
    }

    /**
     * Load from existing session (for resume)
     */
    static fromSession(
        session: CouncilSession,
        onProgress?: (stage: string, data: Record<string, unknown>) => void,
    ): CouncilEngineV2 {
        const engine = new CouncilEngineV2(
            session.question,
            session.mode,
            session.modelUsed,
            session.provider as Provider,
            onProgress,
            session.agentModels,
        );

        // Restore session state
        engine.session = { ...session, status: "running" };
        return engine;
    }

    /**
     * Stop the session immediately
     */
    stop(): void {
        this.shouldStop = true;
        this.session.status = "paused";
        this.emitProgress("session_stopped", { reason: "User requested stop" });
    }

    /**
     * Pause the session
     */
    pause(): void {
        this.isPaused = true;
        this.session.status = "paused";
        this.emitProgress("session_paused", {});
    }

    /**
     * Resume paused session
     */
    resume(): void {
        this.isPaused = false;
        this.session.status = "running";
        this.emitProgress("session_resumed", {});
    }

    /**
     * Check if should continue
     */
    private shouldContinue(): boolean {
        return !this.shouldStop && !this.isPaused;
    }

    /**
     * Wait while paused
     */
    private async waitWhilePaused(): Promise<void> {
        while (this.isPaused && !this.shouldStop) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    /**
     * Estimate tokens for entire session
     */
    async estimateTokens(): Promise<number> {
        const agents: AgentRole[] = ["analyst", "builder", "strategist", "auditor"];
        const questionTokens = this.estimateTokensForText(this.session.question);

        let totalTokens = 0;

        // Initial opinions: 4 agents
        totalTokens += agents.length * (SYSTEM_PROMPT_OVERHEAD + questionTokens + 500);

        // Debate rounds
        const debateRounds = Math.max(0, this.config.maxDebateRounds - 1);
        totalTokens += debateRounds * agents.length * 400;

        // Proposals: 4 agents
        totalTokens += agents.length * 600;

        // Voting: 4 agents × 4 proposals
        totalTokens += agents.length * agents.length * 300;

        // Decision synthesis
        totalTokens += 800;

        // Reflection (if enabled)
        if (this.config.enableReflection) {
            totalTokens += 500;
        }

        this.session.estimatedTokens = totalTokens;
        return totalTokens;
    }

    /**
     * Estimate tokens for text
     */
    private estimateTokensForText(text: string): number {
        return Math.ceil(text.length / AVG_CHARS_PER_TOKEN);
    }

    /**
     * Track tokens used
     */
    private trackTokens(text: string): void {
        const tokens = this.estimateTokensForText(text);
        this.session.tokensUsed = (this.session.tokensUsed || 0) + tokens;
        this.emitProgress("tokens_updated", {
            tokensUsed: this.session.tokensUsed,
            estimatedTokens: this.session.estimatedTokens,
        });
    }

    /**
     * Run the complete Council session
     */
    async run(): Promise<CouncilSession> {
        try {
            // Estimate tokens first
            await this.estimateTokens();
            this.emitProgress("estimation_complete", {
                estimatedTokens: this.session.estimatedTokens,
            });

            // Save initial state
            await this.saveSession();

            // Determine which stage to start from
            if (this.session.initialOpinions.length === 0) {
                // Stage 1: Initial Opinions
                await this.gatherInitialOpinions();
                if (!this.shouldContinue()) return this.finalizeSession();
                await this.saveSession();
            }

            if (
                this.config.maxDebateRounds > 1 &&
                this.session.debateRounds.length < this.config.maxDebateRounds - 1
            ) {
                // Stage 2: Debate
                await this.conductDebate();
                if (!this.shouldContinue()) return this.finalizeSession();
                await this.saveSession();
            }

            if (this.session.proposals.length === 0) {
                // Stage 3: Proposal Generation
                await this.generateProposals();
                if (!this.shouldContinue()) return this.finalizeSession();
                await this.saveSession();
            }

            const expectedVotes =
                4 * this.session.proposals.length; // 4 agents vote on all proposals
            if (this.session.votes.length < expectedVotes) {
                // Stage 4: Voting
                await this.conductVoting();
                if (!this.shouldContinue()) return this.finalizeSession();
                await this.saveSession();
            }

            if (!this.session.decision) {
                // Stage 5: Decision Synthesis
                await this.synthesizeDecision();
                if (!this.shouldContinue()) return this.finalizeSession();
                await this.saveSession();
            }

            if (this.config.enableReflection && !this.session.reflection) {
                // Stage 6: Self-Reflection
                await this.performReflection();
                await this.saveSession();
            }

            return this.finalizeSession();
        } catch (error) {
            console.error("Council session error:", error);
            this.session.status = "error";
            await this.saveSession();
            throw error;
        }
    }

    /**
     * Finalize session and mark as complete
     */
    private async finalizeSession(): Promise<CouncilSession> {
        if (this.session.status === "running") {
            this.session.status = "completed";
        }
        this.session.endTime = Date.now();
        await this.saveSession();
        return this.session;
    }

    /**
     * Save session to database
     */
    private async saveSession(): Promise<void> {
        try {
            await councilDB.saveSession(this.session);
        } catch (error) {
            console.error("Failed to save session:", error);
        }
    }

    /**
     * Stage 1: Gather initial opinions from all agents
     */
    private async gatherInitialOpinions(): Promise<void> {
        this.emitProgress("initial_opinions_start", {
            stage: "Gathering initial perspectives...",
        });

        const agents: AgentRole[] = [
            "analyst",
            "builder",
            "strategist",
            "auditor",
        ];

        for (const role of agents) {
            if (!this.shouldContinue()) break;
            await this.waitWhilePaused();

            const agent = COUNCIL_AGENTS[role];
            const prompt = this.buildInitialOpinionPrompt(role);

            try {
                const response = await this.callAgent(role, prompt);
                this.trackTokens(prompt + response);

                const opinion: AgentOpinion = {
                    agentRole: role,
                    content: response,
                    timestamp: Date.now(),
                    stage: "initial",
                };

                this.session.initialOpinions.push(opinion);
                this.emitProgress("agent_opinion", { role, opinion });
            } catch (error) {
                console.error(`Error getting opinion from ${role}:`, error);
            }
        }
    }

    /**
     * Stage 2: Conduct debate rounds
     */
    private async conductDebate(): Promise<void> {
        this.emitProgress("debate_start", {
            rounds: this.config.maxDebateRounds,
        });

        const startRound = this.session.debateRounds.length;
        const maxRounds = this.config.maxDebateRounds - 1;

        for (let round = startRound; round < maxRounds; round++) {
            if (!this.shouldContinue()) break;

            const roundOpinions: AgentOpinion[] = [];
            const agents: AgentRole[] = [
                "analyst",
                "builder",
                "strategist",
                "auditor",
            ];

            for (const role of agents) {
                if (!this.shouldContinue()) break;
                await this.waitWhilePaused();

                const prompt = this.buildDebatePrompt(role, round);

                try {
                    const response = await this.callAgent(role, prompt);
                    this.trackTokens(prompt + response);

                    const opinion: AgentOpinion = {
                        agentRole: role,
                        content: response,
                        timestamp: Date.now(),
                        stage: "debate",
                    };

                    roundOpinions.push(opinion);
                    this.emitProgress("debate_response", {
                        round,
                        role,
                        opinion,
                    });
                } catch (error) {
                    console.error(
                        `Debate error for ${role} in round ${round}:`,
                        error,
                    );
                }
            }

            if (roundOpinions.length > 0) {
                this.session.debateRounds.push(roundOpinions);
            }
        }
    }

    /**
     * Stage 3: Generate solution proposals
     */
    private async generateProposals(): Promise<void> {
        this.emitProgress("proposals_start", {
            stage: "Generating solution proposals...",
        });

        const agents: AgentRole[] = [
            "analyst",
            "builder",
            "strategist",
            "auditor",
        ];

        for (const role of agents) {
            if (!this.shouldContinue()) break;
            await this.waitWhilePaused();

            const prompt = this.buildProposalPrompt(role);

            try {
                const response = await this.callAgent(role, prompt);
                this.trackTokens(prompt + response);

                const proposal = this.parseProposal(role, response);
                this.session.proposals.push(proposal);
                this.emitProgress("proposal_created", { role, proposal });
            } catch (error) {
                console.error(`Proposal error for ${role}:`, error);
            }
        }
    }

    /**
     * Stage 4: Conduct voting on proposals
     */
    private async conductVoting(): Promise<void> {
        this.emitProgress("voting_start", {
            proposals: this.session.proposals.length,
        });

        const agents: AgentRole[] = [
            "analyst",
            "builder",
            "strategist",
            "auditor",
        ];

        for (const role of agents) {
            for (const proposal of this.session.proposals) {
                if (!this.shouldContinue()) break;
                await this.waitWhilePaused();

                const prompt = this.buildVotingPrompt(role, proposal);

                try {
                    const response = await this.callAgent(role, prompt);
                    this.trackTokens(prompt + response);

                    const vote = this.parseVote(role, proposal.id, response);
                    this.session.votes.push(vote);
                    this.emitProgress("vote_cast", {
                        role,
                        proposalId: proposal.id,
                        vote,
                    });
                } catch (error) {
                    console.error(
                        `Voting error for ${role} on ${proposal.id}:`,
                        error,
                    );
                }
            }
        }
    }

    /**
     * Stage 5: Synthesize final decision
     */
    private async synthesizeDecision(): Promise<void> {
        this.emitProgress("decision_start", {
            stage: "Synthesizing final decision...",
        });

        const proposalScores = this.calculateProposalScores();
        const vetoedProposals = this.checkEthicsVeto();
        const validProposals = proposalScores.filter(
            (ps) => !vetoedProposals.includes(ps.proposalId),
        );

        if (validProposals.length === 0) {
            throw new Error(
                "All proposals were vetoed on ethical grounds. Council cannot proceed.",
            );
        }

        const bestProposal = validProposals.reduce((prev, current) =>
            current.weightedScore > prev.weightedScore ? current : prev,
        );

        const selectedProposal = this.session.proposals.find(
            (p) => p.id === bestProposal.proposalId,
        )!;

        const minorityNotes = this.collectMinorityNotes(
            bestProposal.proposalId,
        );

        const moderatorPrompt = this.buildModeratorDecisionPrompt(
            selectedProposal,
            bestProposal.weightedScore,
            minorityNotes,
        );

        const moderatorResponse = await this.callAgent(
            "moderator",
            moderatorPrompt,
        );
        this.trackTokens(moderatorPrompt + moderatorResponse);

        const decision = this.parseDecision(
            selectedProposal.id,
            bestProposal.weightedScore,
            moderatorResponse,
        );

        this.session.decision = decision;
        this.emitProgress("decision_complete", { decision });
    }

    /**
     * Stage 6: Perform self-reflection
     */
    private async performReflection(): Promise<void> {
        this.emitProgress("reflection_start", {
            stage: "Performing self-reflection...",
        });

        const prompt = this.buildReflectionPrompt();
        const response = await this.callAgent("moderator", prompt);
        this.trackTokens(prompt + response);

        const reflection = this.parseReflection(response);
        this.session.reflection = reflection;
        this.emitProgress("reflection_complete", { reflection });
    }

    /**
     * Calculate weighted scores for all proposals
     */
    private calculateProposalScores(): Array<{
        proposalId: string;
        weightedScore: number;
    }> {
        const weights = this.calculateAgentWeights();
        const proposalScores: Record<string, number> = {};

        for (const proposal of this.session.proposals) {
            const votes = this.session.votes.filter(
                (v) => v.proposalId === proposal.id,
            );

            let totalWeightedScore = 0;
            let totalWeight = 0;

            for (const vote of votes) {
                const weight = weights[vote.agentRole] || 1.0;
                totalWeightedScore += vote.overallScore * weight;
                totalWeight += weight;
            }

            proposalScores[proposal.id] =
                totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
        }

        return Object.entries(proposalScores).map(
            ([proposalId, weightedScore]) => ({
                proposalId,
                weightedScore,
            }),
        );
    }

    /**
     * Calculate agent weights based on context
     */
    private calculateAgentWeights(): Record<AgentRole, number> {
        if (this.config.weightingStrategy === "equal") {
            return {
                analyst: 1.0,
                builder: 1.0,
                strategist: 1.0,
                auditor: 1.0,
                moderator: 1.0,
            };
        }

        if (this.config.weightingStrategy === "contextual") {
            const question = this.session.question.toLowerCase();

            for (const rule of DEFAULT_WEIGHTING_RULES) {
                if (
                    rule.contextKeywords.some((keyword) =>
                        question.includes(keyword),
                    )
                ) {
                    return rule.weights;
                }
            }
        }

        return {
            analyst: 1.1,
            builder: 1.0,
            strategist: 1.2,
            auditor: 1.1,
            moderator: 1.0,
        };
    }

    /**
     * Check for ethics veto
     */
    private checkEthicsVeto(): string[] {
        if (!this.config.enableVeto) {
            return [];
        }

        const vetoedProposals: string[] = [];

        for (const proposal of this.session.proposals) {
            const votes = this.session.votes.filter(
                (v) => v.proposalId === proposal.id,
            );

            for (const vote of votes) {
                if (vote.agentRole === "strategist" && vote.vetoEthics) {
                    vetoedProposals.push(proposal.id);
                    break;
                }
            }
        }

        return vetoedProposals;
    }

    /**
     * Collect minority notes
     */
    private collectMinorityNotes(selectedProposalId: string): string[] {
        const notes: string[] = [];
        const selectedVotes = this.session.votes.filter(
            (v) => v.proposalId === selectedProposalId,
        );

        for (const vote of selectedVotes) {
            if (vote.notes && vote.overallScore < 7) {
                const agent = COUNCIL_AGENTS[vote.agentRole];
                notes.push(`${agent.name}: ${vote.notes}`);
            }
        }

        return notes;
    }

    /**
     * Call an agent via AI API with proper model
     */
    private async callAgent(role: AgentRole, prompt: string): Promise<string> {
        const agent = COUNCIL_AGENTS[role];
        const systemPrompt = agent.systemPrompt;
        const agentModel = this.agentModels[role];

        const messages: Array<{ role: string; content: string }> = [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
        ];

        const maxTokens = this.config.maxTokensPerAgent || 2000;

        const response = await aiApi.sendMessageSync(
            agentModel.provider,
            agentModel.model,
            messages,
            maxTokens,
        );

        return response.content;
    }

    /**
     * Build initial opinion prompt
     */
    private buildInitialOpinionPrompt(role: AgentRole): string {
        const agent = COUNCIL_AGENTS[role];
        return `The Council has received this question:

"${this.session.question}"

As ${agent.name}, provide your initial perspective on this question.
Focus on your specialty: ${agent.perspective}

Keep your response concise (2-3 paragraphs). Be direct and insightful.`;
    }

    /**
     * Build debate prompt
     */
    private buildDebatePrompt(role: AgentRole, round: number): string {
        const agent = COUNCIL_AGENTS[role];
        const previousOpinions =
            round === 0
                ? this.session.initialOpinions
                : this.session.debateRounds[round - 1];

        let context = "Previous perspectives:\n\n";
        for (const opinion of previousOpinions) {
            const otherAgent = COUNCIL_AGENTS[opinion.agentRole];
            context += `${otherAgent.name}:\n${opinion.content}\n\n`;
        }

        return `${context}

As ${agent.name}, respond to the other agents' perspectives.
You may:
- Challenge assumptions you find weak
- Support points you agree with
- Add new angles they missed
- Ask critical questions

Keep your response focused (2-3 paragraphs).`;
    }

    /**
     * Build proposal prompt
     */
    private buildProposalPrompt(role: AgentRole): string {
        const agent = COUNCIL_AGENTS[role];

        let context = "Question:\n" + this.session.question + "\n\n";
        context += "All perspectives so far:\n\n";

        for (const opinion of this.session.initialOpinions) {
            const otherAgent = COUNCIL_AGENTS[opinion.agentRole];
            context += `${otherAgent.name}: ${opinion.content}\n\n`;
        }

        return `${context}

As ${agent.name}, propose your solution to the question.

Format your proposal as JSON:
{
  "title": "Brief title of your solution",
  "description": "2-3 paragraph description",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "risks": ["Risk 1", "Risk 2"],
  "benefits": ["Benefit 1", "Benefit 2"]
}

Be specific and actionable.`;
    }

    /**
     * Build voting prompt
     */
    private buildVotingPrompt(
        role: AgentRole,
        proposal: SolutionProposal,
    ): string {
        const agent = COUNCIL_AGENTS[role];
        const proposer = COUNCIL_AGENTS[proposal.agentRole];

        return `Proposal by ${proposer.name}:

Title: ${proposal.title}
Description: ${proposal.description}

As ${agent.name}, evaluate this proposal on five dimensions (score 1-10):

1. Logic: How consistent and rational is this solution?
2. Feasibility: Can this be implemented in the real world?
3. Safety: How safe and risk-free is this approach?
4. Benefit: How much value does this provide?
5. Ethics: Is this morally sound and respectful of human dignity?

Respond in JSON format:
{
  "logic": {"score": X, "reasoning": "..."},
  "feasibility": {"score": X, "reasoning": "..."},
  "safety": {"score": X, "reasoning": "..."},
  "benefit": {"score": X, "reasoning": "..."},
  "ethics": {"score": X, "reasoning": "..."},
  "notes": "Any additional concerns or praise"
}`;
    }

    /**
     * Build moderator decision prompt
     */
    private buildModeratorDecisionPrompt(
        proposal: SolutionProposal,
        score: number,
        minorityNotes: string[],
    ): string {
        return `The Council has selected this proposal as the best solution:

${proposal.title}
${proposal.description}

Weighted Score: ${score.toFixed(2)}/10

Minority concerns:
${minorityNotes.length > 0 ? minorityNotes.join("\n") : "None"}

As The Moderator, synthesize the final decision. Provide:
1. Clear reasoning for why this solution was chosen
2. Concrete recommendations (action steps)
3. Remaining risks and how to mitigate them
4. Overall consensus level (0-10)

Format as JSON:
{
  "reasoning": "Why this solution is best...",
  "recommendations": ["Step 1", "Step 2", "Step 3"],
  "risks": ["Risk 1", "Risk 2"],
  "mitigations": ["Mitigation 1", "Mitigation 2"],
  "consensus": X
}`;
    }

    /**
     * Build reflection prompt
     */
    private buildReflectionPrompt(): string {
        return `The Council session is complete. As The Moderator, reflect on the process:

1. What worked well in this deliberation?
2. What could be improved?
3. Which agent provided the most valuable insight?
4. Was the debate fair and balanced? (rate 0-10)
5. Did you detect any bias?
6. What did the Council learn from this session?

Format as JSON:
{
  "whatWorkedWell": ["Point 1", "Point 2"],
  "areasForImprovement": ["Point 1", "Point 2"],
  "mostValuableAgent": "analyst|builder|strategist|auditor",
  "debateFairness": X,
  "biasDetected": "Description or null",
  "learnings": ["Learning 1", "Learning 2"]
}`;
    }

    /**
     * Parse proposal from LLM response
     */
    private parseProposal(role: AgentRole, response: string): SolutionProposal {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                return {
                    id: generateId(),
                    agentRole: role,
                    title: data.title || "Untitled Proposal",
                    description: data.description || response,
                    steps: data.steps || [],
                    risks: data.risks || [],
                    benefits: data.benefits || [],
                    timestamp: Date.now(),
                };
            }
        } catch (error) {
            console.error("Failed to parse proposal JSON:", error);
        }

        return {
            id: generateId(),
            agentRole: role,
            title: `Proposal from ${COUNCIL_AGENTS[role].name}`,
            description: response,
            timestamp: Date.now(),
        };
    }

    /**
     * Parse vote from LLM response
     */
    private parseVote(
        role: AgentRole,
        proposalId: string,
        response: string,
    ): AgentVote {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);

                const dimensions: VotingDimension[] = [
                    "logic",
                    "feasibility",
                    "safety",
                    "benefit",
                    "ethics",
                ];
                const scores: DimensionScore[] = [];
                let total = 0;

                for (const dim of dimensions) {
                    const dimData = data[dim];
                    const score =
                        typeof dimData === "object"
                            ? dimData.score
                            : dimData || 5;
                    const reasoning =
                        typeof dimData === "object" ? dimData.reasoning : "";

                    scores.push({ dimension: dim, score, reasoning });
                    total += score;
                }

                const overallScore = total / dimensions.length;
                const ethicsScore =
                    scores.find((s) => s.dimension === "ethics")?.score || 5;

                return {
                    agentRole: role,
                    proposalId,
                    scores,
                    overallScore,
                    notes: data.notes,
                    vetoEthics:
                        role === "strategist" &&
                        ethicsScore < this.config.ethicsThreshold,
                };
            }
        } catch (error) {
            console.error("Failed to parse vote JSON:", error);
        }

        return {
            agentRole: role,
            proposalId,
            scores: [
                { dimension: "logic", score: 5, reasoning: "Default" },
                { dimension: "feasibility", score: 5, reasoning: "Default" },
                { dimension: "safety", score: 5, reasoning: "Default" },
                { dimension: "benefit", score: 5, reasoning: "Default" },
                { dimension: "ethics", score: 5, reasoning: "Default" },
            ],
            overallScore: 5,
        };
    }

    /**
     * Parse decision from moderator response
     */
    private parseDecision(
        proposalId: string,
        score: number,
        response: string,
    ): CouncilDecision {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);

                return {
                    id: generateId(),
                    selectedProposalId: proposalId,
                    finalScore: score,
                    reasoning: data.reasoning || response,
                    recommendations: data.recommendations || [],
                    risks: data.risks || [],
                    mitigations: data.mitigations || [],
                    minorityNotes: data.minorityNotes || [],
                    consensus: data.consensus || score,
                    timestamp: Date.now(),
                    mode: this.config.mode,
                };
            }
        } catch (error) {
            console.error("Failed to parse decision JSON:", error);
        }

        return {
            id: generateId(),
            selectedProposalId: proposalId,
            finalScore: score,
            reasoning: response,
            recommendations: [],
            risks: [],
            mitigations: [],
            consensus: score,
            timestamp: Date.now(),
            mode: this.config.mode,
        };
    }

    /**
     * Parse reflection from moderator response
     */
    private parseReflection(response: string): CouncilReflection {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);

                return {
                    whatWorkedWell: data.whatWorkedWell || [],
                    areasForImprovement: data.areasForImprovement || [],
                    mostValuableAgent: data.mostValuableAgent || "analyst",
                    debateFairness: data.debateFairness || 7,
                    biasDetected: data.biasDetected,
                    learnings: data.learnings || [],
                };
            }
        } catch (error) {
            console.error("Failed to parse reflection JSON:", error);
        }

        return {
            whatWorkedWell: [],
            areasForImprovement: [],
            mostValuableAgent: "analyst",
            debateFairness: 7,
            learnings: [],
        };
    }

    /**
     * Emit progress event
     */
    private emitProgress(stage: string, data: Record<string, unknown>): void {
        if (this.onProgress) {
            this.onProgress(stage, data);
        }
    }

    /**
     * Get current session state
     */
    getSession(): CouncilSession {
        return this.session;
    }
}

/**
 * Convenience function to run a Council session
 */
export async function runCouncilSession(
    question: string,
    mode: CouncilMode,
    modelName: string,
    provider: Provider,
    onProgress?: (stage: string, data: Record<string, unknown>) => void,
    agentModels?: Record<AgentRole, { model: string; provider: Provider }>,
    customRounds?: number,
): Promise<CouncilSession> {
    const engine = new CouncilEngineV2(
        question,
        mode,
        modelName,
        provider,
        onProgress,
        agentModels,
        customRounds,
    );
    return await engine.run();
}

/**
 * Resume a paused Council session
 */
export async function resumeCouncilSession(
    sessionId: string,
    onProgress?: (stage: string, data: Record<string, unknown>) => void,
): Promise<CouncilSession> {
    const session = await councilDB.loadSession(sessionId);
    if (!session) {
        throw new Error("Session not found");
    }

    const engine = CouncilEngineV2.fromSession(session, onProgress);
    return await engine.run();
}
