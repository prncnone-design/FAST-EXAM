
import { GoogleGenAI, Type } from "@google/genai";
import { Question, UserAnswer, ExamResult } from "./types";

const examSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "The title of the exam.",
    },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING },
          instructions: { type: Type.STRING, description: "Specific instruction (e.g. 'Match items from Column A to B')." },
          type: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          matchingPairs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                key: { type: Type.STRING },
                value: { type: Type.STRING }
              },
              required: ["key", "value"]
            },
          },
          correctAnswer: { type: Type.STRING },
          points: { type: Type.NUMBER },
        },
        required: ["id", "text", "type", "correctAnswer", "points"],
      },
    },
  },
  required: ["title", "questions"],
};

const gradingSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER },
    totalPoints: { type: Type.NUMBER },
    breakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionId: { type: Type.STRING },
          isCorrect: { type: Type.BOOLEAN },
          earnedPoints: { type: Type.NUMBER },
          correctAnswer: { type: Type.STRING, description: "The correct key or ideal answer." },
          userAnswer: { type: Type.STRING, description: "The answer provided by the student." },
        },
        required: ["questionId", "isCorrect", "earnedPoints", "correctAnswer", "userAnswer"],
      }
    }
  },
  required: ["score", "totalPoints", "breakdown"],
};

export const parseExamContent = async (text: string, files: { data: string, mimeType: string }[]): Promise<{ title: string, questions: Question[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [{ text: `
    ACT AS: ABDY TAH Exam Digitizer.
    TASK: Convert the input into a structured exam.
    CONSTRAINTS: Use EXACT question text. Do not rewrite. 
    INSTRUCTIONS: For each question, provide a clear instructional prefix (e.g., "MATCHING: Choose the correct pair", "MCQ: Select one").
    FORMAT: Return pure JSON according to the schema.
  ` }];

  if (text) parts.push({ text: `Exam Content Text: ${text}` });
  files.forEach(file => {
    parts.push({ inlineData: { data: file.data.split(',')[1] || file.data, mimeType: file.mimeType } });
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: examSchema,
      temperature: 0.1,
    },
  });

  return JSON.parse(response.text);
};

export const gradeExam = async (questions: Question[], userAnswers: UserAnswer[]): Promise<ExamResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    ACT AS: ABDY TAH Exam Grader.
    TASK: Grade the user's submission based on the provided questions and correct keys.
    
    QUESTIONS (with keys): ${JSON.stringify(questions)}
    USER ANSWERS: ${JSON.stringify(userAnswers)}
    
    GRADING LOGIC:
    - MCQ/TRUE_FALSE: Only exact matches earn points.
    - MATCHING: User answer is stringified JSON. Score based on correct pairings.
    - WORKOUT/FILL-IN-BLANK: Evaluate semantically. Award full points for conceptual correctness.
    - Points: Do not exceed the points allotted per question.
    
    OUTPUT: Valid JSON matching the required schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: gradingSchema,
      temperature: 0.1,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from grading engine.");
  return JSON.parse(text);
};
