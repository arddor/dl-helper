# Download Helper Userscript

A powerful browser userscript that adds download helper buttons to various file hosting services, allowing you to easily send download links to different services like OneDrive Direct Links, RealDebrid, Premiumize, and JDownloader.

## ✨ Features

- **Multi-Service Support**: Download files through OneDrive Direct, RealDebrid, Premiumize, or JDownloader
- **Auto-Detection**: Automatically detects supported file hosting links on any webpage
- **Visual Download Buttons**: Adds small download buttons next to supported links
- **Service Switching**: Hold Alt and click any download button to switch between services
- **OneDrive Integration**: Special handling for OneDrive links with direct link extraction
- **JDownloader Integration**: Full MyJDownloader API integration for remote downloads
- **Top Bar Controls**: Dedicated download button when viewing supported file pages directly

## 🎯 Supported File Hosts

- **OneDrive** (`1drv.ms` and `onedrive.live.com` links)
- **Mega** (File and folder links)
- **Google Drive** (Files, folders, and direct download links)
- **Dropbox** (Shared file links)
- **MediaFire** (File links)

## 🚀 Installation

1. Install a userscript manager like:

   - [Violentmonkey](https://violentmonkey.github.io/) (Recommended)
   - [Tampermonkey](https://www.tampermonkey.net/)
   - [Greasemonkey](https://www.greasespot.net/) (Firefox)

2. Copy the content of `dlhelper.user.js` and create a new userscript in your manager or click the install button

   [![Install directly with Violentmonkey](https://img.shields.io/badge/Install-Violentmonkey-blue?logo=monkey)](https://github.com/arddor/dl-helper/raw/refs/heads/main/dlhelper.user.js)

3. Save and enable the script

## ⚙️ Configuration

### MyJDownloader Setup (Optional)

For JDownloader integration, you need to configure your MyJDownloader credentials:

1. Right-click on any webpage and look for the userscript menu
2. Click "⚙️ Configure MyJDownloader"
3. Enter your MyJDownloader email and password
4. Credentials are securely stored in your browser

## 🎮 Usage

### Basic Usage

1. **Automatic Detection**: Navigate to any webpage with supported file hosting links
2. **Download Buttons**: Small download icons will appear next to each supported link
3. **One-Click Download**: Click any download button to process the link with your selected service

### Service Selection

- **Default Service**: OneDrive Direct (extracts direct download links)
- **Switch Services**: Hold `Alt` + Click any download button to open the service selector
- **Available Services**:
  - 🔗 OneDrive Direct - Extracts direct download links
  - 🔄 RealDebrid - Premium download service (coming soon)
  - ⚡ Premiumize - Premium download service (coming soon)
  - 📥 JDownloader - Send to your JDownloader client

### OneDrive Special Features

When visiting OneDrive links directly:

- **Top Bar Button**: A download button appears at the top of the page
- **Auto-Extraction**: Automatically finds and extracts direct download links
- **Popup Handling**: Opens OneDrive in a new window for seamless processing

### Visual Feedback

Download buttons show different states:

- **Ready**: Service icon (ready to use)
- **Processing**: Spinning loading animation
- **Success**: Green checkmark
- **Error**: Red X indicator

## 🔧 Technical Details

### Button States

- **Ready**: ![Ready](data:image/gif;base64,...) - Normal state, shows service icon
- **Busy**: ![Processing](data:image/gif;base64,...) - Processing the download
- **Success**: ![Success](data:image/gif;base64,...) - Download successful
- **Error**: ![Error](data:image/gif;base64,...) - An error occurred

### Keyboard Shortcuts

- `Alt + Click` - Open service selection dropdown
- `Escape` - Close service selection dropdown

## 🛠️ Development

### File Structure

```
dl-helper/
├── dlhelper.user.js    # Main userscript file
└── README.md          # This documentation
```

### Key Components

- **Service Handlers**: Modular system for different download services
- **Link Detection**: Regex-based URL pattern matching
- **UI Components**: Dynamic button injection and styling
- **MyJDownloader API**: Full API client implementation
- **OneDrive Parser**: Specialized OneDrive link extraction

## 🐛 Troubleshooting

### Common Issues

1. **Buttons Not Appearing**

   - Ensure the userscript is enabled
   - Check if the page contains supported file hosting links
   - Refresh the page

2. **JDownloader Not Working**

   - Verify MyJDownloader credentials are configured
   - Ensure your JDownloader client is online and connected to MyJDownloader
   - Check browser console for error messages

3. **OneDrive Links Failing**
   - Some OneDrive links may require special permissions
   - Try opening the link manually first to ensure it's accessible
   - Check if popup blocker is interfering

### Console Debugging

Open browser developer tools (F12) and check the console for detailed error messages and processing logs.

## 📝 License

This project is provided as-is for educational and personal use. Please respect the terms of service of all file hosting platforms and download services.

## 🤝 Contributing

Feel free to submit issues, suggestions, or improvements. This userscript is designed to be easily extensible for additional file hosting services.

---

**Note**: RealDebrid and Premiumize integrations are placeholder implementations and will be completed in future updates.
