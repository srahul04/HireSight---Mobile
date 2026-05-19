// HireSight Notification Service
// TODO: Phase 2 — Wire expo-notifications for real push notifications
// 
// Prerequisites:
// 1. Install: npx expo install expo-notifications expo-device expo-constants
// 2. Configure app.json with notification settings
// 3. Set up Supabase Edge Functions for server-side push triggers
//
// This module provides the scaffolding for:
// - Local push notifications (new job matches, score updates)
// - Supabase Realtime subscriptions (new applicants for recruiters)
// - Notification preference persistence

import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import { supabase } from './supabase';

const NOTIFICATION_PREFS_KEY = '@hiresight_notification_prefs';

export interface NotificationPrefs {
  enabled: boolean;
  jobMatches: boolean;
  scoreAlerts: boolean;
  newApplicants: boolean; // recruiter only
  interviewReminders: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  enabled: true,
  jobMatches: true,
  scoreAlerts: true,
  newApplicants: true,
  interviewReminders: true,
};

export const NotificationService = {
  /** Get stored notification preferences */
  getPrefs: async (): Promise<NotificationPrefs> => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
      return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  },

  /** Save notification preferences */
  savePrefs: async (prefs: Partial<NotificationPrefs>): Promise<void> => {
    try {
      const current = await NotificationService.getPrefs();
      const updated = { ...current, ...prefs };
      await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save notification prefs:', error);
    }
  },

  /** Request push notification permissions
   *  TODO: Uncomment when expo-notifications is installed */
  // requestPermissions: async () => {
  //   if (!Device.isDevice) {
  //     console.log('Push notifications require a physical device');
  //     return false;
  //   }
  //   const { status: existing } = await Notifications.getPermissionsAsync();
  //   let finalStatus = existing;
  //   if (existing !== 'granted') {
  //     const { status } = await Notifications.requestPermissionsAsync();
  //     finalStatus = status;
  //   }
  //   return finalStatus === 'granted';
  // },

  /** Schedule a local notification
   *  TODO: Uncomment when expo-notifications is installed */
  // scheduleLocal: async (title: string, body: string, data?: any) => {
  //   await Notifications.scheduleNotificationAsync({
  //     content: { title, body, data },
  //     trigger: null, // immediate
  //   });
  // },

  /** Subscribe to real-time Supabase changes
   *  TODO: Wire when Supabase Realtime is configured */
  // subscribeToNewApplicants: (recruiterId: string, callback: (payload: any) => void) => {
  //   return supabase
  //     .channel('new-applications')
  //     .on('postgres_changes', {
  //       event: 'INSERT',
  //       schema: 'public',
  //       table: 'applications',
  //     }, (payload) => {
  //       callback(payload);
  //     })
  //     .subscribe();
  // },

  // subscribeToNewJobs: (callback: (payload: any) => void) => {
  //   return supabase
  //     .channel('new-jobs')
  //     .on('postgres_changes', {
  //       event: 'INSERT',
  //       schema: 'public',
  //       table: 'job_postings',
  //     }, (payload) => {
  //       callback(payload);
  //     })
  //     .subscribe();
  // },
};
