import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from collections import defaultdict
import statistics
import urllib.parse
import webbrowser
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import secrets
import string
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from fastapi import Request
from fastapi.responses import JSONResponse
import uvicorn
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import JSONResponse
import requests
from flexpolyline import decode
import urllib.parse
from flask import Flask, render_template, jsonify
import folium
from folium.plugins import HeatMap
from geopy.distance import geodesic
import numpy as np
import os
from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
import folium
from folium.plugins import HeatMap
from geopy.distance import geodesic
import numpy as np
from fastapi import Request

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Database setup using SQLAlchemy
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost/dbname")  # Replace with your actual PostgreSQL connection string

# Create the base class
Base = declarative_base()

# Define the User model for storing user information
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    email = Column(String, unique=True, index=True)
    is_admin = Column(Boolean, default=False)

# Define the OTP model for storing OTP codes and expiration times
class OTP(Base):
    __tablename__ = 'otps'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    otp_code = Column(String, index=True)
    expires_at = Column(DateTime)
    is_verified = Column(Boolean, default=False)

# SQLAlchemy engine and session setup
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)



# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Authentication API",
    version="1.0.0",
    description="Authentication API with Hardcoded User"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hardcoded user credentials
HARD_CODED_USER = "testuser"
HARD_CODED_PASSWORD = "testpass"
HARD_CODED_EMAIL = "arya.patkar22@spit.ac.in"

# Password hasher (not used here but for compatibility with original code)
def verify_password(plain_password, hashed_password):
    return plain_password == hashed_password


# Email configuration
EMAIL_HOST = "smtp.gmail.com"  # Gmail SMTP server
EMAIL_PORT = 587  # TLS port
EMAIL_USER = "aryapatkar3000@gmail.com"  # Your email
EMAIL_PASSWORD = "ptnv mrbi dorq iftg"  # Your email password or app-specific password

# Send OTP email function
def send_otp_email(to_email: str, otp_code: str):
    """Send OTP code to user's email"""
    try:
        # Create message container
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = "Your OTP Code"

        # Body of the email
        body = f"Your OTP code is {otp_code}. It will expire in 5 minutes."
        msg.attach(MIMEText(body, 'plain'))

        # Establish connection to the email server
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()  # Enable TLS encryption
            server.login(EMAIL_USER, EMAIL_PASSWORD)  # Log in to the email account
            server.sendmail(EMAIL_USER, to_email, msg.as_string())  # Send email
            logger.info(f"OTP sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send OTP email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP email")
# Helper functions
def generate_otp() -> str:
    return ''.join(secrets.choice(string.digits) for _ in range(6))

def generate_access_token() -> str:
    return secrets.token_urlsafe(32)

# Pydantic Models for API
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    message: str
    success: bool
    otp_code: Optional[str] = None

class VerifyOTPRequest(BaseModel):
    username: str
    code: str

class VerifyOTPResponse(BaseModel):
    access_token: str
    username: str
    isAdmin: bool
    Pinned_chats: List[dict]
    Previous_chats: List[dict]

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables in the database
def create_tables():
    Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Authentication API is running",
        "version": "1.0.0"
    }

@app.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login endpoint to authenticate the user and send OTP"""
    try:
        user = db.query(User).filter(User.username == request.username).first()
        if not user or request.password != user.hashed_password:  # Password should be hashed in production
            raise HTTPException(status_code=401, detail="Invalid username or password")

        otp_code = generate_otp()
        expires_at = datetime.now() + timedelta(minutes=5)

        otp = OTP(user_id=user.id, otp_code=otp_code, expires_at=expires_at)
        db.add(otp)
        db.commit()
        db.refresh(otp)

        send_otp_email(user.email, otp_code)

        return LoginResponse(message="OTP generated and sent to email", success=True, otp_code=otp_code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {e}")

@app.post("/verify-2fa", response_model=VerifyOTPResponse)
async def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify OTP and return access token"""
    try:
        otp = db.query(OTP).filter(OTP.otp_code == request.code).first()
        if not otp or otp.is_verified or otp.expires_at < datetime.now():
            raise HTTPException(status_code=401, detail="Invalid or expired OTP")

        otp.is_verified = True
        db.commit()

        access_token = generate_access_token()
        user = db.query(User).filter(User.id == otp.user_id).first()

        return VerifyOTPResponse(
            access_token=access_token,
            username=user.username,
            isAdmin=user.is_admin,
            Pinned_chats=[{"id": 1, "title": "Pinned Chat 1"}],
            Previous_chats=[{"id": 2, "title": "Previous Chat 1"}]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OTP verification failed: {e}")

@app.post("/resend_otp", response_model=LoginResponse)
async def resend_otp(request: LoginRequest, db: Session = Depends(get_db)):
    """Resend OTP to user"""
    try:
        user = db.query(User).filter(User.username == request.username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        new_otp = generate_otp()
        expires_at = datetime.now() + timedelta(minutes=5)

        otp = OTP(user_id=user.id, otp_code=new_otp, expires_at=expires_at)
        db.add(otp)
        db.commit()
        db.refresh(otp)

        send_otp_email(user.email, new_otp)

        return LoginResponse(message="OTP resent successfully", success=True, otp_code=new_otp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resend OTP: {e}")

@app.get("/predict_purchase_intent")
def predict_purchase_intent(lat: float, lng: float):
    """
    Use the HERE Discover API to find nearby shopping-related places.
    This is a placeholder for a purchase intent prediction model.
    """
    url = f"https://discover.search.hereapi.com/v1/discover?at={lat},{lng}&q=shopping&limit=20&apiKey={HERE_API_KEY}"
    response = requests.get(url).json()
    return {"purchase_intent": "Predicted products people may buy", "data": response}

@app.get("/foot_traffic_forecast")
def foot_traffic_forecast(lat: float, lng: float):
    """
    Use the HERE Traffic API to gather traffic incident data near the location.
    Predict foot traffic based on traffic patterns.
    """
    url = f"https://traffic.ls.hereapi.com/traffic/6.3/incidents.json?prox={lat},{lng},2000&apiKey={HERE_API_KEY}"
    traffic_data = requests.get(url).json()
    return {"forecast": "Predicted foot traffic 4 hours ahead", "data": traffic_data}

@app.get("/dynamic_demand_map")
def dynamic_demand_map(lat: float, lng: float):
    """
    Use the HERE Discover API to fetch information about nearby stores or businesses.
    Simulate the creation of a demand heatmap based on location-based search data.
    """
    url = f"https://discover.search.hereapi.com/v1/discover?at={lat},{lng}&q=store&limit=50&apiKey={HERE_API_KEY}"
    response = requests.get(url).json()
    return {"heat_map_data": response}

@app.get("/seasonal_behavior")
def seasonal_behavior(lat: float, lng: float):
    """
    Use the HERE Weather API to fetch weather forecast data for the given location.
    This data helps to predict seasonal shopping behavior.
    """
    url = f"https://weather.ls.hereapi.com/weather/1.0/report.json?product=forecast_hourly&latitude={lat}&longitude={lng}&apiKey={HERE_API_KEY}"
    forecast_data = requests.get(url).json()
    return {"seasonal_patterns": "Seasonal shopping predictions", "forecast_data": forecast_data}

# ------------------------------------------
# 2. Hyper-Intelligent Logistics Network
# ------------------------------------------

@app.get("/predict_inventory_distribution")
def predict_inventory_distribution(lat: float, lng: float):
    """
    Use the HERE Routing API to calculate the optimal route from the current location to another location.
    This helps in predicting areas that need more inventory based on real-time routing data.
    """
    url = f"https://router.hereapi.com/v8/routes?origin={lat},{lng}&destination=some_destination&return=summary&apiKey={HERE_API_KEY}"
    route_data = requests.get(url).json()
    return {"inventory_distribution": "AI-predicted optimal product placement", "route_data": route_data}

@app.get("/dynamic_delivery_optimization")
def dynamic_delivery_optimization(lat: float, lng: float):
    """
    Use the HERE Matrix Routing API to optimize multiple delivery routes.
    This is useful for dynamic delivery orchestration.
    """
    url = f"https://matrix.routing.hereapi.com/v8/matrix?start={lat},{lng}&end=destination&apiKey={HERE_API_KEY}"
    response = requests.get(url).json()
    return {"delivery_optimization": "Optimized delivery routes", "data": response}

@app.get("/micro_fulfillment_centers")
def micro_fulfillment_centers(lat: float, lng: float):
    """
    This function predicts micro-fulfillment centers based on location data.
    It would ideally use the HERE APIs for finding optimal delivery hub locations.
    """
    return {"micro_fulfillment_centers": "AI-predicted locations for 15-minute deliveries"}

@app.get("/cross_business_logistics")
def cross_business_logistics(lat: float, lng: float):
    """
    Use HERE Traffic API for congestion data and the HERE Routing API to help optimize cross-business logistics sharing.
    """
    return {"logistics_sharing": "AI-predicted cross-business delivery sharing"}

@app.get("/last_mile_prediction")
def last_mile_prediction(lat: float, lng: float):
    """
    Use the HERE Routing API to optimize last-mile delivery routes based on current traffic data.
    """
    return {"last_mile_prediction": "AI-predicted success rate for delivery"}

# ------------------------------------------
# 3. Augmented Commerce Experience
# ------------------------------------------

@app.get("/ar_product_discovery")
def ar_product_discovery(lat: float, lng: float):
    """
    Use the HERE Places API to find products or stores nearby based on user location.
    This data can be used for augmented reality (AR) product discovery.
    """
    return {"ar_discovery": "AR-based product availability near your location"}

@app.get("/social_commerce")
def social_commerce(lat: float, lng: float):
    """
    Use the HERE Places API to find products recommended by other users in a social commerce platform.
    This could integrate with social media platforms.
    """
    return {"social_commerce": "Products recommended by your friends"}

@app.get("/gamified_shopping")
def gamified_shopping(lat: float, lng: float):
    """
    Use the HERE Places Search API and Map Image API to create personalized shopping quests with rewards.
    Gamification could involve pathfinding through stores, points collection, etc.
    """
    return {"gamified_shopping": "Personalized shopping quests with rewards"}

@app.get("/virtual_queue")
def virtual_queue(lat: float, lng: float):
    """
    Use HERE Traffic API to monitor store traffic and queue lengths.
    A virtual queue management system will notify users when it's their turn.
    """
    return {"virtual_queue": "Get notified when your turn in line comes"}

@app.get("/contextual_commerce")
def contextual_commerce(lat: float, lng: float):
    """
    Use the HERE Weather API to make product recommendations based on weather conditions (e.g., recommending raincoats on rainy days).
    """
    return {"contextual_commerce": "Product recommendations based on weather, time, and location"}

# ------------------------------------------
# 4. Business Intelligence & Optimization
# ------------------------------------------

@app.get("/competitor_analysis")
def competitor_analysis(lat: float, lng: float):
    """
    Use the HERE Traffic API to monitor traffic patterns around competitor locations.
    This helps analyze competitor performance in real time.
    """
    url = f"https://traffic.ls.hereapi.com/traffic/6.3/incidents.json?prox={lat},{lng},5000&apiKey={HERE_API_KEY}"
    response = requests.get(url).json()
    return {"competitor_analysis": "Insights into competitor performance", "data": response}

@app.get("/location_performance")
def location_performance(lat: float, lng: float):
    """
    Use the HERE Geocoding API to evaluate the business potential of a location based on geographic and economic data.
    """
    return {"location_score": "AI rating of business potential at this location"}

@app.get("/dynamic_pricing")
def dynamic_pricing(lat: float, lng: float):
    """
    Use the HERE Weather API and the Places API to adjust pricing based on external factors like weather, competition, and demand.
    """
    return {"dynamic_pricing": "AI-driven price optimization"}

@app.get("/staff_scheduling")
def staff_scheduling(lat: float, lng: float):
    """
    Predict busy periods and optimize staff schedules using traffic and location data.
    """
    return {"staff_scheduling": "Predicted optimal staff schedule for the business"}

@app.get("/cross_selling_network")
def cross_selling_network(lat: float, lng: float):
    """
    Use the HERE Places API to find complementary businesses (e.g., restaurants referring customers to nearby services).
    """
    return {"cross_selling": "AI-powered automatic referrals for complementary services"}

# ------------------------------------------
# 5. Hyperlocal Marketplace Evolution
# ------------------------------------------

@app.get("/skills_based_gigs")
def skills_based_gigs(lat: float, lng: float):
    """
    Use the HERE Search API to match users with location-specific opportunities, such as gigs for photographers, translators, etc.
    """
    url = f"https://discover.search.hereapi.com/v1/discover?at={lat},{lng}&q=gig&limit=10&apiKey={HERE_API_KEY}"
    response = requests.get(url).json()
    return {"gigs": response}

@app.get("/popup_business")
def popup_business(lat: float, lng: float):
    """
    Identify the best pop-up business opportunities by analyzing location-based data using the HERE Browse Search API.
    """
    return {"popup_business": "AI-predicted perfect pop-up business opportunities"}

@app.get("/community_sharing")
def community_sharing(lat: float, lng: float):
    """
    Use the HERE Discover API to locate community-based resource-sharing platforms such as tool libraries or communal spaces.
    """
    return {"community_sharing": "Shared resources based on location"}

@app.get("/local_investment")
def local_investment(lat: float, lng: float):
    """
    Use the HERE Search API to find local investment opportunities with AI-predicted high returns.
    """
    return {"local_investment": "AI-predicted high-return local businesses to invest in"}

@app.get("/micro_entrepreneurship")
def micro_entrepreneurship(lat: float, lng: float):
    """
    Use the HERE Geocoding API and Search API to identify small business opportunities and micro-entrepreneurship ideas.
    """
    return {"micro_entrepreneurship": "AI-predicted small business opportunities"}


@app.get("/get_map")
def get_map(lat: float, lng: float):
    """
    Fetch a map image for the given latitude and longitude using the HERE Maps API.
    """
    try:
        # URL to get the map image from the HERE Maps API
        url = f"https://image.maps.ls.hereapi.com/mia/1.6/mapview?c={lat},{lng}&z=10&w=600&h=400&apiKey={HERE_API_KEY}"

        # Send the request to get the map image
        response = requests.get(url)

        # If the response is successful, return the map image URL
        if response.status_code == 200:
            return {"map_url": url}
        else:
            return {"error": "Unable to fetch map", "details": response.text}

    except Exception as e:
        return {"error": str(e)}
''' 
@app.get("/get_weather")
def get_weather(lat: float, lng: float):
    try:
        # Fetch current weather
        current_weather_url = f"https://weather.ls.hereapi.com/weather/1.0/report.json?product=observation&latitude={lat}&longitude={lng}&apiKey={HERE_API_KEY}"
        current_weather_response = requests.get(current_weather_url).json()

        # Fetch hourly forecast (next 96 hours)
        hourly_forecast_url = f"https://weather.ls.hereapi.com/weather/1.0/report.json?product=forecast_hourly&latitude={lat}&longitude={lng}&apiKey={HERE_API_KEY}"
        hourly_forecast_response = requests.get(hourly_forecast_url).json()

        # Process hourly forecast into daily summary format for React
        hourly_data = hourly_forecast_response["hourlyForecasts"]["forecastLocation"]["forecast"]
        daily_data = defaultdict(list)

        for entry in hourly_data:
            date_key = entry["utcTime"].split("T")[0]
            daily_data[date_key].append(entry)

        sorted_dates = sorted(daily_data.keys())
        today = datetime.strptime(sorted_dates[0], "%Y-%m-%d")

        daily_forecast = []
        for i, date in enumerate(sorted_dates[:5]):
            entries = daily_data[date]
            temps = [float(e["temperature"]) for e in entries if e["temperature"] != "*"]
            rainfalls = [float(e["rainFall"]) for e in entries if e.get("rainFall") not in ["*", "", None]]
            description = entries[0].get("description", "Unknown")

            label = "Today" if i == 0 else "Tomorrow" if i == 1 else (today + timedelta(days=i)).strftime("%A")

            daily_forecast.append({
                "day": label,
                "temp": round(statistics.mean(temps), 1) if temps else 0,
                "condition": description,
                "precipitation": round(sum(rainfalls) * 100) if rainfalls else 0  # scaled as percentage
            })

        return {
            "daily_forecast": daily_forecast
        }

    except Exception as e:
        return {"error": str(e)}
'''
    
@app.get("/route")
def get_route(origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float):
    url = (
        f"https://router.hereapi.com/v8/routes?"
        f"transportMode=car&origin={origin_lat},{origin_lng}"
        f"&destination={dest_lat},{dest_lng}"
        f"&return=summary,polyline&apiKey={HERE_API_KEY}"
    )
    try:
        response = requests.get(url)
        return response.json()
    except Exception as e:
        return {"error": str(e)}
'''
@app.get("/get_weather")
def get_weather(lat: float, lng: float):
    try:
        # Fetch current weather
        current_weather_url = f"https://weather.ls.hereapi.com/weather/1.0/report.json?product=observation&latitude={lat}&longitude={lng}&apiKey={HERE_API_KEY}"
        current_weather_response = requests.get(current_weather_url).json()

        # Fetch hourly forecast (next 96 hours)
        hourly_forecast_url = f"https://weather.ls.hereapi.com/weather/1.0/report.json?product=forecast_hourly&latitude={lat}&longitude={lng}&apiKey={HERE_API_KEY}"
        hourly_forecast_response = requests.get(hourly_forecast_url).json()

        # Process hourly forecast into daily summary format for React
        hourly_data = hourly_forecast_response["hourlyForecasts"]["forecastLocation"]["forecast"]
        daily_data = defaultdict(list)

        for entry in hourly_data:
            date_key = entry["utcTime"].split("T")[0]
            daily_data[date_key].append(entry)

        sorted_dates = sorted(daily_data.keys())
        today = datetime.strptime(sorted_dates[0], "%Y-%m-%d")

        daily_forecast = []
        for i, date in enumerate(sorted_dates[:5]):
            entries = daily_data[date]
            temps = [float(e["temperature"]) for e in entries if e["temperature"] != "*"]
            rainfalls = [float(e["rainFall"]) for e in entries if e.get("rainFall") not in ["*", "", None]]
            description = entries[0].get("description", "Unknown")

            label = "Today" if i == 0 else "Tomorrow" if i == 1 else (today + timedelta(days=i)).strftime("%A")

            daily_forecast.append({
                "day": label,
                "temp": round(statistics.mean(temps), 1) if temps else 0,
                "condition": description,
                "precipitation": round(sum(rainfalls) * 100) if rainfalls else 0  # scaled as percentage
            })

        weather_data = {
            "daily_forecast": daily_forecast
        }

        return JSONResponse(
            content=weather_data,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            }
        )

    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=500,
            headers={"Access-Control-Allow-Origin": "*"}
        )
'''

# Alternative: Manual OPTIONS handler for specific endpoints
@app.options("/get_weather")
async def options_weather():
    """Handle preflight CORS requests"""
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Your existing GET endpoint
@app.get("/get_weather")
async def get_weather(lat: float, lng: float):
    try:
        # Your weather fetching logic here
        weather_data = {
            "location": f"Location at {lat}, {lng}",
            "daily_forecast": [
                {
                    "day":"Today",
                    "date": "2025-05-24",
                    "temp": 25,
                    "condition": "Cloudy",
                    "precipitation": 20
                },{
                    "day":"Tomorrow",
                    "date": "2025-05-25",
                    "temp": 26,
                    "condition": "Rainy",
                    "precipitation": 50
                },{
                    "day":"Monday",
                    "date": "2025-05-26",
                    "temp": 28,
                    "condition": "Sunny",
                    "precipitation": 10
                },{
                    "day":"Tuesday",
                    "date": "2025-05-27",
                    "temp": 30,
                    "condition": "Sunny",
                    "precipitation": 15
                },{
                    "day":"Wednesday",
                    "date": "2025-05-28",
                    "temp": 23,
                    "condition": "Partly Cloudy",
                    "precipitation": 18
                }
            ]
        }
        
        return JSONResponse(
            content=weather_data,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            }
        )
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=500,
            headers={"Access-Control-Allow-Origin": "*"}
        )

        
API_KEY = "SBTfsvotsuUczrpslWRvUs5V_wXrhFcwm3eLZjb7HIU"  # Replace with your HERE API key

def get_route_map_image_url(api_key, origin_lat, origin_lng, dest_lat, dest_lng):
    route_url = (
        f"https://router.hereapi.com/v8/routes?"
        f"transportMode=car"
        f"&origin={origin_lat},{origin_lng}"
        f"&destination={dest_lat},{dest_lng}"
        f"&return=polyline"
        f"&apiKey={api_key}"
    )
    response = requests.get(route_url).json()

    try:
        polyline = response["routes"][0]["sections"][0]["polyline"]
    except (KeyError, IndexError):
        raise Exception("Could not get polyline from Routing API")

    encoded_polyline = urllib.parse.quote(polyline)

    map_url = (
        f"https://image.maps.ls.hereapi.com/mia/1.6/mapview?"
        f"apiKey={api_key}"
        f"&r={encoded_polyline}"
        f"&m=2400x1600"
        f"&lc=FF0000"
        f"&lw=10"
        f"&t=0"
    )
    return map_url


def shorten_url(long_url):
    api_url = "http://tinyurl.com/api-create.php"
    encoded_url = urllib.parse.quote(long_url, safe='')
    full_api_url = f"{api_url}?url={encoded_url}"
    response = requests.get(full_api_url)
    if response.status_code == 200:
        return response.text
    else:
        raise HTTPException(status_code=500, detail=f"Error shortening URL: HTTP {response.status_code}")


@app.get("/route_map")
def route_map(
    origin_lat: float = Query(..., description="Origin latitude"),
    origin_lng: float = Query(..., description="Origin longitude"),
    dest_lat: float = Query(..., description="Destination latitude"),
    dest_lng: float = Query(..., description="Destination longitude"),
):
    try:
        map_url = get_route_map_image_url(API_KEY, origin_lat, origin_lng, dest_lat, dest_lng)
        short_url = shorten_url(map_url)
        return JSONResponse(content={"short_map_url": map_url})
    except HTTPException as e:
        # Propagate FastAPI HTTPExceptions
        raise e
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    
templates = Jinja2Templates(directory="templates")

# Function to generate the heatmap
def generate_local_random_heatmap(center_lat, center_lon, box_size=0.0008, density_scale=100, num_points=400):
    lat_min = center_lat - box_size
    lat_max = center_lat + box_size
    lon_min = center_lon - box_size
    lon_max = center_lon + box_size

    latitudes = np.random.uniform(lat_min, lat_max, num_points)
    longitudes = np.random.uniform(lon_min, lon_max, num_points)
    
    # Create clusters with higher density
    cluster_centers = [
        (center_lat + 0.0003, center_lon + 0.0002),
        (center_lat - 0.0004, center_lon - 0.0003),
        (center_lat + 0.0001, center_lon - 0.0005),
    ]

    densities = np.zeros(num_points)
    for i in range(num_points):
        point = (latitudes[i], longitudes[i])
        density = np.random.rand() * 20  # base random low density
        for cx, cy in cluster_centers:
            dist = geodesic(point, (cx, cy)).meters
            if dist < 50:
                density += (50 - dist) * 2  # increase density closer to cluster center
        densities[i] = density

    heat_data = [[latitudes[i], longitudes[i], densities[i]] for i in range(num_points)]
    avg_density = np.mean(densities)

    landmarks = [
        {"name": "Train Station", "lat": center_lat + 0.0004, "lon": center_lon - 0.0004},
        {"name": "Cafe Cluster", "lat": center_lat - 0.0005, "lon": center_lon + 0.0003},
        {"name": "Mall Entrance", "lat": center_lat + 0.0003, "lon": center_lon + 0.0005},
        {"name": "Office Building", "lat": center_lat - 0.0003, "lon": center_lon - 0.0005},
        {"name": "University Gate", "lat": center_lat + 0.0002, "lon": center_lon - 0.0006},
        {"name": "Library", "lat": center_lat - 0.0006, "lon": center_lon + 0.0001},
        {"name": "Bus Terminal", "lat": center_lat + 0.0001, "lon": center_lon + 0.0006},
        {"name": "Park Entrance", "lat": center_lat - 0.0007, "lon": center_lon - 0.0002},
        {"name": "Convention Center", "lat": center_lat + 0.0005, "lon": center_lon + 0.0002},
    ]

    landmark_scores = {landmark["name"]: 0 for landmark in landmarks}
    for landmark in landmarks:
        for lat, lon, density in heat_data:
            if density > avg_density:
                distance = geodesic((lat, lon), (landmark["lat"], landmark["lon"])).meters
                if distance <= 50:
                    landmark_scores[landmark["name"]] += 1

    top_landmarks = sorted(landmark_scores.items(), key=lambda x: x[1], reverse=True)[:4]

    # Create map with heatmap and landmarks
    m = folium.Map(location=[center_lat, center_lon], zoom_start=18)
    HeatMap(heat_data, radius=8, max_zoom=20).add_to(m)

    for landmark in landmarks:
        folium.Marker(
            location=[landmark["lat"], landmark["lon"]],
            popup=landmark["name"],
            icon=folium.Icon(color="blue", icon="info-sign")
        ).add_to(m)

    # Save map to HTML
    map_filename = 'templates/heatmap.html'
    m.save(map_filename)
    return map_filename, top_landmarks


# Route for displaying the heatmap
@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    center_lat, center_lon = -37.8136, 144.9631  # Center coordinates for Melbourne
    map_filename, top_landmarks = generate_local_random_heatmap(center_lat, center_lon)

    # Render the HTML page with the heatmap
    return templates.TemplateResponse("index.html", {"request": request, "map_filename": map_filename, "top_landmarks": top_landmarks})


# Route to get the heatmap data as JSON (e.g., for API integration or front-end updates)
@app.get("/api/heatmap_data", response_class=JSONResponse)
async def heatmap_data():
    center_lat, center_lon = -37.8136, 144.9631
    _, top_landmarks = generate_local_random_heatmap(center_lat, center_lon)
    return JSONResponse(content=top_landmarks)