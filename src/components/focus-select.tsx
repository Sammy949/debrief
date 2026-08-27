"use client";

import { type FormEvent } from "react";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireItem,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire";
import type { Claim } from "@/core/types";

/**
 * The learner points at the gap to dig into first. Options are the agent's own
 * findings (the non-solid claims + why each looked shaky), surfaced back as a
 * single-select. Built on the accessible shadcn Questionnaire; the pick comes off
 * the form on submit. No new model call — these gaps were already found when the
 * explanation was mapped.
 */
export function FocusSelect({
  claims,
  onPick,
}: {
  claims: Claim[];
  onPick: (claimId: string) => void;
}) {
  const items = [
    {
      name: "focus",
      required: true,
      prompt: "Which piece do you want to take another run at first?",
      description: "These are the spots your explanation left shaky. Trust your gut.",
      choices: claims.map((c) => ({
        value: c.id,
        label: c.shortLabel,
        description: c.rationale ?? undefined,
      })),
    },
  ];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = new FormData(event.currentTarget).get("focus");
    if (typeof id === "string" && id) onPick(id);
  }

  return (
    <Questionnaire items={items} onSubmit={handleSubmit}>
      {items.map((q) => (
        <QuestionnaireItem key={q.name} name={q.name} required={q.required}>
          <QuestionnaireTitle className="text-2xl leading-snug text-ivory">
            {q.prompt}
          </QuestionnaireTitle>
          <QuestionnaireDescription className="text-muted-ink">
            {q.description}
          </QuestionnaireDescription>
          <QuestionnaireChoices className="mt-2">
            {q.choices.map((ch) => (
              <QuestionnaireChoice key={ch.value} value={ch.value}>
                <span className="font-medium text-ivory">{ch.label}</span>
                {ch.description ? (
                  <QuestionnaireChoiceDescription className="text-muted-ink">
                    {ch.description}
                  </QuestionnaireChoiceDescription>
                ) : null}
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
        </QuestionnaireItem>
      ))}
      <QuestionnaireActions className="mt-6">
        <QuestionnaireSubmit className="col-start-3 bg-ivory font-mono text-[0.7rem] font-medium tracking-[0.16em] text-obsidian uppercase hover:bg-amber">
          Focus here
        </QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}
