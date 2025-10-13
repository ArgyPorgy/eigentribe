// src/lib/googleSheets.ts
import { supabase } from './supabase';

interface SubmissionData {
  name: string;
  wallet: string;
  link: string;
  email?: string;
  contentTags?: string[];
}

export const addSubmissionToSheet = async (data: SubmissionData): Promise<boolean> => {
  try {
    console.log('Getting session...');
    
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('No session:', sessionError);
      alert('Please log in to submit');
      return false;
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
        link: data.link
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
      
      alert(errorData.error || 'Submission failed');
      return false;
    }

    const result = await response.json();
    console.log('✅ Success:', result);
    
    return true;

  } catch (error) {
    console.error('Submission error:', error);
    alert('Submission failed. Please try again.');
    return false;
  }
};
