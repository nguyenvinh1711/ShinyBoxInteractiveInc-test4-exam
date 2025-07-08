import { Button, Alert } from 'react-daisyui';
import { RetryFailed } from './ui/RetryFailed';

function ErrorFallback({ error, resetErrorBoundary }) {
    // Call resetErrorBoundary() to reset the error boundary and retry the render.

    const errorMessage = error && error.message ? error.message : error;
    console.log("errorMessage", errorMessage);

    return (
        <Alert color="warning" className="text-center flex flex-col items-center justify-center max-w-[90%]">

            <b>Oops! Something went wrong:</b>
            <p className="text-red-500">
                {errorMessage}
            </p>
            <Button onClick={resetErrorBoundary} color="warning" className="mt-5" data-testid="retry-button">
                <RetryFailed />
                Click here to try again</Button>
        </Alert>
    );
}

export default ErrorFallback;