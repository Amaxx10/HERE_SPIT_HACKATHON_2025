from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import tempfile
import shutil
import geopandas as gpd
import pandas as pd
import numpy as np
from datetime import datetime
from analyzer import SingaporePOIAnalyzer
from validator import CSVPOILoader, EnhancedPOIValidator, EnhancedSingaporePOICorrectionSystem  # Fixed class names
import warnings
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB setup
MONGO_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGO_URI)
db = client['test']
poi_results = db['rule-based']

# Add new collection for corrected POIs
corrected_pois = db['corrected']

# Add file path configurations
POI_SHAPEFILE_PATH = os.path.join(os.path.dirname(__file__), 'data', 'Singapore_Prime_LAT.shp')
STREETS_SHAPEFILE_PATH = os.path.join(os.path.dirname(__file__), 'data', 'Streets.shp')

ALLOWED_EXTENSIONS = {'shp', 'dbf', 'shx', 'prj'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return jsonify({
        "message": "Welcome to the Flask API",
        "status": "running"
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Resource not found",
        "status": 404
    }), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({
        "error": "Internal server error",
        "status": 500
    }), 500

@app.route('/analyze-poi', methods=['POST'])
def analyze_poi():
    try:
        # Initialize analyzer with default sample size
        sample_size = 3000
        analyzer = SingaporePOIAnalyzer()
        
        # Create results directory
        results_dir = analyzer.create_results_directory()
        print(f"Created results directory: {results_dir}")

        # Load and process local files
        print("Loading shapefile data...")
        success = analyzer.load_data(POI_SHAPEFILE_PATH, STREETS_SHAPEFILE_PATH, sample_size)
        
        if not success:
            return jsonify({"error": "Failed to load shapefile data"}), 400

        print("Running analysis pipeline...")
        # Execute analysis pipeline
        analyzer.extract_coordinates()
        analyzer.calculate_spatial_features()
        
        # Add warning handler for precision loss
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", RuntimeWarning)
            analyzer.detect_outliers_multiple_methods()
            
        analyzer.calculate_composite_outlier_score()
        analyzer.prepare_output_data()

        # Save results to files
        csv_path, shp_path = analyzer.save_results(sample_size)
        incorrect_csv_path = analyzer.save_incorrect_pois_csv(sample_size)
        
        print("Storing results in MongoDB...")
        # Store results in MongoDB
        results_dict = analyzer.results.to_dict(orient='records')
        insert_result = poi_results.insert_many(results_dict)

        incorrect_count = int((analyzer.poi_data['classification'] == 'INCORRECT').sum())
        print(f"Found {incorrect_count} incorrect POIs")

        response_data = {
            "message": "Analysis complete",
            "documents_inserted": len(insert_result.inserted_ids),
            "total_pois": len(analyzer.poi_data),
            "incorrect_pois": incorrect_count,
            "results_dir": results_dir,
            "csv_path": csv_path,
            "incorrect_csv_path": incorrect_csv_path,
            "shapefile_path": shp_path
        }

        return jsonify(response_data)
    except FileNotFoundError as e:
        print(f"File not found: {str(e)}")
        return jsonify({"error": "File not found", "details": str(e)}), 404

@app.route('/validate-poi', methods=['POST'])
def validate_poi():
    try:
        file_path = os.path.join(os.path.dirname(__file__), 'analysis_results', '3000_incorrect_only.csv')
        print(f"Starting POI validation using file: {file_path}")

        # Initialize the enhanced correction system
        correction_system = EnhancedSingaporePOICorrectionSystem()
        
        # Process addresses and get results
        results = correction_system.process_singapore_addresses(file_path)
        
        if 'error' in results:
            return jsonify({"error": results['error']}), 400

        # Store validation results in MongoDB
        if results.get('validation_results'):
            print("💾 Storing validation results in MongoDB...")
            insert_result = corrected_pois.insert_many(results['validation_results'])
            print(f"✅ Stored {len(insert_result.inserted_ids)} records in database")

        # Generate response data
        response_data = {
            "message": "POI validation complete",
            "total_processed": results['total_addresses'],
            "summary": results['summary'],
            "corrections_needed": len(results.get('corrections_needed', [])),
            "visual_verification": {
                "attempted": results['summary'].get('visual_verification_attempted', 0),
                "successful": results['summary'].get('visual_verification_successful', 0)
            },
            "stored_in_db": len(results.get('validation_results', []))
        }

        return jsonify(response_data)

    except FileNotFoundError as e:
        print(f"❌ File not found: {str(e)}")
        return jsonify({"error": "File not found", "details": str(e)}), 404
    except Exception as e:
        print(f"❌ Error during validation: {str(e)}")
        return jsonify({"error": "Validation failed", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
