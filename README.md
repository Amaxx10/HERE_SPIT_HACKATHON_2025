# Team LlamaDrama - POI Validation & Spatial Analysis Platform

**"Revolutionizing Location Data Quality with AI-Powered Analytics"**

Our comprehensive geospatial intelligence solution addresses critical challenges in Point of Interest (POI) data accuracy and validation. The platform combines advanced machine learning algorithms with sophisticated spatial analysis techniques to automatically detect, analyze, and classify incorrectly placed POIs across Singapore's urban landscape. Through our innovative multi-platform approach, we're transforming how businesses and municipalities ensure location data integrity and make informed decisions based on reliable geospatial information.

Our solution has successfully analyzed over 3,000 POIs, achieving intelligent classification with confidence scoring and providing actionable insights through spatial pattern analysis. The platform features advanced analytics using Z-score, IQR, DBSCAN clustering. By implementing a comprehensive data pipeline that processes raw shapefile data through multiple validation layers, we provide businesses with the tools they need to maintain high-quality location databases and improve their mapping services.

![POI Map](https://drive.google.com/uc?export=view&id=14zaohAwcx3-pLaaR62Kf_csdEGZqhGQR)


## 🏗️ Data Processing Pipeline

<p align="center">
  <img src="https://drive.google.com/uc?export=view&id=1AOspbDvbgWp03MvsHS8e_nzC6Zmrp16w" width="400" />
  <br>
  <em>Caption text here</em>
</p>

Our modular validation pipeline processes POI data through the following stages:

---

### 📥 Module 1: Raw Data Ingestion & Preprocessing

- **Input**: Raw `.shp` shapefile data created using routing coordinates.
- **Repurposing Logic**: The `.dbf` file contains display coordinates. We extract and replace the original routing coordinates in the `.shp` file with these display coordinates for accurate POI placement.
- **Preprocessing Steps**:
  - Coordinate Extraction
  - Feature Normalization
  - Spatial Indexing
<p align="center">
  <img src="https://drive.google.com/uc?export=view&id=1yt8uzK0xtrqCTBfLnQvEKVxWuFOoSevx" width="400" />
  <br>
  <em>Black Points are the orignal dataset provided green points are pre processed point.</em>
</p>

---

### 🧠 Module 2: POI Mismatch Identification

- **Goal**: Detect mismatched POIs using both rule-based GIS spatial logic and machine learning techniques.
- **Techniques Used**:
  - **Rule-Based Spatial Analysis**: Distance thresholds, density validation, and location plausibility
  - **ML-Based Outlier Detection**:
    - Z-score analysis
    - Interquartile Range (IQR)
    - DBSCAN clustering
    - Local Outlier Factor (LOF)
<p align="center">
  <img src="https://drive.google.com/uc?export=view&id=1sfBe1MoXHgZwJOejKylsOPXMZlagDiL0" width="400" />
  <br>
  <em>Black points are misplaced points and green points are the display points.</em>
</p>

---

### 🛰️ Module 3: POI Relocation & Correction

#### 🔍 Part A: Contextual Relocation via Street-Level Imagery (Mapillary)

- **Source**: Mapillary API used to fetch images and metadata for surrounding areas of mismatched POIs.
- **Model**: A custom CNN model processes street-level images to:
  - Identify signage, entrances, and contextual indicators.
  - Infer corrected POI placements based on visual cues and metadata (heading, GPS direction, image timestamp).
  - Output corrected coordinates with confidence levels.

#### 🏢 Part B: Visual Relocation via Satellite Image Processing

- **Problem**: POIs within buildings are often centrally placed instead of at entrances.
- **Workflow**:
  1. Load building images and POI CSV.
  2. Detect:
     - Buildings using beige color masking
     - POIs using red color detection
     - Roads using grayscale thresholding
  3. Use OpenCV contour analysis to:
     - Identify POIs inside buildings
     - Calculate nearest road/entrance positions while avoiding obstacles
  4. Match pixel coordinates with real-world coordinates using a transformation matrix.
  5. Output:
     - CSV with original and corrected POI coordinates
     - Before/after visualizations showing POI movements

<p align="center">
  <img src="https://drive.google.com/uc?export=view&id=1_g6-PJD230gy7ENX_xEtCJgQlzWCupEI" width="400" />
  <br>
  <em>These pointsa are refined by Computer vision.</em>
</p>

---

### 🌐 Module 4: Cross-Platform Distribution

- **Real-Time Sync**: Ensures updated and validated POIs are distributed across:
  - React Native Mobile App (field validation, real-time GPS, star ratings)
  - React Web Dashboard (interactive analytics, shapefile processing)
  - Analytics Reports (CSV/GeoJSON exports)
- **Tech Stack**: WebSocket-based real-time updates, MongoDB with spatial indexing, RESTful APIs

---
## 📁 Project Structure Overview

### Core System Components:

• **[`backend`](backend)** - Node.js Express API server handling RESTful endpoints, database operations, and cross-platform data synchronization

• **[`flask_backend`](flask_backend)** - Python-powered spatial analysis engine with machine learning algorithms and the core [`SingaporePOIAnalyzer`](flask_backend/analyzer.py) class

• **[`here_client`](here_client)** - React-based web dashboard for business intelligence, shapefile processing, and administrative POI management

• **[`user_client`](user_client)** - React Native mobile application for field validation, location reviews, and real-time GPS data collection

## ✨ Key Features

### 🎯 Advanced Spatial Analysis
- **Multi-Method Outlier Detection**: Z-score analysis, IQR method, DBSCAN clustering, and Local Outlier Factor
- **Rule-Based Validation**: Distance-based rules, density analysis, and geographic distribution validation
- **Composite Scoring System**: Confidence-based classification with detailed reasoning for each POI assessment
- **Real-Time Processing**: Capable of analyzing 3,000+ POIs with instant results and comprehensive reporting

### 📱 Cross-Platform Integration
- **Mobile Field Validation**: GPS-enabled location capture, photo uploads, and star rating system
- **Web-Based Analytics**: Interactive mapping, shapefile upload, and bulk data processing capabilities
- **Real-Time Synchronization**: Live data updates across all platforms with WebSocket connections

### 🤖 Machine Learning Intelligence
- **Spatial Pattern Recognition**: Automated detection of anomalous POI placements using clustering algorithms
- **Confidence Scoring**: Each classification includes confidence levels and detailed reasoning
- **Adaptive Learning**: System improves accuracy through continuous analysis of spatial patterns



<p align="center">
  <img src="https://drive.google.com/uc?export=view&id=1O_babfSFXkpNnd0XKjT_xdmGpeMyoduH" width="150" style="margin-right: 30px;" />
  <img src="https://drive.google.com/uc?export=view&id=14MJLH2kB4FgH0YVKxaIKXDIG0gsKW5Ek" width="150" style="margin-right: 30px;" />
  <img src="https://drive.google.com/uc?export=view&id=1uhVJYyTcmLnha6L8ujiXPhJRIjmaqJES" width="150" style="margin-right: 30px;" />
  <img src="https://drive.google.com/uc?export=view&id=1Y9i9MxqqNtNqypaa_USXTgIREVn2pqAj" width="150" />
  <br/>
  <em>Mobile Application UI</em>
</p>

<br/>

## 🛠️ Technical Stack

### **Frontend Technologies**
- **Mobile**: React Native with Expo, React Navigation, custom themed components
- **Web**: React 18, Vite, Tailwind CSS, Leaflet Maps for interactive visualization
- **UI/UX**: Responsive design, professional component library, cross-platform consistency

### **Backend Services**
- **API Server**: Node.js with Express.js, RESTful architecture, MongoDB integration
- **Analytics Engine**: Python 3.8+, Flask, NumPy, Pandas, Scikit-learn
- **Database**: MongoDB with spatial indexing, real-time data synchronization

### **Geospatial & Analytics**
- **Spatial Analysis**: GeoPandas, Shapely, GDAL for shapefile processing
- **Machine Learning**: DBSCAN clustering, Local Outlier Factor, statistical analysis
- **Data Processing**: Real-time shapefile parsing, GeoJSON conversion, batch processing

### **Development Tools**
- **Version Control**: Git with structured branching strategy
- **Package Management**: npm for Node.js, pip for Python dependencies
- **Build Tools**: Vite for web app, Expo CLI for mobile development

## 🚀 Installation & Setup

### Prerequisites
```bash
# Required software
Node.js 16+ and npm
Python 3.8+
MongoDB (local or cloud)
Expo CLI for mobile development
```

### 1. Clone Repository
```bash
git clone <repository-url>
cd team-LlamaDrama
```

### 2. Backend API Server Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your MongoDB connection and API keys in .env
npm run dev
```

**Environment Configuration:**
```env
DATABASE_URL=mongodb://localhost:27017/poi_analysis
PORT=5000
NODE_ENV=development
```

### 3. Python Analytics Engine
```bash
cd flask_backend
pip install -r requirements.txt
cp .env.example .env
# Configure Flask environment variables
python app.py
```

**Required Python Dependencies:**
- pandas, numpy, scikit-learn
- geopandas, shapely, gdal
- flask, flask-cors, pymongo

### 4. Web Dashboard Setup
```bash
cd here_client
npm install
cp .env.example .env
# Configure API endpoints in .env
npm run dev
```

**Environment Variables:**
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_FLASK_URL=http://localhost:5001
```

### 5. Mobile Application
```bash
cd user_client
npm install
cp .env.example .env
# Configure backend URLs for your network
npx expo start
```

**Mobile Configuration:**
```env
BACKEND_URL=http://YOUR_IP_ADDRESS:5000
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:5000
```

### 6. Verify Installation
```bash
# Test backend connectivity
curl http://localhost:5000/api/health

# Test Flask analytics
curl http://localhost:5001/analyze-poi

# Access web dashboard
# Navigate to http://localhost:3000

# Mobile app
# Scan QR code with Expo Go app
```



### 🔧 Development Commands
```bash
# Backend development
npm run dev          # Start with nodemon
npm run test         # Run test suite

# Flask backend
python app.py        # Start Flask server
pytest              # Run Python tests

# Web dashboard
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview build

# Mobile app
npx expo start       # Development server
npx expo start --clear  # Clear cache
npx expo build       # Production build
```

## 📊 Project Results

- **✅ POIs Analyzed**: 3,000+ Singapore locations
- **⚡ Processing Speed**: Real-time analysis capabilities
- **📱 Cross-Platform**: Mobile + Web + Analytics integration
- **🔄 Live Sync**: Real-time data synchronization



**Developed for HERE SPIT Hackathon 2025**

### Contact:
- 📧 Email: team-lamadrama@hackathon.com
- 🔗 GitHub: [[Repository Link](https://github.com/Amaxx10/HERE_SPIT_HACKATHON_2025.git)]
- 📋 Presentation: [View PDF](https://drive.google.com/file/d/1srKUuS7BgzQhd2P3rO8kNLz43o8Jddi5/view)


---

**🏆 "Making location data more reliable and trustworthy for navigation, urban planning, and business intelligence applications worldwide."**
