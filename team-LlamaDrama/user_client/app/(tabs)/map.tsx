import React, { useRef, useState, useCallback, useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useReviewStore } from '@/store/reviewStore';
import { Location } from '@/types/review';
import { ThemedView } from '@/components/ThemedView';
import { ReviewForm } from '@/components/ReviewForm';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

type Feature = {
  display: {
    latitude: number;
    longitude: number;
  };
  address: {
    buildingName: string;
    streetName: string;
  };
};

export default function MapScreen() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const reviews = useReviewStore((state) => state.reviews);

  // Fetch features on component mount
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await axios.get(`http://10.10.112.161:5000/api/mapview/allfeatures`);
        setFeatures(response.data);
        console.log('Fetched features:', response.data);
      } catch (error) {
        console.error('Error fetching features:', error);
      }
    };
    fetchFeatures();
  }, []);

  const handleMapPress = useCallback((e) => {
    const { coordinate } = e.nativeEvent;
    setSelectedLocation(coordinate);
    bottomSheetRef.current?.present();
  }, []);

  const handleReviewSubmit = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    setSelectedLocation(null);
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
            key={index}
            coordinate={{
              latitude: feature.display.latitude,
              longitude: feature.display.longitude,
            }}
            title={feature.address.buildingName || 'Unknown Location'}
            description={feature.address.streetName || ''}
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

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={['60%']}
        index={0}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: 'white' }}
        handleIndicatorStyle={{ backgroundColor: '#999' }}
      >
        <ThemedView style={styles.bottomSheetContent}>
          {selectedLocation && (
            <ReviewForm
              location={selectedLocation}
              onSubmit={handleReviewSubmit}
            />
          )}
        </ThemedView>
      </BottomSheetModal>
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
  bottomSheetContent: {
    flex: 1,
    padding: 16,
  },
});
