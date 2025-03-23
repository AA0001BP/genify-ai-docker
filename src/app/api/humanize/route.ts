import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// API configuration
const API_KEY = process.env.NEXT_PUBLIC_HUMANIZER_API_KEY || '249c0ac0f5a7440299f8e6709c7bf157';
const BASE_URL = process.env.NEXT_PUBLIC_HUMANIZER_API_URL || 'https://bypass.hix.ai/api/hixbypass/v1';

const headers = {
  'Content-Type': 'application/json',
  'api-key': API_KEY
};

export async function POST(request: NextRequest) {
  try {
    // Get text from the request body
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Submit task to the API
    console.log('Submitting text to humanization API...');
    const submitResponse = await axios.post(
      `${BASE_URL}/submit`,
      {
        input: text,
        mode: 'Latest'
      },
      { headers }
    );
    
    if (submitResponse.data.err_code !== 0) {
      return NextResponse.json(
        { error: submitResponse.data.err_msg || 'Failed to submit task' },
        { status: 400 }
      );
    }
    
    const taskId = submitResponse.data.data.task_id;
    console.log('Task submitted successfully, task ID:', taskId);
    
    // Poll for results (max 15 attempts, 2s between attempts)
    for (let i = 0; i < 15; i++) {
      console.log(`Polling attempt ${i + 1}/15`);
      
      const pollResponse = await axios.get(`${BASE_URL}/obtain`, {
        params: { task_id: taskId },
        headers
      });
      
      if (pollResponse.data.err_code !== 0) {
        console.error('Error polling:', pollResponse.data.err_msg);
        continue;
      }
      
      if (pollResponse.data.data.subtask_status === 'completed') {
        console.log('Humanization completed successfully');
        return NextResponse.json({
          output: pollResponse.data.data.output,
          detection_result: pollResponse.data.data.detection_result,
          detection_score: pollResponse.data.data.detection_score
        });
      }
      
      // Wait before next poll
      await new Promise(res => setTimeout(res, 2000));
    }
    
    // If we get here, polling timed out
    return NextResponse.json(
      { error: 'Processing timed out' },
      { status: 408 }
    );
    
  } catch (error: any) {
    console.error('Error in humanize API route:', error);
    
    // Handle specific error types
    if (error.response) {
      // The request was made and the server responded with an error
      return NextResponse.json(
        { error: `API Error: ${error.response.status} - ${error.response.data?.err_msg || 'Unknown error'}` },
        { status: error.response.status || 500 }
      );
    } else if (error.request) {
      // The request was made but no response was received
      return NextResponse.json(
        { error: 'No response received from the humanization service' },
        { status: 503 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 