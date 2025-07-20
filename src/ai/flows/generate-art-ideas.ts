// src/ai/flows/generate-art-ideas.ts
"use server";

/**
 * @fileOverview Provides AI-driven suggestions for custom art ideas based on user descriptions and uploaded images.
 *
 * - generateArtIdeas - A function that generates art ideas.
 * - GenerateArtIdeasInput - The input type for the generateArtIdeas function.
 * - GenerateArtIdeasOutput - The return type for the generateArtIdeas function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateArtIdeasInputSchema = z.object({
  description: z.string().describe("A description of the desired artwork."),
  imageDataUri: z
    .string()
    .describe(
      "An image to use for inspiration, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.",
    )
    .optional(),
});
export type GenerateArtIdeasInput = z.infer<typeof GenerateArtIdeasInputSchema>;

const GenerateArtIdeasOutputSchema = z.object({
  ideas: z
    .array(
      z
        .string()
        .describe("A creative art idea based on the description and image."),
    )
    .describe("A list of art ideas."),
});
export type GenerateArtIdeasOutput = z.infer<
  typeof GenerateArtIdeasOutputSchema
>;

export async function generateArtIdeas(
  input: GenerateArtIdeasInput,
): Promise<GenerateArtIdeasOutput> {
  return generateArtIdeasFlow(input);
}

const generateArtIdeasPrompt = ai.definePrompt({
  name: "generateArtIdeasPrompt",
  input: { schema: GenerateArtIdeasInputSchema },
  output: { schema: GenerateArtIdeasOutputSchema },
  prompt: `You are an AI art idea generator. A user will provide a description of the art they want and optionally an image for inspiration. Generate three distinct and creative art ideas based on the description and image.

Description: {{{description}}}

{{#if imageDataUri}}
Image: {{media url=imageDataUri}}
{{/if}}

Art Ideas:
`,
});

const generateArtIdeasFlow = ai.defineFlow(
  {
    name: "generateArtIdeasFlow",
    inputSchema: GenerateArtIdeasInputSchema,
    outputSchema: GenerateArtIdeasOutputSchema,
  },
  async (input) => {
    const { output } = await generateArtIdeasPrompt(input);
    return output!;
  },
);
