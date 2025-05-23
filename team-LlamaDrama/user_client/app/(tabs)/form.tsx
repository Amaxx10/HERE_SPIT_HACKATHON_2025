import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Dimensions
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width } = Dimensions.get('window');

const StarRating = ({ rating, onRatingChange, size = 30 }) => {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRatingChange(star)}
          style={styles.starButton}
          activeOpacity={0.7}
        >
          <IconSymbol
            name={star <= rating ? "star.fill" : "star"}
            size={size}
            color={star <= rating ? "#FFD700" : Colors[colorScheme].icon}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ImagePreview = ({ uri, onRemove, index }) => {
  return (
    <View style={styles.imagePreview}>
      <Image source={{ uri }} style={styles.previewImage} />
      <TouchableOpacity
        style={styles.removeImageButton}
        onPress={onRemove}
        activeOpacity={0.7}
      >
        <IconSymbol name="xmark" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const LocationCard = ({ latitude, longitude, address, accuracy }) => {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <View style={[styles.locationCard, { backgroundColor: Colors[colorScheme].background }]}>
      <View style={styles.locationHeader}>
        <View style={[styles.locationIcon, { backgroundColor: Colors[colorScheme].tint + '20' }]}>
          <IconSymbol name="location.fill" size={20} color={Colors[colorScheme].tint} />
        </View>
        <View style={styles.locationInfo}>
          <ThemedText style={styles.locationTitle}>Current Location</ThemedText>
          {address ? (
            <ThemedText style={styles.locationAddress}>{address}</ThemedText>
          ) : null}
        </View>
      </View>
      
      <View style={styles.coordinatesContainer}>
        <View style={styles.coordinate}>
          <ThemedText style={styles.coordinateLabel}>Latitude:</ThemedText>
          <ThemedText style={styles.coordinateValue}>{latitude?.toFixed(6)}</ThemedText>
        </View>
        <View style={styles.coordinate}>
          <ThemedText style={styles.coordinateLabel}>Longitude:</ThemedText>
          <ThemedText style={styles.coordinateValue}>{longitude?.toFixed(6)}</ThemedText>
        </View>
      </View>
      
      {accuracy && (
        <ThemedText style={styles.accuracyText}>
          Accuracy: ±{Math.round(accuracy)}m
        </ThemedText>
      )}
    </View>
  );
};

export default function LocationReviewForm() {
  const colorScheme = useColorScheme() ?? 'light';
  
  const [formData, setFormData] = useState({
    latitude: null,
    longitude: null,
    address: '',
    images: [],
    rating: 0,
    title: '',
    description: '',
    category: ''
  });

  const [locationState, setLocationState] = useState({
    loading: false,
    error: null,
    accuracy: null
  });

  const [imageState, setImageState] = useState({
    uploading: false,
    error: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    // Check camera permissions
    const cameraStatus = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(cameraStatus.status === 'granted');

    // Check media library permissions
    const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (Platform.OS === 'android') {
      const locationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
    }
  };

  const getCurrentLocation = async () => {
    setLocationState({ loading: true, error: null, accuracy: null });

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationState({
          loading: false,
          error: 'Permission to access location was denied',
          accuracy: null
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
        maximumAge: 60000
      });

      const { latitude, longitude, accuracy } = location.coords;

      setFormData(prev => ({
        ...prev,
        latitude,
        longitude
      }));

      setLocationState({
        loading: false,
        error: null,
        accuracy
      });

      // Reverse geocoding
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude
        });

        if (reverseGeocode.length > 0) {
          const address = reverseGeocode[0];
          const formattedAddress = `${address.street || ''} ${address.city || ''} ${address.region || ''}`.trim();
          
          setFormData(prev => ({
            ...prev,
            address: formattedAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
        }
      } catch (geocodeError) {
        console.log('Reverse geocoding failed:', geocodeError);
        setFormData(prev => ({
          ...prev,
          address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        }));
      }

    } catch (error) {
      setLocationState({
        loading: false,
        error: 'Unable to get location. Please check GPS settings.',
        accuracy: null
      });
    }
  };

  const takePhoto = async () => {
    if (!cameraPermission) {
      Alert.alert('Camera Permission', 'Please grant camera permission to take photos');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        addImage(result.assets[0].uri, true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        result.assets.forEach(asset => {
          addImage(asset.uri, false);
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const addImage = (uri, isCamera) => {
    const newImage = {
      id: Date.now() + Math.random(),
      uri,
      isCamera
    };

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImage]
    }));
  };

  const removeImage = (id) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id)
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.latitude || !formData.longitude) {
      Alert.alert('Location Required', 'Please get your current location first');
      return;
    }

    if (formData.rating === 0) {
      Alert.alert('Rating Required', 'Please provide a star rating');
      return;
    }

    if (!formData.title.trim()) {
      Alert.alert('Title Required', 'Please provide a title for your review');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const reviewData = {
        location: {
          latitude: formData.latitude,
          longitude: formData.longitude,
          address: formData.address
        },
        rating: formData.rating,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        images: formData.images.length,
        timestamp: new Date().toISOString()
      };

      console.log('Review submitted:', reviewData);

      Alert.alert(
        'Success! 🎉',
        'Your review has been submitted successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                latitude: null,
                longitude: null,
                address: '',
                images: [],
                rating: 0,
                title: '',
                description: '',
                category: ''
              });
            }
          }
        ]
      );

    } catch (error) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: Colors[colorScheme].tint }]}>
            <IconSymbol name="location.fill" size={32} color="#fff" />
          </View>
          <ThemedText style={styles.headerTitle}>Share Your Experience</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Help others discover amazing places
          </ThemedText>
        </View>

        {/* Location Section */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme].background }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="location" size={20} color={Colors[colorScheme].tint} />
            <ThemedText style={styles.sectionTitle}>Location</ThemedText>
          </View>

          {!formData.latitude ? (
            <View style={styles.locationPrompt}>
              <TouchableOpacity
                style={[styles.locationButton, { backgroundColor: Colors[colorScheme].tint }]}
                onPress={getCurrentLocation}
                disabled={locationState.loading}
                activeOpacity={0.8}
              >
                {locationState.loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <IconSymbol name="location.fill" size={20} color="#fff" />
                )}
                <ThemedText style={styles.locationButtonText}>
                  {locationState.loading ? 'Getting Location...' : 'Get Current Location'}
                </ThemedText>
              </TouchableOpacity>

              {locationState.error && (
                <View style={styles.errorContainer}>
                  <IconSymbol name="exclamationmark.circle" size={16} color="#FF6B6B" />
                  <ThemedText style={styles.errorText}>{locationState.error}</ThemedText>
                </View>
              )}
            </View>
          ) : (
            <LocationCard
              latitude={formData.latitude}
              longitude={formData.longitude}
              address={formData.address}
              accuracy={locationState.accuracy}
            />
          )}
        </View>

        {/* Images Section */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme].background }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="camera" size={20} color={Colors[colorScheme].tint} />
            <ThemedText style={styles.sectionTitle}>Photos</ThemedText>
          </View>

          <View style={styles.imageActions}>
            <TouchableOpacity
              style={[styles.imageButton, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={takePhoto}
              activeOpacity={0.8}
            >
              <IconSymbol name="camera.fill" size={20} color="#fff" />
              <ThemedText style={styles.imageButtonText}>Take Photo</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.imageButton, styles.imageButtonSecondary, { borderColor: Colors[colorScheme].tint }]}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <IconSymbol name="photo" size={20} color={Colors[colorScheme].tint} />
              <ThemedText style={[styles.imageButtonText, { color: Colors[colorScheme].tint }]}>
                Choose Photos
              </ThemedText>
            </TouchableOpacity>
          </View>

          {formData.images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imagePreviewContainer}
            >
              {formData.images.map((image, index) => (
                <ImagePreview
                  key={image.id}
                  uri={image.uri}
                  index={index}
                  onRemove={() => removeImage(image.id)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Rating Section */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme].background }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="star" size={20} color={Colors[colorScheme].tint} />
            <ThemedText style={styles.sectionTitle}>Rating</ThemedText>
          </View>

          <View style={styles.ratingContainer}>
            <StarRating
              rating={formData.rating}
              onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
            />
            <ThemedText style={styles.ratingText}>
              {formData.rating > 0 ? `${formData.rating} out of 5 stars` : 'Tap to rate'}
            </ThemedText>
          </View>
        </View>

        {/* Review Details Section */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme].background }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="text.alignleft" size={20} color={Colors[colorScheme].tint} />
            <ThemedText style={styles.sectionTitle}>Review Details</ThemedText>
          </View>

          <TextInput
            style={[styles.input, { borderColor: Colors[colorScheme].border, color: Colors[colorScheme].text }]}
            placeholder="Review title..."
            placeholderTextColor={Colors[colorScheme].icon}
            value={formData.title}
            onChangeText={(title) => setFormData(prev => ({ ...prev, title }))}
            maxLength={100}
          />

          <TextInput
            style={[styles.textArea, { borderColor: Colors[colorScheme].border, color: Colors[colorScheme].text }]}
            placeholder="Share your experience..."
            placeholderTextColor={Colors[colorScheme].icon}
            value={formData.description}
            onChangeText={(description) => setFormData(prev => ({ ...prev, description }))}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />

          <TextInput
            style={[styles.input, { borderColor: Colors[colorScheme].border, color: Colors[colorScheme].text }]}
            placeholder="Category (Restaurant, Park, Shop, etc.)"
            placeholderTextColor={Colors[colorScheme].icon}
            value={formData.category}
            onChangeText={(category) => setFormData(prev => ({ ...prev, category }))}
            maxLength={50}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: Colors[colorScheme].tint }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <IconSymbol name="paperplane.fill" size={20} color="#fff" />
          )}
          <ThemedText style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationPrompt: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  locationCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    opacity: 0.7,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  coordinate: {
    flex: 1,
  },
  coordinateLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  coordinateValue: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  accuracyText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 6,
    textAlign: 'center',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  imageButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  imageButtonText: {
    fontWeight: '600',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  starButton: {
    paddingHorizontal: 4,
  },
  ratingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    height: 100,
    marginBottom: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});