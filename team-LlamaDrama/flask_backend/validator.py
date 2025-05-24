import pandas as pd
import geopandas as gpd
import numpy as np
import requests
import json
import os
import time
import base64
from shapely.geometry import Point
from geopy.distance import geodesic
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

# ===== CONFIGURATION =====
class Config:
    # Analysis parameters
    MAX_POIS_TO_PROCESS = 30  # Limit for testing
    GEOCODING_TIMEOUT = 10    # Timeout for geocoding requests
    COORDINATE_TOLERANCE_METERS = 50 # Max acceptable distance discrepancy for "accurate"
    API_DELAY = 1.0 # Seconds between API calls for Nominatim to prevent rate limiting

    # Mappillary settings
    MAPPILLARY_CLIENT_TOKEN = "MLY|9995570487196545|4c97e8c874f89aeb2a1a073d078496c7"
    MAPPILLARY_SEARCH_RADIUS = 100  # meters
    MAX_IMAGES_PER_LOCATION = 3

    # Gemini settings
    GEMINI_API_KEY = "AIzaSyBWGfeOJbKzI9J9oSn5F6s_4BUOa0fiIow"
    GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

# ===== VISUAL VERIFICATION SYSTEM =====
class VisualVerificationSystem:
    def __init__(self):
        self.mappillary_token = Config.MAPPILLARY_CLIENT_TOKEN
        self.gemini_api_key = Config.GEMINI_API_KEY

    def get_mappillary_images(self, lat: float, lon: float, radius: int = Config.MAPPILLARY_SEARCH_RADIUS) -> List[Dict]:
        """Fetch street view images from Mappillary API around given coordinates"""

        try:
            # Mappillary API endpoint for images
            url = "https://graph.mapillary.com/images"
            params = {
                'access_token': self.mappillary_token,
                'fields': 'id,computed_geometry,thumb_1024_url,compass_angle,captured_at',
                'bbox': f"{lon-0.001},{lat-0.001},{lon+0.001},{lat+0.001}",
                'limit': Config.MAX_IMAGES_PER_LOCATION
            }

            print(f"    📸 Fetching Mappillary images near ({lat:.6f}, {lon:.6f})")
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            images = []

            for img in data.get('data', []):
                img_coords = img.get('computed_geometry', {}).get('coordinates', [])
                if len(img_coords) >= 2:
                    img_lat, img_lon = img_coords[1], img_coords[0]
                    distance = geodesic((lat, lon), (img_lat, img_lon)).meters

                    if distance <= radius:
                        images.append({
                            'id': img['id'],
                            'url': img.get('thumb_1024_url'),
                            'coordinates': [img_lat, img_lon],
                            'distance_from_poi': distance,
                            'compass_angle': img.get('compass_angle'),
                            'captured_at': img.get('captured_at')
                        })

            # Sort by distance from POI
            images.sort(key=lambda x: x['distance_from_poi'])
            print(f"    📸 Found {len(images)} images within {radius}m")
            return images

        except Exception as e:
            print(f"    ❌ Error fetching Mappillary images: {str(e)}")
            return []

    def download_image(self, image_url: str) -> Optional[bytes]:
        """Download image from URL and return as bytes"""
        try:
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            return response.content
        except Exception as e:
            print(f"    ❌ Error downloading image: {str(e)}")
            return None

    def analyze_image_with_gemini(self, image_bytes: bytes, poi_info: Dict) -> Dict:
        """Analyze street view image using Gemini Vision API"""

        try:
            # Convert image to base64
            image_b64 = base64.b64encode(image_bytes).decode('utf-8')

            # Create prompt for POI verification
            prompt = f"""
            I need you to analyze this street view image to verify if it shows the location described as:

            POI Information:
            - Address: {poi_info.get('address', 'Unknown')}
            - Building Name: {poi_info.get('building_name', 'Unknown')}
            - Street Name: {poi_info.get('street_name', 'Unknown')}
            - POI Type: {poi_info.get('poi_type', 'Unknown')}
            - Expected Location: Singapore

            Please analyze the image and provide:
            1. What buildings, signs, or landmarks are visible?
            2. Can you identify any street names, building names, or addresses?
            3. Does this location match the expected POI information above?
            4. What type of area is this (residential, commercial, industrial, etc.)?
            5. Are there any Singapore-specific indicators (like HDB blocks, local signage, etc.)?
            6. Confidence level (1-10) that this image shows the correct location
            7. Any discrepancies or concerns about the location accuracy

            Please be specific about what you can see and provide a clear assessment.
            """

            # Prepare request payload
            payload = {
                "contents": [{
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": image_b64
                            }
                        }
                    ]
                }],
                "generationConfig": {
                    "temperature": 0.1,
                    "topK": 32,
                    "topP": 1,
                    "maxOutputTokens": 1024
                }
            }

            headers = {
                'Content-Type': 'application/json',
            }

            # Make API request
            url = f"{Config.GEMINI_API_URL}?key={self.gemini_api_key}"
            response = requests.post(url, headers=headers, json=payload, timeout=30)

            if response.status_code == 200:
                result = response.json()
                analysis_text = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')

                return {
                    'success': True,
                    'analysis': analysis_text,
                    'raw_response': result
                }
            else:
                print(f"    ❌ Gemini API error: {response.status_code} - {response.text}")
                return {
                    'success': False,
                    'error': f"API error: {response.status_code}",
                    'analysis': 'Could not analyze image'
                }

        except Exception as e:
            print(f"    ❌ Error analyzing image with Gemini: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'analysis': 'Analysis failed due to error'
            }

    def extract_confidence_score(self, analysis_text: str) -> float:
        """Extract confidence score from Gemini analysis text"""
        try:
            # Look for confidence patterns
            import re
            patterns = [
                r'confidence.*?(\d+(?:\.\d+)?)',
                r'confident.*?(\d+(?:\.\d+)?)',
                r'(\d+(?:\.\d+)?)/10',
                r'(\d+(?:\.\d+)?)(?:\s*out of\s*10)',
            ]

            for pattern in patterns:
                matches = re.findall(pattern, analysis_text.lower())
                if matches:
                    score = float(matches[0])
                    return min(score / 10.0 if score > 1 else score, 1.0)

            # If no explicit confidence found, infer from text sentiment
            positive_words = ['correct', 'accurate', 'matches', 'consistent', 'appropriate']
            negative_words = ['incorrect', 'wrong', 'mismatch', 'inconsistent', 'doubtful']

            pos_count = sum(1 for word in positive_words if word in analysis_text.lower())
            neg_count = sum(1 for word in negative_words if word in analysis_text.lower())

            if pos_count > neg_count:
                return 0.7
            elif neg_count > pos_count:
                return 0.3
            else:
                return 0.5

        except Exception:
            return 0.5

    def perform_visual_verification(self, poi_data: Dict) -> Dict:
        """Perform complete visual verification for a POI"""

        lat, lon = poi_data['coordinates']

        verification_result = {
            'visual_verification_attempted': True,
            'images_found': 0,
            'images_analyzed': 0,
            'overall_visual_confidence': 0.0,
            'visual_analysis_summary': '',
            'image_analyses': [],
            'visual_recommendation': 'insufficient_data',
            'visual_issues_found': []
        }

        # Get street view images
        images = self.get_mappillary_images(lat, lon)
        verification_result['images_found'] = len(images)

        if not images:
            verification_result['visual_analysis_summary'] = 'No street view images available for visual verification'
            return verification_result

        # Prepare POI info for Gemini analysis
        poi_info = {
            'address': poi_data.get('address', ''),
            'building_name': poi_data.get('building_name', ''),
            'street_name': poi_data.get('street_name', ''),
            'poi_type': poi_data.get('poi_type', ''),
            'coordinates': poi_data['coordinates']
        }

        confidence_scores = []
        analyses = []

        # Analyze each image
        for i, img in enumerate(images[:Config.MAX_IMAGES_PER_LOCATION]):
            print(f"    🔍 Analyzing image {i+1}/{len(images)} (Distance: {img['distance_from_poi']:.1f}m)")

            # Download image
            image_bytes = self.download_image(img['url'])
            if not image_bytes:
                continue

            # Analyze with Gemini
            analysis_result = self.analyze_image_with_gemini(image_bytes, poi_info)

            if analysis_result['success']:
                confidence = self.extract_confidence_score(analysis_result['analysis'])
                confidence_scores.append(confidence)

                analyses.append({
                    'image_id': img['id'],
                    'distance_from_poi': img['distance_from_poi'],
                    'confidence_score': confidence,
                    'analysis': analysis_result['analysis'],
                    'image_url': img['url']
                })

                verification_result['images_analyzed'] += 1

                # Brief delay between API calls
                time.sleep(1)

        # Calculate overall results
        if confidence_scores:
            verification_result['overall_visual_confidence'] = np.mean(confidence_scores)
            verification_result['image_analyses'] = analyses

            # Determine recommendation based on confidence
            avg_confidence = verification_result['overall_visual_confidence']
            if avg_confidence >= 0.7:
                verification_result['visual_recommendation'] = 'coordinates_likely_correct'
                verification_result['visual_analysis_summary'] = f'Visual analysis supports coordinate accuracy (avg confidence: {avg_confidence:.2f})'
            elif avg_confidence >= 0.4:
                verification_result['visual_recommendation'] = 'needs_further_review'
                verification_result['visual_analysis_summary'] = f'Visual analysis shows mixed results (avg confidence: {avg_confidence:.2f})'
                verification_result['visual_issues_found'].append('Mixed visual verification results')
            else:
                verification_result['visual_recommendation'] = 'coordinates_likely_incorrect'
                verification_result['visual_analysis_summary'] = f'Visual analysis suggests coordinate issues (avg confidence: {avg_confidence:.2f})'
                verification_result['visual_issues_found'].append('Low visual verification confidence')
        else:
            verification_result['visual_analysis_summary'] = 'Could not analyze any images successfully'

        return verification_result

# ===== CSV DATA LOADER (Enhanced) =====
class CSVPOILoader:
    def __init__(self):
        self.geolocator = Nominatim(user_agent="singapore_poi_analyzer")

    def load_csv_data(self, file_path: str) -> gpd.GeoDataFrame:
        """Load and process the Singapore address CSV file"""
        try:
            print(f"🔄 Loading CSV file: {file_path}")

            # Read the CSV file
            df = pd.read_csv(file_path)
            print(f"✅ Loaded {len(df)} records from CSV")

            # Limit for testing
            if len(df) > Config.MAX_POIS_TO_PROCESS:
                print(f"📊 Limiting to first {Config.MAX_POIS_TO_PROCESS} records for analysis")
                df = df.head(Config.MAX_POIS_TO_PROCESS)

            # Create geometry from coordinates
            geometry = [Point(lon, lat) for lon, lat in zip(df['DISPLAY_LO'], df['DISPLAY_LA'])]

            # Create GeoDataFrame
            gdf = gpd.GeoDataFrame(df, geometry=geometry, crs='EPSG:4326')

            # Create a readable name from address components
            gdf['formatted_address'] = gdf.apply(self._format_address, axis=1)
            gdf['poi_type'] = gdf.apply(self._determine_poi_type, axis=1)

            print(f"✅ Created GeoDataFrame with {len(gdf)} POIs")
            return gdf

        except Exception as e:
            print(f"❌ Error loading CSV: {str(e)}")
            return None

    def _format_address(self, row):
        """Create a formatted address from CSV components for geocoding"""
        parts = []

        if pd.notna(row.get('HOUSE_NUMB')) and row.get('HOUSE_NUMB'):
            parts.append(str(row['HOUSE_NUMB']))
        if pd.notna(row.get('BUILDING_N')) and row.get('BUILDING_N'):
            parts.append(str(row['BUILDING_N']))
        if pd.notna(row.get('STREET_NAM')) and row.get('STREET_NAM'):
            parts.append(str(row['STREET_NAM']))
        if pd.notna(row.get('FULL_POSTA')) and row.get('FULL_POSTA'):
            parts.append(f"Singapore {int(row['FULL_POSTA'])}")
        else:
            parts.append("Singapore")

        return ', '.join(parts) if parts else f"Location {row.name}"

    def _determine_poi_type(self, row):
        """Determine POI type from building name and other attributes"""
        building = str(row.get('BUILDING_N', '')).upper()
        street = str(row.get('STREET_NAM', '')).upper()

        if any(keyword in building for keyword in ['MALL', 'SHOPPING', 'PLAZA', 'CENTRE']):
            return 'Shopping Complex'
        elif any(keyword in building for keyword in ['ESTATE', 'PARK', 'GARDENS']):
            return 'Residential Estate'
        elif any(keyword in building for keyword in ['COLLEGE', 'SCHOOL', 'UNIVERSITY']):
            return 'Educational Institution'
        elif any(keyword in building for keyword in ['HOSPITAL', 'CLINIC', 'MEDICAL']):
            return 'Healthcare Facility'
        elif 'HDB' in str(row.get('HDB', '')).upper():
            return 'HDB Housing'
        elif any(keyword in building for keyword in ['OFFICE', 'TOWER', 'BUILDING']):
            return 'Office Building'
        elif any(keyword in street for keyword in ['PARK', 'AVE', 'ROAD', 'STREET']):
            return 'Address Point'
        else:
            return 'General Address'

# ===== ENHANCED POI VALIDATOR =====
class EnhancedPOIValidator:
    def __init__(self):
        self.geolocator = Nominatim(user_agent="singapore_poi_validator")
        self.visual_system = VisualVerificationSystem()

    def validate_poi_locations_with_visual(self, gdf: gpd.GeoDataFrame) -> List[Dict]:
        """Validate POI locations using both algorithmic and visual verification."""
        validation_results = []

        print(f"🔍 Validating {len(gdf)} POIs with algorithmic and visual verification...")

        for idx, row in gdf.iterrows():
            formatted_address = row['formatted_address']
            original_lat, original_lon = row.geometry.y, row.geometry.x

            print(f"\n  Validating POI {idx + 1}/{len(gdf)}: {formatted_address}")
            print(f"  Coordinates: ({original_lat:.6f}, {original_lon:.6f})")

            # Start with algorithmic validation
            validation_status = "accurate"
            confidence_score = 1.0
            observations = []
            recommended_action = "keep_current"
            suggested_corrections = {"coordinates": None, "address_components": ""}
            reasoning = []
            distance_to_geocoded = None

            # 1. Basic Singapore bounds check
            if not (1.2 <= original_lat <= 1.5 and 103.6 <= original_lon <= 104.1):
                validation_status = "significantly_off"
                confidence_score = 0.1
                recommended_action = "relocate_coordinates"
                reasoning.append("Coordinates outside typical Singapore bounds.")

            # 2. Attempt to reverse geocode the formatted address
            geocoded_location = None
            try:
                geocoded_location = self.geolocator.geocode(
                    formatted_address,
                    timeout=Config.GEOCODING_TIMEOUT,
                    country_codes='sg'
                )
                time.sleep(Config.API_DELAY)
            except Exception as e:
                observations.append(f"Geocoding failed: {str(e)}")
                validation_status = "cannot_determine"
                confidence_score -= 0.3
                reasoning.append(f"Geocoding failed: {str(e)}")

            if geocoded_location:
                geocoded_lat, geocoded_lon = geocoded_location.latitude, geocoded_location.longitude
                distance_to_geocoded = geodesic((original_lat, original_lon), (geocoded_lat, geocoded_lon)).meters
                observations.append(f"Geocoded to ({geocoded_lat:.6f}, {geocoded_lon:.6f}), {distance_to_geocoded:.2f}m from original.")

                if distance_to_geocoded > Config.COORDINATE_TOLERANCE_METERS:
                    if distance_to_geocoded > 2 * Config.COORDINATE_TOLERANCE_METERS:
                        validation_status = "significantly_off"
                    else:
                        validation_status = "slightly_off"
                    confidence_score -= 0.4
                    recommended_action = "relocate_coordinates"
                    suggested_corrections["coordinates"] = [geocoded_lat, geocoded_lon]
                    reasoning.append(f"Geocoded coordinates are {distance_to_geocoded:.2f}m away from original.")

            # 3. Perform visual verification
            print(f"  🔍 Starting visual verification...")

            poi_data = {
                'address': formatted_address,
                'building_name': str(row.get('BUILDING_N', '')),
                'street_name': str(row.get('STREET_NAM', '')),
                'poi_type': row['poi_type'],
                'coordinates': [original_lat, original_lon]
            }

            visual_verification = self.visual_system.perform_visual_verification(poi_data)

            # Combine algorithmic and visual results
            if visual_verification['visual_verification_attempted']:
                if visual_verification['images_analyzed'] > 0:
                    visual_confidence = visual_verification['overall_visual_confidence']
                    visual_recommendation = visual_verification['visual_recommendation']

                    # Adjust overall confidence based on visual verification
                    if visual_recommendation == 'coordinates_likely_correct':
                        if validation_status in ['accurate', 'slightly_off']:
                            confidence_score = min(confidence_score + 0.2, 1.0)
                            reasoning.append(f"Visual verification supports accuracy (confidence: {visual_confidence:.2f})")
                    elif visual_recommendation == 'coordinates_likely_incorrect':
                        validation_status = "significantly_off" if validation_status == "accurate" else validation_status
                        confidence_score = max(confidence_score - 0.3, 0.1)
                        recommended_action = "relocate_coordinates"
                        reasoning.append(f"Visual verification suggests coordinate issues (confidence: {visual_confidence:.2f})")
                    else:  # needs_further_review
                        validation_status = "needs_review" if validation_status == "accurate" else validation_status
                        recommended_action = "investigate_further"
                        reasoning.append(f"Visual verification inconclusive (confidence: {visual_confidence:.2f})")

                observations.append(visual_verification['visual_analysis_summary'])

            # Final adjustments
            if len(reasoning) > 0 and validation_status == "accurate":
                validation_status = "needs_review"
                recommended_action = "investigate_further"

            confidence_score = max(0.0, min(1.0, confidence_score))

            validation_results.append({
                'address': formatted_address,
                'coordinates': [original_lat, original_lon],
                'poi_type': row['poi_type'],
                'initial_issues': [],
                'suspicion_score': 0,
                'algorithmic_analysis': {
                    "location_accuracy": validation_status,
                    "confidence_score": round(confidence_score, 2),
                    "observations": ". ".join(observations),
                    "recommended_action": recommended_action,
                    "suggested_corrections": suggested_corrections,
                    "reasoning": "; ".join(reasoning),
                    "distance_to_geocoded": distance_to_geocoded,
                    "address_match": {}
                },
                'visual_verification': visual_verification
            })

            print(f"  Result: {validation_status.upper()} (Confidence: {confidence_score:.2f})")
            if visual_verification['images_analyzed'] > 0:
                print(f"  Visual: {visual_verification['visual_recommendation']} (Visual Confidence: {visual_verification['overall_visual_confidence']:.2f})")

        return validation_results

# ===== ENHANCED SINGAPORE POI CORRECTION SYSTEM =====
class EnhancedSingaporePOICorrectionSystem:
    def __init__(self):
        self.loader = CSVPOILoader()
        self.validator = EnhancedPOIValidator()

    def process_singapore_addresses(self, csv_file_path: str) -> Dict:
        """Main processing pipeline for Singapore address validation with visual verification"""

        print("="*80)
        print("🇸🇬 SINGAPORE POI LOCATION VALIDATION SYSTEM (WITH VISUAL VERIFICATION)")
        print("="*80)

        # Load CSV data
        gdf = self.loader.load_csv_data(csv_file_path)
        if gdf is None or gdf.empty:
            return {"error": "Failed to load CSV data"}

        # Perform enhanced validation with visual verification
        validation_results = self.validator.validate_poi_locations_with_visual(gdf)

        results = {
            "total_addresses": len(gdf),
            "addresses_validated": len(validation_results),
            "validation_results": validation_results,
            "corrections_needed": [],
            "summary": {
                "accurate": 0,
                "needs_review": 0,
                "needs_correction": 0,
                "cannot_determine": 0,
                "visual_verification_attempted": 0,
                "visual_verification_successful": 0
            }
        }

        for res in validation_results:
            accuracy = res['algorithmic_analysis']['location_accuracy']

            # Count visual verification stats
            visual_ver = res.get('visual_verification', {})
            if visual_ver.get('visual_verification_attempted'):
                results["summary"]["visual_verification_attempted"] += 1
            if visual_ver.get('images_analyzed', 0) > 0:
                results["summary"]["visual_verification_successful"] += 1

            # Categorize results
            if accuracy == 'accurate':
                results["summary"]["accurate"] += 1
            elif accuracy in ['slightly_off', 'significantly_off']:
                results["summary"]["needs_correction"] += 1
                results["corrections_needed"].append(res)
            elif accuracy == 'cannot_determine':
                results["summary"]["cannot_determine"] += 1
                results["summary"]["needs_review"] += 1
            elif accuracy == 'needs_review':
                results["summary"]["needs_review"] += 1

        return results

    def generate_enhanced_validation_report(self, results: Dict) -> str:
        """Generate comprehensive validation report with visual verification results"""

        # Calculate accuracy rates
        determinable_addresses = results['summary']['accurate'] + results['summary']['needs_correction']
        accuracy_rate = 0.0
        if determinable_addresses > 0:
            accuracy_rate = (results['summary']['accurate'] / determinable_addresses) * 100

        visual_success_rate = 0.0
        if results['summary']['visual_verification_attempted'] > 0:
            visual_success_rate = (results['summary']['visual_verification_successful'] / results['summary']['visual_verification_attempted']) * 100

        report = f"""# Singapore Address Location Validation Report (Enhanced with Visual Verification)

## Executive Summary
- **Total Addresses Processed**: {results['total_addresses']}
- **Addresses Validated**: {results['addresses_validated']}
- **Accurate Locations**: {results['summary']['accurate']}
- **Need Correction**: {results['summary']['needs_correction']}
- **Need Review**: {results['summary']['needs_review']}
- **Could Not Determine**: {results['summary']['cannot_determine']}
- **Accuracy Rate (of determinable addresses)**: {accuracy_rate:.1f}%

## Visual Verification Statistics
- **Visual Verification Attempted**: {results['summary']['visual_verification_attempted']}
- **Visual Verification Successful**: {results['summary']['visual_verification_successful']}
- **Visual Success Rate**: {visual_success_rate:.1f}%

## Detailed Validation Results

"""

        for i, validation in enumerate(results.get('validation_results', []), 1):
            analysis = validation['algorithmic_analysis']
            visual = validation.get('visual_verification', {})
            accuracy = analysis.get('location_accuracy', 'unknown')

            status_emoji = {
                'accurate': '✅',
                'slightly_off': '⚠',
                'significantly_off': '❌',
                'cannot_determine': '❓',
                'needs_review': '🔍'
            }.get(accuracy, '❓')

            report += f"""### {i}. {validation['address']} {status_emoji}

**Location Details:**
- Original Coordinates: {validation['coordinates'][0]:.6f}, {validation['coordinates'][1]:.6f}
- POI Type: {validation['poi_type']}

**Algorithmic Analysis Results:**
- Accuracy Assessment: {accuracy.upper()}
- Confidence Score: {analysis.get('confidence_score', 0):.2f}
- Recommended Action: {analysis.get('recommended_action', 'unknown')}
- Observations: {analysis.get('observations', 'No observations available')}
- Reasoning: {analysis.get('reasoning', 'No reasoning provided')}

**Visual Verification Results:**
"""

            if visual.get('visual_verification_attempted'):
                report += f"""- Images Found: {visual.get('images_found', 0)}
- Images Analyzed: {visual.get('images_analyzed', 0)}
- Visual Confidence: {visual.get('overall_visual_confidence', 0):.2f}
- Visual Recommendation: {visual.get('visual_recommendation', 'N/A')}
- Visual Summary: {visual.get('visual_analysis_summary', 'No analysis available')}
"""

                if visual.get('image_analyses'):
                    report += "\n**Individual Image Analyses:**\n"
                    for img_analysis in visual['image_analyses']:
                        report += f"  - Distance: {img_analysis['distance_from_poi']:.1f}m, Confidence: {img_analysis['confidence_score']:.2f}\n"
                        # Truncate analysis for report brevity
                        analysis_preview = img_analysis['analysis'][:200] + "..." if len(img_analysis['analysis']) > 200 else img_analysis['analysis']
                        report += f"    Analysis: {analysis_preview}\n"
            else:
                report += "- Visual verification not attempted\n"

            report += "\n---\n\n"

        # Add corrections section if any
        if results.get('corrections_needed'):
            report += "\n## Addresses Requiring Correction / Review\n\n"
            for correction in results['corrections_needed']:
                analysis = correction['algorithmic_analysis']
                visual = correction.get('visual_verification', {})
                suggested_coords = analysis.get('suggested_corrections', {}).get('coordinates')

                report += f"""**{correction['address']}**
- Current: {correction['coordinates'][0]:.6f}, {correction['coordinates'][1]:.6f}
- Issue: {analysis.get('location_accuracy', 'unknown').replace('_', ' ').title()}
- Algorithmic Confidence: {analysis.get('confidence_score', 0):.2f}
- Visual Confidence: {visual.get('overall_visual_confidence', 0):.2f}
- Combined Reasoning: {analysis.get('reasoning', 'No reasoning provided')}
"""
                if suggested_coords:
                    report += f"- Suggested Coordinates: {suggested_coords[0]:.6f}, {suggested_coords[1]:.6f}\n"

                if visual.get('visual_issues_found'):
                    report += f"- Visual Issues: {', '.join(visual['visual_issues_found'])}\n"
                report += "\n"

        return report

# ===== MAIN EXECUTION =====
def main():
    """Main execution function with enhanced visual verification"""

    print("🚀 Starting Enhanced Singapore Address Validation System")
    print("="*60)

    # Initialize system
    try:
        system = EnhancedSingaporePOICorrectionSystem()
        print("✅ System initialized successfully")
        print("📸 Mappillary integration enabled")
        print("🤖 Gemini AI vision analysis enabled")
    except Exception as e:
        print(f"❌ System initialization failed: {e}")
        return None

    # Process the CSV file
    csv_file = "/content/test-2.csv"

    if not os.path.exists(csv_file):
        print(f"❌ CSV file not found: {csv_file}")
        # Create a more comprehensive dummy CSV for demonstration
        print("Creating a comprehensive dummy 'test.csv' for demonstration purposes.")
        dummy_data = {
            'DISPLAY_LA': [1.3521, 1.2903, 1.3000, 1.3900, 1.4500, 1.2800, 1.3100, 1.3600, 1.3300, 1.4000],
            'DISPLAY_LO': [103.8198, 103.8519, 103.8400, 103.8000, 103.7500, 103.8300, 103.8900, 103.7800, 103.8600, 103.9200],
            'HOUSE_NUMB': ['10', '20', '30', '40', '50', '60', '70', '80', '90', '100'],
            'BUILDING_N': ['Orchard Towers', 'Raffles City', 'Suntec City', 'NEX', 'Causeway Point', 'VivoCity', 'ION Orchard', 'Great World', 'Jewel Changi', 'AMK Hub'],
            'STREET_NAM': ['Orchard Road', 'North Bridge Road', 'Temasek Boulevard', 'Serangoon Central', 'Woodlands Square', 'Telok Blangah Road', 'Orchard Turn', 'Kim Seng Promenade', 'Airport Boulevard', 'Ang Mo Kio Ave 8'],
            'FULL_POSTA': ['238879', '179099', '038983', '556083', '738099', '098637', '238801', '237994', '819666', '567708'],
            'ROUTING_LA': [1.3521, 1.2903, 1.3000, 1.3900, 1.4500, 1.2800, 1.3100, 1.3600, 1.3300, 1.4000],
            'ROUTING_LO': [103.8198, 103.8519, 103.8400, 103.8000, 103.7500, 103.8300, 103.8900, 103.7800, 103.8600, 103.9200],
            'HDB': ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'Y']
        }
        pd.DataFrame(dummy_data).to_csv(csv_file, index=False)

    try:
        print(f"\n📁 Processing CSV file: {csv_file}")
        results = system.process_singapore_addresses(csv_file)

        if 'error' not in results:
            # Generate and display report
            report = system.generate_enhanced_validation_report(results)

            print("\n" + "="*80)
            print("📄 ENHANCED VALIDATION REPORT (WITH VISUAL VERIFICATION)")
            print("="*80)
            print(report)

            # Save report
            report_filename = "singapore_address_validation_report_enhanced.md"
            with open(report_filename, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"\n💾 Full report saved: {report_filename}")

            # Display summary
            print("\n" + "="*80)
            print("🎯 FINAL SUMMARY")
            print("="*80)
            print(f"📊 Total Addresses: {results['total_addresses']}")
            print(f"🔍 Addresses Validated: {results['addresses_validated']}")
            print(f"✅ Accurate: {results['summary']['accurate']}")
            print(f"🔧 Need Correction: {results['summary']['needs_correction']}")
            print(f"📋 Need Review: {results['summary']['needs_review']}")
            print(f"❓ Could Not Determine: {results['summary']['cannot_determine']}")

            print(f"\n📸 Visual Verification Stats:")
            print(f"🔍 Visual Verification Attempted: {results['summary']['visual_verification_attempted']}")
            print(f"✅ Visual Verification Successful: {results['summary']['visual_verification_successful']}")

            if results['summary']['visual_verification_attempted'] > 0:
                visual_success_rate = (results['summary']['visual_verification_successful'] / results['summary']['visual_verification_attempted']) * 100
                print(f"📈 Visual Success Rate: {visual_success_rate:.1f}%")

            determinable_addresses = results['summary']['accurate'] + results['summary']['needs_correction']
            if determinable_addresses > 0:
                accuracy_rate = (results['summary']['accurate'] / determinable_addresses) * 100
                print(f"🎯 Overall Accuracy Rate: {accuracy_rate:.1f}%")

            print("="*80)

            # Additional insights
            print("\n🔍 VISUAL VERIFICATION INSIGHTS:")
            total_images_found = sum(res.get('visual_verification', {}).get('images_found', 0) for res in results['validation_results'])
            total_images_analyzed = sum(res.get('visual_verification', {}).get('images_analyzed', 0) for res in results['validation_results'])

            print(f"📸 Total Street View Images Found: {total_images_found}")
            print(f"🤖 Total Images Analyzed by AI: {total_images_analyzed}")

            # Calculate visual verification impact
            visual_confirmations = 0
            visual_contradictions = 0
            for res in results['validation_results']:
                visual_ver = res.get('visual_verification', {})
                if visual_ver.get('visual_recommendation') == 'coordinates_likely_correct':
                    visual_confirmations += 1
                elif visual_ver.get('visual_recommendation') == 'coordinates_likely_incorrect':
                    visual_contradictions += 1

            print(f"✅ Visual Confirmations: {visual_confirmations}")
            print(f"❌ Visual Contradictions: {visual_contradictions}")
            print("="*80)

        else:
            print(f"❌ Error processing CSV: {results['error']}")

    except Exception as e:
        print(f"❌ Error during processing: {str(e)}")
        import traceback
        traceback.print_exc()

    return results

# ===== UTILITY FUNCTIONS =====
def test_mappillary_connection():
    """Test Mappillary API connection"""
    try:
        visual_system = VisualVerificationSystem()
        # Test with Singapore CBD coordinates
        test_lat, test_lon = 1.2840, 103.8510
        images = visual_system.get_mappillary_images(test_lat, test_lon, radius=50)
        print(f"✅ Mappillary connection test successful. Found {len(images)} images.")
        return True
    except Exception as e:
        print(f"❌ Mappillary connection test failed: {str(e)}")
        return False

def test_gemini_connection():
    """Test Gemini API connection"""
    try:
        visual_system = VisualVerificationSystem()
        # Create a simple test image (1x1 pixel PNG)
        import io
        from PIL import Image

        # Create minimal test image
        img = Image.new('RGB', (1, 1), color='white')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        test_image_bytes = img_bytes.getvalue()

        # Test with minimal POI info
        test_poi = {
            'address': 'Test Address, Singapore',
            'building_name': 'Test Building',
            'street_name': 'Test Street',
            'poi_type': 'Test Location'
        }

        result = visual_system.analyze_image_with_gemini(test_image_bytes, test_poi)
        if result['success']:
            print("✅ Gemini API connection test successful.")
            return True
        else:
            print(f"❌ Gemini API connection test failed: {result.get('error', 'Unknown error')}")
            return False
    except Exception as e:
        print(f"❌ Gemini API connection test failed: {str(e)}")
        return False

def run_connection_tests():
    """Run all connection tests"""
    print("🧪 Testing API Connections...")
    print("-" * 40)

    mappillary_ok = test_mappillary_connection()
    gemini_ok = test_gemini_connection()

    print("-" * 40)
    if mappillary_ok and gemini_ok:
        print("✅ All API connections successful!")
        return True
    else:
        print("❌ Some API connections failed. Check your API keys and network connection.")
        return False
