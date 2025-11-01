// ASS (Argumentative System Service) - AI Debate System
import { Provider } from "./aiApi";

export interface Debater {
    id: string;
    name: string;
    emoji: string;
    provider: Provider;
    modelId: string;
    traits: {
        perspective: string;
        personality: string;
        beliefPersistence: number; // 0-1, how resistant to changing mind
        reasoningDepth: number; // 0-1, how deep they analyze
        truthSeeking: number; // 0-1, how much they prioritize truth over argument
    };
    internalBelief?: number; // 0-1, private belief about truth
}

export interface DebateVote {
    voterId: string;
    rankings: string[]; // Ordered list of debater IDs
}

export interface DebateRound {
    round: number;
    type: 'opening' | 'argument' | 'rebuttal' | 'voting' | 'judge';
    arguments: DebateArgument[];
    votes?: DebateVote[];
    consensusReached?: boolean;
}

export interface DebateArgument {
    debaterId: string;
    content: string;
    timestamp: number;
    beliefUpdate?: number; // New belief after this argument
}

export interface DebateSession {
    id: string;
    question: string;
    mode: 'voting' | 'classic';
    debaters: Debater[];
    rounds: DebateRound[];
    consensusThreshold: number; // 0-1, percentage agreement needed
    maxIterations: number;
    finalDecision?: string;
    winner?: string;
}

// Predefined Debater Personalities
export const PRESET_DEBATERS: Record<string, Omit<Debater, 'id'>> = {
    optimist: {
        name: "Optimist",
        emoji: "🌟",
        provider: "poe",
        modelId: "GPT-5-mini",
        traits: {
            perspective: "Sees possibilities everywhere",
            personality: "Creative, big-picture, opportunity-focused",
            beliefPersistence: 0.4,
            reasoningDepth: 0.7,
            truthSeeking: 0.6,
        },
    },
    skeptic: {
        name: "Skeptic",
        emoji: "🔍",
        provider: "groq",
        modelId: "openai/gpt-oss-20b",
        traits: {
            perspective: "Points out flaws and limitations",
            personality: "Analytical, detail-oriented, risk-aware",
            beliefPersistence: 0.7,
            reasoningDepth: 0.9,
            truthSeeking: 0.8,
        },
    },
    visionary: {
        name: "Visionary",
        emoji: "🚀",
        provider: "together",
        modelId: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
        traits: {
            perspective: "Champions breakthrough ideas",
            personality: "Forward-thinking, innovative, solution-oriented",
            beliefPersistence: 0.3,
            reasoningDepth: 0.8,
            truthSeeking: 0.5,
        },
    },
    critic: {
        name: "Critic",
        emoji: "⚖️",
        provider: "together",
        modelId: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
        traits: {
            perspective: "Highlights potential issues",
            personality: "Methodical, cautious, problem-focused",
            beliefPersistence: 0.6,
            reasoningDepth: 0.85,
            truthSeeking: 0.7,
        },
    },
};

// System prompts for debate roles
export const getDebaterSystemPrompt = (debater: Debater, round: number, mode: 'voting' | 'classic') => {
    const basePrompt = `You are ${debater.emoji} ${debater.name}, an AI debater with these traits:
- Perspective: ${debater.traits.perspective}
- Personality: ${debater.traits.personality}
- Belief Persistence: ${Math.round(debater.traits.beliefPersistence * 100)}% (how resistant to changing mind)
- Reasoning Depth: ${Math.round(debater.traits.reasoningDepth * 100)}%
- Truth-Seeking: ${Math.round(debater.traits.truthSeeking * 100)}%

Your internal belief about the topic's truth: ${debater.internalBelief ? Math.round(debater.internalBelief * 100) + '%' : 'not yet formed'}`;

    if (mode === 'voting') {
        if (round === 0) {
            return `${basePrompt}

This is your INITIAL POSITION (Round 0). Present your stance without arguing against others yet.

Instructions:
1. State your position clearly
2. Provide 2-3 key reasons
3. Be concise (150-200 words)
4. Don't reference other debaters yet

Format your response naturally without labels.`;
        } else {
            return `${basePrompt}

This is ARGUMENTATION Round ${round}. Directly engage with other debaters' points.

Instructions:
1. Reference specific points from other debaters
2. Provide counter-arguments with evidence
3. Acknowledge strong opposing points (if truth-seeking is high)
4. Present new perspectives
5. Be direct and engaging (200-300 words)

Format your response naturally, engaging directly with others' arguments.`;
        }
    } else {
        // Classic mode
        const roundType = round === 1 ? 'opening argument' : round === 2 ? 'rebuttal' : 'final position';
        return `${basePrompt}

This is Round ${round}: ${roundType.toUpperCase()}.

Instructions for ${roundType}:
${round === 1 ? '1. Present your main argument\n2. Provide evidence and reasoning\n3. Be persuasive and clear' :
round === 2 ? '1. Address opponents\' points\n2. Defend your position\n3. Point out flaws in other arguments' :
'1. Summarize your strongest points\n2. Final rebuttal\n3. Conclude decisively'}

Length: 200-300 words
Format naturally without labels.`;
    }
};

export const getVotingPrompt = (debater: Debater, allDebaters: Debater[], previousArguments: DebateArgument[]) => {
    return `You are ${debater.emoji} ${debater.name}. Based on all arguments presented, rank ALL debaters (including yourself) from strongest to weakest argument.

Previous Arguments:
${previousArguments.map(arg => {
        const d = allDebaters.find(x => x.id === arg.debaterId);
        return `${d?.emoji} ${d?.name}: ${arg.content.substring(0, 200)}...`;
    }).join('\n\n')}

Rank debaters by argument quality (strongest first). Consider:
- Logic and evidence
- Addressing others' points
- Persuasiveness
- Truth-seeking vs rhetoric

Return ONLY a JSON array of debater IDs in ranked order:
["debater-id-1", "debater-id-2", "debater-id-3", "debater-id-4"]

No explanation, just the JSON array.`;
};

export const getJudgePrompt = (question: string, allArguments: DebateArgument[], debaters: Debater[]) => {
    return `You are an impartial JUDGE reviewing a debate on: "${question}"

All Arguments:
${allArguments.map(arg => {
        const d = debaters.find(x => x.id === arg.debaterId);
        return `\n${d?.emoji} ${d?.name}:\n${arg.content}`;
    }).join('\n---\n')}

Your task:
1. Synthesize all perspectives fairly
2. Identify the strongest arguments from each side
3. Make a reasoned final decision
4. Explain your reasoning clearly

Consider:
- Logical strength of arguments
- Evidence quality
- Potential biases
- Practical implications
- Nuanced middle grounds

Provide a balanced, well-reasoned final judgment (300-400 words).`;
};

// Calculate consensus from votes
export const calculateConsensus = (votes: DebateVote[], threshold: number): { reached: boolean; leader: string | null; agreement: number } => {
    if (votes.length === 0) return { reached: false, leader: null, agreement: 0 };

    // Count first-place votes
    const firstPlaceVotes: Record<string, number> = {};
    votes.forEach(vote => {
        const winner = vote.rankings[0];
        firstPlaceVotes[winner] = (firstPlaceVotes[winner] || 0) + 1;
    });

    const totalVotes = votes.length;
    const leader = Object.entries(firstPlaceVotes)
        .sort((a, b) => b[1] - a[1])[0];

    if (!leader) return { reached: false, leader: null, agreement: 0 };

    const agreement = leader[1] / totalVotes;
    const reached = agreement >= threshold;

    return {
        reached,
        leader: leader[0],
        agreement,
    };
};
