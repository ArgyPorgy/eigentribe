// src/lib/googleSheets.ts

interface SubmissionData {
  name: string;
  wallet: string;
  link: string;
  email?: string;
}

export const addSubmissionToSheet = async (data: SubmissionData): Promise<boolean> => {
  const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;

  if (!GOOGLE_SCRIPT_URL) {
    console.error('Google Apps Script URL not configured');
    return false;
  }

  try {
    console.log('Submitting to Google Sheets...', data);
    
    // Using no-cors mode - submission works even though we get HTML error
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    console.log('Submission sent successfully!');
    return true;
    
  } catch (error) {
    console.error('Error submitting:', error);
    return false;
  }
};
