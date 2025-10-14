// src/lib/googleSheets.ts
import { supabase } from './supabase';

interface SubmissionData {
  name: string;
  wallet: string;
  link: string;
  email?: string;
  contentTags?: string[];
}

export const addSubmissionToSheet = async (data: SubmissionData): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Getting session...');
    
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('No session:', sessionError);
      return { success: false, error: 'Please log in to submit' };
    }

    console.log('Session found, calling Netlify function...');
    console.log('Token length:', session.access_token.length);

    // Call Netlify function with authorization header
    const response = await fetch('/.netlify/functions/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}` // This is the key line
      },
      body: JSON.stringify({
        name: data.name,
        wallet: data.wallet,
        link: data.link,
        contentTags: data.contentTags || []
      })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }
      
      return { success: false, error: errorData.error || 'Submission failed' };
    }

    const result = await response.json();
    console.log('✅ Success:', result);
    
    return { success: true };

  } catch (error) {
    console.error('Submission error:', error);
    return { success: false, error: 'Submission failed. Please try again.' };
  }
};
