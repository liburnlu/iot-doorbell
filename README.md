# Smart Doorbell System

This repository contains the implementation details outlined in the Smart Doorbell System.pdf technical documentation by Liburn Lumani.

The Smart Doorbell System is a motion-triggered video and face recognition system built using a Raspberry Pi, cloud media distribution, and computer vision. To maximize efficiency for always-on deployment, the architecture employs a hardware PIR motion sensor to activate heavy AI processing only when a visitor approaches the door.

---

## Key Features

* **Ultra-Low Latency:** Achieves sub-second live-stream rendering (<500ms) inside the browser via native WebRTC (WHEP) protocols.


* **Resource-Optimized Edge Logic:** The Python recognition loop remains asleep until woken up by a physical GPIO hardware interrupt.


* **Conflict-Free Media Routing:** The Raspberry Pi streams a single uplink to the cloud, allowing multiple endpoints to reuse the stream simultaneously without causing hardware access errors.


* **Smart Telegram Alerts:** Delivers instant rich-media alerts with custom text that changes dynamically based on known individuals, unknown strangers, or mixed groups.



---

## High-Level Architecture

The system decouples edge hardware processing from cloud stream redistribution across three main layers:

* **Edge Device (Raspberry Pi):** Streams continuous 720p@30FPS video, handles local motion alerts, and executes face detection/recognition pipelines.


* **Cloud Server (Azure VM):** Functions as the data hub, orchestrating stream translation through MediaMTX and secure routing via an Nginx reverse proxy.


* **User Layer:** Displays the user dashboard interface, logs historic database timelines, and handles incoming messaging alerts.



---

## Tech Stack Matrix

| Component | Technology | Purpose |
| --- | --- | --- |
| **Media Distribution** | MediaMTX | Core multi-protocol streaming server

 |
| **Streaming Protocols** | WHIP / WHEP / RTSP | Video ingestion, web viewing, and low-buffer AI frame extraction

 |
| **Computer Vision** | Haar Cascade & Dlib 128D | Fast CPU-based face checking and deep learning vector matching

 |
| **Web Infrastructure** | FastAPI & Nginx | REST API server backend protected by secure SSL/TLS termination

 |
| **Cloud Storage** | Supabase (PostgreSQL & S3) | Relational event logs and structured asset image buckets

 |
| **User Notifications** | Telegram Bot API | Immediate, cost-free contextual alerts with snapshot attachments

 |

---

## Complete System Flow

1. **Idle State:** The camera captures and pipes video continuously up to the cloud distribution host.


2. **Motion Trigger:** A visitor approaches, tripping the PIR sensor and firing a hardware interrupt to wake the recognition script.


3. **AI Evaluation:** The script flushes the local network buffer to pull the latest RTSP frame. It runs a lightweight Haar Cascade to check for a face, then passes matches to Dlib to look up user identities in `encodings.pickle`.


4. **Cloud Logging:** The script overlays bounding boxes on the frame, posts the asset to Supabase Storage, and saves metadata to PostgreSQL.


5. **Alert Dispatched:** The user receives a descriptive mobile notification with an embedded image.


6. **Cooldown:** The application enforces a 5-second per-person throttle to avoid message flood before sleeping again.
