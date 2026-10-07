import chatbotData from '../chatbot.json';

export interface SearchResult {
  id: string;
  title: string;
  category: 'intent' | 'symptom' | 'workflow' | 'system';
  response: string;
  score: number;
  matchedTerms: string[];
}

interface VectorDocument {
  id: string;
  title: string;
  category: 'intent' | 'symptom' | 'workflow' | 'system';
  rawText: string;
  response: string;
  tokens: Map<string, number>;
  magnitude: number;
}

class CareGuideVectorDB {
  private documents: VectorDocument[] = [];
  private idf: Map<string, number> = new Map();
  private isIndexed: boolean = false;

  constructor() {
    this.initializeCorpus();
  }

  // Tokenize string into words, 3-grams, and clean normalized tokens
  private tokenize(text: string): string[] {
    const cleaned = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim();

    const words = cleaned.split(/\s+/).filter(w => w.length > 1);
    const tokens: string[] = [...words];

    // Add character 3-grams for fuzzy tolerance (e.g., typos like 'headach', 'stomachache')
    for (const word of words) {
      if (word.length >= 4) {
        for (let i = 0; i <= word.length - 3; i++) {
          tokens.push(`$${word.substring(i, i + 3)}`);
        }
      }
    }

    // Add word bigrams for context (e.g., 'who created', 'how work', 'sore throat')
    for (let i = 0; i < words.length - 1; i++) {
      tokens.push(`${words[i]}_${words[i + 1]}`);
    }

    return tokens;
  }

  private initializeCorpus() {
    this.documents = [];

    // 1. Index Chatbot Intents from JSON
    for (const intent of chatbotData.chatbot_intents) {
      const allText = [
        intent.intent.replace(/_/g, ' '),
        ...intent.example_queries,
        intent.sample_response
      ].join(' ');

      this.documents.push({
        id: `intent_${intent.intent}`,
        title: intent.intent.replace(/_/g, ' ').toUpperCase(),
        category: intent.intent.includes('workflow') || intent.intent.includes('how_to_use') || intent.intent.includes('about_app') ? 'workflow' : 'intent',
        rawText: allText,
        response: intent.sample_response,
        tokens: new Map(),
        magnitude: 0
      });
    }

    // 2. Index Symptom Guidance from JSON
    for (const sym of chatbotData.symptom_guidance) {
      const allText = [
        sym.symptom,
        ...sym.keywords,
        ...sym.remedy_steps,
        ...sym.avoid,
        sym.recovery_estimate,
        sym.escalation_line
      ].join(' ');

      const formattedResponse = 
        `📋 **Home-Care Guidance for ${sym.symptom.toUpperCase()}**\n\n` +
        `**Recommended Steps:**\n` +
        sym.remedy_steps.map((s, i) => `${i + 1}. ${s}`).join('\n') +
        `\n\n**Things to Avoid:**\n` +
        sym.avoid.map(a => `• ${a}`).join('\n') +
        `\n\n⏱️ **Estimated Recovery:** ${sym.recovery_estimate}\n\n` +
        `🚨 **When to See a Doctor:** ${sym.escalation_line}`;

      this.documents.push({
        id: `symptom_${sym.symptom.replace(/\s+/g, '_')}`,
        title: sym.symptom,
        category: 'symptom',
        rawText: allText,
        response: formattedResponse,
        tokens: new Map(),
        magnitude: 0
      });
    }

    // 3. Index Deep Website Workflow Knowledge
    const workflowDocs = [
      {
        id: 'workflow_walkthrough',
        title: 'Full Website Workflow & User Guide',
        category: 'workflow' as const,
        rawText: 'how does this website work workflow step by step guide explain the process start to finish careguide navigation user process enter symptoms',
        response: 
          `🌐 **CareGuide System Architecture & Workflow:**\n\n` +
          `1️⃣ **Input Phase:** On the homepage, enter your symptom description, duration, severity, and age bracket.\n` +
          `2️⃣ **Safety & Red-Flag Triage:** Our neural safety filter instantly scans for urgent indicators (e.g. chest pain, shortness of breath, severe trauma).\n` +
          `3️⃣ **Guidance Engine:** For safe minor symptoms, you receive structured remedy steps, habits to avoid, recovery timelines, and exact physician escalation triggers.\n` +
          `4️⃣ **Interactive AI Assistant:** Need on-the-fly clarification? Open this chatbot in the bottom right corner anytime to query symptoms or website navigation!`
      },
      {
        id: 'workflow_creator_chaitu',
        title: 'Developer & Creator Credits',
        category: 'system' as const,
        rawText: 'who created you who is chaitu who made this app developer creator designer engineer author who built careguide website',
        response: 
          `✨ **Creator Info:**\n\n` +
          `This platform and AI assistant were created and engineered by **Chaitu**! 🚀\n` +
          `Chaitu designed CareGuide to bridge the gap between initial minor symptoms and safe, structured home-care advice with cutting-edge UI and safety-first triage.`
      },
      {
        id: 'workflow_red_flags',
        title: 'Emergency Medical Red Flags',
        category: 'system' as const,
        rawText: 'emergency red flags danger chest pain breath breathing heart stroke seizure urgent 911 112 hospital ambulance unconscious blood',
        response: 
          `🚨 **Emergency Medical Protocol:**\n\n` +
          `CareGuide is **NOT** for life-threatening emergencies. Immediately dial emergency services (911 / 112 / 108) if experiencing:\n` +
          `• Chest tightness or radiating arm pain\n` +
          `• Severe respiratory distress or blue lips\n` +
          `• Loss of consciousness, sudden numbness, or slurred speech\n` +
          `• Uncontrollable bleeding or severe head injury`
      }
    ];

    for (const wd of workflowDocs) {
      this.documents.push({
        ...wd,
        tokens: new Map(),
        magnitude: 0
      });
    }

    this.buildVectorIndex();
  }

  // Build TF-IDF Vector Index
  private buildVectorIndex() {
    const totalDocs = this.documents.length;
    const docFrequency: Map<string, number> = new Map();

    // Calculate Term Frequencies (TF) per document
    for (const doc of this.documents) {
      const tokens = this.tokenize(doc.rawText);
      const tokenCounts: Map<string, number> = new Map();

      for (const t of tokens) {
        tokenCounts.set(t, (tokenCounts.get(t) || 0) + 1);
      }

      // Record document frequency
      for (const t of tokenCounts.keys()) {
        docFrequency.set(t, (docFrequency.get(t) || 0) + 1);
      }

      doc.tokens = tokenCounts;
    }

    // Calculate Inverse Document Frequency (IDF)
    this.idf.clear();
    for (const [token, df] of docFrequency.entries()) {
      this.idf.set(token, Math.log((totalDocs + 1) / (df + 1)) + 1);
    }

    // Compute final vector magnitudes for each document
    for (const doc of this.documents) {
      let sumSq = 0;
      for (const [token, count] of doc.tokens.entries()) {
        const tf = count / doc.tokens.size;
        const idfVal = this.idf.get(token) || 1;
        const weight = tf * idfVal;
        sumSq += weight * weight;
      }
      doc.magnitude = Math.sqrt(sumSq) || 1;
    }

    this.isIndexed = true;
  }

  // Vector Cosine Similarity Search
  public search(query: string, topK: number = 3, threshold: number = 0.16): SearchResult[] {
    if (!this.isIndexed) {
      this.buildVectorIndex();
    }

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    const queryCounts: Map<string, number> = new Map();
    for (const t of queryTokens) {
      queryCounts.set(t, (queryCounts.get(t) || 0) + 1);
    }

    // Compute Query Vector & Magnitude
    let querySumSq = 0;
    const queryWeights: Map<string, number> = new Map();

    for (const [token, count] of queryCounts.entries()) {
      const tf = count / queryTokens.length;
      const idfVal = this.idf.get(token) || 1.2;
      const weight = tf * idfVal;
      queryWeights.set(token, weight);
      querySumSq += weight * weight;
    }
    const queryMagnitude = Math.sqrt(querySumSq) || 1;

    // Compute Cosine Similarity against all Document Vectors
    const results: SearchResult[] = [];

    for (const doc of this.documents) {
      let dotProduct = 0;
      const matchedTerms: string[] = [];

      for (const [token, qWeight] of queryWeights.entries()) {
        if (doc.tokens.has(token)) {
          const docTf = (doc.tokens.get(token) || 0) / doc.tokens.size;
          const idfVal = this.idf.get(token) || 1;
          const dWeight = docTf * idfVal;

          dotProduct += qWeight * dWeight;
          if (!token.startsWith('$') && !matchedTerms.includes(token)) {
            matchedTerms.push(token);
          }
        }
      }

      const cosineSimilarity = dotProduct / (queryMagnitude * doc.magnitude);

      if (cosineSimilarity >= threshold) {
        results.push({
          id: doc.id,
          title: doc.title,
          category: doc.category,
          response: doc.response,
          score: Math.min(1, Math.round(cosineSimilarity * 100) / 100),
          matchedTerms
        });
      }
    }

    // Sort by highest similarity
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  // Get total vector entries count
  public getVectorCount(): number {
    return this.documents.length;
  }
}

// Singleton Vector DB Instance
export const vectorDB = new CareGuideVectorDB();
