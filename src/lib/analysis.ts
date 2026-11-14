// Copyright 2026 geksevence
// This is the shared definitions(schemas) of what a user can submit and what the model must return. 
// The API route and the page both use the Analysis type from this one file.

import { z } from "zod";

export const severity = z.enum(["Critical", "High", "Medium", "Low"]);

// What the user may submit.
export const findingSchema = z
  .object({
    id: z.string().min(1).max(100),
    title: z.string().min(1).max(200),
    severity,
    service: z.string().min(1).max(100),
    description: z.string().min(1).max(3000),
  })
  .strict();

// What the model must return. Every field is required so the UI can rely on it.
export const analysisSchema = z.object({
  summary: z
    .string()
    .describe("Two or three sentences explaining the finding in plain language."),
  assessedRisk: severity.describe(
    "Your risk rating based only on the supplied information. May differ from the submitted severity."
  ),
  riskRationale: z
    .string()
    .describe("Why you chose that rating, including any reason it differs from the submitted severity."),
  potentialImpact: z
    .array(z.string())
    .max(5)
    .describe("What an attacker could do or what could go wrong if this is real."),
  verifiedFacts: z
    .array(z.string())
    .max(6)
    .describe("Only facts stated in the submitted finding. Do not add anything else."),
  assumptions: z
    .array(z.string())
    .max(6)
    .describe("Things you are assuming that the finding does not confirm."),
  evidenceToVerify: z
    .array(
      z.object({
        check: z.string().describe("What to confirm."),
        howTo: z.string().describe("How an engineer would confirm it, e.g. a console path or AWS CLI command."),
      })
    )
    .max(5),
  remediationSteps: z
    .array(
      z.object({
        action: z.string().describe("The change to make."),
        rationale: z.string().describe("Why this step matters."),
        effort: z.enum(["Low", "Medium", "High"]),
      })
    )
    .min(1)
    .max(6)
    .describe("Ordered by priority, most important first."),
  validationSteps: z
    .array(z.string())
    .max(5)
    .describe("How to confirm the fix worked after remediation."),
});

export type Analysis = z.infer<typeof analysisSchema>;

