"use client";

import { useState, type FormEvent } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { Clock, GraduationCap, Repeat, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useTensesGenerator } from "@/hooks/useTensesGenerator";
import { useTenseConversionGenerator } from "@/hooks/useTenseConversionGenerator";
import { useDeleteSetAction } from "@/hooks/useDeleteSet";
import { LessonGeneratingModal } from "@/app/components/Lessonsgeneratingmodal";
import { HudPanel } from "@/app/components/HudPanel";
import { DeleteButton } from "@/app/components/DeleteButton";
import { TensesGuide } from "@/app/components/Tensesguide";
import { SearchBar } from "../components/SearchBar";
import { MatrixBackground } from "@/app/components/MatrixBackground";
import { useColorTheme } from "@/app/context/ColorThemeContext";

type Activity = "name" | "transform";

export default function TensesPage() {
  const [activity, setActivity] = useState<Activity>("name");
  const [guideOpen, setGuideOpen] = useState(false);
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;
  const [nameInputFocused, setNameInputFocused] = useState(false);
  const [transformInputFocused, setTransformInputFocused] = useState(false);

  // "Name the Tense"
  const [nameTopic, setNameTopic] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const {
    generateTenseSet,
    isGenerating: isGeneratingName,
    error: nameError,
  } = useTensesGenerator();
  const namePastSets = useQuery(api.tensesData.listMyTenseSets);
  const { deleteItem: deleteNameSet, deletingId: deletingNameId } =
    useDeleteSetAction(api.tensesActions.deleteTenseSet, "tenses set");
  const filteredNameSets = namePastSets?.filter((set) =>
    set.topic.toLowerCase().includes(nameSearch.toLowerCase()),
  );
  const handleNameSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isGeneratingName) return;
    void generateTenseSet(nameTopic);
  };

  // "Transform the Tense"
  const [transformTopic, setTransformTopic] = useState("");
  const [transformSearch, setTransformSearch] = useState("");
  const {
    generateTenseConversionSet,
    isGenerating: isGeneratingTransform,
    error: transformError,
  } = useTenseConversionGenerator();
  const transformPastSets = useQuery(
    api.tenseConversionData.listMyTenseConversionSets,
  );
  const { deleteItem: deleteTransformSet, deletingId: deletingTransformId } =
    useDeleteSetAction(
      api.tenseConversionActions.deleteTenseConversionSet,
      "tense conversion set",
    );
  const filteredTransformSets = transformPastSets?.filter((set) =>
    set.topic.toLowerCase().includes(transformSearch.toLowerCase()),
  );
  const handleTransformSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isGeneratingTransform) return;
    void generateTenseConversionSet(transformTopic);
  };

  const isGenerating =
    activity === "name" ? isGeneratingName : isGeneratingTransform;

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <MatrixBackground />
      <LessonGeneratingModal
        open={isGenerating}
        variant={activity === "name" ? "tenses" : "tenseConversion"}
      />
      <TensesGuide open={guideOpen} onOpenChange={setGuideOpen} />

      <div className="relative z-10 mx-auto max-w-3xl">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-stone-50">
              Tenses
            </h1>
            <p className="mt-2 max-w-xl text-slate-600 dark:text-stone-400">
              Practice recognizing tenses, or practice converting sentences
              between them.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition"
            style={{
              borderColor: `${hex400}4d`,
              backgroundColor: `${hex400}1a`,
              color: shades[300],
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${hex400}99`;
              e.currentTarget.style.backgroundColor = `${hex400}33`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${hex400}4d`;
              e.currentTarget.style.backgroundColor = `${hex400}1a`;
            }}
          >
            <GraduationCap className="h-4 w-4" />
            Let&apos;s learn how
          </button>
        </header>

        <div
          className="mb-6 inline-flex rounded-lg bg-[#0a1219] p-1"
          style={{ border: `1px solid ${hex400}33` }}
        >
          <button
            type="button"
            onClick={() => setActivity("name")}
            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition"
            style={{
              backgroundColor: activity === "name" ? `${hex400}26` : undefined,
              color: activity === "name" ? "#fafaf9" : `${shades[300]}80`,
            }}
            onMouseEnter={(e) => {
              if (activity !== "name")
                e.currentTarget.style.color = shades[300];
            }}
            onMouseLeave={(e) => {
              if (activity !== "name")
                e.currentTarget.style.color = `${shades[300]}80`;
            }}
          >
            <Clock className="h-4 w-4" />
            Name the Tense
          </button>
          <button
            type="button"
            onClick={() => setActivity("transform")}
            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition"
            style={{
              backgroundColor:
                activity === "transform" ? `${hex400}26` : undefined,
              color: activity === "transform" ? "#fafaf9" : `${shades[300]}80`,
            }}
            onMouseEnter={(e) => {
              if (activity !== "transform")
                e.currentTarget.style.color = shades[300];
            }}
            onMouseLeave={(e) => {
              if (activity !== "transform")
                e.currentTarget.style.color = `${shades[300]}80`;
            }}
          >
            <Repeat className="h-4 w-4" />
            Transform the Tense
          </button>
        </div>

        {activity === "name" && (
          <>
            <HudPanel className="p-5">
              <form onSubmit={handleNameSubmit}>
                <label
                  htmlFor="tenses-topic"
                  className="mb-2 block text-sm font-medium text-stone-200/80"
                >
                  Topic{" "}
                  <span
                    className="font-normal"
                    style={{ color: `${shades[300]}66` }}
                  >
                    (optional)
                  </span>
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="tenses-topic"
                    name="topic"
                    value={nameTopic}
                    onChange={(e) => setNameTopic(e.target.value)}
                    onFocus={() => setNameInputFocused(true)}
                    onBlur={() => setNameInputFocused(false)}
                    placeholder="e.g. a rainy weekend... or leave blank"
                    className="flex-1 rounded-lg bg-[#0a1219] px-4 py-2.5 text-stone-50 outline-none transition"
                    style={{
                      border: `1px solid ${
                        nameInputFocused ? hex400 : `${hex400}33`
                      }`,
                      boxShadow: nameInputFocused
                        ? `0 0 0 2px ${hex400}33`
                        : undefined,
                    }}
                    disabled={isGeneratingName}
                  />
                  <button
                    type="submit"
                    disabled={isGeneratingName}
                    className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-[#04070a] transition disabled:opacity-50"
                    style={{ backgroundColor: shades[500] }}
                    onMouseEnter={(e) => {
                      if (!isGeneratingName)
                        e.currentTarget.style.backgroundColor = hex400;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = shades[500];
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    {isGeneratingName
                      ? "Shifting tenses..."
                      : "Generate tenses set"}
                  </button>
                </div>
                {nameError && (
                  <p className="mt-3 text-sm text-red-400">{nameError}</p>
                )}
              </form>
            </HudPanel>

            <section className="mt-10">
              <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-stone-100">
                Your tenses sets
              </h2>
              <SearchBar value={nameSearch} onChange={setNameSearch} />
              {namePastSets === undefined && (
                <p className="text-sm text-slate-500 dark:text-stone-500">
                  Loading...
                </p>
              )}
              {namePastSets?.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-stone-500">
                  No tenses sets yet -- generate your first one above.
                </p>
              )}
              <ul className="space-y-2">
                {filteredNameSets?.map((set) => (
                  <li key={set._id} className="flex items-center gap-2">
                    <Link
                      href={`/tenses/${set._id}`}
                      className="flex flex-1 items-center justify-between rounded-lg bg-[#0a1219] px-4 py-3 text-sm transition"
                      style={{ border: `1px solid ${hex400}1a` }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${hex400}66`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = `${hex400}1a`;
                      }}
                    >
                      <span className="flex items-center gap-2 font-medium text-stone-50">
                        <Clock className="h-4 w-4" style={{ color: hex400 }} />
                        {set.topic}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: `${shades[300]}66` }}
                      >
                        {new Date(set.createdAt).toLocaleDateString()}
                      </span>
                    </Link>
                    <DeleteButton
                      label="Delete tenses set"
                      isDeleting={deletingNameId === set._id}
                      onDelete={() => deleteNameSet({ id: set._id })}
                    />
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {activity === "transform" && (
          <>
            <HudPanel className="p-5">
              <form onSubmit={handleTransformSubmit}>
                <label
                  htmlFor="transform-topic"
                  className="mb-2 block text-sm font-medium text-stone-200/80"
                >
                  Topic{" "}
                  <span
                    className="font-normal"
                    style={{ color: `${shades[300]}66` }}
                  >
                    (optional)
                  </span>
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="transform-topic"
                    name="topic"
                    value={transformTopic}
                    onChange={(e) => setTransformTopic(e.target.value)}
                    onFocus={() => setTransformInputFocused(true)}
                    onBlur={() => setTransformInputFocused(false)}
                    placeholder="e.g. cooking dinner... or leave blank"
                    className="flex-1 rounded-lg bg-[#0a1219] px-4 py-2.5 text-stone-50 outline-none transition"
                    style={{
                      border: `1px solid ${
                        transformInputFocused ? hex400 : `${hex400}33`
                      }`,
                      boxShadow: transformInputFocused
                        ? `0 0 0 2px ${hex400}33`
                        : undefined,
                    }}
                    disabled={isGeneratingTransform}
                  />
                  <button
                    type="submit"
                    disabled={isGeneratingTransform}
                    className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-[#04070a] transition disabled:opacity-50"
                    style={{ backgroundColor: shades[500] }}
                    onMouseEnter={(e) => {
                      if (!isGeneratingTransform)
                        e.currentTarget.style.backgroundColor = hex400;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = shades[500];
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    {isGeneratingTransform
                      ? "Building the set..."
                      : "Generate conversion set"}
                  </button>
                </div>
                {transformError && (
                  <p className="mt-3 text-sm text-red-400">{transformError}</p>
                )}
              </form>
            </HudPanel>

            <section className="mt-10">
              <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-stone-100">
                Your conversion sets
              </h2>
              <SearchBar
                value={transformSearch}
                onChange={setTransformSearch}
              />
              {transformPastSets === undefined && (
                <p className="text-sm text-slate-500 dark:text-stone-500">
                  Loading...
                </p>
              )}
              {transformPastSets?.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-stone-500">
                  No conversion sets yet -- generate your first one above.
                </p>
              )}
              <ul className="space-y-2">
                {filteredTransformSets?.map((set) => (
                  <li key={set._id} className="flex items-center gap-2">
                    <Link
                      href={`/tenses/transform/${set._id}`}
                      className="flex flex-1 items-center justify-between rounded-lg bg-[#0a1219] px-4 py-3 text-sm transition"
                      style={{ border: `1px solid ${hex400}1a` }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${hex400}66`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = `${hex400}1a`;
                      }}
                    >
                      <span className="flex items-center gap-2 font-medium text-stone-50">
                        <Repeat className="h-4 w-4" style={{ color: hex400 }} />
                        {set.topic}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: `${shades[300]}66` }}
                      >
                        {new Date(set.createdAt).toLocaleDateString()}
                      </span>
                    </Link>
                    <DeleteButton
                      label="Delete conversion set"
                      isDeleting={deletingTransformId === set._id}
                      onDelete={() => deleteTransformSet({ id: set._id })}
                    />
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
