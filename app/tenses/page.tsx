"use client";

import { useState, type FormEvent } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { Clock, GraduationCap, Repeat, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useTensesGenerator } from "@/hooks/useTensesGenerator";
import { useTenseConversionGenerator } from "@/hooks/useTenseConversionGenerator";
import { useDeleteSet } from "@/hooks/useDeleteSet";
import { LessonGeneratingModal } from "@/app/components/Lessonsgeneratingmodal";
import { HudPanel } from "@/app/components/HudPanel";
import { DeleteButton } from "@/app/components/DeleteButton";
import { TensesGuide } from "@/app/components/Tensesguide";
import { SearchBar } from "../components/SearchBar";

type Activity = "name" | "transform";

export default function TensesPage() {
  const [activity, setActivity] = useState<Activity>("name");
  const [guideOpen, setGuideOpen] = useState(false);

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
    useDeleteSet(api.tensesData.deleteTenseSet, "tenses set");
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
    useDeleteSet(
      api.tenseConversionData.deleteTenseConversionSet,
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
    <div className="mx-auto max-w-3xl">
      <LessonGeneratingModal
        open={isGenerating}
        variant={activity === "name" ? "tenses" : "tenseConversion"}
      />
      <TensesGuide open={guideOpen} onOpenChange={setGuideOpen} />

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-cyan-50">
            Tenses
          </h1>
          <p className="mt-2 max-w-xl text-slate-600 dark:text-cyan-200/60">
            Practice recognizing tenses, or practice converting sentences
            between them.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-400/60 hover:bg-cyan-400/20"
        >
          <GraduationCap className="h-4 w-4" />
          Let&apos;s learn how
        </button>
      </header>

      <div className="mb-6 inline-flex rounded-lg border border-cyan-400/20 bg-[#0a1219] p-1">
        <button
          type="button"
          onClick={() => setActivity("name")}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${
            activity === "name"
              ? "bg-cyan-400/15 text-cyan-50"
              : "text-cyan-200/50 hover:text-cyan-100"
          }`}
        >
          <Clock className="h-4 w-4" />
          Name the Tense
        </button>
        <button
          type="button"
          onClick={() => setActivity("transform")}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${
            activity === "transform"
              ? "bg-cyan-400/15 text-cyan-50"
              : "text-cyan-200/50 hover:text-cyan-100"
          }`}
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
                className="mb-2 block text-sm font-medium text-cyan-100/80"
              >
                Topic{" "}
                <span className="font-normal text-cyan-200/40">(optional)</span>
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="tenses-topic"
                  name="topic"
                  value={nameTopic}
                  onChange={(e) => setNameTopic(e.target.value)}
                  placeholder="e.g. a rainy weekend... or leave blank"
                  className="flex-1 rounded-lg border border-cyan-400/20 bg-[#0a1219] px-4 py-2.5 text-cyan-50 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  disabled={isGeneratingName}
                />
                <button
                  type="submit"
                  disabled={isGeneratingName}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 font-semibold text-[#04070a] transition hover:bg-cyan-400 disabled:opacity-50"
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
            <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-cyan-100/90">
              Your tenses sets
            </h2>
            <SearchBar value={nameSearch} onChange={setNameSearch} />
            {namePastSets === undefined && (
              <p className="text-sm text-slate-500 dark:text-cyan-200/50">
                Loading...
              </p>
            )}
            {namePastSets?.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-cyan-200/50">
                No tenses sets yet -- generate your first one above.
              </p>
            )}
            <ul className="space-y-2">
              {filteredNameSets?.map((set) => (
                <li key={set._id} className="flex items-center gap-2">
                  <Link
                    href={`/tenses/${set._id}`}
                    className="flex flex-1 items-center justify-between rounded-lg border border-cyan-400/10 bg-[#0a1219] px-4 py-3 text-sm transition hover:border-cyan-400/40"
                  >
                    <span className="flex items-center gap-2 font-medium text-cyan-50">
                      <Clock className="h-4 w-4 text-cyan-400" />
                      {set.topic}
                    </span>
                    <span className="text-xs text-cyan-200/40">
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
                className="mb-2 block text-sm font-medium text-cyan-100/80"
              >
                Topic{" "}
                <span className="font-normal text-cyan-200/40">(optional)</span>
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="transform-topic"
                  name="topic"
                  value={transformTopic}
                  onChange={(e) => setTransformTopic(e.target.value)}
                  placeholder="e.g. cooking dinner... or leave blank"
                  className="flex-1 rounded-lg border border-cyan-400/20 bg-[#0a1219] px-4 py-2.5 text-cyan-50 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  disabled={isGeneratingTransform}
                />
                <button
                  type="submit"
                  disabled={isGeneratingTransform}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 font-semibold text-[#04070a] transition hover:bg-cyan-400 disabled:opacity-50"
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
            <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-cyan-100/90">
              Your conversion sets
            </h2>
            <SearchBar value={transformSearch} onChange={setTransformSearch} />
            {transformPastSets === undefined && (
              <p className="text-sm text-slate-500 dark:text-cyan-200/50">
                Loading...
              </p>
            )}
            {transformPastSets?.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-cyan-200/50">
                No conversion sets yet -- generate your first one above.
              </p>
            )}
            <ul className="space-y-2">
              {filteredTransformSets?.map((set) => (
                <li key={set._id} className="flex items-center gap-2">
                  <Link
                    href={`/tenses/transform/${set._id}`}
                    className="flex flex-1 items-center justify-between rounded-lg border border-cyan-400/10 bg-[#0a1219] px-4 py-3 text-sm transition hover:border-cyan-400/40"
                  >
                    <span className="flex items-center gap-2 font-medium text-cyan-50">
                      <Repeat className="h-4 w-4 text-cyan-400" />
                      {set.topic}
                    </span>
                    <span className="text-xs text-cyan-200/40">
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
  );
}
