import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShieldCheck, Database, Stethoscope } from 'lucide-react';

const DIAGNOSTIC_STEPS = [
  { text: 'Scanning red-flag emergency symptoms...', icon: ShieldCheck, color: 'text-emerald-600' },
  { text: 'Traversing Vector Database knowledge graph...', icon: Database, color: 'text-cyan-600' },
  { text: 'Evaluating OTC & non-prescription boundaries...', icon: Cpu, color: 'text-blue-600' },
  { text: 'Synthesizing verified home-care protocols...', icon: Stethoscope, color: 'text-purple-600' }
];

export const LoadingState: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % DIAGNOSTIC_STEPS.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const currentStep = DIAGNOSTIC_STEPS[stepIndex];
  const StepIcon = currentStep.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-xl mx-auto white-glass-panel p-10 rounded-3xl text-center relative overflow-hidden shadow-lg border border-slate-200"
    >
      {/* Top neon accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff]" />

      {/* Concentric Radar Ring Scanner */}
      <div className="relative w-36 h-36 mx-auto mb-8 flex items-center justify-center">
        {/* Outer Pulsing Aura */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-cyan-400/20 filter blur-md"
        />

        {/* Outer Rotating Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/60"
        />

        {/* Middle Counter-Rotating Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-3 rounded-full border border-blue-400 border-t-cyan-500 border-b-purple-400"
        />

        {/* Inner Glowing Core */}
        <motion.div
          animate={{ scale: [0.92, 1.06, 0.92] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-cyan-50 to-blue-50 border border-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center text-cyan-600"
        >
          <StepIcon size={32} className={`${currentStep.color} transition-all duration-300`} />
        </motion.div>
      </div>

      {/* Status Readout */}
      <div className="space-y-2.5 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-mono tracking-wider uppercase font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          NEURAL TRIAGE IN PROGRESS
        </div>

        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          Synthesizing Clinical Analysis
        </h3>

        <div className="h-8 flex items-center justify-center">
          <motion.p
            key={currentStep.text}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs sm:text-sm font-mono text-slate-600 flex items-center gap-2 font-medium"
          >
            {currentStep.text}
          </motion.p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-6 border border-slate-200">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_10px_#00f0ff]"
          />
        </div>
      </div>
    </motion.div>
  );
};
