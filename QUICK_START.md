# Quick Start Guide - ASS Debate Mode

## 🚀 Setup & Run (5 minutes)

### 1. Install Dependencies
```bash
cd chabotx
npm install
```

### 2. Configure API Keys
Create/edit `.env` file:
```bash
VITE_POE_API_KEY=your_poe_key_here
VITE_GROQ_API_KEY=your_groq_key_here
VITE_TOGETHER_API_KEY=your_together_key_here
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open in Browser
```
http://localhost:8080
```

---

## 🎭 Using ASS Debate Mode

### Step 1: Open Debate Mode
- Click the **"🎭 ASS Debate"** button in sidebar, or
- Look for **Users icon** button in main interface

### Step 2: Enter Your Question
```
Example questions:
✓ Should we develop AGI as fast as possible?
✓ Is pineapple on pizza acceptable?
✓ Should social media be regulated like tobacco?
```

Or click a **preset question** button below the text area.

### Step 3: Select Debaters (Minimum 2)
Click on personality cards to select/deselect:

- 🌟 **Optimist** - Sees possibilities everywhere
- 🔍 **Skeptic** - Points out flaws and limitations
- 🚀 **Visionary** - Champions breakthrough ideas
- ⚖️ **Critic** - Highlights potential issues
- 🔬 **Scientist** - Evidence-based reasoning
- 🎨 **Artist** - Creative perspective
- 📚 **Philosopher** - Deep theoretical thinking
- ⚙️ **Pragmatist** - Practical solutions

### Step 4: Customize Models (NEW!)
For each selected debater:
1. Expand the **Model Configuration** section
2. Choose **Provider**: POE, GROQ, or TOGETHER
3. Select **Model** from dropdown

**Example Configuration:**
```
Optimist  → POE     → GPT-5-mini
Skeptic   → GROQ    → llama-3.3-70b-versatile
Visionary → TOGETHER → Meta-Llama-3.1-405B
Critic    → TOGETHER → Qwen3-Next-80B
```

### Step 5: Adjust Settings (Optional)
Click **"Show Settings"** to configure:

- **Debate Format:**
  - 🗳️ Voting Mode (Consensus-based)
  - 🎭 Classic (3 structured rounds)
  - 👥 Team Debate
  - 🎪 Panel Discussion
  - 🏆 Tournament (Elimination)

- **Voting System:**
  - Ranked Choice
  - Borda Count
  - Approval Voting
  - Condorcet Method

- **Consensus Threshold:** 50% - 100%
- **Maximum Rounds:** 3 - 10

### Step 6: Start Debate!
Click the **"Start Debate"** button

---

## 📊 Understanding the Debate

### What You'll See:

#### 1. Loading Phase
```
⏳ Initializing debate...
   Preparing X debaters
```

#### 2. Thinking Indicators
Each debater shows when processing:
```
🌟 Optimist
   POE - GPT-5-mini
   [Loading spinner] Thinking and formulating response...
```

#### 3. Arguments Display
```
┌─────────────────────────────────────────┐
│ Round 1: Opening                     ✓  │
├─────────────────────────────────────────┤
│                                          │
│ 🌟 Optimist                      75%    │
│    POE - GPT-5-mini                     │
│                                          │
│    [Argument text with perfect          │
│     word wrapping - no cutoff!]         │
│                                          │
└─────────────────────────────────────────┘
```

#### 4. Voting Results
```
🏆 Votes (ranked)
1. 🌟 Optimist     - 12 🏆
2. 🚀 Visionary    - 10
3. 🔍 Skeptic      - 8
4. ⚖️ Critic       - 6
```

#### 5. Auto-Scroll
- Page automatically scrolls to newest content
- Smooth scrolling animation
- Manual scroll still works

---

## 📱 Mobile Usage

### Optimized for Small Screens:

✅ **Compact Layout**
- Smaller text sizes
- Icon-only tabs
- Single-column grids

✅ **Touch-Friendly**
- Large tap targets
- No accidental selections
- Smooth gestures

✅ **Content Focus**
- Essential info only
- Progressive disclosure
- Easy scrolling

### Mobile Tips:
1. Rotate to landscape for more space
2. Pinch to zoom if needed
3. Swipe to scroll through arguments
4. Tap debate cards to expand

---

## 🎯 Quick Tips

### For Best Results:

1. **Choose Diverse Models**
   - Mix providers (POE + GROQ + TOGETHER)
   - Different model sizes
   - Varied perspectives

2. **Pick Complementary Personalities**
   - Optimist + Skeptic = Balanced
   - Scientist + Artist = Creative + Logical
   - Philosopher + Pragmatist = Theory + Practice

3. **Ask Clear Questions**
   - ✅ "Should X or Y?"
   - ✅ "Is X beneficial?"
   - ❌ Too broad or vague

4. **Adjust Settings**
   - More rounds = deeper debate
   - Higher consensus = harder agreement
   - Team mode = collaborative reasoning

---

## 🔧 Troubleshooting

### Common Issues:

#### "API Key Error"
```bash
# Check .env file exists
# Verify keys are correct
# Restart dev server: npm run dev
```

#### "Build Fails"
```bash
rm -rf node_modules dist
npm install
npm run build
```

#### "Text Cutoff/Overflow"
✅ **Fixed!** Now auto-wraps perfectly

#### "Loading Never Ends"
- Check console for errors
- Verify API keys are valid
- Check network tab for failed requests

#### "No Auto-Scroll"
✅ **Fixed!** Now scrolls automatically

---

## 🎨 UI Features Explained

### Color Coding:
- **Purple/Blue** - Debate questions
- **Team colors** - Team assignments
- **Green badge** - Consensus reached
- **Yellow** - Judge decisions

### Icons:
- 👥 Users - Debaters tab
- 📊 Bar Chart - Analytics tab
- 🌳 Git Branch - Tree view tab
- 🏆 Trophy - Winners/consensus
- ⚙️ Settings - Configuration
- 🔄 Loading - Processing

### Progress Bars:
- **Belief Level** - How convinced (0-100%)
- **Consensus** - Agreement level
- **Participation** - Message count

---

## 📖 Example Workflow

### Full Debate Setup:

```
1. Open ASS Debate Mode
   ↓
2. Enter: "Should we colonize Mars or fix Earth first?"
   ↓
3. Select: Optimist, Skeptic, Scientist, Pragmatist
   ↓
4. Customize Models:
   - Optimist: POE → GPT-5-mini
   - Skeptic: GROQ → llama-3.3-70b
   - Scientist: TOGETHER → Llama-405B
   - Pragmatist: GROQ → mixtral-8x7b
   ↓
5. Settings:
   - Format: Voting Mode
   - Voting: Ranked Choice
   - Consensus: 70%
   - Max Rounds: 5
   ↓
6. Click "Start Debate"
   ↓
7. Watch the magic happen!
   - See thinking indicators
   - Read full arguments
   - View voting results
   - Check analytics
```

---

## ⚡ Keyboard Shortcuts

- **Esc** - Close debate mode
- **Ctrl + Enter** - Start debate (when ready)
- **Tab** - Switch between tabs
- **Space** - Scroll down
- **Shift + Space** - Scroll up

---

## 📊 Analytics Tab

### Available After Debate:

1. **Participation Rate**
   - Who spoke most
   - Message counts
   - Activity distribution

2. **Argument Quality**
   - Quality scores (0-100%)
   - Strength analysis
   - Impact ratings

3. **Belief Changes**
   - How opinions shifted
   - Conviction levels
   - Persuasion effects

4. **Consensus Evolution**
   - Agreement over time
   - Polarization levels
   - Leading positions

5. **Top Arguments**
   - Most impactful points
   - Key insights
   - Strongest evidence

---

## 🌳 Tree View Tab

### Visual Debate Structure:
- Parent-child argument relationships
- Response chains
- Agreement patterns
- Influence mapping

*Coming soon with enhanced visualization!*

---

## 🎓 Advanced Features

### Team Debates:
1. Select "Team Debate" format
2. Debaters auto-assigned to teams
3. Team colors shown on cards
4. Collaborative arguments

### Tournament Mode:
1. Select "Tournament" format
2. Bracket-style elimination
3. Winner advances
4. Final champion declared

### Panel Discussion:
1. Select "Panel" format
2. Round-robin speaking
3. No elimination
4. Consensus-focused

---

## 💡 Pro Tips

### Maximize Debate Quality:

1. **Use Strong Models**
   - Meta-Llama-3.1-405B for depth
   - GPT-5-mini for speed
   - Mixtral for balance

2. **Mix Personality Types**
   - Don't pick all similar types
   - Balance optimism vs skepticism
   - Combine theory with practice

3. **Ask Controversial Questions**
   - Encourage diverse views
   - Avoid yes/no questions
   - Include nuance

4. **Watch Belief Changes**
   - Track conviction shifts
   - Note who persuades whom
   - Analyze consensus patterns

5. **Review Analytics**
   - Check participation balance
   - Identify strongest arguments
   - Study persuasion dynamics

---

## ✅ Feature Checklist

What's Working Now:

- ✅ Custom model selection per character
- ✅ Perfect text wrapping (no cutoff!)
- ✅ Auto-scroll to new content
- ✅ Loading indicators per debater
- ✅ Non-streaming responses (full text at once)
- ✅ Mobile responsive design
- ✅ Token limit fixes (no API errors)
- ✅ Smooth animations
- ✅ Provider info display
- ✅ Model name display
- ✅ Belief tracking
- ✅ Voting systems
- ✅ Multiple debate formats
- ✅ Analytics dashboard

---

## 🚀 Ready to Start?

```bash
npm run dev
```

Then open browser and click **"🎭 ASS Debate"**

**Have fun debating! 🎉**

---

## 📞 Need Help?

### Resources:
- `FINAL_IMPROVEMENTS.md` - All improvements details
- `AGENTS.md` - Project guidelines
- `ASS_FEATURES.md` - Feature documentation
- Console (F12) - Error messages
- Network tab - API requests

### Common Commands:
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Check code quality
npm run preview  # Preview built app
```

---

**Version:** 1.2.0  
**Status:** ✅ Production Ready  
**Last Updated:** 2024

Enjoy the perfect debate experience! 🎭✨