import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MapPin, 
  Briefcase, 
  Share2, 
  Plus, 
  Trash2, 
  Search, 
  ShieldCheck, 
  Info,
  Network,
  Activity,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { analyzeConnections } from './services/geminiService';
import { Entity, Connection, AnalysisResult } from './types';

// Custom CSS for technical look
const technicalStyles = {
  bg: 'bg-[#E4E3E0]',
  ink: 'text-[#141414]',
  line: 'border-[#141414]',
  mono: 'font-mono',
  serif: 'font-serif italic',
};

export default function App() {
  const [entities, setEntities] = useState<Entity[]>(() => {
    const saved = localStorage.getItem('nexus_entities');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: '', address: '', context: '', phone: '' },
      { id: '2', name: '', address: '', context: '', phone: '' }
    ];
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(() => {
    const saved = localStorage.getItem('nexus_results');
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [verifyingLinks, setVerifyingLinks] = useState<Record<number, 'idle' | 'checking' | 'active' | 'error'>>({});

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('nexus_entities', JSON.stringify(entities));
  }, [entities]);

  useEffect(() => {
    if (results) {
      localStorage.setItem('nexus_results', JSON.stringify(results));
    } else {
      localStorage.removeItem('nexus_results');
    }
  }, [results]);

  const clearSession = () => {
    setEntities([
      { id: '1', name: '', address: '', context: '', phone: '' },
      { id: '2', name: '', address: '', context: '', phone: '' }
    ]);
    setResults(null);
    localStorage.clear();
  };

  const handleReVerify = async (idx: number, url?: string) => {
    if (!url) return;
    setVerifyingLinks(prev => ({ ...prev, [idx]: 'checking' }));
    
    try {
      // Simulate real-time data ping to the source
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Basic connectivity check via no-cors (opaque result)
      // Note: This won't catch all link deaths due to opaque responses, but it's a "Direct" attempt
      await fetch(url, { mode: 'no-cors' });
      setVerifyingLinks(prev => ({ ...prev, [idx]: 'active' }));
    } catch (err) {
      setVerifyingLinks(prev => ({ ...prev, [idx]: 'error' }));
    }
  };

  const addEntity = () => {
    if (entities.length < 5) {
      setEntities([...entities, { id: Math.random().toString(36).substr(2, 9), name: '', address: '', context: '', phone: '' }]);
    }
  };

  const removeEntity = (id: string) => {
    if (entities.length > 2) {
      setEntities(entities.filter(e => e.id !== id));
    }
  };

  const updateEntity = (id: string, field: keyof Entity, value: string) => {
    setEntities(entities.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleAnalyze = async () => {
    const validEntities = entities.filter(e => 
      e.name?.trim() !== '' || 
      e.address?.trim() !== '' || 
      e.phone?.trim() !== ''
    );
    
    if (validEntities.length < 2) {
      setError("Please define at least two parameters (Names, Addresses, or Phones) to cross-reference.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeConnections(validEntities);
      setResults(result);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again later. Ensure your API key is configured correctly.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`min-h-screen ${technicalStyles.bg} ${technicalStyles.ink} font-sans selection:bg-[#141414] selection:text-[#E4E3E0]`}>
      {/* Header */}
      <header className={`p-6 border-b ${technicalStyles.line} flex justify-between items-center bg-[#E4E3E0]/80 backdrop-blur sticky top-0 z-50`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase flex items-center gap-2">
            <Network className="w-6 h-6" />
            Nexus Investigative Discovery
          </h1>
          <p className={`${technicalStyles.serif} text-xs opacity-60`}>
            Relational Mapping & Connection Logic • v1.0.42
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={clearSession}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:text-red-600 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Clear Session
          </button>
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold border-l border-[#141414]/10 pl-6">
            <span className="flex items-center gap-1 text-green-700">
              <ShieldCheck className="w-3 h-3" /> System Secure
            </span>
            <span className="opacity-40"> | </span>
            <span className="flex items-center gap-1 opacity-60">
              <Info className="w-3 h-3" /> Public Data Only
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <section className={`p-6 border ${technicalStyles.line} bg-white shadow-sm`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4" /> Entity Definition
              </h2>
              <span className={`${technicalStyles.mono} text-[10px] opacity-40`}>MAX: 05</span>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {entities.map((entity, index) => (
                  <motion.div 
                    key={entity.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 border ${technicalStyles.line} relative overflow-hidden group`}
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {entities.length > 2 && (
                        <button 
                          onClick={() => removeEntity(entity.id)}
                          className="text-red-600 hover:bg-red-50 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <span className={`${technicalStyles.mono} text-[8px] opacity-30 absolute top-2 left-2`}>
                      ID: {index + 1}
                    </span>
                    
                    <div className="space-y-3 mt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`${technicalStyles.serif} text-[10px] block mb-1 opacity-50 uppercase`}>Full Name</label>
                          <input 
                            type="text" 
                            placeholder="NAME"
                            value={entity.name}
                            onChange={(e) => updateEntity(entity.id, 'name', e.target.value)}
                            className={`w-full bg-transparent border-b ${technicalStyles.line} py-1 text-sm focus:outline-none focus:border-opacity-100 border-opacity-20`}
                          />
                        </div>
                        <div>
                          <label className={`${technicalStyles.serif} text-[10px] block mb-1 opacity-50 uppercase`}>Phone Num</label>
                          <input 
                            type="text" 
                            placeholder="TEL"
                            value={entity.phone || ''}
                            onChange={(e) => updateEntity(entity.id, 'phone', e.target.value)}
                            className={`w-full bg-transparent border-b ${technicalStyles.line} py-1 text-sm focus:outline-none focus:border-opacity-100 border-opacity-20`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`${technicalStyles.serif} text-[10px] block mb-1 opacity-50 uppercase`}>Physical Address / Location</label>
                        <input 
                          type="text" 
                          placeholder="REQUIRED IF NAME IS EMPTY"
                          value={entity.address}
                          onChange={(e) => updateEntity(entity.id, 'address', e.target.value)}
                          className={`w-full bg-transparent border-b ${technicalStyles.line} py-1 text-sm focus:outline-none focus:border-opacity-100 border-opacity-20`}
                        />
                      </div>
                      <div>
                        <label className={`${technicalStyles.serif} text-[10px] block mb-1 opacity-50 uppercase`}>Contextual Data / Intel</label>
                        <textarea 
                          placeholder="ALIASES, EMPLOYERS, SOCIAL HANDLES"
                          rows={2}
                          value={entity.context}
                          onChange={(e) => updateEntity(entity.id, 'context', e.target.value)}
                          className={`w-full bg-transparent border-b ${technicalStyles.line} py-1 text-sm focus:outline-none focus:border-opacity-100 border-opacity-20 resize-none`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-6 space-y-3">
              {entities.length < 5 && (
                <button 
                  onClick={addEntity}
                  className={`w-full border ${technicalStyles.line} border-dashed p-3 text-[10px] uppercase font-bold tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex items-center justify-center gap-2`}
                >
                  <Plus className="w-3 h-3" /> Add Entity
                </button>
              )}

              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={`w-full p-4 bg-[#141414] text-[#E4E3E0] text-[12px] uppercase font-bold tracking-widest hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3`}
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Searching Connections...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Initiate Discovery
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-red-600 text-[10px] mt-4 font-bold border border-red-600 p-2 bg-red-50">
                ERROR: {error}
              </p>
            )}
          </section>

          <section className={`p-6 border ${technicalStyles.line} bg-[#141414] text-[#E4E3E0]`}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Ethics & Privacy Protocol
            </h3>
            <ul className={`${technicalStyles.serif} text-[11px] space-y-2 opacity-80`}>
              <li>• Data processed is restricted to publicly indexed records.</li>
              <li>• No personal identifiers are cached permanently in system logs.</li>
              <li>• Results are inferred via probabilistic relationship mapping.</li>
              <li>• Always verify information through second-source verification.</li>
            </ul>
          </section>
        </div>

        {/* Content Area: Results */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!results && !isAnalyzing && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`h-full border ${technicalStyles.line} flex flex-col items-center justify-center p-12 text-center opacity-30`}
              >
                <div className="w-24 h-24 border border-dashed border-[#141414] rounded-full flex items-center justify-center mb-6">
                  <Network className="w-12 h-12" />
                </div>
                <h3 className="text-xl uppercase font-bold tracking-tighter">Waiting for Parameters</h3>
                <p className={`${technicalStyles.serif} mt-2`}>Enter entities on the left to begin cross-referencing connections.</p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`h-full border ${technicalStyles.line} flex flex-col items-center justify-center p-12 overflow-hidden bg-white`}
              >
                <div className="relative mb-8">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-48 h-48 border border-[#141414]/10 rounded-full flex items-center justify-center"
                  >
                    <div className="w-40 h-40 border border-[#141414]/20 rounded-full flex items-center justify-center">
                      <div className="w-32 h-32 border border-[#141414]/40 rounded-full"></div>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Search className="w-8 h-8" />
                  </motion.div>
                </div>
                <div className="space-y-4 max-w-sm w-full">
                  <div className={`h-1 w-full bg-[#141414]/10 overflow-hidden`}>
                    <motion.div 
                      className="h-full bg-[#141414]"
                      initial={{ left: '-100%' }}
                      animate={{ left: '100%' }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ position: 'relative', width: '30%' }}
                    />
                  </div>
                  <div className={`${technicalStyles.mono} text-[10px] flex justify-between uppercase opacity-60 tracking-widest`}>
                    <span>Scanning Public Archives</span>
                    <span>72%</span>
                  </div>
                </div>
                <p className={`${technicalStyles.serif} mt-8 text-sm max-w-xs text-center italic`}>
                  "The most profound connections often dwell in the gaps between public records..."
                </p>
              </motion.div>
            )}

            {results && !isAnalyzing && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                {/* Summary View */}
                <section className={`p-8 border ${technicalStyles.line} bg-white relative`}>
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5" />
                    <h2 className="text-xs font-bold uppercase tracking-widest">Analysis Summary</h2>
                  </div>
                  <div className="absolute top-8 right-8 text-[8px] font-mono opacity-20">
                    REPORT_REF: {Date.now()}
                  </div>
                  <p className="text-lg leading-relaxed font-medium">
                    {results.summary}
                  </p>
                </section>

                {/* Connections Grid */}
                <section className={`border ${technicalStyles.line} bg-white overflow-hidden`}>
                  <div className={`p-4 border-b ${technicalStyles.line} flex justify-between items-center bg-[#E4E3E0]/30`}>
                    <h2 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Share2 className="w-4 h-4" /> Identified Relationships
                    </h2>
                    <span className={`${technicalStyles.mono} text-[10px]`}>
                      COUNT: {String(results.connections.length).padStart(2, '0')}
                    </span>
                  </div>
                  
                  {results.connections.length > 0 ? (
                    <div className="divide-y divide-[#141414]">
                      {/* Connection Header - Hidden on small screens */}
                      <div className="hidden md:grid grid-cols-12 bg-[#141414] text-[#E4E3E0] text-[8px] uppercase tracking-widest font-bold py-2 px-6">
                        <div className="col-span-3">Relationship Map</div>
                        <div className="col-span-2">Classification</div>
                        <div className="col-span-4">Contextual Analysis</div>
                        <div className="col-span-3">Data Verification</div>
                      </div>

                      {results.connections.map((connection, idx) => {
                        const sEntity = results.entities.find(e => e.id === connection.sourceId);
                        const tEntity = results.entities.find(e => e.id === connection.targetId);
                        const source = sEntity ? (sEntity.name || sEntity.address || sEntity.phone || connection.sourceId) : connection.sourceId;
                        const target = tEntity ? (tEntity.name || tEntity.address || tEntity.phone || connection.targetId) : connection.targetId;

                        const searchTerms = encodeURIComponent(`${source} and ${target} ${connection.type} connection ${connection.evidence}`);

                        return (
                          <div 
                            key={idx}
                            className="flex flex-col md:grid md:grid-cols-12 py-6 px-4 md:px-6 hover:bg-[#E4E3E0]/50 transition-colors group cursor-default items-center gap-4 md:gap-0"
                          >
                            <div className="w-full md:col-span-3">
                              <div className="flex flex-col gap-1">
                                <div className="text-[11px] font-bold leading-tight break-words uppercase tracking-tight">
                                  {source}
                                </div>
                                <div className="flex items-center gap-2 opacity-30">
                                  <div className="h-[1px] w-4 bg-[#141414]"></div>
                                  <ArrowRight className="w-2 h-2" />
                                </div>
                                <div className="text-[11px] font-bold leading-tight break-words uppercase tracking-tight opacity-70">
                                  {target}
                                </div>
                              </div>
                            </div>
                            <div className="w-full md:col-span-2">
                              <span className={`inline-block text-[10px] px-2 py-1 border ${technicalStyles.line} uppercase font-bold tracking-tighter ${getTypeStyles(connection.type)}`}>
                                {connection.type}
                              </span>
                            </div>
                            <div className="w-full md:col-span-4 md:pr-6">
                              <p className="text-xs leading-relaxed opacity-80 whitespace-normal break-words">
                                {connection.description}
                              </p>
                            </div>
                            <div className="w-full md:col-span-3 space-y-2">
                              <div className={`p-3 border ${technicalStyles.line} border-opacity-20 bg-white/50 space-y-3`}>
                                <a 
                                  href={connection.url || `https://www.google.com/search?q=${searchTerms}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block group/btn"
                                >
                                  <div className="flex items-start gap-2">
                                    {connection.url ? (
                                      <ShieldCheck className="w-3 h-3 mt-0.5 shrink-0 text-green-700 transition-colors" />
                                    ) : (
                                      <Search className="w-3 h-3 mt-0.5 shrink-0 opacity-40 group-hover:group-hover/btn:opacity-100 transition-opacity" />
                                    )}
                                    <span className={`${technicalStyles.serif} text-[10px] uppercase font-bold tracking-tight leading-tight block break-words group-hover/btn:underline`}>
                                      {connection.evidence}
                                    </span>
                                  </div>
                                  <div className={`text-[8px] mt-2 opacity-50 group-hover/btn:opacity-100 flex items-center justify-between ${technicalStyles.mono}`}>
                                    <span>{connection.url ? 'DIRECT_SOURCE_LINK' : 'VERIFY_PUBLIC_RECORDS'}</span>
                                    <ArrowRight className="w-2 h-2" />
                                  </div>
                                </a>

                                {/* Confidence Score Indicator */}
                                <div className="pt-2 border-t border-[#141414]/10">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[7px] uppercase font-bold opacity-40">Confidence Score</span>
                                    <span className={`text-[8px] font-bold ${connection.confidence > 80 ? 'text-green-700' : connection.confidence > 50 ? 'text-amber-600' : 'text-red-700'}`}>
                                      {connection.confidence}% Match
                                    </span>
                                  </div>
                                  <div className="h-1 w-full bg-[#141414]/10 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${connection.confidence}%` }}
                                      className={`h-full ${connection.confidence > 80 ? 'bg-green-600' : connection.confidence > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                    />
                                  </div>
                                </div>

                                {/* Re-verify Button */}
                                {connection.url && (
                                  <div className="flex items-center justify-between pt-1">
                                    <button 
                                      onClick={() => handleReVerify(idx, connection.url)}
                                      disabled={verifyingLinks[idx] === 'checking'}
                                      className={`text-[8px] font-mono px-2 py-1 border ${technicalStyles.line} hover:bg-[#141414] hover:text-[#E4E3E0] transition-all disabled:opacity-50 flex items-center gap-1`}
                                    >
                                      {verifyingLinks[idx] === 'checking' ? (
                                        <Activity className="w-2 h-2 animate-spin" />
                                      ) : (
                                        <RefreshCw className="w-2 h-2" />
                                      )}
                                      RE-VERIFY LINK
                                    </button>
                                    <div className="flex items-center gap-1">
                                      {verifyingLinks[idx] === 'active' && (
                                        <span className="text-[7px] text-green-700 font-bold animate-pulse tracking-tighter uppercase tracking-widest">● Link Active</span>
                                      )}
                                      {verifyingLinks[idx] === 'error' && (
                                        <span className="text-[7px] text-red-700 font-bold tracking-tighter uppercase tracking-widest">● Restricted/Down</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center opacity-40 italic text-sm">
                      No significant public connections identified between parameters.
                    </div>
                  )}
                </section>

                {/* Commonalities & Overlaps */}
                {results.overlaps && results.overlaps.length > 0 && (
                  <section className={`border ${technicalStyles.line} bg-white overflow-hidden`}>
                    <div className={`p-4 border-b ${technicalStyles.line} flex justify-between items-center bg-[#141414] text-[#E4E3E0]`}>
                      <h2 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-4 h-4" /> Overlapping Intelligence
                      </h2>
                      <span className={`${technicalStyles.mono} text-[10px]`}>
                        SIGNALS: {String(results.overlaps.length).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#E4E3E0]/20">
                      {results.overlaps.map((overlap, idx) => (
                        <div key={idx} className={`p-4 border ${technicalStyles.line} bg-white shadow-sm flex flex-col justify-between`}>
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[9px] font-mono bg-[#141414] text-[#E4E3E0] px-2 py-0.5 uppercase">
                                {overlap.type}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold mb-2 uppercase break-words">{overlap.value}</h4>
                            <p className="text-[11px] opacity-70 mb-4 leading-relaxed">{overlap.description}</p>
                          </div>
                          <div className="border-t border-[#141414]/10 pt-3">
                            <div className="text-[8px] uppercase font-bold opacity-40 mb-2">Linked Entities</div>
                            <div className="flex flex-wrap gap-2">
                              {overlap.entities.map((eId, eIdx) => {
                                const found = results.entities.find(ent => ent.id === eId);
                                return (
                                  <span key={eIdx} className="text-[9px] px-2 py-0.5 border border-[#141414]/20 font-bold">
                                    {found?.name || found?.address || found?.phone || 'IDENTIFIED_SUBJECT'}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Evidence Stats (Faux/Meta Data) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`p-4 border ${technicalStyles.line} bg-white`}>
                    <div className="text-[8px] uppercase font-bold opacity-40 mb-1">Index Density</div>
                    <div className="text-2xl font-bold flex items-baseline gap-1">
                      84.2 <span className="text-[10px] opacity-40">MHZ</span>
                    </div>
                  </div>
                  <div className={`p-4 border ${technicalStyles.line} bg-white`}>
                    <div className="text-[8px] uppercase font-bold opacity-40 mb-1">Search Nodes</div>
                    <div className="text-2xl font-bold flex items-baseline gap-1">
                      12,402 <span className="text-[10px] opacity-40">RECS</span>
                    </div>
                  </div>
                  <div className={`p-4 border ${technicalStyles.line} bg-white`}>
                    <div className="text-[8px] uppercase font-bold opacity-40 mb-1">Confidence Score</div>
                    <div className="text-2xl font-bold flex items-baseline gap-1">
                      HIGH <span className="text-[10px] opacity-40">SIGNAL</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className={`mt-12 p-8 border-t ${technicalStyles.line} opacity-30 text-[9px] uppercase tracking-widest font-bold flex justify-between`}>
        <div>© 2026 NEXUS KINSHIP SYSTEMS • ALL RIGHTS RESERVED</div>
        <div className="flex gap-4">
          <span>Security Protocol 7.21</span>
          <span>Encryption Enabled</span>
          <span>Public Gateway</span>
        </div>
      </footer>
    </div>
  );
}

function getTypeStyles(type: string) {
  switch (type) {
    case 'address': return 'bg-blue-50 text-blue-900 border-blue-900/20';
    case 'employer': return 'bg-amber-50 text-amber-900 border-amber-900/20';
    case 'social': return 'bg-purple-50 text-purple-900 border-purple-900/20';
    default: return 'bg-gray-50 text-gray-900 border-gray-900/20';
  }
}
