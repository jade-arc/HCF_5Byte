
import { GoogleGenAI, Type } from '@google/genai';
import type { InterpretedResult, InterpretedPrescription } from '../types';

export async function validateApiKey(apiKey: string): Promise<{isValid: boolean, message: string}> {
  if (!apiKey) {
    return { isValid: false, message: 'API Key cannot be empty.' };
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    // A very simple prompt to test connectivity and authentication.
    await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'h', // one character prompt to minimize cost
    });
    return { isValid: true, message: 'API Key is valid and saved successfully!' };
  } catch (error) {
    console.error("API Key validation failed:", error);
    if (error instanceof Error) {
        // Specific check for common API key-related error messages from Google's API
        if (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID')) {
            return { isValid: false, message: 'The provided API key is not valid. Please check it and try again.' };
        }
        // Handle other potential issues like network errors
        if (error.message.includes('fetch')) {
             return { isValid: false, message: 'Could not connect to the AI service. Please check your network connection.' };
        }
    }
    // Generic failure message
    return { isValid: false, message: 'This API key is not supported or an unknown error occurred.' };
  }
}

const fileToGenerativePart = (data: string, mimeType: string) => {
  return {
    inlineData: {
      data,
      mimeType,
    },
  };
};

export async function interpretPrescription(
    fileData: string,
    mimeType: string,
    apiKey: string
): Promise<InterpretedPrescription[]> {
    if (!apiKey) {
        throw new Error("API Key is missing.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const imagePart = fileToGenerativePart(fileData, mimeType);

    const prompt = `You are an expert at reading and interpreting medical prescriptions. Analyze the following prescription document and extract the key information for each medication listed. Structure the output as a JSON array of objects.`;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            Medication: { type: Type.STRING, description: 'The name of the medication.' },
                            Dosage: { type: Type.STRING, description: 'The dosage (e.g., "500mg", "1 tablet").' },
                            Frequency: { type: Type.STRING, description: 'How often to take it (e.g., "Twice a day", "Every 6 hours").' },
                            Reason: { type: Type.STRING, description: 'The reason or diagnosis for the prescription.' }
                        },
                        required: ['Medication', 'Dosage', 'Frequency', 'Reason']
                    }
                }
            }
        });
        
        const jsonText = result.text?.trim();
        if (!jsonText) {
            throw new Error("Interpretation failed. The model returned an empty response.");
        }
        
        return JSON.parse(jsonText) as InterpretedPrescription[];

    } catch(error) {
        console.error('Error interpreting prescription:', error);
        let detailedMessage = 'Failed to communicate with the AI model for prescription analysis.';
        if (error instanceof Error && error.message.includes('API key')) {
            detailedMessage = 'The provided API Key is invalid or has insufficient permissions.';
        }
        throw new Error(detailedMessage);
    }
}


export async function interpretMedicalReport(
  fileData: string,
  mimeType: string,
  apiKey: string,
  onProgress: (message: string) => void,
): Promise<InterpretedResult[]> {
  if (!apiKey) {
    throw new Error("API Key is missing. Please add your API key to proceed.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    // --- Step 1: OCR to extract text from the image ---
    onProgress('Extracting text from document...');
    const ocrPrompt = `You are an expert OCR system specializing in medical documents. Extract all the text from this blood report, paying close attention to the Complete Blood Count (CBC) section. Present the extracted CBC results as a clean list of key-value pairs (e.g., 'Hemoglobin: 14.5 g/dL', 'RBC: 4.7 x10^6/uL', 'Normal Range: 4.2-5.4'). Ignore any non-CBC data.`;

    const imagePart = fileToGenerativePart(fileData, mimeType);
    
    const ocrResult = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [imagePart, { text: ocrPrompt }] },
    });

    const extractedText = ocrResult.text;
    if (!extractedText) {
      throw new Error('OCR failed. Could not extract text from the document.');
    }
    
    // --- Step 2: Interpret the extracted text ---
    onProgress('Interpreting medical data...');
    const interpretationPrompt = `You are a medical data analyst with expertise in explaining complex lab results to patients. Take the following Complete Blood Count (CBC) results and interpret them. For each significant item, identify the term, its status (High, Low, or Normal based on typical reference ranges), the patient's specific value with units, and the normal range provided in the report. Provide a simple explanation understandable by a layperson and give actionable advice. Structure your response as a JSON array of objects. The CBC results are:
    ---
    ${extractedText}
    ---
    `;

    const interpretationResult = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: interpretationPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              Term: {
                type: Type.STRING,
                description: 'The name of the medical term (e.g., "Hemoglobin", "Lymphocytes").',
              },
              Status: {
                type: Type.STRING,
                description: 'The status of the result, typically "High", "Low", or "Normal".',
              },
              Value: {
                type: Type.STRING,
                description: 'The specific value from the report, including units (e.g., "14.5 g/dL").',
              },
              NormalRange: {
                type: Type.STRING,
                description: 'The normal range for this term as stated on the report (e.g., "13.5 - 17.5 g/dL").',
              },
              SimpleExplanation: {
                type: Type.STRING,
                description: 'A brief, easy-to-understand explanation of what this term means.',
              },
              ActionableAdvice: {
                type: Type.STRING,
                description: 'Simple, actionable advice for the user. Always include a disclaimer to consult a doctor.',
              },
            },
            required: ['Term', 'Status', 'Value', 'NormalRange', 'SimpleExplanation', 'ActionableAdvice'],
          },
        },
      },
    });

    const jsonText = interpretationResult.text?.trim();
    if (!jsonText) {
        throw new Error("Interpretation failed. The model returned an empty response.");
    }
    
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as InterpretedResult[];

  } catch (error) {
    console.error('Error in Gemini service:', error);
    let detailedMessage = 'Failed to communicate with the AI model. Please try again.';
    if (error instanceof Error) {
        if (error.message.includes('API key')) {
            detailedMessage = 'The provided API Key is invalid or has insufficient permissions. Please check your key and try again.';
        } else if (error.message.toLowerCase().includes('json')) {
            detailedMessage = 'The AI model returned an unexpected format. Failed to parse the interpretation.';
        } else {
            detailedMessage = error.message || detailedMessage;
        }
    } else if (typeof error === 'string') {
        detailedMessage = error;
    }
    throw new Error(detailedMessage);
  }
}