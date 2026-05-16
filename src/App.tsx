import React, { useState, useEffect, useCallback } from 'react';
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
  Zap
} from 'lucide-react';

const App = () => {
  const [step, setStep] = useState('idle'); // idle, uploading, storing, interacting, success
  const [file, setFile] = useState(null);
  const [miloUrl, setMiloUrl] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [agentLogs, setAgentLogs] = useState([]);
  const [finalJson, setFinalJson] = useState(null);

  const STAGES = {
    IDLE: 'idle',
    UPLOADING: 'uploading',
    STORING: 'storing',
    INTERACTING: 'interacting',
    SUCCESS: 'success'
  };

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      startWorkflow(selectedFile);
    }
  };

  const addLog = (msg) => {
    setAgentLogs(prev => [...prev, { id: Date.now(), text: msg }]);
  };

  const startWorkflow = async (file) => {
    // 1. 开始上传
    setStep(STAGES.UPLOADING);
    addLog(`正在读取文件: ${file.name}...`);
    
    // 模拟文件上传耗时
    await new Promise(r => setTimeout(r, 1500));
    
    // 2. 存储到 Milo
    setStep(STAGES.STORING);
    addLog("正在请求 Milo 存储服务分配地址...");
    await new Promise(r => setTimeout(r, 1200));
    const fakeMiloUrl = `milo://bucket-tunnel-co/bids/${Date.now()}-${file.name}`;
    setMiloUrl(fakeMiloUrl);
    addLog(`文件已成功存入 Milo: ${fakeMiloUrl}`);

    // 3. 与 Agent 交互
    setStep(STAGES.INTERACTING);
    await runAgentSimulation();
  };

  const runAgentSimulation = async () => {
    const tasks = [
      { msg: "Agent 激活: 隧道股份专项解析引擎已上线", progress: 10 },
      { msg: "正在检索 Milo 存储内容...", progress: 25 },
      { msg: "语义分析: 正在识别工程标段、金额与工期...", progress: 45 },
      { msg: "合规性审查: 正在比对隧道建设行业标准...", progress: 70 },
      { msg: "结构化转换: 正在生成 JSON 数据对象...", progress: 90 },
      { msg: "交互完成: 结构化数据已就绪", progress: 100 }
    ];

    for (const task of tasks) {
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
      addLog(task.msg);
      setAnalysisProgress(task.progress);
    }

    // 最终生成的 JSON 串
    const mockJson = {
      project_name: "隧道股份上海路桥建设工程",
      bid_id: "SH-TUNNEL-2024-089",
      submission_date: new Date().toLocaleDateString(),
      milo_path: miloUrl,
      entities: {
        company: "上海隧道股份有限公司",
        amount: "￥125,000,000.00",
        duration: "540 days"
      },
      agent_confidence: 0.98,
      status: "VERIFIED"
    };

    setFinalJson(mockJson);
    setStep(STAGES.SUCCESS);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        {/* 头部 */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Agent 开发者大赛 <span className="text-cyan-500">·</span> 智能标书Agent</h1>
          </div>
          <p className="text-slate-400 max-w-2xl">
            欢迎参加隧道股份 Agent 应用挑战赛。请上传项目标书（PDF/Word），我们的智能 Agent 将自动解析内容并存储至 Milo 系统。
          </p>
        </header>

        {/* 主内容区 */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 左侧：操作区 */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`p-6 rounded-2xl border transition-all duration-500 ${step === STAGES.IDLE ? 'bg-slate-900/50 border-slate-800 shadow-xl' : 'bg-slate-900/20 border-slate-800/50 opacity-60'}`}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" /> 文件上传
              </h2>
              
              <label className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${step === STAGES.IDLE ? 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/50' : 'border-slate-800 cursor-not-allowed'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-10 h-10 text-slate-500 mb-3" />
                  <p className="mb-2 text-sm text-slate-400">点击或拖拽上传</p>
                  <p className="text-xs text-slate-500 uppercase">Word, PDF (Max 10MB)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  disabled={step !== STAGES.IDLE}
                  accept=".pdf,.doc,.docx"
                />
              </label>
            </div>

            {/* 存储信息卡片 */}
            {(step !== STAGES.IDLE) && (
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" /> Milo 存储状态
                </h3>
                {miloUrl ? (
                  <div className="space-y-2">
                    <div className="text-xs font-mono bg-black/40 p-3 rounded border border-slate-800 break-all text-cyan-400">
                      {miloUrl}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> 地址已锁定，可供后续流程调用
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">正在分配存储地址...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            <div className="h-full min-h-[500px] rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden flex flex-col relative shadow-2xl">
              
              {/* 背景格栅 */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

              {/* 顶部状态条 */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${step === STAGES.INTERACTING ? 'bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-600'}`} />
                  <span className="text-sm font-medium tracking-wide">
                    {step === STAGES.IDLE && "等待任务初始化..."}
                    {step === STAGES.UPLOADING && "文件传输中..."}
                    {step === STAGES.STORING && "存储寻址中..."}
                    {step === STAGES.INTERACTING && "Agent 深度解析中..."}
                    {step === STAGES.SUCCESS && "解析任务完成"}
                  </span>
                </div>
                {step === STAGES.INTERACTING && (
                  <span className="text-xs font-mono text-cyan-500">{analysisProgress}%</span>
                )}
              </div>

              {/* 可视化核心内容 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-sm relative z-10 custom-scrollbar">
                {step === STAGES.IDLE && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
                    <Cpu className="w-16 h-16 stroke-[1]" />
                    <p>等待上传指令激活 Agent</p>
                  </div>
                )}

                {/* 实时日志流 */}
                {agentLogs.map((log) => (
                  <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-slate-600">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                    <span className={log.text.includes('milo') ? 'text-amber-400' : 'text-slate-300'}>
                      <span className="text-cyan-500 mr-2">➜</span> {log.text}
                    </span>
                  </div>
                ))}

                {/* Agent 思考动画可视化 */}
                {step === STAGES.INTERACTING && (
                  <div className="py-8 flex flex-col items-center justify-center">
                    <div className="relative">
                      {/* 中心核心 */}
                      <div className="w-24 h-24 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center relative z-20 overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent animate-spin-slow" />
                        <Layers className="w-10 h-10 text-cyan-400 relative z-10" />
                      </div>
                      
                      {/* 轨道动画 */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-cyan-500/10 rounded-full animate-ping-slow" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border border-cyan-500/5 rounded-full" />
                      
                      {/* 数据粒子飞向核心 */}
                      {[...Array(6)].map((_, i) => (
                        <div 
                          key={i}
                          className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-particle"
                          style={{ 
                            top: '50%', 
                            left: '50%', 
                            '--tx': `${Math.cos(i * 60 * Math.PI/180) * 120}px`,
                            '--ty': `${Math.sin(i * 60 * Math.PI/180) * 120}px`,
                            animationDelay: `${i * 0.2}s`
                          }}
                        />
                      ))}
                    </div>
                    <div className="mt-12 w-full max-w-md bg-slate-800/50 h-1.5 rounded-full overflow-hidden border border-slate-700">
                      <div 
                        className="h-full bg-cyan-500 transition-all duration-500 ease-out" 
                        style={{ width: `${analysisProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {step === STAGES.SUCCESS && finalJson && (
                  <div className="space-y-6 mt-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-emerald-400 font-semibold">解析成功</h4>
                        <p className="text-xs text-slate-400">数据已结构化并就绪，可供下游 Agent 使用。</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-black/60 overflow-hidden shadow-inner group">
                      <div className="px-4 py-2 bg-slate-800/50 flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-400">STRUCTURED_OUTPUT.JSON</span>
                        </div>
                        <button className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest">Copy JSON</button>
                      </div>
                      <pre className="p-5 text-cyan-300 text-xs overflow-x-auto leading-relaxed scrollbar-thin">
                        {JSON.stringify(finalJson, null, 2)}
                      </pre>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm transition-all flex items-center gap-2"
                      >
                        处理下一个文件 <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 底部装饰 */}
              <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 text-[10px] flex justify-between text-slate-500 font-mono tracking-widest">
                <span>SYSTEM: AGENT_RUNNER_v4.2.0</span>
                <span>ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </main>

        {/* 底部版权 */}
        <footer className="mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span>Tunnel Co. Ltd</span>
            <span className="text-slate-800">|</span>
            <span>Agent Competition 2024</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-cyan-500 transition-colors">Documentation</a>
            <a href="#" className="hover:text-cyan-500 transition-colors">Support</a>
            <a href="#" className="hover:text-cyan-500 transition-colors">Milo API</a>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ping-slow {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        @keyframes particle {
          0% { transform: translate(-50%, -50%) translate(var(--tx), var(--ty)); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(-50%, -50%) translate(0, 0); opacity: 0.2; }
        }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        .animate-ping-slow { animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-particle { animation: particle 1.5s ease-in infinite; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};

export default App;