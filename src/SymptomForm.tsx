import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Sparkles, Clock, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

interface SymptomFormProps {
  onSubmit: (data: { symptom: string; duration: string; severity: string; ageGroup: string }) => void;
  selectedCategory?: string;
}

const CATEGORY_PRESETS: Record<string, { label: string; text: string; icon: string }[]> = {
  all: [
    { label: 'Headache & Tension', text: 'mild throbbing tension headache behind eyes and neck', icon: '🤕' },
    { label: 'Common Cold & Sneezing', text: 'runny nose, sneezing, and light throat congestion', icon: '❄️' },
    { label: 'Mild Fever & Chills', text: 'feeling warm with slight shivering, temperature around 99.8°F', icon: '🔥' },
    { label: 'Minor Scrape or Cut', text: 'small superficial scrape on knee bleeding slightly', icon: '🩹' },
    { label: 'Upset Stomach / Nausea', text: 'mild nausea, bloating, and stomach discomfort after eating', icon: '🤢' },
    { label: 'Pulled Muscle / Sprain', text: 'sore pulled muscle in lower back after lifting heavy box', icon: '💪' }
  ],
  cold: [
    { label: 'Runny & Stuffy Nose', text: 'blocked sinuses and clear runny nose for 2 days', icon: '🤧' },
    { label: 'Scratchy Sore Throat', text: 'scratchy dry throat with mild pain when swallowing', icon: '☕' },
    { label: 'Dry Tickly Cough', text: 'dry throat tickle causing frequent mild coughing fits', icon: '💨' }
  ],
  fever: [
    { label: 'Mild Body Heat', text: 'mild low-grade fever with slight body weakness', icon: '🌡️' },
    { label: 'Chills & Shivering', text: 'intermittent cold chills without high temperature', icon: '🥶' }
  ],
  skin: [
    { label: 'Shallow Paper Cut', text: 'small clean cut on index finger with minor bleeding', icon: '🩹' },
    { label: 'Minor First-Degree Burn', text: 'red sensitive skin on finger after touching hot pan', icon: '🍳' },
    { label: 'Mild Sunburn', text: 'pink warm skin on shoulders after beach afternoon', icon: '☀️' },
    { label: 'Itchy Mosquito Bite', text: 'small red itchy bump from bug bite on forearm', icon: '🦟' }
  ],
  stomach: [
    { label: 'Acid Indigestion', text: 'mild burning sensation in upper stomach after dinner', icon: '🍽️' },
    { label: 'Bloating & Cramping', text: 'full bloated stomach with mild cramping', icon: '🫖' },
    { label: 'Mild Dehydration', text: 'dry mouth, mild thirst, and lightheadedness after workout', icon: '💧' }
  ]
};

export const SymptomForm: React.FC<SymptomFormProps> = ({ onSubmit }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'cold' | 'fever' | 'skin' | 'stomach'>('all');
  const [symptom, setSymptom] = useState('');
  const [duration, setDuration] = useState('1 to 2 days');
  const [severity, setSeverity] = useState('Mild');
  const [ageGroup, setAgeGroup] = useState('Adult (18-64)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptom.trim()) return;
    onSubmit({ symptom, duration, severity, ageGroup });
  };

  const currentPresets = CATEGORY_PRESETS[activeTab] || CATEGORY_PRESETS.all;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -25 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-2xl mx-auto premium-card p-6 sm:p-10 rounded-3xl relative overflow-hidden"
    >
      {/* Top Luminous Neon Cyan Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

      {/* Header Badge */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50/90 border border-cyan-200 text-cyan-800 text-xs font-mono uppercase tracking-wider mb-3 font-semibold shadow-xs">
          <Activity size={14} className="text-cyan-600 animate-pulse" />
          <span>Interactive Clinical Assessment</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Describe Your Symptoms
        </h2>
        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto leading-relaxed">
          Input your discomfort or tap one of the common presets below for instant, non-prescription guidance.
        </p>
      </div>

      {/* Category Tabs for Quick Filtering */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
          <span className="flex items-center gap-1 text-cyan-700 font-semibold">
            <Sparkles size={12} className="text-cyan-500" />
            POPULAR SYMPTOM CATEGORIES
          </span>
          <span className="text-slate-400">Click to filter</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Common', icon: '✨' },
            { id: 'cold', label: 'Cold & Cough', icon: '❄️' },
            { id: 'fever', label: 'Fever & Warmth', icon: '🔥' },
            { id: 'skin', label: 'Skin & Cuts', icon: '🩹' },
            { id: 'stomach', label: 'Stomach & Gut', icon: '🍵' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono whitespace-nowrap transition-all cursor-pointer border ${
                activeTab === cat.id
                  ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Presets List */}
      <div className="mb-6 flex flex-wrap gap-2">
        {currentPresets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSymptom(preset.text)}
            className="px-3 py-1.5 rounded-xl text-xs bg-white hover:bg-cyan-50/70 text-slate-700 hover:text-cyan-800 border border-slate-200/90 hover:border-cyan-300 transition-all cursor-pointer shadow-2xs font-medium flex items-center gap-1.5"
          >
            <span>{preset.icon}</span>
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {/* Symptom Description Field */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 mb-1.5 uppercase">
            <span>Symptom Details</span>
            <span className="text-slate-400 font-normal">{symptom.length} characters</span>
          </div>
          <div className="relative">
            <textarea
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              required
              rows={3}
              placeholder="e.g., I have a scratchy throat, light headache, and feeling cold since yesterday..."
              className="w-full px-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 focus:outline-none transition-all resize-none text-sm shadow-xs"
            />
          </div>
        </div>

        {/* Duration & Severity Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 mb-1.5 uppercase">
              <Clock size={13} className="text-cyan-600" /> Duration
            </label>
            <div className="flex gap-1.5 mb-2">
              {['Today', '1-2 days', '3-5 days', '1 week+'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                    duration === d
                      ? 'bg-cyan-50 border-cyan-400 text-cyan-800 font-semibold'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Custom duration..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-cyan-500 focus:outline-none text-xs shadow-xs"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 mb-1.5 uppercase">
              <ShieldCheck size={13} className="text-emerald-600" /> Severity Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Mild', label: 'Mild', desc: 'Home manageable' },
                { id: 'Moderate', label: 'Moderate', desc: 'Watch closely' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSeverity(lvl.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    severity === lvl.id
                      ? 'bg-cyan-50 border-cyan-400 text-cyan-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-mono font-bold uppercase">{lvl.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Age Bracket */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 mb-1.5 uppercase">
            <UserCheck size={13} className="text-blue-600" /> Patient Age Group
          </label>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 border border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 focus:outline-none text-sm cursor-pointer shadow-xs"
          >
            <option value="Adult (18-64)">Adult (18 - 64 years)</option>
            <option value="Senior (65+)">Senior (65+ years)</option>
            <option value="Teen (13-17)">Adolescent / Teen (13 - 17 years)</option>
            <option value="Child (2-12)">Child (2 - 12 years)</option>
            <option value="Infant (Under 2)">Infant (Under 2 years)</option>
          </select>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.015, boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.4)' }}
          whileTap={{ scale: 0.985 }}
          type="submit"
          className="w-full relative overflow-hidden py-4 rounded-2xl font-bold font-mono tracking-wider text-sm uppercase bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-md border border-cyan-300/40 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Zap size={18} className="text-cyan-200" />
            Generate Home-Care Guidance
            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      </form>
    </motion.div>
  );
};
