# APP-REC-044 Browser Runtime Inspection

## Perform these steps

1. Open Developer Tools (F12).

2. Select the Console tab.

3. Clear the console.

4. Refresh /hub/dashboard.

5. Copy every message that appears, including:
   - Uncaught Error
   - TypeError
   - ReferenceError
   - React warnings
   - Failed network requests
   - Stack traces

6. Also open the Network tab.

7. Refresh again.

8. Verify whether any request is red (4xx/5xx) or cancelled.

## Expected

Backend:
✓ Already certified.

Frontend:
This inspection should reveal any render-time exception or failing child component.
