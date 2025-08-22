import sounddevice as sd
import numpy as np
import time
import paho.mqtt.client as mqtt


DURATION = 1  
FS = 44100     
THRESHOLD = -7

broker = "localhost"
topic = "traffic/noise"

client = mqtt.Client()
client.connect(broker)

print("Noise Monitoring System (Real Microphone Input)\n")
print("Press Ctrl+C to stop\n")

def get_db_level(data):
    """Convert audio signal to decibel level"""
    rms = np.sqrt(np.mean(data**2)) 
    db = 20 * np.log10(rms + 1e-6)   
    return db

try:
    while True:

        recording = sd.rec(int(DURATION * FS), samplerate=FS, channels=1, dtype='float64')
        sd.wait()  

        
        db_level = get_db_level(recording)

        
        print(f"Current Noise Level: {db_level:.2f} dB", end=" -> ")

        status = "HIGH NOISE" if db_level > THRESHOLD else "NORMAL NOISE"

        payload = f'{{"db": {db_level:.2f}, "status": "{status}"}}'

        client.publish(topic,payload)  

        # print("Published",payload)  
        
        if db_level > THRESHOLD:
            print("🚨 RED LIGHT ON")
        else:
            print("✅ NORMAL")

        time.sleep(0.5)

except KeyboardInterrupt:
    print("\nStopped monitoring.")
