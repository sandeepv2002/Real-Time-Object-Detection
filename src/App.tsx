import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { Camera, CameraOff, Volume2, VolumeX } from 'lucide-react';

function App() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(true);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [detections, setDetections] = useState<Array<{class: string, score: number}>>([]);
  const lastSpokenRef = useRef<{[key: string]: number}>({});

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await cocossd.load();
        setModel(loadedModel);
        console.log('Model loaded successfully');
      } catch (error) {
        console.error('Failed to load model:', error);
      }
    };
    loadModel();
  }, []);

  const speakDetection = (text: string) => {
    if (!isSpeechEnabled) return;
    
    const now = Date.now();
    // Only announce each object type once every 5 seconds
    if (lastSpokenRef.current[text] && now - lastSpokenRef.current[text] < 5000) {
      return;
    }
    
    lastSpokenRef.current[text] = now;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const detect = async () => {
    if (!model || !webcamRef.current || !webcamRef.current.video || !canvasRef.current) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const predictions = await model.detect(video);
    
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);

      predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox;
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = '#00ff00';
        ctx.font = '16px Arial';
        ctx.fillText(
          `${prediction.class} ${Math.round(prediction.score * 100)}%`,
          x,
          y > 10 ? y - 5 : 10
        );

        // Speak detection if confidence is high enough
        if (prediction.score > 0.7) {
          speakDetection(`Detected ${prediction.class}`);
        }
      });

      setDetections(predictions.map(p => ({ class: p.class, score: p.score })));
    }

    requestAnimationFrame(detect);
  };

  useEffect(() => {
    if (model && isWebcamEnabled) {
      detect();
    }
  }, [model, isWebcamEnabled]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Real-Time Object Detection</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isSpeechEnabled ? (
                <>
                  <Volume2 size={20} />
                  Mute Voice
                </>
              ) : (
                <>
                  <VolumeX size={20} />
                  Enable Voice
                </>
              )}
            </button>
            <button
              onClick={() => setIsWebcamEnabled(!isWebcamEnabled)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isWebcamEnabled ? (
                <>
                  <CameraOff size={20} />
                  Disable Camera
                </>
              ) : (
                <>
                  <Camera size={20} />
                  Enable Camera
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              {isWebcamEnabled ? (
                <>
                  <Webcam
                    ref={webcamRef}
                    className="absolute inset-0 w-full h-full object-cover opacity-0"
                    mirrored={true}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera size={48} className="text-gray-500" />
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Detected Objects</h2>
            {detections.length > 0 ? (
              <ul className="space-y-2">
                {detections.map((detection, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-gray-700 p-3 rounded"
                  >
                    <span className="capitalize">{detection.class}</span>
                    <span className="text-sm text-gray-400">
                      {Math.round(detection.score * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No objects detected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;