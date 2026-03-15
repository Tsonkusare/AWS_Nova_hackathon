import type { AnalysisResult } from '../types';

const API_BASE = '/api';

export async function analyzeText(
  text: string,
  language: string
): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE}/analyze/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.statusText}`);
  }

  return response.json();
}

export async function analyzeFile(
  file: File,
  language: string
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  const response = await fetch(`${API_BASE}/analyze/file`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`File analysis failed: ${response.statusText}`);
  }

  return response.json();
}

export async function generateText(category?: string, language?: string): Promise<{ text: string; category: string }> {
  const response = await fetch(`${API_BASE}/generate/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: category || null, language: language || 'en' }),
  });

  if (!response.ok) {
    throw new Error(`Generate failed: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchRegulations(params?: {
  jurisdiction?: string;
  status?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.jurisdiction) searchParams.set('jurisdiction', params.jurisdiction);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const response = await fetch(`${API_BASE}/regulations/?${searchParams}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch regulations: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchBills(params?: {
  jurisdiction?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.jurisdiction) searchParams.set('jurisdiction', params.jurisdiction);
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const response = await fetch(`${API_BASE}/bills/?${searchParams}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch bills: ${response.statusText}`);
  }
  return response.json();
}

export async function searchBills(query: string) {
  const response = await fetch(`${API_BASE}/bills/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error(`Failed to search bills: ${response.statusText}`);
  }
  return response.json();
}

export async function createProject(data: {
  name: string;
  industry?: string;
  region?: string;
  use_case?: string;
  description?: string;
}) {
  const response = await fetch(`${API_BASE}/projects/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create project: ${response.statusText}`);
  }
  return response.json();
}

export async function getProject(projectId: number) {
  const response = await fetch(`${API_BASE}/projects/${projectId}`);
  if (!response.ok) {
    throw new Error(`Failed to get project: ${response.statusText}`);
  }
  return response.json();
}

export async function translateText(text: string, fromLang: string, toLang: string): Promise<string> {
  const response = await fetch(`${API_BASE}/analyze/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, from_lang: fromLang, to_lang: toLang }),
  });

  if (!response.ok) return text;
  const data = await response.json();
  return data.text;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/`);
    return response.ok;
  } catch {
    return false;
  }
}
