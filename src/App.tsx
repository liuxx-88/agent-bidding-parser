import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Cpu, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Terminal,
  ChevronRight,
  Code2,
  Layers,
  Zap,
  Search,
  MessageSquare,
  BookOpen,
  AlertTriangle
} from 'lucide-react';

// 模拟从上传的“标准化施工工艺库.json”中提取的数据
const KNOWLEDGE_BASE = [
  {
    "工艺名称": "高地应力软岩隧道双层支护施工工艺",
    "匹配关键词": ["软岩", "高地应力", "变形", "支护"],
    "适用条件": "埋深≥300m，岩石强度≤25MPa",
    "核心要点": "采用初期支护+加强支护的双层模式"
  },
  {
    "工艺名称": "隧道施工职业健康监控工艺",
    "匹配关键词": ["监控", "职业健康", "粉尘", "噪声"],
    "适用条件": "所有隧道施工作业环境",
    "核心要点": "每月至少检测1次粉尘，设置噪声隔离区"
  },
  {
    "工艺名称": "隧道湿式凿岩与通风除尘工艺",
    "匹配关键词": ["通风", "除尘", "爆破", "湿式作业"],
    "适用条件": "钻孔、爆破、装渣作业阶段",
    "核心要点": "强制机械通风，爆破后喷雾降尘"
  }
];

const App = () => {
  const [step, setStep] = useState('idle'); // idle, uploading, storing, interacting, success
  const [file, setFile] = useState(null);
  const [miloUrl, setMiloUrl] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [agentLogs, setAgentLogs] = useState([]);
  const [finalJson, setFinalJson] = useState(null);
  const [ragMatches, setRagMatches] = useState([]);
  const [activeTab, setActiveTab] = useState('json'); // json, rag, chat
  
  const STAGES = {
    IDLE: 'idle',
    UPLOADING: 'uploading',
    STORING: 'storing',
    INTERACTING: 'interacting',
    SUCCESS: 'success'
  };

  const addLog = (msg) => {
    setAgentLogs(prev => [...prev, { id: Date.now(), text: msg }]);
  };

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      startWorkflow(selectedFile);
    }
  };

  const startWorkflow = async (file) => {
    setStep(STAGES.UPLOADING);
    addLog(`正在读取文件: ${file.name}...`);
    await new Promise(r => setTimeout(r, 1200));
    
    setStep(STAGES.STORING);
    addLog("正在请求 Milo 存储服务分配地址...");
    await new Promise(r => setTimeout(r, 1000));
    const fakeMiloUrl = `milo://bucket-tunnel-co/bids/${Date.now()}-${file.name}`;
    setMiloUrl(fakeMiloUrl);
    addLog(`文件已成功存入 Milo 系统，准备发起 Agent 任务...`);

    setStep(STAGES.INTERACTING);
    await runAgentSimulation();
  };

  const runAgentSimulation = async () => {
    const tasks = [
      { msg: "Agent 激活: 隧道股份专项解析引擎 v4.2 已上线", progress: 15 },
      { msg: "NLP 解析: 提取标书关键工程量与地质参数...", progress: 35 },
      { msg: "RAG 检索开启: 正在扫描《标准化施工工艺库》...", progress: 55 },
      { msg: "工艺比对: 发现标书描述与 '高地应力软岩' 工艺高度匹配", progress: 75 },
      { msg: "知识提取: 正在生成结构化 JSON 与 施工建议...", progress: 90 },
      { msg: "任务完成: 结果已就绪", progress: 100 }
    ];

    for (const task of tasks) {
      await new Promise(r => setTimeout(r, 800 + Math.random() * 800));
      addLog(task.msg);
      setAnalysisProgress(task.progress);
    }

    // 模拟基于标书内容的 RAG 匹配结果
    setRagMatches(KNOWLEDGE_BASE.slice(0, 2));

    const mockJson = {
      project_name: "隧道股份上海某标段地下空间开发项目",
      bid_id: "STEC-2024-BID-009",
      geology: "高地应力软岩段 (预计变形量 > 200mm)",
      milo_path: miloUrl,
      entities: {
        company: "上海隧道股份有限公司",
        amount: "￥125,000,000.00",
        duration: "540 days"
      },
      rag_status: "COMPLETED",
      matched_standards: ["工艺库-001", "职业健康-005"]
    };

    setFinalJson(mockJson);
    setStep(STAGES.SUCCESS);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* 背景动态装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* 导航/头部 */}
        <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-xl border border-cyan-500/40">
              <Zap className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Agent 竞标书自动化系统</h1>
              <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">STEC Intelligence Framework</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-mono">MILO_STATUS: <span className="text-emerald-400">ONLINE</span></span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 左侧：输入与状态 */}
          <div className="lg:col-span-4 space-y-6">
            <section className={`p-6 rounded-2xl border transition-all duration-500 ${step === STAGES.IDLE ? 'bg-slate-900 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'bg-slate-900/40 border-slate-800'}`}>
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-slate-300">
                <Upload className="w-4 h-4 text-cyan-400" /> 1. 上传标书原文
              </h2>
              <label className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${step === STAGES.IDLE ? 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800' : 'border-slate-800 opacity-50 cursor-not-allowed'}`}>
                <FileText className={`w-8 h-8 mb-2 ${step === STAGES.IDLE ? 'text-slate-400' : 'text-slate-600'}`} />
                <span className="text-xs text-slate-400">点击或拖拽 PDF / Word</span>
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={step !== STAGES.IDLE} accept=".pdf,.doc,.docx" />
              </label>
            </section>

            {/* 知识库挂载状态 */}
            <section className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> 知识库底座 (RAG Source)
              </h2>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center">
                      <Code2 className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="text-xs font-medium">标准化施工工艺库.json</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                  * 系统已自动索引该知识库，用于对标书内容进行合规性审查。
                </p>
              </div>
            </section>

            {/* Milo 实时地址 */}
            {miloUrl && (
              <section className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/20 animate-in fade-in slide-in-from-left-4">
                <h2 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" /> Milo 存储路径
                </h2>
                <div className="font-mono text-[10px] bg-black p-3 rounded border border-slate-800 break-all text-cyan-400">
                  {miloUrl}
                </div>
              </section>
            )}
          </div>

          {/* 右侧：交互可视化 */}
          <div className="lg:col-span-8 space-y-6">
            <div className="min-h-[600px] rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col overflow-hidden shadow-2xl relative">
              {/* 可视化顶栏 */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
                <div className="flex gap-4">
                  {['json', 'rag', 'chat'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all border-b-2 ${activeTab === tab ? 'text-cyan-400 border-cyan-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                    >
                      {tab === 'json' && '解析结果'}
                      {tab === 'rag' && 'RAG 知识检索'}
                      {tab === 'chat' && 'Agent 对话'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${step === STAGES.INTERACTING ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`} />
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{step}</span>
                </div>
              </div>

              {/* 内容滚动区 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                
                {/* 1. 运行日志 (始终显示) */}
                <div className="space-y-2 mb-6">
                  {agentLogs.map((log) => (
                    <div key={log.id} className="flex gap-3 font-mono text-xs animate-in fade-in slide-in-from-left-2">
                      <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                      <span className={log.text.includes('RAG') ? 'text-amber-400' : 'text-slate-300'}>
                        <span className="text-cyan-500 mr-1">»</span> {log.text}
                      </span>
                    </div>
                  ))}
                  {step === STAGES.INTERACTING && (
                    <div className="flex items-center gap-2 text-cyan-400 animate-pulse font-mono text-xs">
                      <Loader2 className="w-3 h-3 animate-spin" /> 执行深度推理中...
                    </div>
                  )}
                </div>

                {/* 2. 核心状态展示 */}
                {step === STAGES.INTERACTING && (
                  <div className="flex flex-col items-center py-12">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-2 border-cyan-500/20 flex items-center justify-center relative z-10">
                        <Layers className="w-10 h-10 text-cyan-400 animate-bounce" />
                        <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-spin" />
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 rounded-full animate-pulse" />
                    </div>
                    <div className="mt-10 w-full max-w-sm bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${analysisProgress}%` }} />
                    </div>
                    <span className="mt-4 text-xs font-mono text-slate-500">正在重构非结构化数据...</span>
                  </div>
                )}

                {/* 3. 结果选项卡内容 */}
                {step === STAGES.SUCCESS && (
                  <div className="animate-in fade-in zoom-in-95 duration-500">
                    {activeTab === 'json' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-mono text-slate-500 px-2">
                          <span>OUTPUT_STREAM: FINAL_RESULT</span>
                          <button className="text-cyan-500 hover:underline">COPY_JSON</button>
                        </div>
                        <pre className="bg-black/60 p-6 rounded-xl border border-slate-800 text-cyan-300 text-xs leading-relaxed overflow-x-auto">
                          {JSON.stringify(finalJson, null, 2)}
                        </pre>
                      </div>
                    )}

                    {activeTab === 'rag' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                          <h4 className="text-sm font-bold text-amber-500 mb-2 flex items-center gap-2">
                            <Search className="w-4 h-4" /> 知识库召回建议 (Top 2)
                          </h4>
                          <p className="text-xs text-slate-400 mb-4">基于标书中提及的“高地应力”、“软岩”参数，Agent 自动关联以下工艺标准：</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ragMatches.map((item, idx) => (
                              <div key={idx} className="p-4 bg-slate-800/40 border border-slate-700 rounded-lg hover:border-cyan-500/30 transition-colors">
                                <div className="text-cyan-400 text-xs font-bold mb-2 uppercase tracking-wide">{item.工艺名称}</div>
                                <div className="text-[10px] text-slate-400 leading-relaxed mb-3">
                                  <span className="text-slate-500 font-bold mr-1">适用:</span> {item.适用条件}
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                  {item.匹配关键词.map(k => (
                                    <span key={k} className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[9px] rounded border border-cyan-500/20">{k}</span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex gap-3">
                          <AlertTriangle className="w-5 h-5 text-emerald-500 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-emerald-500">RAG 合规性初评</div>
                            <p className="text-[10px] text-slate-400 mt-1">
                              当前标书施工方案与《标准化施工工艺库》匹配度为 94%。建议在职业健康监控章节增加关于“爆破后粉尘检测频率”的具体描述。
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'chat' && (
                      <div className="h-[400px] flex flex-col">
                        <div className="flex-1 space-y-4 mb-4">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 uppercase text-[10px]">User</div>
                            <div className="p-3 bg-slate-800/50 rounded-2xl rounded-tl-none text-xs text-slate-300 max-w-[80%]">
                              根据知识库，这份标书对于软岩支护的设计参数是否达标？
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                              <Cpu className="w-4 h-4" />
                            </div>
                            <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl rounded-tl-none text-xs text-slate-300 max-w-[80%] leading-relaxed">
                              基于 <span className="text-cyan-400 font-bold">RAG 检索结果</span>：标书中提到的初期支护厚度为 150mm，而《高地应力软岩隧道双层支护施工工艺》要求最小初期支护厚度为 180mm。
                              <br /><br />
                              <span className="text-amber-500">建议：</span>在最终投标文件中建议上调支护强度，以符合标准工艺库的安全要求。
                            </div>
                          </div>
                        </div>
                        <div className="mt-auto flex gap-2">
                          <input type="text" placeholder="向 Agent 询问关于知识库的内容..." className="flex-1 bg-black/40 border border-slate-800 rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-cyan-500" />
                          <button className="p-2 bg-cyan-500 rounded-lg hover:bg-cyan-600 transition-colors">
                            <ArrowRight className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 装饰性底栏 */}
              <div className="px-6 py-2 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-4">
                  <span>MODEL: GEMINI_2.5_FLASH</span>
                  <span className="text-slate-800">|</span>
                  <span>RAG_STATUS: <span className="text-emerald-500">ACTIVE</span></span>
                </div>
                <span>SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 页脚 */}
        <footer className="mt-12 pt-6 border-t border-slate-900 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em]">
            隧道股份有限公司 · Agent 大赛演示版本 · 2024
          </p>
        </footer>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;