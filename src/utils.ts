import { GoogleGenAI } from "@google/genai";
import 'dotenv/config'

/**
 * Get a random number between two values.
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns A random number between min(0) and max(100).
 */
function getRandomArbitrary(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}

/**
 * Generates a unique codename for a gadget using Google GenAI.
 * @param projectId - The Google Cloud project ID.
 * @param location - The Google Cloud location.
 * @param gadgetNames - An array of existing gadget names to avoid duplicates.
 * @returns A promise that resolves to the generated codename.
 */
async function generateCodename(
  gadgetNames: string[],
  projectId: string = process.env.GOOGLE_CLOUD_PROJECT_ID,
  location: string = process.env.GOOGLE_CLOUD_LOCATION,
) {

  let response: any;

  try {
      const ai = new GoogleGenAI({
        vertexai: true,
        project: projectId,
        location: location,
      });

      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Return a single 2-word codename starting with "The" (e.g., "The Nightangle", "The Kraken"). Your response 
                  is intended to be stored in the name field of a row in a database table, so it should only have one 
                  codename. To avoid duplicates, it should not be included in this array of existing codenames: 
                  ${gadgetNames}`,
      });

      // console.log(response.text);
  } catch (error) {
    console.error(`Error generating codename: ${error}`);
    throw new Error(`Failed to generate codename: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return response.text;
}

export { getRandomArbitrary, generateCodename }

