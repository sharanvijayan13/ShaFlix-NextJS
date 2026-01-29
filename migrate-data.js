/**
 * Data Migration Script
 * 
 * This script helps migrate data from localStorage to your database.
 * Run this in your browser console after logging in to migrate your existing data.
 */

async function migrateLocalStorageToDatabase() {
  console.log("🚀 Starting data migration...");
  
  // Check if user is logged in
  const token = localStorage.getItem('firebase-token');
  if (!token) {
    console.error("❌ Please log in first before running migration");
    return;
  }

  try {
    // Get data from localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    const watched = JSON.parse(localStorage.getItem('watched') || '[]');
    const diaryEntries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    const customLists = JSON.parse(localStorage.getItem('customLists') || '[]');
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

    console.log("📊 Found data:", {
      favorites: favorites.length,
      watchlist: watchlist.length,
      watched: watched.length,
      diaryEntries: diaryEntries.length,
      customLists: customLists.length,
      hasProfile: Object.keys(userProfile).length > 0
    });

    // Prepare sync data
    const syncData = {
      favorites,
      watchlist,
      watched,
      diaryEntries,
      customLists,
      profile: userProfile
    };

    // Send to sync endpoint
    const response = await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(syncData)
    });

    if (response.ok) {
      console.log("✅ Migration completed successfully!");
      console.log("🔄 Please refresh the page to see your data");
      
      // Optionally clear localStorage after successful migration
      const clearLocal = confirm("Migration successful! Clear localStorage data? (Recommended)");
      if (clearLocal) {
        localStorage.removeItem('favorites');
        localStorage.removeItem('watchlist');
        localStorage.removeItem('watched');
        localStorage.removeItem('diaryEntries');
        localStorage.removeItem('customLists');
        localStorage.removeItem('userProfile');
        console.log("🧹 localStorage cleared");
      }
    } else {
      const error = await response.json();
      console.error("❌ Migration failed:", error);
    }

  } catch (error) {
    console.error("❌ Migration error:", error);
  }
}

// Run migration
migrateLocalStorageToDatabase();