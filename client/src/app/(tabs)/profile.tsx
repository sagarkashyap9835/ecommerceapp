import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { dummyUser } from '@/assets/assets'
import { useRouter } from 'expo-router'
import Header from '../../../components/Header'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

// constants फ़ोल्डर से PROFILE_MENU को इम्पोर्ट किया
// नोट: पाथ को अपनी प्रोजेक्ट डायरेक्टरी के अनुसार कन्फर्म कर लें
import { PROFILE_MENU } from '../../../constants' 

export default function Profile() {
  const router = useRouter()
  
  // टेस्ट करने के लिए: अगर आप असली प्रोफाइल देखना चाहते हैं तो dummyUser रखें, 
  // अगर Guest User स्क्रीन देखना चाहते हैं तो null कर दें।
  const [user, setUser] = useState<typeof dummyUser | null>(dummyUser)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title='Profile' />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {user ? (
          /* 1. असली प्रोफ़ाइल स्क्रीन (जब यूज़र लॉग-इन हो) */
          <View style={styles.profileContainer}>
            
            {/* प्रोफ़ाइल इमेज और नाम */}
            <View style={styles.avatarSection}>
              <Image 
                source={{ uri: user.imageUrl }} 
                style={styles.avatar}
              />
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{user.role.toUpperCase()}</Text>
              </View>
            </View>

            {/* अकाउंट सेटिंग्स ऑप्शंस (डायनामिक लिस्ट) */}
            <View style={styles.menuSection}>
              
              {/* CONDITION: अगर यूजर admin है, तो लिस्ट में सबसे पहले Admin Panel दिखाओ */}
              {user.publicMetadata?.role === 'admin' && (
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => router.push('/admin')}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="shield-checkmark-outline" size={22} color="#4b5563" />
                    <Text style={[styles.menuItemText, { fontWeight: '600' }]}>Admin Panel</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                </TouchableOpacity>
              )}

              {/* PROFILE_MENU का लूप चलाकर बाकी ऑप्शंस दिखाए */}
              {PROFILE_MENU.map((menu) => (
                <TouchableOpacity 
                  key={menu.id} 
                  style={styles.menuItem} 
                  onPress={() => menu.route !== '/' && router.push(menu.route as any)}
                >
                  <View style={styles.menuItemLeft}>
                    {/* यहाँ @expo/vector-icons से डायनामिक आइकॉन नेम रेंडर हो रहे हैं */}
                    <Ionicons name={menu.icon as any} size={22} color="#4b5563" />
                    <Text style={styles.menuItemText}>{menu.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                </TouchableOpacity>
              ))}

              {/* लॉगआउट बटन (हमेशा लिस्ट के आखिर में रहेगा) */}
              <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={() => setUser(null)}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                  <Text style={[styles.menuItemText, { color: '#ef4444', fontWeight: '500' }]}>Log Out</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* 2. Guest User स्क्रीन (जब यूज़र लॉग-इन न हो) */
          <View style={styles.guestContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-circle-outline" size={80} color="#9ca3af" />
            </View>
            <Text style={styles.guestTitle}>Welcome, Guest</Text>
            <Text style={styles.guestSubtitle}>Please sign in to manage your profile, track orders, and view your wishlist.</Text>
            
            {/* Sign In Button */}
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.signInButton} 
              onPress={() => router.push('/sign-in')}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

            {/* Sign Up Button */}
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
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  /* Profile Styles */
  profileContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e5e7eb',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  menuSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  /* Guest Styles */
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 36,
  },
  signInButton: {
    backgroundColor: '#000000',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: 'transparent',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  signUpButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
})