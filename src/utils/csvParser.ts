import Papa from 'papaparse';
import { Show } from '../types';

export const parseCSV = (csvText: string): Show[] => {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim()
  });

  return result.data as Show[];
};

export const loadShowsFromCSV = async (): Promise<Show[]> => {
  try {
    const response = await fetch('/shows.csv');
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Error loading CSV:', error);
    throw new Error('Failed to load shows data');
  }
};

