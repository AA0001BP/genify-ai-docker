import axios from 'axios';

// API configuration
const API_KEY = process.env.NEXT_PUBLIC_HUMANIZER_API_KEY || '249c0ac0f5a7440299f8e6709c7bf157';
const BASE_URL = process.env.NEXT_PUBLIC_HUMANIZER_API_URL || 'https://bypass.hix.ai/api/hixbypass/v1';

const headers = {
  'Content-Type': 'application/json',
  'api-key': API_KEY
};

// Submit a humanization task
async function submitHumanizationTask(inputText: string): Promise<string> {
  try {
    console.log('Submitting text for humanization...');
    console.log('API URL:', `${BASE_URL}/submit`);
    
    const response = await axios.post(`${BASE_URL}/submit`, {
      input: inputText,
      mode: "Latest" // Always use Latest mode
    }, { headers });
    
    console.log('Submit API response:', response.data);
    
    if (response.data.err_code === 0) {
      return response.data.data.task_id;
    } else {
      throw new Error('Submission failed: ' + response.data.err_msg);
    }
  } catch (error: any) {
    console.error('Error submitting humanization task:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      throw new Error(`API error: ${error.response.status} - ${error.response.data?.err_msg || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
}

// Poll the task until it's complete
async function getHumanizationResult(taskId: string, retries = 15, delay = 2000): Promise<string> {
  console.log('Getting humanization result for task ID:', taskId);
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Poll attempt ${i+1}/${retries}...`);
      
      const response = await axios.get(`${BASE_URL}/obtain`, {
        params: { task_id: taskId },
        headers
      });
      
      console.log('Poll response:', response.data);
      
      if (response.data.err_code === 0) {
        if (response.data.data.subtask_status === 'completed') {
          console.log('Humanization completed successfully');
          return response.data.data.output;
        } else if (response.data.data.subtask_status === 'waiting') {
          console.log('Task still processing, waiting...');
        } else {
          console.log('Unknown status:', response.data.data.subtask_status);
        }
      } else {
        console.error('Error in polling:', response.data.err_msg);
      }
      
      // Wait between polls
      console.log(`Waiting ${delay}ms before next poll...`);
      await new Promise(res => setTimeout(res, delay));
    } catch (error: any) {
      console.error('Error getting humanization result:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      // Don't throw here, try the next poll
      console.log('Will retry in next poll...');
    }
  }
  
  throw new Error('Timeout: Task did not complete in time.');
}

// Main function to humanize text
export const humanizeText = async (text: string): Promise<string> => {
  try {
    console.log('Calling server-side API route for humanization');
    
    // Use our internal API route
    const response = await axios.post('/api/humanize', { text });
    
    if (response.data.output) {
      return response.data.output;
    } else if (response.data.error) {
      throw new Error(response.data.error);
    } else {
      throw new Error('No output received from humanization service');
    }
  } catch (error: any) {
    console.error('Error humanizing text:', error);
    
    // If API fails, fall back to simulation in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('API request failed, falling back to simulation');
      return simulateHumanization(text);
    }
    
    throw new Error(error.response?.data?.error || error.message || 'Failed to humanize text. Please try again.');
  }
};

// This is just a simple simulation of text humanization for demo purposes
const simulateHumanization = (text: string): string => {
  // Replace common robotic patterns with more human-like ones
  let humanized = text;
  
  // Replace bullet points
  humanized = humanized.replace(/• /g, '- ');
  
  // Replace formal language
  humanized = humanized.replace(/utilize/gi, 'use');
  humanized = humanized.replace(/implement/gi, 'set up');
  humanized = humanized.replace(/obtain/gi, 'get');
  humanized = humanized.replace(/commence/gi, 'start');
  humanized = humanized.replace(/terminate/gi, 'end');
  
  // Add conversational tone
  humanized = humanized.replace(/It is recommended/gi, 'I recommend');
  humanized = humanized.replace(/Please note that/gi, 'Keep in mind');
  humanized = humanized.replace(/In conclusion/gi, 'To wrap up');
  
  // Add some variety to sentence beginnings
  humanized = humanized.replace(/Additionally,/gi, 'Also,');
  humanized = humanized.replace(/Furthermore,/gi, 'Plus,');
  humanized = humanized.replace(/However,/gi, 'But,');
  
  // Add contractions
  humanized = humanized.replace(/it is/gi, "it's");
  humanized = humanized.replace(/cannot/gi, "can't");
  humanized = humanized.replace(/will not/gi, "won't");
  humanized = humanized.replace(/do not/gi, "don't");
  
  // Add some simulated filler for demonstration
  humanized = humanized + "\n\n[Note: This text was processed with the simulation mode because the API connection failed. In production, this would use the real API.]";
  
  return humanized;
}; 