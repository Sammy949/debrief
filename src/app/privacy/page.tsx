import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy · Debrief",
  description: "How Debrief handles your explanations and data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="August 2026"
      intro="Debrief is a teach-back learning tool. It works without an account, and it keeps as little about you as it can. This page explains what happens to what you write."
      sections={[
        {
          heading: "What you write",
          body: (
            <p>
              When you explain a concept, your text is sent to our AI provider
              (Groq) to be evaluated so Debrief can map your understanding and
              respond. Your explanations are used to generate that feedback in
              the moment, not to advertise to you or to build a profile.
            </p>
          ),
        },
        {
          heading: "What we store",
          body: (
            <p>
              In the current guest experience, a session lives only in your
              browser for the length of your visit. We do not require sign-up,
              and we do not persist your explanations on a server once the
              session ends. If accounts are added later, this page will be
              updated to describe what is saved and how to delete it.
            </p>
          ),
        },
        {
          heading: "Third parties",
          body: (
            <p>
              Explanations are processed by Groq under their terms and privacy
              policy. Debrief does not sell your data, and it does not run
              third-party advertising or cross-site tracking.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              Debrief is an open project. Questions about privacy can be raised
              in the project&apos;s public repository.
            </p>
          ),
        },
      ]}
    />
  );
}
