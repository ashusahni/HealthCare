export class NotificationService {
  private static instance: NotificationService | null = null;
  private permission: NotificationPermission = 'default';
  private isSupported: boolean = false;
  private notificationSound: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private activeNotifications: Map<string, Notification> = new Map();
  private scheduledNotifications: Map<string, number> = new Map(); // Track scheduled notifications by reminder ID

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isSupported = 'Notification' in window;
      if (this.isSupported) {
        this.permission = Notification.permission;
        try {
          // Initialize Web Audio API
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (error) {
          console.error('Failed to initialize Web Audio API:', error);
        }
      }
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !this.isSupported) {
      console.warn('Notifications are not supported in this environment');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('Notification permission was denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  private async playNotificationSound() {
    try {
      if (this.audioContext) {
        // Create oscillators and gain nodes
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Configure oscillators
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        
        const startTime = this.audioContext.currentTime;
        const duration = 5; // Total duration in seconds
        const intervalDuration = 1; // Duration of each beep
        const gapDuration = 0.5; // Duration of silence between beeps

        // Configure gain envelope for repeating pattern
        gainNode.gain.setValueAtTime(0, startTime);

        // Create a repeating pattern of beeps
        for (let i = 0; i < duration; i += (intervalDuration + gapDuration)) {
          // Start of beep
          gainNode.gain.setValueAtTime(0, startTime + i);
          gainNode.gain.linearRampToValueAtTime(0.3, startTime + i + 0.1);
          
          // Hold the beep
          gainNode.gain.setValueAtTime(0.3, startTime + i + intervalDuration - 0.1);
          
          // End of beep
          gainNode.gain.linearRampToValueAtTime(0, startTime + i + intervalDuration);
          
          // Set frequencies for each beep
          oscillator1.frequency.setValueAtTime(880, startTime + i); // A5
          oscillator2.frequency.setValueAtTime(659.25, startTime + i); // E5
          
          // Change pitch slightly for the second half of each beep
          oscillator1.frequency.setValueAtTime(1108.73, startTime + i + intervalDuration/2); // C#6
          oscillator2.frequency.setValueAtTime(880, startTime + i + intervalDuration/2); // A5
        }
        
        // Connect nodes
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Start and stop oscillators
        oscillator1.start(startTime);
        oscillator2.start(startTime);
        oscillator1.stop(startTime + duration);
        oscillator2.stop(startTime + duration);
      } else {
        console.warn('Audio context not initialized');
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  private closeNotification(notification: Notification, tag: string) {
    setTimeout(() => {
      notification.close();
      this.activeNotifications.delete(tag);
    }, 6000); // Close after 6 seconds
  }

  async showNotification(title: string, options: NotificationOptions & {
    reminderId?: string;
    requireVerification?: boolean;
    verificationTimeout?: number;
  } = {}): Promise<void> {
    if (typeof window === 'undefined' || !this.isSupported || this.permission !== 'granted') {
      console.warn('Cannot show notification: Not supported or permission not granted');
      return;
    }

    try {
      // Close existing notification with the same tag if it exists
      if (options.tag && this.activeNotifications.has(options.tag)) {
        const existingNotification = this.activeNotifications.get(options.tag);
        if (existingNotification) {
          existingNotification.close();
          this.activeNotifications.delete(options.tag);
        }
      }

      // Create and show the notification
      const notification = new Notification(title, {
        ...options,
        silent: true, // We'll handle the sound manually
        requireInteraction: options.requireVerification || false, // Keep notification if verification required
      });

      // Play the custom sound
      await this.playNotificationSound();

      // Store the notification reference if it has a tag
      if (options.tag) {
        this.activeNotifications.set(options.tag, notification);
      }

      // Handle verification timeout
      if (options.requireVerification && options.reminderId && options.verificationTimeout) {
        setTimeout(async () => {
          try {
            const reminderService = (await import('./reminder-service')).reminderService;
            await reminderService.markMedicationMissed(options.reminderId!);
            
            // Show missed medication notification
            this.showNotification(
              'Medication Missed',
              {
                body: `You haven't verified taking ${title}. Your guardian will be notified.`,
                tag: `${options.tag}-missed`
              }
            );
          } catch (error) {
            console.error('Error handling verification timeout:', error);
          }
        }, options.verificationTimeout * 60 * 1000); // Convert minutes to milliseconds
      } else if (!options.requireVerification) {
        // Set up auto-close only for non-verification notifications
        this.closeNotification(notification, options.tag || '');
      }

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        if (!options.requireVerification) {
          notification.close();
          if (options.tag) {
            this.activeNotifications.delete(options.tag);
          }
        }
      };

    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  async scheduleNotification(
    title: string,
    options: NotificationOptions & { 
      time: Date;
      reminderId?: string; // Add reminderId to track notifications
      days?: string[]; // Add days to check if notification should be shown
    }
  ): Promise<number> {
    if (typeof window === 'undefined' || !this.isSupported || this.permission !== 'granted') {
      console.warn('Cannot schedule notification: Not supported or permission not granted');
      return -1;
    }

    const now = new Date();
    const scheduledTime = new Date(options.time);
    
    // Set the date of scheduledTime to today
    scheduledTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
    
    // If the time has already passed today, don't schedule
    if (scheduledTime.getTime() < now.getTime()) {
      console.warn('Cannot schedule notification: Time has already passed for today');
      return -1;
    }

    // Check if this is the correct day for the reminder
    const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' });
    if (options.days && !options.days.includes(currentDay)) {
      console.log(`Skipping notification for ${title} - not scheduled for ${currentDay}`);
      return -1;
    }

    try {
      // Clear any existing scheduled notification for this reminder
      if (options.reminderId && this.scheduledNotifications.has(options.reminderId)) {
        this.cancelScheduledNotification(this.scheduledNotifications.get(options.reminderId)!);
        this.scheduledNotifications.delete(options.reminderId);
      }

      const delay = scheduledTime.getTime() - now.getTime();
      const timeoutId = window.setTimeout(() => {
        this.showNotification(title, options);
        // Remove from scheduled notifications after showing
        if (options.reminderId) {
          this.scheduledNotifications.delete(options.reminderId);
        }
      }, delay);

      // Store the scheduled notification
      if (options.reminderId) {
        this.scheduledNotifications.set(options.reminderId, timeoutId);
      }

      return timeoutId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return -1;
    }
  }

  cancelScheduledNotification(timeoutId: number): void {
    if (typeof window !== 'undefined') {
      window.clearTimeout(timeoutId);
    }
  }

  cancelAllScheduledNotifications(): void {
    this.scheduledNotifications.forEach((timeoutId) => {
      this.cancelScheduledNotification(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }
} 