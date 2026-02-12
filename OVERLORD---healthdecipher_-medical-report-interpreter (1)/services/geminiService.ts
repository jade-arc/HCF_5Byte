
import { GoogleGenAI, Type } from '@google/genai';
import type { InterpretedResult, InterpretedPrescription, SymptomCorrelation, Report } from '../types';

const fileToGenerativePart = (data: string, mimeType: string) => {
  return {
    inlineData: {
      data,
      mimeType,
    },
  };
};

export async function correlateSymptoms(
    symptoms: string,
    latestReport: Report | null,
    apiKey: string
): Promise<SymptomCorrelation> {
    if (!apiKey) {
        throw new Error("API Key is missing.");
    }
    
    let contextPrompt = `Analyze the following symptoms reported by a user: "${symptoms}".`;
    if (latestReport && latestReport.results.length > 0) {
        const reportSummary = latestReport.results
            .map(r => `${r.Term}: ${r.Value} (${r.Status})`)
            .join(', ');
        contextPrompt += `\n\nHere is their most recent lab report for context: ${reportSummary}. Identify potential links between their symptoms and any abnormal lab values. Suggest a course of action. If no direct link is obvious, state that and recommend consulting a doctor.`;
    } else {
        contextPrompt += `\n\nNo recent lab data is available. Analyze the symptoms based on general medical knowledge and suggest a course of action.`;
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: contextPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        Symptom: { type: Type.STRING, description: "The primary symptom identified from the user's input." },
                        PossibleCauses: {
                            type: Type.ARRAY,
                            description: "A list of possible links to lab results.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    Biomarker: { type: Type.STRING, description: "The related lab parameter (e.g., 'Hemoglobin')." },
                                    Finding: { type: Type.STRING, description: "The lab result status (e.g., 'Low')." },
                                    Explanation: { type: Type.STRING, description: "How this lab result could cause the symptom." }
                                }
                            }
                        },
                        SuggestedAction: { type: Type.STRING, description: "Recommended next steps for the user." }
                    },
                    required: ['Symptom', 'PossibleCauses', 'SuggestedAction']
                }
            }
        });

        const jsonText = result.text?.trim();
        if (!jsonText) throw new Error("Symptom analysis returned an empty response.");
        return JSON.parse(jsonText) as SymptomCorrelation;
    } catch(error) {
        console.error('Error correlating symptoms:', error);
        throw new Error('Failed to communicate with the AI model for symptom analysis.');
    }
}

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
    const currentDate = new Date().toISOString().split('T')[0];

    const prompt = `You are an expert at reading medical prescriptions. Analyze the following document. For each medication, extract its name, dosage, frequency, and reason. Crucially, if you find any instructions for a follow-up appointment (e.g., "follow up in 2 weeks", "return on July 15th"), calculate the specific date based on today's date (${currentDate}) and return it ONLY in YYYY-MM-DD format. Structure the output as a JSON array.`;

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
                            Frequency: { type: Type.STRING, description: 'How often to take it (e.g., "Twice a day").' },
                            Reason: { type: Type.STRING, description: 'The reason for the prescription.' },
                            FollowUpAppointment: { type: Type.STRING, description: 'The calculated follow-up date in YYYY-MM-DD format.' }
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
): Promise<Pick<Report, 'results' | 'confidenceScore' | 'confidenceReason'>> {
  if (!apiKey) {
    throw new Error("API Key is missing. Please add your API key to proceed.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    onProgress('Extracting text from document...');
    const ocrPrompt = `You are an expert OCR system specializing in medical documents. Extract all the text from this blood report, paying close attention to the Complete Blood Count (CBC) section. Present the extracted CBC results as a clean list of key-value pairs (e.g., 'Hemoglobin: 14.5 g/dL', 'RBC: 4.7 x10^6/uL', 'Normal Range: 4.2-5.4'). Ignore any non-CBC data. Also, assess the clarity of the document and provide a confidence score (0-100) and a brief reason. Format the output as a JSON object with "extractedText", "confidenceScore", and "confidenceReason" keys.`;

    const imagePart = fileToGenerativePart(fileData, mimeType);
    
    const ocrResult = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [imagePart, { text: ocrPrompt }] },
        config: { responseMimeType: 'application/json' }
    });

    const ocrResponse = JSON.parse(ocrResult.text.trim());
    const { extractedText, confidenceScore, confidenceReason } = ocrResponse;
    
    if (!extractedText) {
      throw new Error('OCR failed. Could not extract text from the document.');
    }
    
    onProgress('Interpreting medical data...');
    const interpretationPrompt = `You are a medical data analyst. Take the following CBC results and interpret them. For each item, provide the Term, Status (High, Low, Normal), Value, NormalRange, a SimpleExplanation, ActionableAdvice, a "WhyItMatters" explanation, and a "WhenToWorry" explanation. Structure your response as a JSON array of objects. The CBC results are:\n---\n${extractedText}\n---`;

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
              Term: { type: Type.STRING },
              Status: { type: Type.STRING },
              Value: { type: Type.STRING },
              NormalRange: { type: Type.STRING },
              SimpleExplanation: { type: Type.STRING },
              ActionableAdvice: { type: Type.STRING },
              WhyItMatters: { type: Type.STRING },
              WhenToWorry: { type: Type.STRING },
            },
            required: ['Term', 'Status', 'Value', 'NormalRange', 'SimpleExplanation', 'ActionableAdvice', 'WhyItMatters', 'WhenToWorry'],
          },
        },
      },
    });

    const jsonText = interpretationResult.text?.trim();
    if (!jsonText) {
        throw new Error("Interpretation failed. The model returned an empty response.");
    }
    
    const results = JSON.parse(jsonText) as InterpretedResult[];
    return { results, confidenceScore, confidenceReason };

  } catch (error) {
    console.error('Error in Gemini service:', error);
    let detailedMessage = 'Failed to communicate with the AI model. Please try again.';
    if (error instanceof Error) {
        if (error.message.includes('API key')) {
            detailedMessage = 'The provided API Key is invalid or has insufficient permissions.';
        } else if (error.message.toLowerCase().includes('json')) {
            detailedMessage = 'The AI model returned an unexpected format. Failed to parse the interpretation.';
        } else {
            detailedMessage = error.message || detailedMessage;
        }
    }
    throw new Error(detailedMessage);
  }
}
