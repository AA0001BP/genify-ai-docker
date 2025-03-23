# Humanizer API Integration Documentation

This document explains how the Humanizer API is integrated into our application.

## API Configuration

The API is configured using environment variables:

```
NEXT_PUBLIC_HUMANIZER_API_KEY=ce5c178fc7644851bced0bcb19ab881f
NEXT_PUBLIC_HUMANIZER_API_URL=https://bypass.hix.ai/api/hixbypass/v1
NEXT_PUBLIC_USE_REAL_API=true|false
```

## API Workflow

The humanization process follows these steps:

1. **Submit a Text for Humanization**
   - Endpoint: `POST /submit`
   - Request body: 
     ```json
     {
       "input": "Text to humanize (min 50 words)",
       "mode": "Latest"
     }
     ```
   - Response:
     ```json
     {
       "err_code": 0,
       "err_msg": "Success",
       "data": {
         "task_id": "unique-task-id"
       }
     }
     ```

2. **Retrieve the Humanized Result**
   - Endpoint: `GET /obtain?task_id=unique-task-id`
   - Response:
     ```json
     {
       "err_code": 0,
       "err_msg": "Success",
       "data": {
         "input": "...original text...",
         "output": "...humanized version...",
         "subtask_status": "completed",
         "detection_result": "human",
         "detection_score": 100
       }
     }
     ```
   - Pending Response:
     ```json
     {
       "err_code": 0,
       "err_msg": "Success",
       "data": {
         "subtask_status": "waiting",
         "task_status": true
       }
     }
     ```
   - Note: The API is polled until `subtask_status` is `completed`.

## Implementation Details

The API integration is implemented in `src/lib/api.ts` with these main functions:

1. `submitHumanizationTask`: Submits the input text to the API using the "Latest" mode and returns a task ID.
2. `getHumanizationResult`: Polls the API for the result using the task ID.
3. `humanizeText`: Main function that orchestrates the workflow.

### Simulation Mode

For development purposes, the application can use a simulated API instead of calling the real endpoints. This is controlled by the `NEXT_PUBLIC_USE_REAL_API` environment variable.

When set to `false`, the application uses a local function called `simulateHumanization` that makes basic text transformations to mimic the real API.

## Error Handling

The API integration includes comprehensive error handling:

- API submission errors are caught and reported
- Polling timeout is implemented to prevent infinite waiting
- User-friendly error messages are displayed in the UI
- Input validation ensures the text meets the minimum 50-word requirement

## Requirements and Limitations

- Input text must be at least 50 words long
- The API uses the "Latest" mode for most advanced and effective humanization
- The API response may take time depending on the length and complexity of the text 