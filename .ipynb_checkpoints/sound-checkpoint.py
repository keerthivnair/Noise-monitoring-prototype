import sounddevice as sd
import numpy as np
import time


DURATION = 1   # seconds for each recording
FS = 44100     # sample rate
THRESHOLD = 70 # dB threshold

print("Noise Monitoring System (Real Microphone Input)\n")
print("Press Ctrl+C to stop\n")

def get_db_level(data):
    """Convert audio signal to decibel level"""
    rms = np.sqrt(np.mean(data**2))  ##calc the rms 
    db = 20 * np.log10(rms + 1e-6)  + 60  
    return db

try:
    while True:

        recording = sd.rec(int(DURATION * FS), samplerate=FS, channels=1, dtype='float64')
        sd.wait()  

        
        db_level = get_db_level(recording)

        
        print(f"Current Noise Level: {db_level:.2f} dB", end=" -> ")
        if db_level > THRESHOLD:
            print("🚨 RED LIGHT ON")
        else:
            print("✅ RED LIGHT OFF")

        time.sleep(0.5)

except KeyboardInterrupt:
    print("\nStopped monitoring.")
