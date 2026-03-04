"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "overview" | "blueprints" | "analytics" | "settings";
type ChatRole = "user" | "assistant";

type Blueprint = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

type InvestorInsights = {
  executiveSummary: {
    summary: string;
    keyHighlights: string[];
  };
  roiForecast: {
    conservativeROI: string;
    expectedROI: string;
    optimisticROI: string;
    assumptions: string[];
  };
  riskAssessment: {
    overallRisk: string;
    categories: Record<string, string>;
    mitigations: string[];
  };
  fundingBreakdown: {
    targetRaiseUSD: number;
    allocation: Record<string, number>;
    runwayMonths: number;
  };
};

const EXPLORE_STORAGE_KEY = "vistara_explore_blueprints";
const CHAT_STORAGE_PREFIX = "vistara_chat_threads_v1";

function parseTab(raw: string | null): Tab {
  if (raw === "overview" || raw === "blueprints" || raw === "analytics" || raw === "settings") {
    return raw;
  }
  return "overview";
}

function formatDate(dateInput: string) {
  return new Date(dateInput).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildChatStorageKey(isExploreMode: boolean) {
  return `${CHAT_STORAGE_PREFIX}_${isExploreMode ? "explore" : "auth"}`;
}

function messageId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readExploreBlueprints(): Blueprint[] {
  const raw = localStorage.getItem(EXPLORE_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Blueprint[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeExploreBlueprints(blueprints: Blueprint[]) {
  localStorage.setItem(EXPLORE_STORAGE_KEY, JSON.stringify(blueprints));
}

function readChatThreads(key: string): Record<string, ChatMessage[]> {
  const raw = localStorage.getItem(key);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, ChatMessage[]>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeChatThreads(key: string, threads: Record<string, ChatMessage[]>) {
  localStorage.setItem(key, JSON.stringify(threads));
}

function generateExploreInsight(content: string, prompt: string, threadDepth: number): string {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const suggestion =
    wordCount < 120
      ? "Add stronger market proof and distribution detail."
      : "Tighten narrative and quantify milestones.";
  const promptSignal = prompt.trim() ? `Request focus: ${prompt.trim()}.` : "Focus: make the plan investor-ready.";

  return [
    promptSignal,
    `Conversation context: ${threadDepth} prior message(s) in this blueprint thread.`,
    "AI Improvement Plan:",
    "1. Clarify target customer and pain score in one line.",
    "2. Add a 90-day execution timeline with measurable outcomes.",
    "3. Define budget by function: product, GTM, operations, contingency.",
    `4. ${suggestion}`,
    "",
    "Suggested rewrite (drop-in section):",
    "Execution Sprint (90 Days): Week 1-2 validation, Week 3-6 pilot launch, Week 7-10 conversion optimization, Week 11-12 investor update with KPI movement.",
  ].join("\n");
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isExploreMode, setIsExploreMode] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [modeReady, setModeReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatThreads, setChatThreads] = useState<Record<string, ChatMessage[]>>({});

  const selectedBlueprint = useMemo(
    () => blueprints.find((item) => item.id === selectedBlueprintId) ?? null,
    [blueprints, selectedBlueprintId]
  );

  const activeThread = useMemo(() => {
    if (!selectedBlueprintId) return [];
    return chatThreads[selectedBlueprintId] ?? [];
  }, [chatThreads, selectedBlueprintId]);

  const lastAssistantMessage = useMemo(
    () => [...activeThread].reverse().find((item) => item.role === "assistant") ?? null,
    [activeThread]
  );

  const stats = useMemo(() => {
    const totalBlueprints = blueprints.length;
    const totalChars = blueprints.reduce((acc, item) => acc + item.content.length, 0);
    const avgSize = totalBlueprints ? Math.round(totalChars / totalBlueprints) : 0;
    const updatedThisWeek = blueprints.filter((item) => {
      const updatedAt = new Date(item.updatedAt).getTime();
      return Date.now() - updatedAt < 7 * 24 * 60 * 60 * 1000;
    }).length;

    return [
      { title: "Total Blueprints", value: String(totalBlueprints), delta: `${updatedThisWeek} updated this week` },
      { title: "Avg Blueprint Size", value: `${avgSize} chars`, delta: "Higher is not always better" },
      { title: "Work Improvement", value: `${Math.min(99, 40 + totalBlueprints * 8)}%`, delta: "AI readiness score" },
    ];
  }, [blueprints]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = parseTab(params.get("tab"));
    const exploreEnabled = params.get("explore") === "1" || localStorage.getItem("vistara_explore_mode") === "1";
    const storedToken = localStorage.getItem("vistara_token");
    const exploreMode = !storedToken && exploreEnabled;

    if (params.get("explore") === "1") {
      localStorage.setItem("vistara_explore_mode", "1");
    }

    setActiveTab(tab);
    setIsExploreMode(exploreMode);
    setToken(storedToken);
    setChatThreads(readChatThreads(buildChatStorageKey(exploreMode)));
    setModeReady(true);
  }, []);

  useEffect(() => {
    if (!modeReady) return;
    writeChatThreads(buildChatStorageKey(isExploreMode), chatThreads);
  }, [chatThreads, isExploreMode, modeReady]);

  useEffect(() => {
    async function loadBlueprints() {
      if (!modeReady) return;

      if (isExploreMode) {
        const localBlueprints = readExploreBlueprints();
        setBlueprints(localBlueprints);
        setSelectedBlueprintId(localBlueprints[0]?.id ?? null);
        setEditorContent(localBlueprints[0]?.content ?? "");
        setLoading(false);
        return;
      }

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/blueprint", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const payload = (await res.json().catch(() => null)) as { data?: Blueprint[]; error?: string } | null;

        if (!res.ok) {
          throw new Error(payload?.error ?? "Failed to load blueprints");
        }

        const items = payload?.data ?? [];
        setBlueprints(items);
        setSelectedBlueprintId(items[0]?.id ?? null);
        setEditorContent(items[0]?.content ?? "");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    void loadBlueprints();
  }, [isExploreMode, token, modeReady]);

  useEffect(() => {
    if (selectedBlueprint) {
      setEditorContent(selectedBlueprint.content);
    }
  }, [selectedBlueprintId, selectedBlueprint]);

  function pushChatMessage(blueprintId: string, role: ChatRole, content: string) {
    const msg: ChatMessage = {
      id: messageId(),
      role,
      content,
      createdAt: new Date().toISOString(),
    };

    setChatThreads((prev) => ({
      ...prev,
      [blueprintId]: [...(prev[blueprintId] ?? []), msg],
    }));
  }

  async function buildAssistantReply(prompt: string, blueprint: Blueprint, threadDepth: number) {
    if (isExploreMode || !token) {
      return generateExploreInsight(editorContent || blueprint.content, prompt, threadDepth);
    }

    const res = await fetch(`/api/investor/${blueprint.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = (await res.json().catch(() => null)) as { data?: InvestorInsights; error?: string } | null;

    if (!res.ok || !payload?.data) {
      throw new Error(payload?.error ?? "AI assistant failed");
    }

    const data = payload.data;
    return [
      prompt.trim() ? `You asked: ${prompt.trim()}` : "You asked for blueprint improvements.",
      `Thread context: ${threadDepth} prior message(s) for this blueprint.`,
      "",
      `Executive summary: ${data.executiveSummary.summary}`,
      `ROI outlook: ${data.roiForecast.conservativeROI} conservative / ${data.roiForecast.expectedROI} expected / ${data.roiForecast.optimisticROI} optimistic.`,
      `Overall risk: ${data.riskAssessment.overallRisk}.`,
      `Target raise: $${data.fundingBreakdown.targetRaiseUSD.toLocaleString()} with ${data.fundingBreakdown.runwayMonths}-month runway.`,
      `Current draft size: ${(editorContent || blueprint.content).length} characters.`,
      "",
      "Next improvements:",
      ...data.roiForecast.assumptions.map((item, index) => `${index + 1}. ${item}`),
    ].join("\n");
  }

  async function sendChatMessage(customPrompt?: string) {
    if (!selectedBlueprint) {
      setError("Pick a blueprint so AI can assist.");
      return;
    }

    const prompt = (customPrompt ?? chatInput).trim();
    if (!prompt) {
      setError("Enter a message for the assistant.");
      return;
    }

    setError("");
    setChatInput("");
    setChatLoading(true);

    const threadDepth = activeThread.length;
    pushChatMessage(selectedBlueprint.id, "user", prompt);

    try {
      const reply = await buildAssistantReply(prompt, selectedBlueprint, threadDepth);
      pushChatMessage(selectedBlueprint.id, "assistant", reply);
    } catch (assistantError) {
      setError(assistantError instanceof Error ? assistantError.message : "AI request failed");
    } finally {
      setChatLoading(false);
    }
  }

  function applyAssistantToDraft() {
    if (!lastAssistantMessage?.content) return;

    const merged = `${editorContent.trim()}\n\n--- AI Improvement Notes ---\n${lastAssistantMessage.content}`.trim();
    setEditorContent(merged);
    setActiveTab("blueprints");
  }

  function clearSelectedThread() {
    if (!selectedBlueprintId) return;
    setChatThreads((prev) => ({ ...prev, [selectedBlueprintId]: [] }));
  }

  async function createBlueprint(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const title = newTitle.trim();
    const content = editorContent.trim() || "Add your blueprint strategy here.";

    if (!title) {
      setError("Title is required");
      return;
    }

    if (isExploreMode) {
      const now = new Date().toISOString();
      const created: Blueprint = {
        id: `explore-${Date.now()}`,
        title,
        content,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [created, ...blueprints];
      setBlueprints(updated);
      setSelectedBlueprintId(created.id);
      writeExploreBlueprints(updated);
      setNewTitle("");
      setChatThreads((prev) => ({ ...prev, [created.id]: [] }));
      return;
    }

    if (!token) {
      setError("Missing auth token. Please login again.");
      return;
    }

    try {
      const res = await fetch("/api/blueprint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const payload = (await res.json().catch(() => null)) as { data?: Blueprint; error?: string } | null;

      if (!res.ok || !payload?.data) {
        throw new Error(payload?.error ?? "Failed to create blueprint");
      }

      const created = payload.data;
      const updated = [created, ...blueprints];
      setBlueprints(updated);
      setSelectedBlueprintId(created.id);
      setNewTitle("");
      setChatThreads((prev) => ({ ...prev, [created.id]: prev[created.id] ?? [] }));
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Creation failed");
    }
  }

  async function saveBlueprint() {
    if (!selectedBlueprint) {
      setError("Select a blueprint first");
      return;
    }

    setSaveLoading(true);
    setError("");

    if (isExploreMode) {
      const updated = blueprints.map((item) =>
        item.id === selectedBlueprint.id
          ? { ...item, content: editorContent, updatedAt: new Date().toISOString() }
          : item
      );
      setBlueprints(updated);
      writeExploreBlueprints(updated);
      setSaveLoading(false);
      return;
    }

    if (!token) {
      setError("Missing auth token. Please login again.");
      setSaveLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/blueprint/${selectedBlueprint.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editorContent }),
      });
      const payload = (await res.json().catch(() => null)) as { data?: Blueprint; error?: string } | null;

      if (!res.ok || !payload?.data) {
        throw new Error(payload?.error ?? "Failed to save blueprint");
      }

      setBlueprints((prev) => prev.map((item) => (item.id === payload.data?.id ? payload.data : item)));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed");
    } finally {
      setSaveLoading(false);
    }
  }

  async function removeBlueprint() {
    if (!selectedBlueprint) {
      setError("Select a blueprint first");
      return;
    }

    setError("");

    if (isExploreMode) {
      const updated = blueprints.filter((item) => item.id !== selectedBlueprint.id);
      setBlueprints(updated);
      setSelectedBlueprintId(updated[0]?.id ?? null);
      setEditorContent(updated[0]?.content ?? "");
      writeExploreBlueprints(updated);
      setChatThreads((prev) => {
        const next = { ...prev };
        delete next[selectedBlueprint.id];
        return next;
      });
      return;
    }

    if (!token) {
      setError("Missing auth token. Please login again.");
      return;
    }

    try {
      const res = await fetch(`/api/blueprint/${selectedBlueprint.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        throw new Error(payload?.error ?? "Failed to delete blueprint");
      }

      const updated = blueprints.filter((item) => item.id !== selectedBlueprint.id);
      setBlueprints(updated);
      setSelectedBlueprintId(updated[0]?.id ?? null);
      setEditorContent(updated[0]?.content ?? "");
      setChatThreads((prev) => {
        const next = { ...prev };
        delete next[selectedBlueprint.id];
        return next;
      });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Delete failed");
    }
  }

  function logoutAndReset() {
    localStorage.removeItem("vistara_token");
    localStorage.removeItem("vistara_explore_mode");
    router.replace("/login");
    router.refresh();
  }

  const analytics = useMemo(() => {
    const now = Date.now();
    const fresh = blueprints.filter((item) => now - new Date(item.updatedAt).getTime() < 3 * 24 * 60 * 60 * 1000).length;
    const stale = Math.max(0, blueprints.length - fresh);
    const quality = Math.min(
      100,
      Math.round(
        blueprints.reduce((acc, item) => acc + item.content.length, 0) /
          Math.max(blueprints.length, 1) /
          10
      )
    );

    return {
      fresh,
      stale,
      quality,
      conversations: Object.values(chatThreads).reduce((acc, thread) => acc + thread.length, 0),
    };
  }, [blueprints, chatThreads]);

  if (loading) {
    return <p className="text-sm text-slate-300">Loading workspace...</p>;
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Blueprint Workspace</h1>
        <p className="mt-2 text-sm text-slate-300">
          {isExploreMode
            ? "Explore mode is active. Blueprint and chat data are stored locally in this browser."
            : "Manage blueprints, iterate with AI chat threads, and track progress in one place."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-white/10 bg-[#11182B] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.4)]"
          >
            <p className="text-sm text-slate-300">{card.title}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
            <p className="mt-3 text-xs font-medium text-blue-300">{card.delta}</p>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`rounded-lg px-4 py-2 text-sm ${activeTab === "overview" ? "bg-blue-500 text-white" : "bg-white/10 text-slate-300"}`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("blueprints")}
          className={`rounded-lg px-4 py-2 text-sm ${activeTab === "blueprints" ? "bg-blue-500 text-white" : "bg-white/10 text-slate-300"}`}
        >
          Blueprints
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`rounded-lg px-4 py-2 text-sm ${activeTab === "analytics" ? "bg-blue-500 text-white" : "bg-white/10 text-slate-300"}`}
        >
          Analytics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`rounded-lg px-4 py-2 text-sm ${activeTab === "settings" ? "bg-blue-500 text-white" : "bg-white/10 text-slate-300"}`}
        >
          Settings
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>
      ) : null}

      {activeTab === "overview" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-[#0E1629] p-6">
            <h2 className="text-lg font-semibold text-white">Recent Blueprints</h2>
            {blueprints.length ? (
              <div className="mt-4 space-y-3">
                {blueprints.slice(0, 5).map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setSelectedBlueprintId(item.id);
                      setActiveTab("blueprints");
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-blue-400/50"
                  >
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-300">Updated {formatDate(item.updatedAt)}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-300">No blueprints yet. Create one in the Blueprints tab.</p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0E1629] p-6">
            <h2 className="text-lg font-semibold text-white">Threaded AI Assistant</h2>
            <p className="mt-2 text-xs text-slate-300">Messages are kept per blueprint, so each project has its own improvement context.</p>
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask: improve go-to-market milestones for this blueprint"
              className="mt-4 h-28 w-full rounded-xl border border-slate-700 bg-[#0F1629] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
            />
            <button
              type="button"
              onClick={() => void sendChatMessage()}
              disabled={chatLoading || !selectedBlueprint}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {chatLoading ? "Responding..." : "Send To Assistant"}
            </button>
            <div className="mt-4 rounded-xl border border-white/10 bg-[#0A1120] p-3">
              <p className="text-xs text-slate-400">Current thread: {selectedBlueprint ? selectedBlueprint.title : "No blueprint selected"}</p>
              <p className="mt-1 text-xs text-slate-300">{activeThread.length} message(s)</p>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "blueprints" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[310px_1fr_380px]">
          <aside className="rounded-2xl border border-white/10 bg-[#0E1629] p-5">
            <h2 className="text-base font-semibold text-white">Create Blueprint</h2>
            <form onSubmit={createBlueprint} className="mt-3 space-y-3">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Blueprint title"
                className="w-full rounded-xl border border-slate-700 bg-[#0F1629] px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-400"
                required
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400"
              >
                Create
              </button>
            </form>

            <div className="mt-5 space-y-2">
              {blueprints.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSelectedBlueprintId(item.id)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    selectedBlueprintId === item.id
                      ? "border-blue-400/70 bg-blue-500/15"
                      : "border-white/10 bg-white/5 hover:border-white/25"
                  }`}
                >
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-300">{formatDate(item.updatedAt)}</p>
                </button>
              ))}
              {!blueprints.length ? <p className="text-sm text-slate-300">No blueprints yet.</p> : null}
            </div>
          </aside>

          <div className="rounded-2xl border border-white/10 bg-[#0E1629] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-white">
                {selectedBlueprint ? selectedBlueprint.title : "Select a blueprint"}
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void sendChatMessage("Improve this draft for investor clarity and execution sequencing.")}
                  disabled={!selectedBlueprint || chatLoading}
                  className="rounded-lg border border-blue-400/60 bg-blue-500/15 px-3 py-2 text-xs font-medium text-blue-100 transition hover:bg-blue-500/25 disabled:opacity-60"
                >
                  AI Improve
                </button>
                <button
                  type="button"
                  onClick={saveBlueprint}
                  disabled={saveLoading || !selectedBlueprint}
                  className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {saveLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={removeBlueprint}
                  disabled={!selectedBlueprint}
                  className="rounded-lg border border-rose-400/50 px-3 py-2 text-xs font-medium text-rose-200 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>

            <textarea
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              placeholder="Write your blueprint strategy, milestones, budget, and risk mitigation."
              className="mt-4 h-[26rem] w-full rounded-xl border border-slate-700 bg-[#0A1120] px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-blue-400"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0E1629] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-white">AI Conversation</h2>
              <button
                type="button"
                onClick={clearSelectedThread}
                disabled={!selectedBlueprint || !activeThread.length}
                className="rounded-lg border border-white/20 px-3 py-2 text-xs text-slate-300 transition hover:border-white/40 disabled:opacity-60"
              >
                Clear Thread
              </button>
            </div>

            <div className="mt-4 h-[20rem] space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-[#0A1120] p-3">
              {!activeThread.length ? (
                <p className="text-xs text-slate-400">No messages yet. Ask AI to start this blueprint thread.</p>
              ) : (
                activeThread.map((msg) => (
                  <article
                    key={msg.id}
                    className={`rounded-lg px-3 py-2 ${
                      msg.role === "assistant"
                        ? "border border-blue-400/30 bg-blue-500/10"
                        : "border border-white/15 bg-white/5"
                    }`}
                  >
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-300">
                      {msg.role === "assistant" ? "Assistant" : "You"} • {formatDate(msg.createdAt)}
                    </p>
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-100">{msg.content}</pre>
                  </article>
                ))
              )}
            </div>

            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Continue the thread: refine budget assumptions with lower burn rate"
              className="mt-4 h-24 w-full rounded-xl border border-slate-700 bg-[#0F1629] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
            />
            <button
              type="button"
              onClick={() => void sendChatMessage()}
              disabled={chatLoading || !selectedBlueprint}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {chatLoading ? "Responding..." : "Send Message"}
            </button>

            {lastAssistantMessage ? (
              <button
                type="button"
                onClick={applyAssistantToDraft}
                className="mt-3 w-full rounded-lg border border-blue-300/50 px-3 py-2 text-xs font-medium text-blue-100 transition hover:bg-blue-500/20"
              >
                Apply Latest Assistant Reply To Draft
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {activeTab === "analytics" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#0E1629] p-6">
            <h2 className="text-lg font-semibold text-white">Blueprint Freshness</h2>
            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-300">
                  <span>Fresh (&lt;3 days)</span>
                  <span>{analytics.fresh}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-emerald-400"
                    style={{ width: `${blueprints.length ? (analytics.fresh / blueprints.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-300">
                  <span>Needs update</span>
                  <span>{analytics.stale}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-amber-300"
                    style={{ width: `${blueprints.length ? (analytics.stale / blueprints.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0E1629] p-6">
            <h2 className="text-lg font-semibold text-white">AI Readiness</h2>
            <p className="mt-2 text-sm text-slate-300">Score based on content depth, update frequency, and active AI collaboration.</p>
            <p className="mt-6 text-5xl font-bold text-white">{analytics.quality}%</p>
            <p className="mt-2 text-xs text-blue-300">{analytics.conversations} total conversation messages.</p>
          </div>
        </div>
      ) : null}

      {activeTab === "settings" ? (
        <div className="rounded-2xl border border-white/10 bg-[#0E1629] p-6">
          <h2 className="text-lg font-semibold text-white">Workspace Settings</h2>
          <p className="mt-2 text-sm text-slate-300">
            Mode: {isExploreMode ? "Explore (local data only)" : "Authenticated API mode"}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(EXPLORE_STORAGE_KEY);
                localStorage.removeItem(buildChatStorageKey(true));
                setBlueprints([]);
                setSelectedBlueprintId(null);
                setEditorContent("");
                setChatThreads({});
              }}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-slate-200 transition hover:border-white/40"
            >
              Clear Explore Data
            </button>
            <button
              type="button"
              onClick={logoutAndReset}
              className="rounded-lg border border-rose-400/40 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/10"
            >
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

