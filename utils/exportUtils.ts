import { JournalEntry } from '@/hooks/useJournal';
import { Platform } from 'react-native';

export interface ExportOptions {
  format: 'pdf' | 'word';
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeMoods?: boolean;
  includeTags?: boolean;
}

export interface ExportResult {
  success: boolean;
  fileName?: string;
  error?: string;
  downloadUrl?: string;
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatMood = (mood?: string): string => {
  if (!mood) return '';
  return mood.charAt(0).toUpperCase() + mood.slice(1);
};

const generateTextContent = (entries: JournalEntry[], options: ExportOptions): string => {
  const title = `Journal Export - ${new Date().toLocaleDateString()}`;
  const separator = '=' .repeat(50);
  
  let content = `${title}\n${separator}\n\n`;
  
  if (entries.length === 0) {
    content += 'No journal entries found for the selected period.\n';
    return content;
  }

  entries.forEach((entry, index) => {
    content += `Entry ${index + 1}\n`;
    content += `Date: ${formatDate(entry.date)}\n`;
    
    if (options.includeMoods && entry.mood) {
      content += `Mood: ${formatMood(entry.mood)}\n`;
    }
    
    if (options.includeTags && entry.tags && entry.tags.length > 0) {
      content += `Tags: ${entry.tags.join(', ')}\n`;
    }
    
    content += `\n${entry.text}\n\n`;
    content += '-'.repeat(30) + '\n\n';
  });

  return content;
};

const downloadFile = async (content: string, fileName: string, mimeType: string): Promise<ExportResult> => {
  try {
    if (Platform.OS === 'web') {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { success: true, fileName };
    } else {
      // For mobile, we'll use a simple alert for now
      // In a real app, you would use expo-file-system and expo-sharing
      console.log('Mobile export not fully implemented - would save file:', fileName);
      return { success: true, fileName };
    }
  } catch (error) {
    console.error('Export error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Export failed' 
    };
  }
};

export const exportToPDF = async (
  entries: JournalEntry[], 
  options: ExportOptions = { format: 'pdf' }
): Promise<ExportResult> => {
  try {
    const filteredEntries = options.dateRange 
      ? entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= options.dateRange!.start && entryDate <= options.dateRange!.end;
        })
      : entries;

    const content = generateTextContent(filteredEntries, options);
    const fileName = `journal-export-${new Date().toISOString().split('T')[0]}.txt`;
    
    // For a real PDF export, you would use a library like react-native-html-to-pdf
    // or generate HTML and convert to PDF. For now, we'll export as text.
    return await downloadFile(content, fileName, 'text/plain');
    
  } catch (error) {
    console.error('PDF export error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'PDF export failed' 
    };
  }
};

export const exportToWord = async (
  entries: JournalEntry[], 
  options: ExportOptions = { format: 'word' }
): Promise<ExportResult> => {
  try {
    const filteredEntries = options.dateRange 
      ? entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= options.dateRange!.start && entryDate <= options.dateRange!.end;
        })
      : entries;

    // Generate RTF content (Rich Text Format) which can be opened by Word
    let rtfContent = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}';
    rtfContent += '\\f0\\fs24 ';
    
    const title = `Journal Export - ${new Date().toLocaleDateString()}`;
    rtfContent += `{\\b ${title}}\\par\\par`;
    
    if (filteredEntries.length === 0) {
      rtfContent += 'No journal entries found for the selected period.\\par';
    } else {
      filteredEntries.forEach((entry, index) => {
        rtfContent += `{\\b Entry ${index + 1}}\\par`;
        rtfContent += `Date: ${formatDate(entry.date)}\\par`;
        
        if (options.includeMoods && entry.mood) {
          rtfContent += `Mood: ${formatMood(entry.mood)}\\par`;
        }
        
        if (options.includeTags && entry.tags && entry.tags.length > 0) {
          rtfContent += `Tags: ${entry.tags.join(', ')}\\par`;
        }
        
        rtfContent += '\\par';
        rtfContent += entry.text.replace(/\n/g, '\\par ') + '\\par\\par';
        rtfContent += '\\line\\par';
      });
    }
    
    rtfContent += '}';
    
    const fileName = `journal-export-${new Date().toISOString().split('T')[0]}.rtf`;
    return await downloadFile(rtfContent, fileName, 'application/rtf');
    
  } catch (error) {
    console.error('Word export error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Word export failed' 
    };
  }
};

export const exportEntries = async (
  entries: JournalEntry[],
  options: ExportOptions
): Promise<ExportResult> => {
  if (options.format === 'pdf') {
    return await exportToPDF(entries, options);
  } else if (options.format === 'word') {
    return await exportToWord(entries, options);
  } else {
    return { success: false, error: 'Unsupported export format' };
  }
};