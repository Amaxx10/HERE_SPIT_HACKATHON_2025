import geopandas as gpd
import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
from scipy import stats
from scipy.spatial.distance import cdist
from shapely.geometry import Point
import warnings
import os
from datetime import datetime

class SingaporePOIAnalyzer:
    def __init__(self):
        self.poi_data = None
        self.streets_data = None
        self.results = None
        self.outlier_threshold = 0.1  # 10% of data as potential outliers
        self.results_dir = None

    def create_results_directory(self):
        """Create a new directory for storing results"""
        self.results_dir = f"analysis_results"
        os.makedirs(self.results_dir, exist_ok=True)
        print(f"Created results directory: {self.results_dir}")
        return self.results_dir

    def load_data(self, poi_shapefile_path, streets_shapefile_path, sample_size=3000):
        """Load POI and Streets shapefiles with sampling for faster processing"""
        try:
            full_poi_data = gpd.read_file(poi_shapefile_path)
            self.streets_data = gpd.read_file(streets_shapefile_path)

            print(f"Loaded {len(full_poi_data)} total POIs")
            print(f"Loaded {len(self.streets_data)} street segments")

            if len(full_poi_data) > sample_size:
                self.poi_data = full_poi_data.sample(n=sample_size, random_state=42).reset_index(drop=True)
                print(f"Sampled {sample_size} POIs for analysis (random seed=42 for reproducibility)")
            else:
                self.poi_data = full_poi_data
                print("Using all POIs (dataset smaller than sample size)")

            print(f"POI CRS: {self.poi_data.crs}")
            print(f"Streets CRS: {self.streets_data.crs}")

            if self.poi_data.crs != self.streets_data.crs:
                self.streets_data = self.streets_data.to_crs(self.poi_data.crs)

            return True
        except Exception as e:
            print(f"Error loading data: {e}")
            return False

    def extract_coordinates(self):
        """Extract X, Y coordinates from geometry"""
        self.poi_data['x_coord'] = self.poi_data.geometry.x
        self.poi_data['y_coord'] = self.poi_data.geometry.y

    def calculate_spatial_features(self):
        """Calculate various spatial features for outlier detection (optimized)"""
        print("Calculating spatial features...")
        coords = np.column_stack([self.poi_data['x_coord'], self.poi_data['y_coord']])

        # 1. Distance to nearest POI
        print("  Calculating nearest POI distances...")
        nbrs = NearestNeighbors(n_neighbors=2, algorithm='ball_tree').fit(coords)
        distances, indices = nbrs.kneighbors(coords)
        self.poi_data['nearest_poi_distance'] = distances[:, 1]

        # 2. Distance to nearest street
        print("  Calculating distances to streets (fast method)...")
        street_coords = []
        for geom in self.streets_data.geometry:
            try:
                if geom.geom_type == 'LineString':
                    street_coords.extend(list(geom.coords))
                elif geom.geom_type == 'MultiLineString':
                    for line in geom.geoms:
                        street_coords.extend(list(line.coords))
            except:
                continue

        if len(street_coords) > 10000:
            street_coords = street_coords[::len(street_coords)//10000]
        street_coords = np.array(street_coords)
        poi_coords = coords

        print(f"    Using {len(street_coords)} street points for distance calculation...")

        chunk_size = 200
        street_distances = []
        for i in range(0, len(poi_coords), chunk_size):
            end_idx = min(i + chunk_size, len(poi_coords))
            poi_chunk = poi_coords[i:end_idx]
            distances = cdist(poi_chunk, street_coords)
            min_distances = np.min(distances, axis=1)
            street_distances.extend(min_distances)
            if (i // chunk_size) % 5 == 0:
                print(f"    Processed {end_idx}/{len(poi_coords)} POIs")
        self.poi_data['distance_to_street'] = street_distances

        # 3. Local density
        print("  Calculating local density...")
        nbrs_density = NearestNeighbors(radius=500, algorithm='ball_tree').fit(coords)
        distances, indices = nbrs_density.radius_neighbors(coords)
        local_density = [len(neighbors) - 1 for neighbors in indices]
        self.poi_data['local_density'] = local_density

        # 4. Distance to centroid
        print("  Calculating distances to centroid...")
        centroid_x = self.poi_data['x_coord'].mean()
        centroid_y = self.poi_data['y_coord'].mean()
        self.poi_data['distance_to_centroid'] = np.sqrt(
            (self.poi_data['x_coord'] - centroid_x)**2 +
            (self.poi_data['y_coord'] - centroid_y)**2
        )
        print("  Spatial features calculation complete!")

    def detect_outliers_multiple_methods(self):
        """Apply multiple outlier detection methods"""
        features = ['nearest_poi_distance', 'distance_to_street', 'local_density', 'distance_to_centroid']
        z_scores = np.abs(stats.zscore(self.poi_data[features].fillna(0)))
        self.poi_data['z_score_outlier'] = (z_scores > 2.5).any(axis=1)

        iqr_outliers = []
        for feature in features:
            Q1 = self.poi_data[feature].quantile(0.25)
            Q3 = self.poi_data[feature].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            outliers = (self.poi_data[feature] < lower_bound) | (self.poi_data[feature] > upper_bound)
            iqr_outliers.append(outliers)
        self.poi_data['iqr_outlier'] = pd.DataFrame(iqr_outliers).T.any(axis=1)

        coords = self.poi_data[['x_coord', 'y_coord']].fillna(0)
        coords_scaled = StandardScaler().fit_transform(coords)
        nbrs = NearestNeighbors(n_neighbors=5).fit(coords_scaled)
        distances, indices = nbrs.kneighbors(coords_scaled)
        k_distances = distances[:, -1]
        eps = np.percentile(k_distances, 90)
        dbscan = DBSCAN(eps=eps, min_samples=3).fit(coords_scaled)
        self.poi_data['cluster'] = dbscan.labels_
        self.poi_data['dbscan_outlier'] = dbscan.labels_ == -1

        from sklearn.neighbors import LocalOutlierFactor
        lof = LocalOutlierFactor(n_neighbors=10, contamination=self.outlier_threshold)
        lof_outliers = lof.fit_predict(coords_scaled)
        self.poi_data['lof_outlier'] = lof_outliers == -1

    def calculate_composite_outlier_score(self):
        """Calculate composite outlier score and final classification"""
        weights = {
            'z_score_outlier': 0.25,
            'iqr_outlier': 0.20,
            'dbscan_outlier': 0.30,
            'lof_outlier': 0.25
        }
        self.poi_data['outlier_score'] = 0
        for method, weight in weights.items():
            self.poi_data['outlier_score'] += weight * self.poi_data[method].astype(int)

        high_street_distance = self.poi_data['distance_to_street'] > self.poi_data['distance_to_street'].quantile(0.95)
        self.poi_data['outlier_score'] += 0.15 * high_street_distance.astype(int)

        low_density = self.poi_data['local_density'] < self.poi_data['local_density'].quantile(0.05)
        self.poi_data['outlier_score'] += 0.10 * low_density.astype(int)

        extreme_isolation = self.poi_data['nearest_poi_distance'] > self.poi_data['nearest_poi_distance'].quantile(0.98)
        self.poi_data['outlier_score'] += 0.20 * extreme_isolation.astype(int)

        self.poi_data['confidence_level'] = 'Low'
        self.poi_data.loc[self.poi_data['outlier_score'] > 0.3, 'confidence_level'] = 'Medium'
        self.poi_data.loc[self.poi_data['outlier_score'] > 0.6, 'confidence_level'] = 'High'
        self.poi_data.loc[self.poi_data['outlier_score'] > 0.8, 'confidence_level'] = 'Very High'

        threshold = 0.4
        self.poi_data['is_outlier'] = self.poi_data['outlier_score'] > threshold
        self.poi_data['classification'] = self.poi_data['is_outlier'].map({True: 'INCORRECT', False: 'CORRECT'})

    def generate_detailed_analysis(self):
        """Generate detailed analysis and statistics"""
        total_pois = len(self.poi_data)
        incorrect_pois = (self.poi_data['classification'] == 'INCORRECT').sum()
        correct_pois = total_pois - incorrect_pois

        print("\n" + "="*50)
        print("SINGAPORE POI SPATIAL ANALYSIS RESULTS")
        print("="*50)
        print(f"Total POIs analyzed: {total_pois}")
        print(f"Correctly placed POIs: {correct_pois} ({correct_pois/total_pois*100:.1f}%)")
        print(f"Incorrectly placed POIs: {incorrect_pois} ({incorrect_pois/total_pois*100:.1f}%)")

        print("\nConfidence Level Distribution:")
        confidence_dist = self.poi_data['confidence_level'].value_counts()
        for level, count in confidence_dist.items():
            print(f"  {level}: {count} ({count/total_pois*100:.1f}%)")

        print("\nOutlier Detection Method Agreement:")
        methods = ['z_score_outlier', 'iqr_outlier', 'dbscan_outlier', 'lof_outlier']
        for method in methods:
            agreement = (self.poi_data[method] == self.poi_data['is_outlier']).mean()
            print(f"  {method}: {agreement*100:.1f}% agreement with final classification")

        print("\nTop 10 Most Likely Misplaced POIs:")
        top_outliers = self.poi_data.nlargest(10, 'outlier_score')[
            ['outlier_score', 'confidence_level', 'nearest_poi_distance', 'distance_to_street', 'local_density']
        ]
        print(top_outliers.round(4))

    def prepare_output_data(self):
        """Prepare comprehensive output data"""
        output_columns = [
            'x_coord', 'y_coord',
            'nearest_poi_distance', 'distance_to_street', 'local_density', 'distance_to_centroid',
            'z_score_outlier', 'iqr_outlier', 'dbscan_outlier', 'lof_outlier',
            'cluster', 'outlier_score', 'confidence_level', 'classification'
        ]
        existing_cols = [col for col in self.poi_data.columns if col not in output_columns + ['geometry']]
        output_columns = existing_cols + output_columns
        self.results = self.poi_data[output_columns].copy()

        reasons = []
        for idx, row in self.poi_data.iterrows():
            reason_list = []
            if row['distance_to_street'] > self.poi_data['distance_to_street'].quantile(0.9):
                reason_list.append("Far from streets")
            if row['local_density'] < 2:
                reason_list.append("Low local density")
            if row['nearest_poi_distance'] > self.poi_data['nearest_poi_distance'].quantile(0.95):
                reason_list.append("Isolated from other POIs")
            if row['dbscan_outlier']:
                reason_list.append("Spatial clustering outlier")
            reasons.append("; ".join(reason_list) if reason_list else "Normal spatial pattern")
        self.results['outlier_reasons'] = reasons

    def format_csv_data(self):
        """Format data for CSV export with proper column structure"""
        if self.results is not None:
            formatted_data = self.results.copy()
            
            # Round numerical columns
            numerical_cols = formatted_data.select_dtypes(include=[np.number]).columns
            formatted_data[numerical_cols] = formatted_data[numerical_cols].round(6)
            
            # Format specific columns
            if 'outlier_score' in formatted_data.columns:
                formatted_data['outlier_score'] = formatted_data['outlier_score'].map('{:.2%}'.format)
            
            # Add column descriptions
            column_descriptions = {
                'x_coord': 'Longitude',
                'y_coord': 'Latitude',
                'nearest_poi_distance': 'Distance to Nearest POI (m)',
                'distance_to_street': 'Distance to Nearest Street (m)',
                'local_density': 'Number of POIs within 500m',
                'distance_to_centroid': 'Distance to Area Centroid (m)',
                'outlier_score': 'Anomaly Score (%)',
                'confidence_level': 'Confidence in Classification',
                'classification': 'POI Classification',
                'outlier_reasons': 'Reasons for Classification'
            }
            
            # Rename columns
            formatted_data = formatted_data.rename(columns=column_descriptions)
            
            return formatted_data
        return None

    def save_results(self, sample_size):
        """Save results to shapefile and CSV in the results directory"""
        if self.results is not None:
            # Format data for CSV
            formatted_data = self.format_csv_data()
            
            csv_filename = f'{sample_size}_all_results.csv'
            csv_path = os.path.join(self.results_dir, csv_filename)
            formatted_data.to_csv(csv_path, index=False, encoding='utf-8')
            print(f"\nCSV (All POIs) Results saved to: {csv_path}")

            results_gdf = self.poi_data.copy()
            for col in self.results.columns:
                if col not in results_gdf.columns:
                    results_gdf[col] = self.results[col]

            shp_filename = f'{sample_size}_all_results.shp'
            shp_path = os.path.join(self.results_dir, shp_filename)
            results_gdf.to_file(shp_path)
            print(f"Shapefile (All POIs) Results saved to: {shp_path}")
            print(f"Shapefile components (.shp, .shx, .dbf, .prj, .cpg) created in: {self.results_dir}")

            return csv_path, shp_path
        else:
            print("No results to save. Run analysis first.")
            return None, None

    def save_incorrect_pois_csv(self, sample_size):
        """Save only the identified incorrect POIs to a separate CSV file."""
        if self.results is not None:
            incorrect_pois_df = self.results[self.results['classification'] == 'INCORRECT'].copy()

            if len(incorrect_pois_df) > 0:
                # Format data for CSV
                formatted_incorrect = self.format_csv_data().loc[incorrect_pois_df.index]
                
                csv_filename = f'{sample_size}_incorrect_only.csv'
                csv_path = os.path.join(self.results_dir, csv_filename)
                formatted_incorrect.to_csv(csv_path, index=False, encoding='utf-8')
                print(f"\nCSV (Incorrect POIs Only) saved to: {csv_path}")
                return csv_path
            else:
                print("\nNo incorrect POIs identified to save to CSV.")
                return None
        else:
            print("\nNo results available to save incorrect POIs. Run analysis first.")
            return None
