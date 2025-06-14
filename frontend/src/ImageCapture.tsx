// frontend/src/ImageCapture.tsx

import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { auth } from './firebase';

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'environment'
};

const IMAGE_MAX_WIDTH = 3000;
const IMAGE_COMPRESSION_QUALITY = 1.0;

export const ImageCapture = () => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>(''); 

  const captureAndProcess = useCallback(async () => {
    if (!webcamRef.current) return;
    setIsProcessing(true);
    setStatusMessage('Capturing image...');
    setDownloadUrl(''); // Clear previous download URL when starting a new capture

    const rawImageSrc = webcamRef.current.getScreenshot({
        width: 1920, // Request higher capture resolution
        height: 1080
    });
    if (!rawImageSrc) {
      setStatusMessage('Failed to capture image.');
      setIsProcessing(false);
      return;
    }

    setStatusMessage('Optimizing image...');
    const optimizedImage = await new Promise<string | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = img.width / img.height;
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
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', IMAGE_COMPRESSION_QUALITY);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(null);
      img.src = rawImageSrc;
    });

    if (!optimizedImage) {
      setStatusMessage('Failed to optimize image.');
      setIsProcessing(false);
      return;
    }

    setImgSrc(optimizedImage);
    setStatusMessage('Image captured! Sending to server...');

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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Server responded with an error.');
      }

      setStatusMessage(`Success: ${result.message}`);
      setDownloadUrl(result.markdownUrl); // Store the secure download URL
      setImgSrc(null); // Hide the captured image preview
      
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [webcamRef]);

  const retakePhoto = () => {
    setImgSrc(null);
    setStatusMessage('');
    setDownloadUrl(''); 
  };

  const processAnother = () => {
    console.log("Process Another clicked. Initiating full state reset."); // Debugging log
    setDownloadUrl(''); 
    setImgSrc(null);    
    setIsProcessing(false); 
    setStatusMessage('');   
  };

  return (
    <div className="capture-container">
      {downloadUrl ? (
        <div className="result-container">
          <h3>Entry Saved!</h3>
          <p>Your journal entry has been processed and saved securely.</p>
          <a href={downloadUrl} className="button" target="_blank" rel="noopener noreferrer">
            Download .md File
          </a>
          <button onClick={processAnother} style={{marginLeft: '10px'}}>Process Another</button>
        </div>
      ) : imgSrc ? ( 
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
          screenshotQuality={1}
          // The key ensures Webcam remounts for a fresh start when its state context changes
          key={downloadUrl || imgSrc ? 'result-or-preview' : 'camera-view'} 
        />
      )}
      <div className="controls">
        {!imgSrc && !downloadUrl && ( 
          <button onClick={captureAndProcess} disabled={isProcessing}>Capture photo</button>
        )}
        {isProcessing && <p>Processing...</p>}
        {!isProcessing && statusMessage && <p>{statusMessage}</p>}
      </div>
    </div>
  );
};