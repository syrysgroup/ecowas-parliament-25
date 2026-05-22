/**
 * Lazy loader for OpenCV.js. Loaded from CDN on demand — adds no weight to the
 * main bundle. Resolves once `cv` is ready and its WASM runtime initialised.
 */
const CDN_URL = "https://docs.opencv.org/4.10.0/opencv.js";

let loaderPromise: Promise<any> | null = null;

export function loadOpenCv(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("OpenCV can only load in the browser"));
  }
  const w = window as any;
  if (w.cv && w.cv.Mat) return Promise.resolve(w.cv);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-opencv]`);
    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.src = CDN_URL;
      script.async = true;
      script.defer = true;
      script.dataset.opencv = "true";
      document.head.appendChild(script);
    }
    const waitReady = () => {
      const cv = (window as any).cv;
      if (!cv) return setTimeout(waitReady, 50);
      // OpenCV.js sets cv.onRuntimeInitialized when WASM is ready.
      if (cv.Mat) return resolve(cv);
      cv.onRuntimeInitialized = () => resolve(cv);
    };
    script.addEventListener("load", waitReady, { once: true });
    script.addEventListener("error", () => {
      loaderPromise = null;
      reject(new Error("Failed to load OpenCV.js from CDN"));
    });
    if (existing) waitReady();
  });
  return loaderPromise;
}
