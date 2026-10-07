import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SymptomForm } from './SymptomForm';
import { LoadingState } from './LoadingState';
import { ResultCard, type ResultData } from './ResultCard';
import { ChatbotWidget } from './ChatbotWidget';
import { NeonCursorParticles } from './NeonCursorParticles';
import chatbotData from '../chatbot.json';
import { 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  HelpCircle, 
  Layers, 
  X,
  Stethoscope,
  Lock,
  HeartHandshake,
  Lightbulb
} from 'lucide-react';

type AppState = 'input' | 'loading' | 'result';

function App() {
  const [appState, setAppState] = useState<AppState>('input');
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showTip, setShowTip] = useState(true);

  const handleSymptomSubmit = (data: { symptom: string; duration: string; severity: string; ageGroup: string }) => {
    setAppState('loading');
    
    setTimeout(() => {
      const lowerSymptom = data.symptom.toLowerCase();
      
      // 1. Red-Flag Emergency Triage
      const matchedRedFlag = chatbotData.red_flag_keywords.find(rf => lowerSymptom.includes(rf.toLowerCase()));
      
      if (matchedRedFlag) {
        setResultData({
          isEmergency: true,
          emergencyReason: `Critical symptom flagged: "${matchedRedFlag.toUpperCase()}". This presents risk of acute clinical deterioration. Immediate emergency hospital intervention is advised.`
        });
      } else {
        // 2. Cross-reference Clinical Database
        const matchedGuidance = chatbotData.symptom_guidance.find(sg => 
          sg.keywords.some(kw => lowerSymptom.includes(kw.toLowerCase())) ||
          lowerSymptom.includes(sg.symptom.toLowerCase())
        );

        if (matchedGuidance) {
          setResultData({
            isEmergency: false,
            remedy_steps: matchedGuidance.remedy_steps,
            avoid: matchedGuidance.avoid,
            recovery_estimate: matchedGuidance.recovery_estimate,
            escalation_line: matchedGuidance.escalation_line
          });
        } else {
          setResultData({
            isEmergency: false,
            remedy_steps: [
              `Prioritize 7-8 hours of uninterrupted rest to boost your immune recovery.`,
              `Maintain steady hydration with lukewarm water, herbal teas, or electrolyte fluids.`,
              `Apply a gentle warm or cool compress to soothe local discomfort.`,
              `Rest the affected body area and avoid strenuous physical tasks.`
            ],
            avoid: [
              `Do not consume heavy, ultra-processed, or high-sugar foods during recovery.`,
              `Avoid heavy lifting or sudden straining if experiencing muscle tension.`,
              `Do not self-prescribe antibiotics or unverified prescription medicines.`
            ],
            recovery_estimate: `Typically resolves within 2 to 4 days with proper home rest and hydration.`,
            escalation_line: `Schedule a consultation with a doctor if symptoms persist past 7 days or worsen abruptly.`
          });
        }
      }
      setAppState('result');
    }, 2200);
  };

  const resetFlow = () => {
    setResultData(null);
    setAppState('input');
  };

  return (
    <div className="min-h-screen relative font-sans text-slate-900 bg-white selection:bg-cyan-200 selection:text-slate-900 overflow-x-hidden">
      {/* Interactive Astra Neon Particle Constellation Canvas */}
      <NeonCursorParticles />

      {/* Fluid Ambient Aurora Blobs (No Grid Lines) */}
      <div className="fixed top-[-15%] left-[10%] w-[600px] h-[600px] aurora-blob-1 pointer-events-none -z-10" />
      <div className="fixed bottom-[-15%] right-[10%] w-[650px] h-[650px] aurora-blob-2 pointer-events-none -z-10" />
      <div className="fixed top-[45%] right-[-5%] w-[500px] h-[500px] aurora-blob-3 pointer-events-none -z-10" />

      {/* Top Clean White Navigation Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl sticky top-0 z-40 shadow-xs">
        <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                <Stethoscope size={22} className="text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-xl text-slate-900">
                  Care<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Guide</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold">
                  Vector DB 2.5
                </span>
              </div>
              <p className="text-[9px] sm:text-[11px] font-mono text-slate-500 truncate max-w-[160px] sm:max-w-none mt-0.5">
                CREATED BY CHAITU • CLINICAL HOME TRIAGE
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>50+ Clinical Vectors</span>
            </div>

            <button
              onClick={() => setShowWorkflowModal(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-mono font-semibold transition-all shadow-xs hover:border-cyan-400 hover:text-cyan-700 cursor-pointer"
            >
              <HelpCircle size={14} className="text-cyan-500" />
              <span className="hidden sm:inline">How It Works</span>
              <span className="sm:hidden">Info</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 py-8 lg:py-12 relative z-20 max-w-4xl">
        {/* Sleek Dismissible Daily Tip Banner */}
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-3 rounded-2xl bg-gradient-to-r from-cyan-50/90 via-blue-50/70 to-indigo-50/80 border border-cyan-200/80 flex items-center justify-between shadow-xs max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-2.5 text-xs text-cyan-950 font-medium">
              <span className="p-1 rounded-lg bg-cyan-500 text-white shrink-0">
                <Lightbulb size={13} />
              </span>
              <span><strong>Self-Care Tip:</strong> For scratchy throats, warm salt water gargles 3x daily can reduce swelling and ease discomfort naturally.</span>
            </div>
            <button
              onClick={() => setShowTip(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}

        {/* Hero Headline Section */}
        {appState === 'input' && (
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-slate-700 text-xs font-mono uppercase tracking-wider mb-4 shadow-2xs"
            >
              <Sparkles size={13} className="text-cyan-600" />
              <span>AI-Powered Clinical Home Guidance • By Chaitu</span>
            </motion.div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Instant & Calm <br className="hidden sm:block" />
              <span className="shimmer-gradient">Home-Care Guidance</span>
            </h1>

            <p className="text-slate-500 text-sm sm:text-base mt-3.5 leading-relaxed max-w-lg mx-auto">
              Safely evaluate minor symptoms in seconds. Formulated with on-device vector clinical intelligence, red-flag emergency safety filters, and practical recovery protocols.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <Lock size={13} className="text-cyan-600" /> 100% In-Browser & Private
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" /> Emergency Triage Engine
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1.5">
                <HeartHandshake size={14} className="text-blue-600" /> Safe Non-Rx Remedies
              </span>
            </div>
          </div>
        )}

        {/* Interactive 3-Step Workflow Roadmap Bar */}
        <div className="mb-8 max-w-xl mx-auto">
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-xs backdrop-blur-md">
            {[
              { num: '01', title: 'Symptom Scan', state: 'input' },
              { num: '02', title: 'Safety Triage', state: 'loading' },
              { num: '03', title: 'Care Protocol', state: 'result' }
            ].map((step) => {
              const isActive = appState === step.state;
              return (
                <div
                  key={step.num}
                  className={`flex items-center justify-center sm:justify-start gap-2 py-2 px-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-300 text-cyan-800 shadow-[0_0_15px_rgba(0,240,255,0.15)] font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  <span className={`font-mono text-xs font-bold ${isActive ? 'text-cyan-600' : 'text-slate-400'}`}>
                    {step.num}
                  </span>
                  <span className="text-xs font-medium hidden sm:inline">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Transition Between Screens */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {appState === 'input' && (
              <SymptomForm key="form" onSubmit={handleSymptomSubmit} />
            )}
            
            {appState === 'loading' && (
              <LoadingState key="loading" />
            )}
            
            {appState === 'result' && resultData && (
              <ResultCard 
                key="result" 
                data={resultData} 
                onReset={resetFlow} 
              />
            )}
          </AnimatePresence>
        </div>

        {/* Feature Highlights Grid */}
        {appState === 'input' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto"
          >
            <div className="premium-card p-5 rounded-2xl">
              <div className="p-2 w-fit rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200 mb-3 shadow-xs">
                <Cpu size={18} />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">On-Device Vector DB</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Smart semantic search engine parses user intent and symptoms even with typos or varied phrasing.
              </p>
            </div>

            <div className="premium-card p-5 rounded-2xl">
              <div className="p-2 w-fit rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-3 shadow-xs">
                <ShieldCheck size={18} />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Dual Safety Filter</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Immediately isolates acute red-flag symptoms to recommend urgent clinical emergency care.
              </p>
            </div>

            <div className="premium-card p-5 rounded-2xl">
              <div className="p-2 w-fit rounded-xl bg-purple-50 text-purple-600 border border-purple-200 mb-3 shadow-xs">
                <Sparkles size={18} />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Astra Neon Particles</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Move your cursor across the clean canvas to see glowing neon particle constellations follow your mouse.
              </p>
            </div>
          </motion.div>
        )}
      </main>

      {/* Workflow Explanation Modal for New Users */}
      <AnimatePresence>
        {showWorkflowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-200 relative shadow-2xl"
            >
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 text-cyan-600 font-mono text-xs uppercase mb-1 font-semibold">
                <Layers size={15} /> System Architecture
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">
                How CareGuide Works
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mb-6">
                Engineered by <strong className="text-cyan-600">Chaitu</strong> to provide safe, structured first-aid and home-care guidance.
              </p>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3.5">
                  <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-700 font-mono font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <h5 className="font-semibold text-slate-900">Symptom Input & Context</h5>
                    <p className="text-slate-500 mt-0.5">
                      Enter your symptom description, duration, and severity in the main console or select a preset chip.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-mono font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <h5 className="font-semibold text-slate-900">Dual Safety & Vector Check</h5>
                    <p className="text-slate-500 mt-0.5">
                      The safety algorithm detects red-flag emergency symptoms (e.g., chest pain, breathing distress) to immediately display hospital dialers.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3.5">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-mono font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <h5 className="font-semibold text-slate-900">Formulated Home-Care Plan</h5>
                    <p className="text-slate-500 mt-0.5">
                      For safe minor conditions, it creates step-by-step home remedies, habits to avoid, recovery duration, and doctor visit thresholds.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-mono font-bold flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div>
                    <h5 className="font-semibold text-slate-900">Interactive Vector Chatbot</h5>
                    <p className="text-slate-500 mt-0.5">
                      Tap the AI orb in the bottom right corner anytime to ask questions about workflow or symptoms with instant semantic search!
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowWorkflowModal(false)}
                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
              >
                Got It, Begin Assessment
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}

export default App;
