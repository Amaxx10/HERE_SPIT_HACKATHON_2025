import React, { useRef, useState, useCallback, useEffect } from 'react';
import { StyleSheet, Dimensions, View, Text, Modal, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { useReviewStore } from '@/store/reviewStore';
import { Location } from '@/types/review';
import { ThemedView } from '@/components/ThemedView';
import { ReviewForm } from '@/components/ReviewForm';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

type Feature = {
  objectId?: string | number;
  display: {
    latitude: number;
    longitude: number;
  };
  address: {
    buildingName: string;
    streetName: string;
    houseNumber: string;
  };
  postalArea?: string;
  fullPostal?: string;
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
          .filter(f => f.display?.latitude && f.display?.longitude) // Only include features with valid coordinates
          .map(f => ({
            objectId: f.objectId,
            display: {
              latitude: parseFloat(f.display.latitude) || 0,
              longitude: parseFloat(f.display.longitude) || 0
            },
            address: {
              buildingName: f.address?.buildingName || '',
              streetName: f.address?.streetName || '',
              houseNumber: f.address?.houseNumber || ''
            },
            postalArea: f.postalArea,
            fullPostal: f.fullPostal
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

  return (
    <ThemedView style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 1.35,  // Updated to Singapore coordinates
          longitude: 103.81,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        onPress={handleMapPress}
      >
        {/* Map features from database */}
        {features.map((feature, index) => (
          <Marker
            key={`feature-${feature.objectId || index}`}
            coordinate={{
              latitude: feature.display.latitude,
              longitude: feature.display.longitude,
            }}
            onPress={() => handleMarkerPress(feature)}
          />
        ))}

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
            {selectedFeature && (
              <View style={styles.modalBody}>
                {selectedFeature.address.buildingName && (
                  <Text style={styles.detailTitle}>{selectedFeature.address.buildingName}</Text>
                )}
                <Text style={styles.detailText}>
                  {[
                    selectedFeature.address.houseNumber,
                    selectedFeature.address.streetName
                  ].filter(Boolean).join(' ')}
                </Text>
                {selectedFeature.fullPostal && (
                  <Text style={styles.detailSubtext}>{selectedFeature.fullPostal}</Text>
                )}
                <Text style={styles.coordinates}>
                  {`${selectedFeature.display.latitude.toFixed(6)}, ${selectedFeature.display.longitude.toFixed(6)}`}
                </Text>
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
  detailSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  coordinates: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
  },
});
