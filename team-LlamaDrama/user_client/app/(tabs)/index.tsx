import React, { useRef, useState, useCallback, useEffect } from 'react';
import { StyleSheet, Dimensions, View, Text, Modal, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { useReviewStore } from '@/store/reviewStore';
import { Location } from '@/types/review';
import { ThemedView } from '@/components/ThemedView';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

type Feature = {
  id?: string;
  address: string;
  coordinates: number[];  // Changed from tuple to array
  poi_type: string;
  suspicion_score: number;
  algorithmic_analysis: {
    location_accuracy: string;
    confidence_score: number;
    observations: string;
  };
  visual_verification: {
    visual_verification_attempted: boolean;
    images_found: number;
    overall_visual_confidence: number;
    visual_analysis_summary: string;
  };
};

export default function MapScreen() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const reviews = useReviewStore((state) => state.reviews);
  const [pins, setPins] = useState<Location | null>(null);

  // Fetch and transform features
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await axios.get(`http://10.10.112.161:5000/api/mapview/allfeatures`);
        const transformedFeatures = response.data
          .filter(f => f.coordinates && f.coordinates.length === 2)
          .map(f => ({
            id: f._id,
            address: f.address,
            coordinates: f.coordinates,
            poi_type: f.poi_type,
            suspicion_score: f.suspicion_score,
            algorithmic_analysis: f.algorithmic_analysis || {},
            visual_verification: f.visual_verification || {}
          }));

        setFeatures(transformedFeatures);
        setPins(true);
      } catch (error) {
        console.error('Error fetching features:', error);
      }
    };
    fetchFeatures();
  }, [pins]);

  const handleMapPress = useCallback((e) => {
    const { coordinate } = e.nativeEvent;
    setSelectedLocation(coordinate);
    // bottomSheetRef.current?.present();
  }, []);

  const handleReviewSubmit = useCallback(() => {
    // bottomSheetRef.current?.dismiss();
    setSelectedLocation(null);
  }, []);

  const handleMarkerPress = useCallback((feature: Feature) => {
    setSelectedFeature(feature);
    setShowMetadata(true);
  }, []);

  // Update the marker rendering section
  return (
    <ThemedView style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 1.35,
          longitude: 103.81,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        onPress={handleMapPress}
      >
        {features.map((feature, index) => {
          // Add null check and coordinate validation
          if (!feature.coordinates || feature.coordinates.length < 2) {
            return null;
          }
          
          return (
            <Marker
              key={`feature-${feature.id || index}`}
              coordinate={{
                latitude: Number(feature.coordinates[0]) || 0,
                longitude: Number(feature.coordinates[1]) || 0
              }}
              onPress={() => handleMarkerPress(feature)}
              pinColor={feature.suspicion_score > 0.5 ? 'red' : 'green'}
            />
          );
        })}

        {/* Existing review markers */}
        {reviews.map((review) => (
          <Marker
            key={review.id}
            coordinate={review.location}
            title={`Rating: ${review.rating}★`}
            description={review.text}
          />
        ))}
      </MapView>

      {/* Replace BottomSheetModal with Modal */}
      <Modal
        visible={showMetadata}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMetadata(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Location Details</Text>
              <TouchableOpacity onPress={() => setShowMetadata(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            {selectedFeature && selectedFeature.coordinates && selectedFeature.coordinates.length >= 2 && (
              <View style={styles.modalBody}>
                <Text style={styles.detailTitle}>{selectedFeature.poi_type}</Text>
                <Text style={styles.detailText}>{selectedFeature.address}</Text>
                <Text style={styles.coordinates}>
                  {`${Number(selectedFeature.coordinates[0]).toFixed(6)}, ${Number(selectedFeature.coordinates[1]).toFixed(6)}`}
                </Text>
                <Text style={styles.confidenceScore}>
                  Confidence: {(selectedFeature.algorithmic_analysis?.confidence_score * 100 || 0).toFixed(1)}%
                </Text>
                {selectedFeature.visual_verification?.visual_verification_attempted && (
                  <Text style={styles.visualVerification}>
                    Visual Confidence: {(selectedFeature.visual_verification.overall_visual_confidence * 100).toFixed(1)}%
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  modalBody: {
    paddingVertical: 10,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  coordinates: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
  },
  confidenceScore: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  visualVerification: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
});
