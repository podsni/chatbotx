/**
 * COUNCIL-HADES: Types and Interfaces
 * Multi-agent collective intelligence system
 */

// Core Agent Roles
export type AgentRole =
    | "analyst"
    | "builder"
    | "strategist"
    | "auditor"
    | "moderator";

// Council Operating Modes
export type CouncilMode = "quick" | "deliberative" | "ethical" | "builder";

// Voting Dimensions
export type VotingDimension =
    | "logic"
    | "feasibility"
    | "safety"
    | "benefit"
    | "ethics";

// Agent Personality and Role Definition
export interface AgentProfile {
    role: AgentRole;
    name: string;
    description: string;
    perspective: string;
    primaryFocus: VotingDimension[];
    systemPrompt: string;
    color: string;
    icon: string;
}

// Single agent's opinion/response
export interface AgentOpinion {
    agentRole: AgentRole;
    content: string;
    timestamp: number;
    stage: "initial" | "debate" | "proposal" | "reflection";
}

// Proposed solution from an agent
export interface SolutionProposal {
    id: string;
    agentRole: AgentRole;
    title: string;
    description: string;
    steps?: string[];
    risks?: string[];
    benefits?: string[];
    timestamp: number;
}

// Score for a single dimension
export interface DimensionScore {
    dimension: VotingDimension;
    score: number; // 1-10
    reasoning: string;
}

// Agent's vote on a specific proposal
export interface AgentVote {
    agentRole: AgentRole;
    proposalId: string;
    scores: DimensionScore[];
    overallScore: number; // calculated average
    notes?: string;
    vetoEthics?: boolean; // true if ethics score < 5
}

// Weighted vote calculation
export interface WeightedVote {
    agentRole: AgentRole;
    weight: number; // 0-1, based on relevance to question type
    vote: AgentVote;
}

// Final decision from Council
export interface CouncilDecision {
    id: string;
    selectedProposalId: string;
    finalScore: number;
    reasoning: string;
    recommendations: string[];
    risks: string[];
    mitigations: string[];
    minorityNotes?: string[];
    consensus: number; // 0-10
    timestamp: number;
    mode: CouncilMode;
}

// Complete Council Session
export interface CouncilSession {
    id: string;
    question: string;
    mode: CouncilMode;
    startTime: number;
    endTime?: number;

    // Stages
    initialOpinions: AgentOpinion[];
    debateRounds: AgentOpinion[][];
    proposals: SolutionProposal[];
    votes: AgentVote[];

    // Result
    decision?: CouncilDecision;

    // Metadata
    modelUsed: string; // Default model
    provider: string; // Default provider
    agentModels?: Record<AgentRole, { model: string; provider: string }>; // Per-agent models

    // Self-reflection
    reflection?: CouncilReflection;

    // Session state
    status: "running" | "paused" | "completed" | "error";
    currentStage?: string;
    tokensUsed?: number;
    estimatedTokens?: number;
}

// Self-reflection after session
export interface CouncilReflection {
    whatWorkedWell: string[];
    areasForImprovement: string[];
    mostValuableAgent: AgentRole;
    debateFairness: number; // 0-10
    biasDetected?: string;
    learnings: string[];
}

// Config for Council behavior
export interface CouncilConfig {
    mode: CouncilMode;
    maxDebateRounds: number;
    enableVeto: boolean;
    ethicsThreshold: number; // default 5
    weightingStrategy: "equal" | "adaptive" | "contextual";
    enableReflection: boolean;
    maxTokensPerAgent?: number; // Token limit per agent call
    estimateOnly?: boolean; // Only estimate tokens, don't run
}

// Context-based weighting rules
export interface WeightingRule {
    contextKeywords: string[]; // keywords to match in question
    weights: Record<AgentRole, number>; // role -> weight
}

// Saved session for localStorage
export interface SavedCouncilSession {
    session: CouncilSession;
    savedAt: number;
    title: string;
    preview: string; // Short preview of question
}

// Agent profiles - the five permanent members
export const COUNCIL_AGENTS: Record<AgentRole, AgentProfile> = {
    analyst: {
        role: "analyst",
        name: "The Analyst",
        description: "Logic, structure, and rationality",
        perspective:
            "Understanding the problem from its root, breaking complexity into manageable patterns",
        primaryFocus: ["logic", "feasibility"],
        systemPrompt: `You are The Analyst in the Council. You represent logic, structure, and rationality.
Your role is to:
- Map the core of the problem
- Identify required data and relevant logic
- Break down complexity into clear patterns
- Speak with scientific calm and precision
- Challenge assumptions with evidence

Always think systematically. Question what is unclear. Demand proof.`,
        color: "from-blue-500 to-blue-700",
        icon: "🔬",
    },
    builder: {
        role: "builder",
        name: "The Builder",
        description: "Action, reality, and concrete steps",
        perspective:
            "Thinking in plans and sequences that can be executed in the real world",
        primaryFocus: ["feasibility", "benefit"],
        systemPrompt: `You are The Builder in the Council. You represent action, reality, and practical execution.
Your role is to:
- Translate ideas into concrete action steps
- Focus on what can be done TODAY
- Prioritize speed and practicality
- Always ask: "How can this be realized in the real world?"
- Create clear, sequential plans

You value results over theory. Be pragmatic and direct.`,
        color: "from-orange-500 to-orange-700",
        icon: "🔨",
    },
    strategist: {
        role: "strategist",
        name: "The Strategist",
        description: "Morality, ethics, and long-term consequences",
        perspective:
            "Seeing social impact, legal risks, and the balance of humanity",
        primaryFocus: ["ethics", "safety"],
        systemPrompt: `You are The Strategist in the Council. You represent morality, ethics, and long-term thinking.
Your role is to:
- Evaluate social and ethical impact
- Identify legal and moral risks
- Consider long-term consequences
- Protect human dignity and values
- Be the voice of conscience

You are the moral compass. If something feels wrong, speak up. You have veto power on ethical grounds.`,
        color: "from-purple-500 to-purple-700",
        icon: "⚖️",
    },
    auditor: {
        role: "auditor",
        name: "The Auditor",
        description: "Skepticism, validation, and scrutiny",
        perspective:
            "Testing all claims, finding holes in logic, protecting from error",
        primaryFocus: ["logic", "safety"],
        systemPrompt: `You are The Auditor in the Council. You represent skepticism, validation, and critical scrutiny.
Your role is to:
- Challenge every claim until proven
- Find logical holes and weak points
- Validate assumptions with evidence
- Prevent errors and oversights
- Ask the hard questions others avoid

Trust nothing without proof. Your job is to break bad ideas before they cause harm.`,
        color: "from-red-500 to-red-700",
        icon: "🔍",
    },
    moderator: {
        role: "moderator",
        name: "The Moderator",
        description: "Collective consciousness and balance",
        perspective:
            "Listening to all voices, weighing perspectives, synthesizing unity",
        primaryFocus: ["logic", "feasibility", "safety", "benefit", "ethics"],
        systemPrompt: `You are The Moderator in the Council. You represent collective consciousness and balance.
Your role is to:
- Listen to all voices equally
- Synthesize diverse perspectives
- Find common ground
- Make final balanced decisions
- Explain reasoning transparently

You are not a leader, but a harmonizer. Your job is to unite the council's wisdom into clear action.`,
        color: "from-green-500 to-green-700",
        icon: "🌟",
    },
};

// Mode configurations
export const COUNCIL_MODE_CONFIGS: Record<CouncilMode, CouncilConfig> = {
    quick: {
        mode: "quick",
        maxDebateRounds: 1,
        enableVeto: false,
        ethicsThreshold: 5,
        weightingStrategy: "equal",
        enableReflection: false,
        maxTokensPerAgent: 1000,
    },
    deliberative: {
        mode: "deliberative",
        maxDebateRounds: 3,
        enableVeto: true,
        ethicsThreshold: 5,
        weightingStrategy: "adaptive",
        enableReflection: true,
        maxTokensPerAgent: 2000,
    },
    ethical: {
        mode: "ethical",
        maxDebateRounds: 2,
        enableVeto: true,
        ethicsThreshold: 6, // stricter
        weightingStrategy: "contextual",
        enableReflection: true,
        maxTokensPerAgent: 2000,
    },
    builder: {
        mode: "builder",
        maxDebateRounds: 2,
        enableVeto: false,
        ethicsThreshold: 5,
        weightingStrategy: "contextual",
        enableReflection: false,
        maxTokensPerAgent: 1500,
    },
};

// Default weighting rules for contextual strategy
export const DEFAULT_WEIGHTING_RULES: WeightingRule[] = [
    {
        contextKeywords: [
            "code",
            "implement",
            "build",
            "create",
            "develop",
            "programming",
        ],
        weights: {
            analyst: 1.2,
            builder: 1.5,
            strategist: 0.8,
            auditor: 1.1,
            moderator: 1.0,
        },
    },
    {
        contextKeywords: [
            "ethics",
            "moral",
            "privacy",
            "security",
            "legal",
            "rights",
        ],
        weights: {
            analyst: 0.9,
            builder: 0.7,
            strategist: 1.5,
            auditor: 1.2,
            moderator: 1.0,
        },
    },
    {
        contextKeywords: [
            "analyze",
            "research",
            "study",
            "investigate",
            "understand",
        ],
        weights: {
            analyst: 1.5,
            builder: 0.8,
            strategist: 1.0,
            auditor: 1.3,
            moderator: 1.0,
        },
    },
    {
        contextKeywords: [
            "plan",
            "strategy",
            "approach",
            "methodology",
            "framework",
        ],
        weights: {
            analyst: 1.1,
            builder: 1.3,
            strategist: 1.2,
            auditor: 1.0,
            moderator: 1.2,
        },
    },
];
