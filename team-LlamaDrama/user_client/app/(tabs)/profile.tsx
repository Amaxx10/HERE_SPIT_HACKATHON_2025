import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const ProfileCard = ({ icon, title, value, onPress }: { 
  icon: string; 
  title: string; 
  value: string; 
  onPress?: () => void;
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <TouchableOpacity style={styles.profileCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardLeft}>
        <View style={[styles.iconContainer, { backgroundColor: Colors[colorScheme].tint + '20' }]}>
          <IconSymbol 
            name={icon as any} 
            size={20} 
            color={Colors[colorScheme].tint} 
          />
        </View>
        <View style={styles.cardContent}>
          <ThemedText style={styles.cardTitle}>{title}</ThemedText>
          <ThemedText style={styles.cardValue}>{value}</ThemedText>
        </View>
      </View>
      <IconSymbol 
        name="chevron.right" 
        size={16} 
        color={Colors[colorScheme].icon} 
      />
    </TouchableOpacity>
  );
};

const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => {
  return (
    <View style={styles.statCard}>
      <ThemedText style={[styles.statValue, { color }]}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
};

const LeaderboardItem = ({ rank, name, score, avatar, isCurrentUser = false }: {
  rank: number;
  name: string;
  score: number;
  avatar: string;
  isCurrentUser?: boolean;
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return Colors[colorScheme].text;
    }
  };

  return (
    <View style={[
      styles.leaderboardItem,
      isCurrentUser && { backgroundColor: Colors[colorScheme].tint + '10', borderColor: Colors[colorScheme].tint, borderWidth: 1 }
    ]}>
      <View style={styles.rankContainer}>
        <ThemedText style={[styles.rankText, { color: getRankColor(rank) }]}>
          {typeof getRankIcon(rank) === 'string' && getRankIcon(rank).includes('#') ? getRankIcon(rank) : null}
        </ThemedText>
        {rank <= 3 && <ThemedText style={styles.rankEmoji}>{getRankIcon(rank)}</ThemedText>}
      </View>
      
      <Image
        source={{ uri: avatar }}
        style={styles.leaderboardAvatar}
        contentFit="cover"
      />
      
      <View style={styles.leaderboardInfo}>
        <ThemedText style={[styles.leaderboardName, isCurrentUser && { fontWeight: 'bold' }]}>
          {name} {isCurrentUser && '(You)'}
        </ThemedText>
        <ThemedText style={styles.leaderboardScore}>{score.toLocaleString()} points</ThemedText>
      </View>
      
      {isCurrentUser && (
        <View style={[styles.currentUserBadge, { backgroundColor: Colors[colorScheme].tint }]}>
          <ThemedText style={styles.currentUserText}>YOU</ThemedText>
        </View>
      )}
    </View>
  );
};

const EditProfileModal = ({ visible, onClose, profileData, onSave }: {
  visible: boolean;
  onClose: () => void;
  profileData: any;
  onSave: (data: any) => void;
}) => {
  const [editData, setEditData] = useState(profileData);
  const colorScheme = useColorScheme() ?? 'light';

  const handleSave = () => {
    onSave(editData);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ThemedView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <ThemedText style={styles.cancelButton}>Cancel</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.modalTitle}>Edit Profile</ThemedText>
          <TouchableOpacity onPress={handleSave}>
            <ThemedText style={[styles.saveButton, { color: Colors[colorScheme].tint }]}>Save</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.editSection}>
            <ThemedText style={styles.editLabel}>Full Name</ThemedText>
            <TextInput
              style={[styles.editInput, { 
                borderColor: Colors[colorScheme].border || '#E0E0E0',
                color: Colors[colorScheme].text 
              }]}
              value={editData.fullName}
              onChangeText={(text) => setEditData({...editData, fullName: text})}
              placeholder="Enter your full name"
              placeholderTextColor={Colors[colorScheme].text + '60'}
            />
          </View>

          <View style={styles.editSection}>
            <ThemedText style={styles.editLabel}>Phone Number</ThemedText>
            <TextInput
              style={[styles.editInput, { 
                borderColor: Colors[colorScheme].border || '#E0E0E0',
                color: Colors[colorScheme].text 
              }]}
              value={editData.phone}
              onChangeText={(text) => setEditData({...editData, phone: text})}
              placeholder="Enter your phone number"
              placeholderTextColor={Colors[colorScheme].text + '60'}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.editSection}>
            <ThemedText style={styles.editLabel}>Location</ThemedText>
            <TextInput
              style={[styles.editInput, { 
                borderColor: Colors[colorScheme].border || '#E0E0E0',
                color: Colors[colorScheme].text 
              }]}
              value={editData.location}
              onChangeText={(text) => setEditData({...editData, location: text})}
              placeholder="Enter your location"
              placeholderTextColor={Colors[colorScheme].text + '60'}
            />
          </View>

          <View style={styles.editSection}>
            <ThemedText style={styles.editLabel}>Date of Birth</ThemedText>
            <TextInput
              style={[styles.editInput, { 
                borderColor: Colors[colorScheme].border || '#E0E0E0',
                color: Colors[colorScheme].text 
              }]}
              value={editData.dateOfBirth}
              onChangeText={(text) => setEditData({...editData, dateOfBirth: text})}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={Colors[colorScheme].text + '60'}
            />
          </View>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeLeaderboard, setActiveLeaderboard] = useState('overall');

  // User profile data
  const [profileData, setProfileData] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    fullName: 'Alexander Johnson',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    dateOfBirth: 'March 15, 1992',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format',
    score: 1247,
    reviews: 24,
    level: 'Gold'
  });

  // Leaderboard data
  const leaderboards = {
    overall: [
      { id: 1, name: 'Sarah Chen', score: 2850, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face' },
      { id: 2, name: 'Mike Rodriguez', score: 2340, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face' },
      { id: 3, name: 'Emma Wilson', score: 1890, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face' },
      { id: 4, name: 'Alex Johnson', score: 1247, avatar: profileData.avatar, isCurrentUser: true },
      { id: 5, name: 'David Kim', score: 1156, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face' },
      { id: 6, name: 'Lisa Zhang', score: 945, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face' }
    ],
    monthly: [
      { id: 1, name: 'Alex Johnson', score: 456, avatar: profileData.avatar, isCurrentUser: true },
      { id: 2, name: 'Emma Wilson', score: 423, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face' },
      { id: 3, name: 'Mike Rodriguez', score: 387, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face' },
      { id: 4, name: 'Sarah Chen', score: 345, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face' },
      { id: 5, name: 'David Kim', score: 298, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face' }
    ],
    reviews: [
      { id: 1, name: 'Sarah Chen', score: 156, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face' },
      { id: 2, name: 'Emma Wilson', score: 134, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face' },
      { id: 3, name: 'Mike Rodriguez', score: 89, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face' },
      { id: 4, name: 'David Kim', score: 67, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face' },
      { id: 5, name: 'Alex Johnson', score: 24, avatar: profileData.avatar, isCurrentUser: true },
      { id: 6, name: 'Lisa Zhang', score: 18, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face' }
    ]
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = (newData: any) => {
    setProfileData({ ...profileData, ...newData });
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings page coming soon!');
  };

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Notification settings coming soon!');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy', 'Privacy settings coming soon!');
  };

  const handleHelp = () => {
    Alert.alert('Help & Support', 'Help center coming soon!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout', 
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout') }
      ]
    );
  };

  const getAchievementLevel = (score: number) => {
    if (score >= 2000) return { level: 'Diamond', color: '#B9F2FF', icon: '💎' };
    if (score >= 1500) return { level: 'Platinum', color: '#E5E4E2', icon: '🏆' };
    if (score >= 1000) return { level: 'Gold', color: '#FFD700', icon: '🥇' };
    if (score >= 500) return { level: 'Silver', color: '#C0C0C0', icon: '🥈' };
    return { level: 'Bronze', color: '#CD7F32', icon: '🥉' };
  };

  const currentAchievement = getAchievementLevel(profileData.score);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: profileData.avatar }}
              style={styles.profileImage}
              contentFit="cover"
            />
            <View style={[styles.onlineIndicator, { backgroundColor: '#4CAF50' }]} />
            <View style={[styles.achievementBadge, { backgroundColor: currentAchievement.color }]}>
              <ThemedText style={styles.achievementIcon}>{currentAchievement.icon}</ThemedText>
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <ThemedText style={styles.name}>{profileData.name}</ThemedText>
            <ThemedText style={styles.email}>{profileData.email}</ThemedText>
            <View style={styles.levelContainer}>
              <ThemedText style={[styles.levelText, { color: currentAchievement.color }]}>
                {currentAchievement.level} Level
              </ThemedText>
            </View>
            <ThemedText style={styles.memberSince}>Member since March 2023</ThemedText>
          </View>

          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: Colors[colorScheme].tint }]}
            onPress={handleEditProfile}
          >
            <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <StatCard label="Reviews" value={profileData.reviews.toString()} color="#FF6B6B" />
          <StatCard label="Points" value={profileData.score.toLocaleString()} color="#4ECDC4" />
          <StatCard label="Level" value={currentAchievement.level} color={currentAchievement.color} />
        </View>

        {/* Leaderboards Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🏆 Leaderboards</ThemedText>
          
          {/* Leaderboard Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeLeaderboard === 'overall' && { backgroundColor: Colors[colorScheme].tint }]}
              onPress={() => setActiveLeaderboard('overall')}
            >
              <ThemedText style={[styles.tabText, activeLeaderboard === 'overall' && { color: '#fff' }]}>
                Overall
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeLeaderboard === 'monthly' && { backgroundColor: Colors[colorScheme].tint }]}
              onPress={() => setActiveLeaderboard('monthly')}
            >
              <ThemedText style={[styles.tabText, activeLeaderboard === 'monthly' && { color: '#fff' }]}>
                This Month
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeLeaderboard === 'reviews' && { backgroundColor: Colors[colorScheme].tint }]}
              onPress={() => setActiveLeaderboard('reviews')}
            >
              <ThemedText style={[styles.tabText, activeLeaderboard === 'reviews' && { color: '#fff' }]}>
                Reviews
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Leaderboard List */}
          <View style={styles.leaderboardContainer}>
            {leaderboards[activeLeaderboard as keyof typeof leaderboards].map((user, index) => (
              <LeaderboardItem
                key={user.id}
                rank={index + 1}
                name={user.name}
                score={user.score}
                avatar={user.avatar}
                isCurrentUser={user.isCurrentUser}
              />
            ))}
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Profile Information</ThemedText>
          
          <ProfileCard
            icon="person.fill"
            title="Full Name"
            value={profileData.fullName}
            onPress={handleEditProfile}
          />
          
          <ProfileCard
            icon="phone.fill"
            title="Phone Number"
            value={profileData.phone}
            onPress={handleEditProfile}
          />
          
          <ProfileCard
            icon="location.fill"
            title="Location"
            value={profileData.location}
            onPress={handleEditProfile}
          />
          
          <ProfileCard
            icon="calendar"
            title="Date of Birth"
            value={profileData.dateOfBirth}
            onPress={handleEditProfile}
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
          
          <ProfileCard
            icon="bell.fill"
            title="Notifications"
            value="Enabled"
            onPress={handleNotifications}
          />
          
          <ProfileCard
            icon="shield.fill"
            title="Privacy Settings"
            value="Public Profile"
            onPress={handlePrivacy}
          />
          
          <ProfileCard
            icon="gear"
            title="App Settings"
            value="Manage preferences"
            onPress={handleSettings}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Support</ThemedText>
          
          <ProfileCard
            icon="questionmark.circle.fill"
            title="Help & Support"
            value="Get assistance"
            onPress={handleHelp}
          />
          
          <ProfileCard
            icon="info.circle.fill"
            title="About"
            value="App version 1.0.0"
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol name="power" size={20} color="#FF6B6B" />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ThemedView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        profileData={profileData}
        onSave={handleSaveProfile}
      />
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
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  achievementBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  achievementIcon: {
    fontSize: 16,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  levelContainer: {
    marginBottom: 4,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberSince: {
    fontSize: 14,
    opacity: 0.6,
  },
  editButton: {
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
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    paddingLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  leaderboardContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankEmoji: {
    fontSize: 18,
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  leaderboardScore: {
    fontSize: 14,
    opacity: 0.7,
  },
  currentUserBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentUserText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 12,
    marginTop: 20,
  },
  logoutText: {
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  bottomSpacing: {
    height: 40,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  editSection: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
});