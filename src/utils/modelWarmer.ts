// Model Warmer Utility
// Keeps Replicate models warm by making periodic lightweight requests

class ModelWarmer {
  private warmInterval: NodeJS.Timeout | null = null;
  private isWarming = false;

  // Start warming models when app loads
  startWarming() {
    if (this.warmInterval) return;

    // Initial warm on app load
    this.warmModels();

    // Warm every 4 minutes (before 5-minute cold timeout)
    this.warmInterval = setInterval(() => {
      this.warmModels();
    }, 4 * 60 * 1000); // 4 minutes
  }

  // Stop warming (e.g., when app unmounts)
  stopWarming() {
    if (this.warmInterval) {
      clearInterval(this.warmInterval);
      this.warmInterval = null;
    }
  }

  private async warmModels() {
    if (this.isWarming) return;
    this.isWarming = true;

    try {
      console.log('Warming models...');
      
      // Warm image model with minimal request
      const imageWarmPromise = fetch('/.netlify/functions/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'warm',
          width: 64,
          height: 64,
          steps: 1,
          cfg_scale: 1,
          seed: 42
        })
      }).catch(err => console.log('Image warm failed:', err));

      // Warm chat model with minimal request
      const chatWarmPromise = fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'hi' }]
        })
      }).catch(err => console.log('Chat warm failed:', err));

      // Don't await - fire and forget
      Promise.all([imageWarmPromise, chatWarmPromise]).then(() => {
        console.log('Model warming requests sent');
      });

      // Cancel requests after 3 seconds to save costs
      setTimeout(() => {
        this.isWarming = false;
      }, 3000);

    } catch (error) {
      console.error('Model warming error:', error);
      this.isWarming = false;
    }
  }
}

// Singleton instance
export const modelWarmer = new ModelWarmer();

// Auto-start warming if in browser
if (typeof window !== 'undefined') {
  // Start warming after a short delay
  setTimeout(() => {
    modelWarmer.startWarming();
  }, 5000); // 5 second delay after app load

  // Stop warming when page unloads
  window.addEventListener('beforeunload', () => {
    modelWarmer.stopWarming();
  });
}