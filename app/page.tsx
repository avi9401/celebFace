"use client";

import { WhichCelebrityResponse } from "@/types";
import {  useCallback, useRef, useState  } from "react";
import Head from 'next/head'
import styles from './page.module.css'
import CelebrityResult from "@/components/CelebrityResult";
import { postWhichCelebrity } from "@/utils/postWhichCelebrity";
import { CollectorSource } from "clarifai-nodejs-grpc/proto/clarifai/api/resources_pb";



export default function Home() {
  const cameraPreviewEl = useRef<HTMLVideoElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [snapshot, setSnapshot] = useState<string>();
  const [response, setResponse] = useState<WhichCelebrityResponse>();

  const beginCapture = useCallback(
    async () => {
      if (!cameraPreviewEl.current) {
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraPreviewEl.current.srcObject = stream;
      cameraPreviewEl.current.play();
      setCapturing(true);
    },
    [cameraPreviewEl],
  );

  const takeSnapshot = useCallback(
    () => {
      if (!cameraPreviewEl.current) {
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      ctx.drawImage(cameraPreviewEl.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          return null;
        }

        if (snapshot) {
          URL.revokeObjectURL(snapshot);
        }
        setSnapshot(URL.createObjectURL(blob));

        const resp = await postWhichCelebrity(blob);
        setResponse(resp);
        console.log(resp)
      });
    },
    [snapshot]
  );

  return (
    <>
      <div className={styles.body}>     
        <Head>
          <title>Which Celebrity Am I?</title>
          <meta name="description" content="Use the power of AI to figure out which celebrity you look like!" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className= {styles.main} >
          <div className={styles.description}>
            <h1>Which celebrity
           do you look like?</h1>
          </div>
        </main>
          <div className={styles.rightSide}>
          <div className={styles.vidParent}>
             <video className={styles.video} ref={cameraPreviewEl} />
             <div className={styles.vidOverlay}></div>
          </div> 
            <div className={styles.btns}>
              <div className={styles.btncom}>
                <button className={styles.btn} onClick={beginCapture}>Click to start video</button>
                {capturing &&
                      (
                        <button onClick={takeSnapshot} className={styles.snapshot}>
                          📸
                        </button>
                        
                        
                      )}
              </div>  
                  { snapshot && <CelebrityResult snapshot={snapshot} response={response} />}
            </div>
           
              
          </div>
          
        
      </div>
    </>
   
  )
}
