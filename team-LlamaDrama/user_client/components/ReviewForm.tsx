import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ReviewFormData, Location } from '@/types/review';
import { useReviewStore } from '@/store/reviewStore';

interface Props {
  location: Location;
  onSubmit: () => void;
}

export function ReviewForm({ location, onSubmit }: Props) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const addReview = useReviewStore(...state => state.addReview);

  const handleSubmit = () => {
    if (rating === 0) return;
    
    addReview({
      location,
      rating,
      text,
    });
    
    setRating(0);
    setText('');
    onSubmit();
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Add Review</ThemedText>
      
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <ThemedText style={[styles.star, star <= rating && styles.starSelected]}>
              ★
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Write your review..."
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.button, !rating && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!rating}
      >
        <ThemedText style={styles.buttonText}>Submit Review</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 32,
    color: '#ccc',
  },
  starSelected: {
    color: '#FFD700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
