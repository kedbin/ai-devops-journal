import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { auth } from './firebase';

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'environment'
};

const IMAGE_MAX_WIDTH = 3000;
const IMAGE_COMPRESSION_QUALITY = 1.0; // Max quality for best OCR

export const ImageCapture = () => {
  // --- Simplified State Management ---
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null); // For the photo preview
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // State for the final results from the single API call
  const [downloadUrl, setDownloadUrl] = useState<string>(''); 
  const [previewContent, setPreviewContent] = useState<string>('');

  const captureAndProcess = useCallback(async () => {
    if (!webcamRef.current) return;
    
    // Reset all states for a new run
    setIsProcessing(true);
    setStatusMessage('Capturing image...');
    setDownloadUrl('');
    setPreviewContent('');

    const rawImageSrc = webcamRef.current.getScreenshot({
        width: 1920,
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
        if (!ctx) return resolve(null);
        
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

    setImgSrc(optimizedImage); // Show the preview
    setStatusMessage('Image captured! Sending to AI for processing...');

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
      setDownloadUrl(result.downloadUrl);
      setPreviewContent(result.hugoContent);
      setImgSrc(null); // Hide the image preview to show the results
      
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

  const startOver = () => {
    // Reset all result-related states to go back to the camera view
    setDownloadUrl(''); 
    setPreviewContent('');
    setImgSrc(null);    
    setIsProcessing(false); 
    setStatusMessage('');   
  };

  const handleCopyToClipboard = () => {
    if (!previewContent) return;
    navigator.clipboard.writeText(previewContent).then(() => {
        alert('Blog post content copied to clipboard!');
    }).catch(err => {
        alert('Failed to copy text.');
        console.error('Clipboard copy failed:', err);
    });
  };

  return (
    <div className="capture-container">
      {/* --- RENDER LOGIC --- */}
      
      {/* 1. If we have preview content, show the final result state */}
      {previewContent ? (
        <div className="result-container blog-preview">
          <h3>Blog Post Preview</h3>
          <textarea readOnly value={previewContent} rows={20} style={{width: '95%', fontSize: '0.9rem', fontFamily: 'monospace', padding: '10px'}}></textarea>
          <div className="result-buttons" style={{marginTop: '1rem'}}>
            <button onClick={handleCopyToClipboard}>Copy to Clipboard</button>
            <a href={downloadUrl} className="button" target="_blank" rel="noopener noreferrer" style={{marginLeft: '10px'}}>
              Download .md
            </a>
            <button onClick={startOver} style={{marginLeft: '10px'}}>Start Over</button>
          </div>
        </div>
      
      /* 2. Else, if we have an image source, show the preview state */
      ) : imgSrc ? ( 
        <>
          <img src={imgSrc} alt="Captured" />
          <button onClick={retakePhoto} disabled={isProcessing}>Retake Photo</button>
        </>
      
      /* 3. Otherwise, show the initial camera state */
      ) : ( 
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          screenshotQuality={1}
        />
      )}
      
      {/* --- CONTROLS --- */}
      <div className="controls" style={{marginTop: '1rem'}}>
        {/* Show capture button only in the initial camera state */}
        {!imgSrc && !previewContent && ( 
          <button onClick={captureAndProcess} disabled={isProcessing}>Capture photo</button>
        )}
        {isProcessing && <p>Processing...</p>}
        {!isProcessing && statusMessage && <p>{statusMessage}</p>}
      </div>
    </div>
  );
};