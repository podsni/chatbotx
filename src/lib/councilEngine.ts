/**
 * COUNCIL-HADES: Core Engine
 * Multi-agent collective intelligence system
 * Handles voting, debate orchestration, and decision synthesis
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
    WeightedVote,
    CouncilReflection,
    COUNCIL_AGENTS,
    COUNCIL_MODE_CONFIGS,
    DEFAULT_WEIGHTING_RULES,
} from "./councilTypes";
import { aiApi, Provider } from "./aiApi";

// Generate unique IDs
const generateId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Council Engine Class
 * Orchestrates the entire Council deliberation process
 */
export class CouncilEngine {
    private session: CouncilSession;
    private config: CouncilConfig;
    private onProgress?: (stage: string, data: Record<string, unknown>) => void;

    constructor(
        question: string,
        mode: CouncilMode,
        modelName: string,
        provider: Provider,
        onProgress?: (stage: string, data: Record<string, unknown>) => void,
    ) {
        this.config = { ...COUNCIL_MODE_CONFIGS[mode] };
        this.onProgress = onProgress;

        this.session = {
            id: generateId(),
            question,
            mode,
            startTime: Date.now(),
            initialOpinions: [],
            debateRounds: [],
            proposals: [],
            votes: [],
            modelUsed: modelName,
            provider,
        };
    }

    /**
     * Run the complete Council session
     */
    async run(): Promise<CouncilSession> {
        try {
            // Stage 1: Initial Opinions
            await this.gatherInitialOpinions();

            // Stage 2: Debate (if not quick mode)
            if (this.config.maxDebateRounds > 1) {
                await this.conductDebate();
            }

            // Stage 3: Proposal Generation
            await this.generateProposals();

            // Stage 4: Voting
            await this.conductVoting();

            // Stage 5: Decision Synthesis
            await this.synthesizeDecision();

            // Stage 6: Self-Reflection (if enabled)
            if (this.config.enableReflection) {
                await this.performReflection();
            }

            this.session.endTime = Date.now();
            return this.session;
        } catch (error) {
            console.error("Council session error:", error);
            throw error;
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
            const agent = COUNCIL_AGENTS[role];
            const prompt = this.buildInitialOpinionPrompt(role);

            try {
                const response = await this.callAgent(role, prompt);

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
                // Continue with other agents
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

        for (let round = 0; round < this.config.maxDebateRounds - 1; round++) {
            const roundOpinions: AgentOpinion[] = [];

            const agents: AgentRole[] = [
                "analyst",
                "builder",
                "strategist",
                "auditor",
            ];

            for (const role of agents) {
                const prompt = this.buildDebatePrompt(role, round);

                try {
                    const response = await this.callAgent(role, prompt);

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

            this.session.debateRounds.push(roundOpinions);
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
            const prompt = this.buildProposalPrompt(role);

            try {
                const response = await this.callAgent(role, prompt);
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
                const prompt = this.buildVotingPrompt(role, proposal);

                try {
                    const response = await this.callAgent(role, prompt);
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

        // Calculate weighted scores for each proposal
        const proposalScores = this.calculateProposalScores();

        // Check for ethics veto
        const vetoedProposals = this.checkEthicsVeto();

        // Filter out vetoed proposals
        const validProposals = proposalScores.filter(
            (ps) => !vetoedProposals.includes(ps.proposalId),
        );

        if (validProposals.length === 0) {
            throw new Error(
                "All proposals were vetoed on ethical grounds. Council cannot proceed.",
            );
        }

        // Select best proposal
        const bestProposal = validProposals.reduce((prev, current) =>
            current.weightedScore > prev.weightedScore ? current : prev,
        );

        // Get the actual proposal
        const selectedProposal = this.session.proposals.find(
            (p) => p.id === bestProposal.proposalId,
        )!;

        // Collect minority notes
        const minorityNotes = this.collectMinorityNotes(
            bestProposal.proposalId,
        );

        // Ask Moderator to synthesize final decision
        const moderatorPrompt = this.buildModeratorDecisionPrompt(
            selectedProposal,
            bestProposal.weightedScore,
            minorityNotes,
        );

        const moderatorResponse = await this.callAgent(
            "moderator",
            moderatorPrompt,
        );
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

        // Default adaptive weights
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
                // Check if Strategist vetoed on ethics
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
     * Call an agent via AI API
     */
    private async callAgent(role: AgentRole, prompt: string): Promise<string> {
        const agent = COUNCIL_AGENTS[role];
        const systemPrompt = agent.systemPrompt;

        const messages: Array<{ role: string; content: string }> = [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
        ];

        const response = await aiApi.sendMessageSync(
            this.session.provider,
            this.session.modelUsed,
            messages,
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

        // Fallback
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

        // Fallback
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

        // Fallback
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

        // Fallback
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
): Promise<CouncilSession> {
    const engine = new CouncilEngine(
        question,
        mode,
        modelName,
        provider,
        onProgress,
    );
    return await engine.run();
}
