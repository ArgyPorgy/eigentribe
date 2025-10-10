// Google Sheets integration utility (Client-side only)
export interface SubmissionData {
  name: string;
  wallet: string;
  link: string;
}

// Method 1: Google Apps Script (Recommended for client-side)
export async function addSubmissionViaAppsScript(data: SubmissionData): Promise<boolean> {
  try {
    const APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
    
    if (!APPS_SCRIPT_URL) {
      console.error('Google Apps Script URL not configured');
      return false;
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.text();
      console.log('Successfully added submission via Apps Script:', result);
      return true;
    } else {
      console.error('Failed to add submission via Apps Script:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error adding submission via Apps Script:', error);
    return false;
  }
}

// Method 2: Form submission to Google Forms (Alternative)
export async function addSubmissionViaGoogleForms(data: SubmissionData): Promise<boolean> {
  try {
    const FORM_URL = import.meta.env.VITE_GOOGLE_FORM_URL;
    
    if (!FORM_URL) {
      console.error('Google Form URL not configured');
      return false;
    }

    // Create form data
    const formData = new FormData();
    formData.append('entry.NAME_FIELD_ID', data.name);
    formData.append('entry.WALLET_FIELD_ID', data.wallet);
    formData.append('entry.LINK_FIELD_ID', data.link);

    const response = await fetch(FORM_URL, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      console.log('Successfully added submission via Google Forms');
      return true;
    } else {
      console.error('Failed to add submission via Google Forms');
      return false;
    }
  } catch (error) {
    console.error('Error adding submission via Google Forms:', error);
    return false;
  }
}

// Legacy function for backward compatibility
export async function addSubmissionToSheet(data: SubmissionData): Promise<boolean> {
  // Try Apps Script first, then Google Forms as fallback
  let success = await addSubmissionViaAppsScript(data);
  
  if (!success) {
    success = await addSubmissionViaGoogleForms(data);
  }
  
  return success;
}
