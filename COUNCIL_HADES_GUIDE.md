# Council-Hades: Multi-Agent Collective Intelligence System

## 🌍 Overview

**Council-Hades** is a revolutionary multi-agent AI system that brings collective intelligence to ChatBotX. Unlike traditional single-model interactions, Council-Hades convenes five distinct AI agents with different perspectives, expertise, and values to deliberate on complex questions through structured debate, voting, and consensus-building.

> "Truth emerges not from a single voice, but from the conversation between many minds."

---

## 🏛️ The Five Agents

Council-Hades consists of five permanent members, each representing a unique way of thinking:

### 🔬 The Analyst
- **Focus**: Logic, structure, and rationality
- **Role**: Maps problems from their root, breaks complexity into patterns
- **Primary Dimensions**: Logic, Feasibility
- **Personality**: Scientific, calm, evidence-driven

### 🔨 The Builder
- **Focus**: Action, reality, and concrete steps
- **Role**: Translates ideas into executable plans
- **Primary Dimensions**: Feasibility, Benefit
- **Personality**: Pragmatic, direct, results-oriented

### ⚖️ The Strategist
- **Focus**: Morality, ethics, and long-term consequences
- **Role**: Voice of conscience, evaluates social and ethical impact
- **Primary Dimensions**: Ethics, Safety
- **Personality**: Thoughtful, principled, protective of human values
- **Special Power**: **Ethics Veto** - Can reject solutions on moral grounds

### 🔍 The Auditor
- **Focus**: Skepticism, validation, and scrutiny
- **Role**: Challenges claims, finds logical holes, prevents errors
- **Primary Dimensions**: Logic, Safety
- **Personality**: Critical, thorough, trust-but-verify

### 🌟 The Moderator
- **Focus**: Collective consciousness and balance
- **Role**: Listens to all voices, synthesizes unity, makes final decisions
- **Primary Dimensions**: All five dimensions equally
- **Personality**: Harmonizing, balanced, transparent

---

## 🔄 The Deliberation Process

Every Council session follows a structured six-stage process:

### Stage 1: Initial Perspectives
Each agent (except Moderator) provides their first take on the question from their unique perspective.

### Stage 2: Debate & Refinement (conditional)
Agents respond to each other's perspectives:
- Challenge weak assumptions
- Support strong points
- Add missing angles
- Ask critical questions

Number of debate rounds varies by mode (1-3 rounds).

### Stage 3: Solution Proposals
Each agent crafts a concrete solution proposal including:
- Title and description
- Step-by-step execution plan
- Identified risks
- Expected benefits

### Stage 4: Voting
Each agent evaluates **all proposals** (including their own) across **five dimensions**:

| Dimension | Question |
|-----------|----------|
| **Logic** | How consistent and rational is this solution? |
| **Feasibility** | Can this be implemented in the real world? |
| **Safety** | How safe and risk-free is this approach? |
| **Benefit** | How much value does this provide? |
| **Ethics** | Is this morally sound and respectful of human dignity? |

Each dimension is scored 1-10 with reasoning provided.

### Stage 5: Decision Synthesis
The Moderator:
1. Calculates weighted scores for each proposal
2. Checks for ethics veto (Strategist can veto if ethics < threshold)
3. Selects the highest-scoring valid proposal
4. Collects minority notes from agents who had concerns
5. Synthesizes the final decision with:
   - Clear reasoning
   - Concrete recommendations
   - Risk mitigation strategies
   - Consensus score (0-10)

### Stage 6: Self-Reflection (conditional)
The Council reflects on its own process:
- What worked well?
- What could be improved?
- Which agent provided the most value?
- Was the debate fair? (fairness score 0-10)
- Was any bias detected?
- What did the Council learn?

---

## ⚙️ Operating Modes

Council-Hades can operate in four distinct modes:

### ⚡ Quick Council
- **Best for**: Simple questions, quick confirmations
- **Debate Rounds**: 1 (minimal)
- **Ethics Veto**: Disabled
- **Weighting**: Equal (all agents weighted 1.0)
- **Reflection**: Disabled
- **Speed**: Fastest

### 🧠 Deliberative Council (Default)
- **Best for**: Complex decisions, multi-faceted problems
- **Debate Rounds**: 3 (full deliberation)
- **Ethics Veto**: Enabled
- **Weighting**: Adaptive (based on past performance)
- **Reflection**: Enabled
- **Speed**: Thorough

### 🛡️ Ethical Council
- **Best for**: Sensitive topics, moral dilemmas, privacy/security questions
- **Debate Rounds**: 2
- **Ethics Veto**: Enabled (stricter threshold: 6/10)
- **Weighting**: Contextual (Strategist gets higher weight)
- **Reflection**: Enabled
- **Speed**: Moderate

### 🔧 Builder Council
- **Best for**: Technical problems, implementation tasks, coding projects
- **Debate Rounds**: 2
- **Ethics Veto**: Disabled
- **Weighting**: Contextual (Builder & Analyst get higher weight)
- **Reflection**: Disabled
- **Speed**: Moderate

---

## 🎯 Voting & Weighting System

### Equal Weighting
All agents have equal say (weight = 1.0). Used in Quick mode.

### Adaptive Weighting
Weights adjust based on historical performance. The Council learns which agents tend to provide the most accurate assessments over time.

### Contextual Weighting
Weights adjust based on question content. Examples:

**Technical Questions** (keywords: code, implement, build, develop):
- Analyst: 1.2×
- Builder: 1.5×
- Strategist: 0.8×
- Auditor: 1.1×

**Ethical Questions** (keywords: ethics, privacy, security, legal):
- Analyst: 0.9×
- Builder: 0.7×
- Strategist: 1.5×
- Auditor: 1.2×

**Research Questions** (keywords: analyze, study, investigate):
- Analyst: 1.5×
- Builder: 0.8×
- Strategist: 1.0×
- Auditor: 1.3×

---

## 🛡️ Ethics Veto System

The Strategist holds special veto power to protect moral values:

- **Trigger**: When Strategist scores a proposal < 5 on Ethics (or < 6 in Ethical mode)
- **Effect**: Proposal is immediately disqualified from consideration
- **Rationale**: "Truth should not sacrifice humanity"
- **Override**: Cannot be overridden; if all proposals are vetoed, session fails with error

This ensures the Council never recommends actions that violate fundamental ethical principles.

---

## 🎨 User Interface

### Setup Tab
- Enter your question
- Choose operating mode (Quick/Deliberative/Ethical/Builder)
- Select AI model to power all agents
- Convene the Council button

### The Council Tab
- View profiles of all five agents
- See their roles, perspectives, and system prompts
- Understand primary focus areas

### Process Tab (Live)
- Real-time progress as the Council deliberates
- See each agent's opinion as it's generated
- Watch proposals and votes being cast
- Progress indicators for each stage

### Debate Tab
- Read initial perspectives from all agents
- Follow debate rounds (if any)
- Review all solution proposals with scores
- Examine detailed voting results with dimension breakdowns

### Decision Tab
- Final selected solution highlighted
- Consensus meter (0-10)
- Clear reasoning from Moderator
- Actionable recommendations
- Risk identification & mitigation strategies
- Minority concerns documented
- Self-reflection (if enabled)

---

## 💡 Best Practices

### When to Use Council-Hades

**✅ Great For:**
- Complex decisions with multiple perspectives
- Ethical dilemmas requiring careful consideration
- Technical problems needing both theory and practice
- Strategic planning with long-term implications
- Questions where you want diverse viewpoints
- Situations requiring transparent reasoning

**❌ Not Ideal For:**
- Simple factual questions
- Time-sensitive emergencies requiring instant answers
- Questions with objectively correct answers (use regular chat)
- Creative writing (use regular chat or Agent mode)

### Crafting Effective Questions

**Good Questions:**
- "Should our startup prioritize privacy features over user growth in the first year?"
- "What's the best approach to implement real-time collaboration in our web app?"
- "How should we handle user data deletion requests to comply with GDPR?"

**Poor Questions:**
- "What's the capital of France?" (too simple)
- "Write me a poem" (not a decision/problem)
- "Is 2+2=4?" (objective fact)

### Interpreting Results

- **Consensus 8+**: Strong agreement, high confidence in decision
- **Consensus 6-7.9**: Moderate agreement, valid concerns exist
- **Consensus <6**: Significant disagreement, proceed with caution
- **Minority Notes**: Always read these - they highlight blind spots
- **Ethics Veto**: If triggered, reconsider the entire approach

---

## 🔧 Technical Architecture

### Core Components

```
src/lib/councilTypes.ts      # Type definitions, agent profiles
src/lib/councilEngine.ts     # Core deliberation engine
src/components/CouncilMode.tsx        # Main UI component
src/components/CouncilAgentCard.tsx   # Agent profile display
src/components/CouncilDebateView.tsx  # Debate visualization
src/components/CouncilDecisionView.tsx # Decision presentation
```

### Data Flow

1. **User Input** → Question + Mode selection
2. **Engine Initialization** → CouncilEngine instance created
3. **Stage Execution** → Sequential execution of 6 stages
4. **LLM Calls** → Each agent powered by selected AI model
5. **Progress Events** → Real-time updates to UI
6. **Result Storage** → Complete session saved (CouncilSession object)

### LLM Integration

- Uses existing `aiApi` from ChatBotX
- Each agent gets its own system prompt defining personality
- Same model powers all agents (ensures consistent capability)
- Supports all providers: OpenRouter, Groq, Together AI, POE

---

## 🚀 Getting Started

### Quick Start

1. **Launch Council**: Click the purple **Sparkles** button (bottom-right)
2. **Ask a Question**: Enter a complex question in the text area
3. **Choose Mode**: Select Deliberative for first-time use
4. **Select Model**: Pick a capable model (recommend GPT-4 or Claude-3)
5. **Convene**: Click "Convene the Council"
6. **Watch**: Observe the deliberation in real-time (Process tab)
7. **Review**: Read the debate (Debate tab)
8. **Decide**: See the final decision (Decision tab)

### Example Session

**Question**: "Our AI chatbot collected user conversations for training. A user now requests full deletion under GDPR. What should we do?"

**Mode**: Ethical Council

**Result** (hypothetical):
- **Analyst**: Identifies legal requirements, data dependencies
- **Builder**: Proposes technical deletion process
- **Strategist**: Emphasizes user rights, recommends proactive compliance
- **Auditor**: Questions if deletion is truly complete, suggests audit trail
- **Moderator**: Synthesizes into action plan with full deletion + verification
- **Consensus**: 8.7/10 - Strong agreement with clear ethical imperative

---

## 📊 Comparison with Other Modes

| Feature | Regular Chat | Agent Mode | ASS Debate | Council-Hades |
|---------|--------------|------------|------------|---------------|
| Models Used | 1 | Multiple | 2 | 1 (5 agents) |
| Perspectives | 1 | Multiple | 2 (opposing) | 5 (diverse) |
| Structure | Conversational | Parallel comparison | Debate format | Deliberative voting |
| Best For | Q&A, coding | Model comparison | Exploring arguments | Complex decisions |
| Voting | No | No | No | Yes (5 dimensions) |
| Ethics Veto | No | No | No | Yes |
| Consensus Score | No | No | No | Yes |
| Reflection | No | No | No | Yes |

---

## 🎓 Philosophy & Principles

### Core Values

1. **Truth**: All opinions must seek truth, not justification
2. **Balance**: No extremes; consider all sides
3. **Safety**: Never harm humans, data, or environment
4. **Humanity**: Preserve human dignity in all decisions
5. **Transparency**: All reasoning must be explainable
6. **Accountability**: Council admits mistakes and corrects them
7. **Evolution**: All decisions can be revised as knowledge grows

### Why Multi-Agent?

> "Single AI models can be brilliant but biased, fast but reckless, logical but cold. Council-Hades tempers each extreme with its opposite, creating wisdom through diversity."

- **Prevents Groupthink**: Agents challenge each other
- **Catches Blind Spots**: Each agent sees different angles
- **Balances Values**: Technical feasibility vs. ethical concerns
- **Builds Trust**: Transparent process > black-box decision
- **Improves Over Time**: Reflection enables learning

---

## 🐛 Troubleshooting

### Session Fails Immediately
- **Check API Key**: Ensure model provider has valid API key
- **Check Model**: Some models may not support system prompts
- **Check Question**: Very short questions may confuse agents

### All Proposals Vetoed
- **Cause**: All solutions deemed unethical by Strategist
- **Fix**: Reframe question to allow ethical solutions
- **Example**: "How to hack X?" → "How to secure X?"

### Low Consensus Score
- **Not Always Bad**: Indicates genuine disagreement
- **Review Minority Notes**: Understand the concerns
- **Consider**: Maybe the question has no clear "right" answer

### Slow Performance
- **Normal**: Council makes many LLM calls (15-30+ per session)
- **Speed Up**: Use Quick mode for simpler questions
- **Model Choice**: Faster models = faster sessions

---

## 🔮 Future Enhancements

Planned features for Council-Hades:

- [ ] Session History: Save and replay past deliberations
- [ ] Custom Agents: Define your own agent personalities
- [ ] Agent Memory: Agents remember past sessions
- [ ] Multi-Model Council: Different models for different agents
- [ ] Larger Councils: 7, 9, or 11 agents for deeper analysis
- [ ] User Voting: Let users cast their own vote
- [ ] Export Reports: PDF/Markdown export of decisions
- [ ] API Access: Programmatic access to Council deliberations

---

## 📝 API Reference (For Developers)

### Running a Session Programmatically

```typescript
import { runCouncilSession } from '@/lib/councilEngine';
import { CouncilMode } from '@/lib/councilTypes';

const session = await runCouncilSession(
  "Should we open-source our AI training data?",
  'ethical' as CouncilMode,
  'gpt-4',
  'openrouter',
  (stage, data) => {
    console.log(`Stage: ${stage}`, data);
  }
);

console.log('Decision:', session.decision);
console.log('Consensus:', session.decision?.consensus);
```

### Custom Configuration

```typescript
import { CouncilEngine } from '@/lib/councilEngine';
import { COUNCIL_MODE_CONFIGS } from '@/lib/councilTypes';

// Modify config
const config = { ...COUNCIL_MODE_CONFIGS.deliberative };
config.maxDebateRounds = 5; // More debate
config.ethicsThreshold = 7; // Stricter ethics

// Create engine with custom config
const engine = new CouncilEngine(question, mode, model, provider);
// Manually modify engine.config before running
```

---

## 🙏 Credits & Inspiration

Council-Hades is inspired by:
- **Collective Intelligence Theory**: "Wisdom of crowds" research
- **Socratic Method**: Truth through dialogue and questioning
- **Jury Deliberation**: Structured decision-making with diverse perspectives
- **Buddhist Councils**: Historical precedent of collective wisdom-seeking
- **Multi-Agent Systems**: AI research on collaborative problem-solving

Built with ❤️ for ChatBotX by the development team.

---

## 📄 License & Usage

Council-Hades is part of ChatBotX and follows the same license.

**Note**: Using Council-Hades consumes more tokens than regular chat (15-30× more) since it powers 5 agents through multiple stages. Choose your AI model provider accordingly.

---

## 🤝 Contributing

Want to improve Council-Hades?

- Add new agents with unique perspectives
- Improve voting algorithms
- Create new operating modes
- Enhance UI/UX
- Write better system prompts for agents
- Add tests and benchmarks

See `AGENTS.md` for contribution guidelines.

---

## 📞 Support

- **Issues**: Report bugs via GitHub Issues
- **Questions**: Ask in ChatBotX community
- **Feedback**: We'd love to hear how Council-Hades helped your decision-making!

---

**Remember**: Council-Hades is a tool for deliberation, not a replacement for human judgment. Always consider the Council's advice in context and make final decisions based on your own values and circumstances.

*"The highest intelligence is not just knowing what is right, but understanding why truth must be protected."*  
— Council-Hades Core Principle