import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { auth } from './firebase';

// Define the screen dimensions for the webcam view
const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'environment' // Use the rear camera
};

// Define the maximum dimension for the output image
const IMAGE_MAX_WIDTH = 1920;

export const ImageCapture = () => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const captureAndProcess = useCallback(async () => {
    if (!webcamRef.current) return;
    setIsProcessing(true);
    setStatusMessage('Capturing image...');

    // 1. Capture the raw, high-resolution screenshot from the webcam
    const rawImageSrc = webcamRef.current.getScreenshot();
    if (!rawImageSrc) {
      setStatusMessage('Failed to capture image.');
      setIsProcessing(false);
      return;
    }

    // --- SRE OPTIMIZATION: Client-side Resizing & Compression ---
    setStatusMessage('Optimizing image...');
    const optimizedImage = await new Promise<string | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = img.width / img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        if (width > IMAGE_MAX_WIDTH) {
          width = IMAGE_MAX_WIDTH;
          height = width / ratio;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        
        // Draw the resized image onto the canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export the canvas content as a compressed JPEG base64 string
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.9); // 90% quality
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(null);
      img.src = rawImageSrc;
    });
    // --- End of Optimization ---

    if (!optimizedImage) {
      setStatusMessage('Failed to optimize image.');
      setIsProcessing(false);
      return;
    }

    setImgSrc(optimizedImage); // Show the captured (and now optimized) image
    setStatusMessage('Image captured! Sending to server...');

    // 3. Send the OPTIMIZED image to the backend
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated.');

      const token = await user.getIdToken();
      const backendUrl = `${import.meta.env.VITE_BACKEND_API_URL}/process`;

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ image: optimizedImage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server responded with an error.');
      }

      const result = await response.json();
      setStatusMessage(`Success: ${result.message}`);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [webcamRef]);

  const retakePhoto = () => {
    setImgSrc(null);
    setStatusMessage('');
  };

  return (
    <div className="capture-container">
      {imgSrc ? (
        <>
          <img src={imgSrc} alt="Captured" />
          <button onClick={retakePhoto} disabled={isProcessing}>Retake Photo</button>
        </>
      ) : (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          screenshotQuality={1} // Capture at full quality, we will compress later
        />
      )}
      <div className="controls">
        {!imgSrc && (
          <button onClick={captureAndProcess} disabled={isProcessing}>Capture photo</button>
        )}
        {isProcessing && <p>Processing...</p>}
        {statusMessage && <p>{statusMessage}</p>}
      </div>
    </div>
  );
};