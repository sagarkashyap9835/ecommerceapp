import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import Header from '../../../components/Header'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useUser, useAuth } from "@/context/AuthContext";
import Toast from 'react-native-toast-message'
import { PROFILE_MENU } from '../../../constants' 

const { width } = Dimensions.get('window');

export default function Profile() {
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)
  
  React.useEffect(() => {
    if (user) {
      user.reload().catch(console.error);
    }
  }, [user]);

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut()
      router.replace('/(tabs)')
    } catch (err: any) {
      console.error(err)
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: err?.message ?? 'Could not sign out'
      })
    } finally {
      setLoggingOut(false)
    }
  }

  if (!isLoaded || loggingOut) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title='Profile' />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF3399" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title='Profile' />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isSignedIn && user ? (
          <View style={styles.profileWrapper}>
            {/* 1. Header Banner Image Section */}
            <View style={styles.bannerSection}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000' }} 
                style={styles.bannerImage}
              />
              <View style={[styles.bannerOverlay, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
                <View style={styles.avatarWrapper}>
                  {user.imageUrl ? (
                    <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF2F8' }]}>
                      <Ionicons name="person" size={44} color="#FF3399" />
                    </View>
                  )}
                </View>
                <Text style={styles.userName}>{user.fullName || user.username || 'User'}</Text>
                <Text style={styles.userEmail}>{user.primaryEmailAddress?.emailAddress}</Text>
                <Text style={styles.userQuote}>Manage your profile, orders, and preferences</Text>
              </View>
            </View>

            {/* 2. Grouped Menu Cards (Overlapping the banner) */}
            <View style={styles.menuContainer}>
              
              {/* Group 1: Admin (if any) + Top Menu Items */}
              <View style={[styles.cardGroup, styles.overlapCard]}>
                {user.publicMetadata?.role === 'admin' && (
                  <TouchableOpacity 
                    style={styles.menuItem} 
                    onPress={() => router.push('/admin')}
                  >
                    <View style={styles.menuItemLeft}>
                      <Ionicons name="shield-checkmark" size={20} color="#94A3B8" />
                      <Text style={[styles.menuItemText, { fontWeight: '700', color: '#0F172A' }]}>Admin Panel</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                  </TouchableOpacity>
                )}

                {PROFILE_MENU.slice(0, 3).map((menu, index) => {
                  const isLast = index === 2 && user.publicMetadata?.role !== 'admin';
                  return (
                    <TouchableOpacity 
                      key={menu.id} 
                      style={[styles.menuItem, isLast && styles.noBorder]} 
                      onPress={() => menu.route !== '/' && router.push(menu.route as any)}
                    >
                      <View style={styles.menuItemLeft}>
                        <Ionicons name={menu.icon as any} size={20} color="#94A3B8" />
                        <Text style={styles.menuItemText}>{menu.title}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                    </TouchableOpacity>
                  )
                })}
              </View>

              {/* Group 2: Bottom Menu Items + Logout */}
              <View style={styles.cardGroup}>
                {PROFILE_MENU.slice(3).map((menu) => (
                  <TouchableOpacity 
                    key={menu.id} 
                    style={styles.menuItem} 
                    onPress={() => menu.route !== '/' && router.push(menu.route as any)}
                  >
                    <View style={styles.menuItemLeft}>
                      <Ionicons name={menu.icon as any} size={20} color="#94A3B8" />
                      <Text style={styles.menuItemText}>{menu.title}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={[styles.menuItem, styles.noBorder]} onPress={handleLogout}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="log-out" size={20} color="#EF4444" />
                    <Text style={[styles.menuItemText, { color: '#EF4444', fontWeight: '600' }]}>Log Out</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                </TouchableOpacity>
              </View>

            </View>
          </View>
        ) : (
          /* Guest User Screen */
          <View style={styles.guestContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="person" size={64} color="#FF3399" />
            </View>
            <Text style={styles.guestTitle}>Welcome, Guest</Text>
            <Text style={styles.guestSubtitle}>Please sign in to manage your profile, track orders, and view your wishlist.</Text>
            
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.signInButton} 
              onPress={() => router.push('/sign-in')}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.signUpButton} 
              onPress={() => router.push('/sign-up')}
            >
              <Text style={styles.signUpButtonText}>Create an Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Light gray background matches the image
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  /* Profile Styles */
  profileWrapper: {
    flex: 1,
  },
  bannerSection: {
    width: '100%',
    height: 320,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)', // Dark overlay so text is readable
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  avatarWrapper: {
    marginBottom: 16,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E5E7EB',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Outfit_800',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#E2E8F0',
    fontFamily: 'Outfit_500',
    marginBottom: 12,
  },
  userQuote: {
    fontSize: 13,
    color: '#CBD5E1',
    fontFamily: 'Outfit',
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  overlapCard: {
    marginTop: -40, // Pulls the first card up over the banner
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    fontFamily: 'Outfit_600',
  },
  /* Guest Styles */
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    fontFamily: 'Outfit_800',
  },
  guestSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    fontFamily: 'Outfit_500',
  },
  signInButton: {
    backgroundColor: '#FF3399',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#FF3399',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Outfit_700',
  },
  signUpButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  signUpButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Outfit_700',
  },
});