# Signs of AI Writing

Reference for identifying AI-generated writing patterns. Paraphrased from [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), maintained by WikiProject AI Cleanup.

Use when: diagnosing why AI detection tools flag a piece of writing, auditing this catalog, or adding new patterns.

---

## Category 1 — Content Patterns

### Significance Inflation
Inflates mundane details by connecting them to grandiose themes.

**Keywords:** stands/serves as, is a testament, vital/crucial/pivotal role, reflects broader, marking/shaping, key turning point, enduring legacy

**Before:**
> The Statistical Institute of Catalonia was officially established in 1989, marking a pivotal moment in the evolution of regional statistics in Spain.

**After:**
> The Statistical Institute of Catalonia was established in 1989 to collect regional statistics independently from Spain's national statistics office.

---

### Vague Authority Attribution
Attributes opinions to undefined authorities without naming sources or explaining what they said.

**Keywords:** Industry reports, Observers have cited, Experts argue, Some critics, Several sources, as widely acknowledged

**Before:**
> Experts believe the Haolai River plays a crucial role in the regional ecosystem.

**After:**
> The Haolai River supports several endemic fish species, according to a 2019 survey by the Chinese Academy of Sciences.

---

### Superficial Analysis (-ing phrases)
Appends present-participle phrases offering vague commentary on significance without substantive content.

**Keywords:** highlighting, underscoring, emphasizing, reflecting, symbolizing, contributing to, fostering, showcasing, cultivating

**Before:**
> The temple uses blue and gold, reflecting the community's deep connection to the land.

**After:**
> The architect chose blue and gold to reference local bluebonnets and the Gulf coast, according to the project brief.

---

### Promotional Language
Adopts travel-guide or press-release tone regardless of context.

**Keywords:** boasts a, vibrant, rich (figurative), nestled, in the heart of, groundbreaking, renowned, breathtaking, stunning, diverse array

**Before:**
> Nestled within the breathtaking region of Gonder, Alamata stands as a vibrant town with rich cultural heritage.

**After:**
> Alamata is a town in the Gonder region of Ethiopia, known for its weekly market and 18th-century church.

---

## Category 2 — Language and Grammar Patterns

### AI Vocabulary Density
Multiple flagged words co-occur in the same passage. Frequency increased sharply post-2022.

**High-frequency AI words:** additionally, align with, crucial, delve, enduring, enhance, fostering, garner, highlight (verb), interplay, intricate/intricacies, key (adjective), landscape (abstract), pivotal, showcase, tapestry (abstract), testament, underscore (verb), valuable, vibrant

**Before:**
> Additionally, the intricate tapestry of influences showcases the vibrant cultural landscape, emphasizing the enduring testament to the community's resilience.

**After:**
> The neighborhood's architecture reflects immigration waves from three countries over 80 years.

---

### Copula Avoidance
Substitutes elaborate constructions for simple is/are/has.

**Substitution words:** serves as, stands as, marks, represents [a], features, offers, boasts

**Before:**
> Gallery 825 serves as LAAA's exhibition space and boasts over 3,000 square feet.

**After:**
> Gallery 825 is LAAA's exhibition space. It has four rooms totaling 3,000 square feet.

---

### Negative Parallelisms
Overuses "not only…but also" or "it's not just X, it's Y" constructions.

**Before:**
> It's not just about the beat riding under the vocals; it's part of the aggression and atmosphere.

**After:**
> The heavy beat contributes to the aggressive tone.

---

### Elegant Variation (Synonym Cycling)
Avoids repeating a word by substituting synonyms throughout — stems from repetition-penalty code in LLMs.

**Before:**
> The protagonist faces many challenges. The main character must overcome obstacles. The central figure eventually triumphs.

**After:**
> The protagonist faces many challenges but eventually triumphs.

---

### Rule of Three Overuse
Forces ideas into groups of three even when the grouping is superficial.

**Before:**
> The event features keynote sessions, panel discussions, and networking opportunities.

**After:**
> The event includes talks, panels, and time for networking.

---

## Category 3 — Style Patterns

### Em Dash Overuse
Uses em dashes more than humans do, mimicking "punchy" writing.

**Before:**
> The term is primarily promoted by Dutch institutions—not by the people themselves—yet this mislabeling continues—even in official documents.

**After:**
> The term is primarily promoted by Dutch institutions, not by the people themselves, yet this mislabeling continues in official documents.

---

### Boldface Overuse
Mechanically emphasizes phrases in boldface regardless of actual importance.

**Before:**
> It blends **OKRs**, **KPIs**, and the **Balanced Scorecard**.

**After:**
> It blends OKRs, KPIs, and the Balanced Scorecard.

---

### Inline-Header Vertical Lists
Creates bulleted lists where items start with bolded headers followed by colons.

**Before:**
> - **Speed:** Code generation is faster.
> - **Quality:** Output is higher.

**After:**
> Code generation is faster and output quality is higher.

---

### Title Case in Headings
Capitalizes all main words in section headings.

**Before:**
> ## Strategic Negotiations And Global Partnerships

**After:**
> ## Strategic negotiations and global partnerships

---

## Category 4 — Structural and Tonal Patterns (Academic Writing)

These are the patterns most commonly flagged by AI detectors in formal/academic writing. They differ from the patterns above in being structural and tonal rather than lexical.

---

### Over-Formal Sentence Architecture
Every sentence follows the same multi-clause compound structure with embedded subordinate phrases. Sounds assembled by formula rather than written by a person. Detectors flag this as "Robotic Formality."

**GPTZero reason tags:** Robotic Formality, Sophisticated Clarity

**Before:**
> This documented pattern of misalignment, alongside rapid deployment at scale, is precisely what makes the governance question urgent rather than speculative.

**After:**
> Clark and Amodei documented these failures. The misalignment problem is real, and governance hasn't caught up to deployment speed.

---

### Mechanical Transition Uniformity
100% of sentences or paragraphs open with transitional words (Similarly, However, Yet, Additionally, In both cases). Detectors read this as machine-generated. Detectors flag this as "Mechanical Transitions" or "Formulaic Flow."

**GPTZero reason tags:** Mechanical Transitions, Formulaic Flow

**Target:** No more than 2 consecutive sentences starting with a transitional word. Aim for ~1-in-3 sentences subject-first.

**Note:** In academic writing, some transitional coverage is correct and expected. The fix is breaking uniformity, not removing transitions.

**Before:**
> Similarly, Osoro et al. find that LEO satellites extend broadband while producing more carbon. In both cases, harm and benefit coexisting demands governance. As deployment accelerates, AI creates new problems.

**After:**
> Similarly, Osoro et al. find that LEO satellites extend broadband while producing more carbon. Harm and benefit coexisting does not make a technology worthless — it makes governance necessary. As deployment accelerates, AI creates new problems.

---

### Technical Jargon Accumulation
Multiple domain-specific technical terms stacked in the same clause. The density reads as machine-generated even when individual terms are accurate. Detectors flag this as "Technical Jargon" or "Mechanical Precision."

**GPTZero reason tags:** Technical Jargon, Mechanical Precision

**Fix:** Where two or more technical terms co-occur in a single clause, unpack one of them or rephrase it in plain language.

**Before:**
> Jack Clark and Dario Amodei documented that reinforcement learning agents given imprecisely specified reward functions exploit unintended loopholes, pursuing technically correct but misaligned objectives in ways their designers did not anticipate (Clark and Amodei).

**After:**
> Clark and Amodei documented AI systems that exploit loopholes in how they're scored — pursuing technically correct but misaligned goals when the reward function is poorly specified (Clark and Amodei).

---

### Impersonal Passive Constructions
Uses passive or indirect speech when an active construction is clearly available. Reads as formal to the point of being robotic. Detectors flag this as "Impersonal Tone."

**GPTZero reason tags:** Impersonal Tone

**Patterns:** "is attributable to," "is precisely what makes," "are related to how they are being used," "argues that" as primary verb, "suggests that" repeatedly

**Before:**
> 50–70% of wage inequality growth is attributable to automation displacing workers from advantageous tasks.

**After:**
> Automation displaced workers from better-paid tasks — that accounts for 50–70% of wage inequality growth over four decades.

---

### Perfect Uniform Polish
Every sentence in a paragraph reads at the same register and complexity level. Human writing has texture variation. Detectors pick up the absence of roughness.

**Fix:** Check paragraphs where all sentences have the same complexity. Loosen 1–2 sentences: shorten one, make one more direct, allow rougher phrasing.

**Before:**
> In both labour and military contexts, AI generates genuine and empirically documented problems. These harms are not speculative. However, the evidence consistently attributes them to deployment choices and governance gaps rather than to the technology itself.

**After:**
> In both labour and military contexts, AI generates genuine, documented problems. Not speculative ones. But the evidence consistently traces them to deployment choices and governance gaps, not the technology itself.

---

## Category 5 — Communication Patterns

### Collaborative Communication Artifacts
Chatbot correspondence language pasted into content.

**Keywords:** I hope this helps, Of course!, Would you like me to, let me know, here is a, Certainly!

---

### Knowledge-Cutoff Disclaimers
Speculates about information gaps in ways a human writer wouldn't.

**Keywords:** as of [date], Up to my last training update, While specific details are limited, based on available information

---

### Filler Phrases
Inflates sentence length with no added meaning.

**Before → After:**
- "In order to achieve this" → "To achieve this"
- "Due to the fact that" → "Because"
- "At this point in time" → "Now"
- "It is important to note that" → [delete, or just state the thing]
- "The system has the ability to" → "The system can"

---

## Self-Improvement

When new AI-flagged patterns are identified through GPTZero scans or other detection tools:

1. Add the pattern here under the most fitting category
2. Provide a before/after example from the actual flagged text
3. Note whether this catalog already covers it (or mark as "catalog gap — pending")
4. Update this catalog if the gap is confirmed
5. Update this file's catalog gap note to "covered" once patched

---

## GPTZero — what actually moves the score

GPTZero weighs structural and tonal regularities more heavily than individual word choice. Lexical tweaks alone rarely move the score; structural shifts do.

**High-risk patterns to look for first:**

- Over-formal architecture (every paragraph follows the same shape)
- Mechanical transitions ("Furthermore", "Moreover", "Additionally" stacked)
- Jargon accumulation (multiple terms-of-art per sentence)
- Impersonal passives ("It is observed that...", "It must be acknowledged...")
- Uniform polish — every sentence reads at the same register and length

**Highest-leverage fixes:**

- Sentence splitting — break long compound sentences into 2–3 shorter ones
- Jargon unpacking — replace term-of-art clusters with plain restatement
- Subject-first cadence — make at least 1 in 3 sentences start with a concrete subject, not a transition word or qualifier

Apply these before tweaking individual words.
