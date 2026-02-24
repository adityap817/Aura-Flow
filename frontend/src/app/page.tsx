"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Terminal, Code2, Cpu, CheckCircle2, XCircle, Clock, Github, Twitter, Linkedin, Heart, Globe, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [task, setTask] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [thoughtStream, setThoughtStream] = useState<{ id: number; agent: string; message: string; type: "info" | "success" | "error" | "action" }[]>([]);
  const [codeOutput, setCodeOutput] = useState("");
  const [sandboxFilename, setSandboxFilename] = useState("test_script.py");
  const [currentTime, setCurrentTime] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const streamEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll thought stream
  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thoughtStream]);

  // Handle Theme Toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || isProcessing) return;

    setIsProcessing(true);
    setCodeOutput("Connecting to Aura-Flow Orchestrator...");
    setThoughtStream([
      { id: Date.now(), agent: "System", message: `Task Received: "${task}"`, type: "info" }
    ]);

    try {
      const response = await fetch("http://localhost:8000/api/run-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task })
      });

      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let parts = buffer.split('\n\n');
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (part.startsWith("data: ")) {
            const dataStr = part.slice(6);
            if (!dataStr.trim()) continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                setIsProcessing(false);
                setThoughtStream(prev => [...prev, { id: Date.now(), agent: "System Error", message: String(data.error), type: "error" }]);
                break;
              } else if (data.finished) {
                setIsProcessing(false);
                setThoughtStream(prev => [...prev, { id: Date.now(), agent: "System", message: "Flow Complete.", type: "success" }]);
              } else {
                const node = data.node;
                const state_update = data.state_update;

                if (state_update?.messages && state_update.messages.length > 0) {
                  const newMsg = state_update.messages[state_update.messages.length - 1];
                  let type: "info" | "success" | "error" | "action" = "info";
                  if (newMsg.includes("FAILED")) type = "error";
                  else if (newMsg.includes("PASSED") || newMsg.includes("Successfully")) type = "success";
                  else if (node === "coder" || node === "verifier") type = "action";

                  setThoughtStream(prev => [...prev, { id: Date.now() + Math.random(), agent: node.charAt(0).toUpperCase() + node.slice(1), message: newMsg, type }]);
                }
                if (state_update?.code_written) {
                  setCodeOutput(state_update.code_written);
                }
                if (state_update?.filename) {
                  setSandboxFilename(state_update.filename);
                }
              }
            } catch (e) {
              console.error("Parse error", e);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
      setThoughtStream(prev => [...prev, { id: Date.now(), agent: "System", message: "Failed to reach orchestrator backend.", type: "error" }]);
      setIsProcessing(false);
    }
  };

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case "Supervisor": return "text-blue-400";
      case "Researcher": return "text-purple-400";
      case "Coder": return "text-emerald-400";
      case "Verifier": return "text-amber-400";
      default: return "text-gray-400";
    }
  };

  const getLanguageIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" className="w-5 h-5 shrink-0" alt="JS" />;
      case 'ts':
      case 'tsx':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" className="w-5 h-5 shrink-0" alt="TS" />;
      case 'py':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" className="w-5 h-5 shrink-0" alt="Python" />;
      case 'go':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original.svg" className="w-5 h-5 shrink-0" alt="Go" />;
      case 'rs':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rust/rust-original.svg" className="w-5 h-5 shrink-0 invert opacity-80" alt="Rust" />;
      case 'java':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg" className="w-5 h-5 shrink-0" alt="Java" />;
      case 'cpp':
      case 'cc':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg" className="w-5 h-5 shrink-0" alt="C++" />;
      case 'c':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg" className="w-5 h-5 shrink-0" alt="C" />;
      default:
        return <Code2 className="w-5 h-5 text-purple-400 shrink-0" />;
    }
  };

  return (
    <>
      {/* Modern Top Hanger */}
      <div className="relative z-50 w-full bg-[var(--background)]/80 backdrop-blur-2xl border-b border-[var(--glass-border)] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        {/* Subtle top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 h-12 flex justify-between items-center text-xs text-gray-400 font-medium tracking-wide">
          {/* Left Side: Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-[var(--foreground)] opacity-50 uppercase tracking-widest text-[9px] font-bold mr-1">Powered BY</span>
              <div className="flex items-center gap-2 glass-panel pr-3 pl-2 py-1 rounded-full border border-[var(--glass-border)] hover:border-purple-500/30 transition-all cursor-pointer relative ml-1">
                <img src="/adiicodes.png" alt="adiicodes logo" className="w-8 h-8 absolute -left-2 top-1/2 -translate-y-1/2 z-10 drop-shadow-lg" />
                <span className="text-[var(--foreground)] font-mono text-[10px] uppercase font-bold tracking-widest ml-6">adiicodes</span>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[var(--foreground)] opacity-10">|</span>
            <span className="hidden sm:flex items-center gap-2 text-[var(--foreground)] hover:text-purple-400 opacity-60 hover:opacity-100 transition-colors cursor-default font-mono text-[10px] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Aura-Flow Beta
            </span>
          </div>

          {/* Right Side: Socials */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-[var(--foreground)] opacity-50 uppercase tracking-widest text-[9px] font-bold">Collaborate</span>
            <div className="flex items-center gap-2">
              <a href="https://github.com/adityap817" target="_blank" rel="noopener noreferrer" className="p-1.5 text-[var(--foreground)] opacity-70 glass-panel rounded-md transition-all hover:-translate-y-0.5 shadow-sm hover:text-purple-500"><Github className="w-3.5 h-3.5" /></a>
              <a href="https://www.linkedin.com/in/adityap817/" target="_blank" rel="noopener noreferrer" className="p-1.5 text-[var(--foreground)] opacity-70 glass-panel rounded-md transition-all hover:-translate-y-0.5 shadow-sm hover:text-blue-500"><Linkedin className="w-3.5 h-3.5" /></a>
              <a href="https://adityapatil8.vercel.app/" target="_blank" rel="noopener noreferrer" className="p-1.5 text-[var(--foreground)] opacity-70 glass-panel rounded-md transition-all hover:-translate-y-0.5 shadow-sm hover:text-purple-400"><Globe className="w-3.5 h-3.5" /></a>

              <div className="w-px h-4 bg-[var(--foreground)] opacity-10 mx-1"></div>

              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1.5 text-[var(--foreground)] opacity-70 glass-panel rounded-md hover:text-yellow-400 transition-all shadow-sm">
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-purple-600" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="min-h-screen p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between glass-panel rounded-2xl p-5 px-6 gap-4">
          <div className="flex items-start gap-4">
            <div className="relative mt-1">
              <Cpu className="w-8 h-8 text-purple-500" />
              {isProcessing && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
              )}
            </div>
            <div className="flex flex-col flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] mb-1">Aura-Flow</h1>
              <p className="text-xs sm:text-sm text-[var(--foreground)] opacity-60 font-mono mb-2">Multi-Agent Orchestrator</p>
              <p className="text-[11px] sm:text-xs text-[var(--foreground)] opacity-50 leading-relaxed max-w-2xl hidden md:block border-l-2 border-purple-500/30 pl-3">
                Aura-Flow is a fully autonomous, LLM-powered cognitive engine. It coordinates a team of specialized AI agents—Supervisor, Researcher, Coder, and Verifier—to dynamically analyze requirements, architect solutions, write structured code, and self-execute test suites within a secure sandboxed environment.
              </p>
            </div>
          </div>

          <div className="flex gap-4 sm:flex">
            <div className="hidden sm:flex items-center gap-2 glass-panel px-4 py-2 rounded-xl text-sm font-mono text-[var(--foreground)] opacity-80">
              <Clock className="w-4 h-4 text-purple-400" />
              {currentTime || "00:00:00"}
            </div>
            <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-xl text-sm font-mono text-[var(--foreground)]">
              <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></div>
              {isProcessing ? 'Processing' : 'Idle'}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">

          {/* Left Column: Input and Thoughts */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-[80vh]">

            {/* Task Input Block */}
            <div className="glass-panel rounded-2xl p-5 flex-shrink-0">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[var(--foreground)]">
                <Send className="w-4 h-4 text-purple-400" />
                Task Directive
              </h2>
              <form onSubmit={handleSubmitTask} className="relative">
                <textarea
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  disabled={isProcessing}
                  placeholder="Instruct the agents on what to build..."
                  className="w-full h-32 glass-input rounded-xl p-4 text-sm text-[var(--foreground)] resize-none font-mono"
                />
                <button
                  type="submit"
                  disabled={isProcessing || !task.trim()}
                  className="absolute bottom-3 right-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 disabled:text-gray-500 text-white p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Live Thought Stream */}
            <div className="glass-panel rounded-2xl p-5 flex-grow flex flex-col min-h-0">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[var(--foreground)]">
                <Terminal className="w-4 h-4 text-purple-400" />
                Agent Thought Stream
              </h2>

              <div className="flex-grow glass-input rounded-xl p-4 overflow-y-auto font-mono text-xs md:text-sm">
                {thoughtStream.length === 0 ? (
                  <div className="text-[var(--foreground)] opacity-50 h-full flex items-center justify-center italic">
                    Waiting for task directive...
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {thoughtStream.map((log) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={log.id}
                          className="flex gap-3"
                        >
                          <span className="text-[var(--foreground)] opacity-50 shrink-0">[{new Date(log.id).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                          <div>
                            <span className={`font-semibold mr-2 ${getAgentColor(log.agent)}`}>
                              {log.agent}:
                            </span>
                            <span className={
                              log.type === "error" ? "text-red-500 font-semibold" :
                                log.type === "success" ? "text-emerald-500 font-semibold" :
                                  "text-[var(--foreground)] opacity-80"
                            }>
                              {log.message}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={streamEndRef} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Code Output */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-5 h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--foreground)] overflow-hidden whitespace-nowrap text-ellipsis">
                {getLanguageIcon(sandboxFilename)}
                Sandbox Preview (/sandbox/{sandboxFilename})
              </h2>

              <button className="text-xs text-[var(--foreground)] opacity-60 hover:opacity-100 glass-panel px-3 py-1 rounded-lg">
                Copy Code
              </button>
            </div>

            <div className="flex-grow glass-input rounded-xl p-4 overflow-y-auto font-mono text-sm relative">
              {!codeOutput ? (
                <div className="text-[var(--foreground)] opacity-50 h-full flex items-center justify-center italic">
                  Source code will compile here...
                </div>
              ) : (
                <pre className="text-[var(--foreground)] opacity-90 whitespace-pre-wrap">
                  <code>{codeOutput}</code>
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full text-center text-xs font-mono text-[var(--foreground)] opacity-50 pt-6 mt-auto">
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 animate-pulse" fill="currentColor" /> by
            <span className="text-[var(--foreground)] opacity-100 font-semibold mx-1">Aditya Patil</span>
            aka <span className="text-purple-500 font-bold opacity-100">adiicodes</span> © 2026
          </p>
        </footer>
      </main>
    </>
  );
}
