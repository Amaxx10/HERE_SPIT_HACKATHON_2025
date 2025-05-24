# 🗺️ AI-Driven Map Update from Crowd-Sourced Data

## Overview

This project demonstrates an AI-first pipeline for creating and updating digital maps using crowd-sourced and sensor-based data. Traditional map-making processes rely heavily on manual curation and rule-based systems. In contrast, this solution leverages Generative AI, Computer Vision, and LLMs (Large Language Models) to extract, enrich, validate, and visualize geospatial data automatically.

By integrating data from sources like Swiggy metadata, satellite and street-view imagery, and Overpass GPS traces, we aim to build an intelligent, scalable system that produces accurate, semantically rich, and up-to-date digital maps.

## 🔧 Key Features

1. NLP-based address extraction and geocoding from real-world metadata
2. Satellite and street-view imagery retrieval based on geo-coordinates
3. Feature extraction using state-of-the-art vision models:
   - SAM for building segmentation
   - Mask2Former for road segmentation
   - YOLOv8 for object, crowd and traffic detection
4. Semantic analysis using LLMs to generate meaningful tags (e.g., "busy intersection")
5. Anomaly detection and correction using LLM + AdalFlow
6. Interactive visualization using GeoJSON and HERE Vector Map API
7. Multi-timestamp analysis for temporal context

## 🧠 Tech Stack

| Component | Tool / Model |
|-----------|-------------|
| Geocoding | Google Maps API |
| Street-View Image Retrieval | Mapillary API |
| Building Detection | SAM (Segment Anything Model) |
| Road Segmentation | Mask2Former (Cityscapes) |
| Object Detection | YOLOv8 |
| Anomaly Detection | LLM + AdalFlow |
| Visualization | HERE Vector Map API |
| Data Format | GeoJSON |

<div align="center">
  <img src="https://github.com/user-attachments/assets/4521778f-8eb0-4d53-ace7-7cbe0903505a" alt="Pipeline Workflow Diagram" width="600">
  <p><em>Figure 1: Complete AI-driven geospatial data processing pipeline workflow</em></p>
</div>

## 🛠️ Pipeline Workflow

### 1. Data Ingestion & Preprocessing

Identified that 3 types of raw data can be used: metadata, satellite imagery, and street view images.
- Swiggy restaurant metadata was collected
- NLP used to extract addresses, which were then geocoded into lat/lon
- Created initial POI layer in GeoJSON format

<div align="center">
  <img src="https://github.com/user-attachments/assets/1c3e2100-cbdd-4538-833f-abf6548dc2b9" alt="Data Collection Interface" width="400">
  <p><em>Figure 2: Data collection and preprocessing interface showing restaurant metadata extraction</em></p>
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/6f5652b5-b547-44e8-adf4-7a54827e5a3e" alt="Geocoding Results" width="400">
  <p><em>Figure 3: Road results visualization</em></p>
</div>

### 2. Imagery Collection

- Coordinates used to fetch satellite imagery
- Street-view images gathered using Capillary API

### 3. Feature Detection

- Satellite imagery passed through SAM for building footprints
- Road segmentation via Mask2Former on Street View images
- Object & traffic detection via YOLOv8 (people, signals, traffic, vehicles) on Street View images

<div align="center">
  <img src="https://github.com/user-attachments/assets/90553da3-f75c-4ae6-b057-278a5869ad0c" alt="Feature Detection Results" width="500">
  <p><em>Figure 4: Computer vision feature detection showing building segmentation and object detection results</em></p>
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/63926407-a43b-4a3f-be47-ff5b4adabc51" alt="Combined Analysis" width="500">
  <p><em>Figure 5: Road Detection (Purple Color) At Street Level view</em></p>
</div>


<div align="center">
  <img src="https://github.com/user-attachments/assets/fee84c1b-9d46-4c23-95da-def6ed66a97a" alt="Combined Analysis" width="500">
  <p><em>Figure 6: Object Detection At Street Level view</em></p>
</div>

### 4. Semantic Labelling/Enrichment

- Vision outputs or features across YOLOv8 and Mask2Former models that are extracted are analyzed by an LLM
- LLM converted low-level features into contextual tags (e.g., "signalized busy road")
- These insights were embedded in the GeoJSON properties

<div align="center">
  <img src="https://github.com/user-attachments/assets/3e731c58-4621-4f11-9492-e36664b06ee4" alt="Combined Analysis" width="500">
  <p><em>Figure 7: Semantic Labelling - Analysis of multiple data over a period of time to draw final conclusion tagging</em></p>
</div>

### 5. Anomaly Detection & Correction

- LLM + AdalFlow used to identify spatial inconsistencies or misclassifications
- Automatically corrected errors in coordinates, labels, and missing attributes

<div align="center">
  <img src="https://github.com/user-attachments/assets/3d572744-781f-40c6-b8e0-045ef4d3b9c8" alt="Anomaly Detection" width="400">
  <p><em>Figure 8: Anomaly detection system identifying spatial inconsistencies in the data</em></p>
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/099c7beb-b11f-4630-90b4-3f19b7705c6a" alt="Error Correction" width="400">
  <p><em>Figure 9: Automated error correction results showing before and after data quality improvements</em></p>
</div>

### 6. Map Rendering & Interaction

- Refined GeoJSON rendered on HERE Vector Map API
- Interactive layers allowed toggling of buildings, roads, traffic, real-time weather and semantic tags

<div align="center">
  <img src="https://github.com/user-attachments/assets/34eacbfe-4d99-4290-88de-1c9604f692c4" alt="Interactive Map Visualization" width="600">
  <p><em>Figure 10: Final interactive map visualization with multiple data layers and semantic enrichment</em></p>
</div>

## 📊 Example Use Cases

- Automatically detecting new buildings or roads in urban areas
- Identifying traffic-prone intersections from multi-timestamp image analysis
- Flagging incorrect POI locations (e.g., a restaurant tagged on a highway)
- Creating semantically enriched maps for navigation, logistics, or urban planning

## 🚀 How to Run

### Prerequisites
- Python 3.8+
- Jupyter Notebook
- API keys (Google Maps, Capillary, etc.)

### Clone the repo:
```bash
git clone https://github.com/NirmiteeS/here_hackathon.git
cd client
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run Notebook
Open `Segmentation_Here_Hackathon.ipynb` and run each cell step by step to see the full pipeline in action.

## 🤖 Future Enhancements

- Real-time GPS trace integration for live map updates
- Crowdsourced anomaly reporting via mobile app
- LLM-guided feedback loop for continuous improvement

## Presentation Slides

[Presentation Slides](https://docs.google.com/presentation/d/11GCBJuqbkzWKMA2Jat-pTnVZ6D9cxhX2mjlz3_vEwW4/edit?usp=sharing)
