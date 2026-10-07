import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertOctagon, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Stethoscope, 
  PhoneCall, 
  RotateCcw, 
  MessageSquareCode,
  ShieldAlert
} from 'lucide-react';

export interface ResultData {
  isEmergency?: boolean;
  remedy_steps?: string[];
  avoid?: string[];
  recovery_estimate?: string;
  escalation_line?: string;
  emergencyReason?: string;
}

interface ResultCardProps {
  data: ResultData;
  onReset: () => void;
  onOpenChat?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data, onReset, onOpenChat }) => {
  // EMERGENCY RED-FLAG STATE
  if (data.isEmergency) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="max-w-2xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border-2 border-rose-400 shadow-2xl relative overflow-hidden"
      >
        {/* Top laser alert line */}
        <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_#f43f5e]" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-center justify-center text-rose-600 shrink-0 shadow-md">
            <AlertOctagon size={36} className="animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-mono uppercase tracking-wider mb-2 font-bold border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              CRITICAL MEDICAL TRIAGE ALERT
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Immediate Medical Attention Required
            </h2>
            <p className="text-rose-700 text-sm mt-1 font-medium">
              Do not attempt home remedies. Please seek emergency medical care immediately.
            </p>
          </div>
        </div>

        {/* Emergency Reason Card */}
        <div className="bg-rose-50/70 border border-rose-200 p-5 rounded-2xl mb-6">
          <h4 className="text-xs font-mono text-rose-800 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <ShieldAlert size={14} /> Clinical Triage Rationale
          </h4>
          <p className="text-slate-800 text-sm leading-relaxed">
            {data.emergencyReason || "Your description indicates acute symptoms that could signal a severe cardiovascular, respiratory, or physiological emergency."}
          </p>
        </div>

        {/* Action Hotline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <a
            href="tel:911"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-mono font-bold text-sm shadow-md hover:brightness-110 transition-all cursor-pointer"
          >
            <PhoneCall size={18} /> Dial Emergency (911 / 112)
          </a>
          <button
            onClick={onReset}
            className="p-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-sm font-medium transition-all cursor-pointer"
          >
            Re-evaluate Symptoms
          </button>
        </div>

        <p className="text-[11px] text-center text-slate-400 font-mono">
          CareGuide Emergency Safety Filter • Engineered by Chaitu
        </p>
      </motion.div>
    );
  }

  // STANDARD SAFE HOME-CARE GUIDANCE
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 24 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-2xl mx-auto space-y-5"
    >
      <div className="white-glass-panel p-6 sm:p-10 rounded-3xl relative overflow-hidden shadow-lg border border-slate-200">
        {/* Top Cyan Laser Line */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff]" />

        {/* Readout Header */}
        <motion.div variants={itemVariants} className="text-center sm:text-left mb-8 pb-6 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono uppercase tracking-wider mb-2.5 font-semibold">
            <CheckCircle size={13} className="text-emerald-600" />
            SYNTHESIS COMPLETE // MINOR SYMPTOM CONFIRMED
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Personalized Home-Care Protocol
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Safe non-pharmacological comfort steps formulated for minor, non-urgent management.
          </p>
        </motion.div>

        {/* 01. Recommended Care Steps */}
        <motion.div variants={itemVariants} className="mb-7">
          <div className="flex items-center gap-2 mb-3.5 text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
            <CheckCircle size={16} />
            <span>01 // Safe Home Care Steps</span>
          </div>
          <div className="space-y-2.5">
            {data.remedy_steps?.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/70 text-slate-800 text-sm leading-relaxed"
              >
                <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 02. What to Avoid */}
        <motion.div variants={itemVariants} className="mb-7">
          <div className="flex items-center gap-2 mb-3.5 text-xs font-mono font-bold text-amber-700 uppercase tracking-wider">
            <AlertTriangle size={16} />
            <span>02 // Actions & Habits to Avoid</span>
          </div>
          <div className="space-y-2.5">
            {data.avoid?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 text-slate-800 text-sm leading-relaxed"
              >
                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                  ✕
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 03. Recovery Estimate */}
        <motion.div variants={itemVariants} className="mb-7 p-4 rounded-xl bg-cyan-50/60 border border-cyan-200 flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-cyan-100 text-cyan-700 shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-cyan-800 uppercase tracking-wider block mb-1">
              03 // Prognostic Recovery Timeline
            </span>
            <p className="text-slate-800 text-sm font-medium">
              {data.recovery_estimate || "Expected to resolve in 3 to 5 days with adequate hydration and rest."}
            </p>
          </div>
        </motion.div>

        {/* 04. Escalation Trigger Line */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 relative overflow-hidden"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
              <Stethoscope size={20} />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-rose-800 uppercase tracking-wider block mb-1">
                04 // Physician Escalation Threshold
              </span>
              <p className="text-slate-800 text-sm leading-relaxed">
                {data.escalation_line || "Consult a licensed healthcare provider if symptoms persist beyond 7 days or worsen abruptly."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Control Bar */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onReset}
          className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-mono text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 hover:border-cyan-400 cursor-pointer shadow-xs"
        >
          <RotateCcw size={16} /> Scan Another Symptom
        </button>

        {onOpenChat && (
          <button
            onClick={onOpenChat}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquareCode size={16} /> Ask AI Assistant Questions
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};
