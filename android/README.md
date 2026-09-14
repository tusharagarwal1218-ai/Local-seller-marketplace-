# Local Seller POS & Storefront - Native Android Project (Kotlin & Jetpack Compose)

This is the complete, standalone Android Studio project converted directly from the Local Seller Marketplace web application into modern Android architecture with **Kotlin** and **Jetpack Compose**.

---

## 📱 Features Included
1. **POS Register**:
   - Product catalog search by name, barcode, or category
   - Fast cart addition, quantity steppers, discount calculation
   - Cash tender calculation (change due)
   - UPI QR code payment support
   - Card / POS tender support
2. **Customer Showcase / Storefront**:
   - Clean 2-column mobile cards displaying products with prices, units, categories, and quick order actions
3. **Inventory & Stock Management**:
   - Stock level tracking with color-coded Low Stock warnings
   - Inline `+` / `-` quick stock adjust steppers
   - Add new product dialog with selling price, cost price, barcode, unit, and category
   - Edit and delete product operations
4. **Sales Ledger & Receipts**:
   - Revenue KPI summary (Total revenue, sales count, average ticket)
   - Order history cards
   - Realistic **Thermal Receipt modal** with printable layout and Android native **Share via WhatsApp / SMS / Email**
5. **Store Settings & Taxonomy**:
   - Custom shop profile, phone, address, and receipt notes
   - Custom category manager (add, delete, reassign)
   - Offline local persistence via `SharedPreferences` and reactive `StateFlow`

---

## 🚀 How to Build into an APK in Android Studio

### Step 1: Open the Project
1. Download this project by clicking **Settings** > **Export to ZIP** in Google AI Studio.
2. Unzip the downloaded file.
3. Open **Android Studio** (Koala, Ladybug, Iguana, or newer recommended).
4. Click **Open** (or **File > Open**) and select the `android` folder inside the unzipped directory.
5. Android Studio will automatically sync Gradle and download dependencies using Gradle Version Catalog (`libs.versions.toml`).

### Step 2: Run on an Android Phone or Emulator
1. Connect your Android phone via USB with **USB Debugging enabled** (or create an Android Emulator with API 34/35).
2. Click the green **Run (▶)** button in Android Studio.
3. The app will compile and install on your phone.

### Step 3: Generate the APK File
To build a standalone APK file to install on any Android phone:
1. In the top menu, go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. When the build finishes, click **locate** in the popup notification.
3. Your APK will be located at:
   `android/app/build/outputs/apk/debug/app-debug.apk`
4. You can transfer this `.apk` to any Android phone and install it directly!

### Step 4: Generate Signed App Bundle (.aab) for Google Play
1. In the top menu, go to **Build** > **Generate Signed Bundle / APK**.
2. Select **Android App Bundle** (`.aab`).
3. Select your keystore (or click **Create new...**).
4. Select `release` build variant and click **Finish**.
5. Upload the resulting `.aab` to the **Google Play Console**.
