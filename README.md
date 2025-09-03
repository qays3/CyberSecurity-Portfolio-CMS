# CyberSecurity Portfolio CMS

A personal cybersecurity portfolio with a built-in Content Management System (CMS). This project extends the original [CyberSecurity-Portfolio](https://github.com/qays3/CyberSecurity-Portfolio) with a secure administrative interface for managing content, themes, and assets.

## Table of Contents

- [Features](#features)
  - [Secure Administration](#secure-administration)
  - [Content Management](#content-management)
  - [Theme Control](#theme-control)
  - [Portfolio Showcase](#portfolio-showcase)
- [File Structure](#file-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Initial Setup](#initial-setup)
- [Usage](#usage)
  - [Content Management](#content-management-1)
  - [Media Management](#media-management)
  - [Security](#security)
  - [Theme Customization](#theme-customization)
- [Configuration](#configuration)
  - [Server Requirements](#server-requirements)
  - [Security Recommendations](#security-recommendations)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Support](#support)

## Features

### Secure Administration
- Password protection with first-time setup requirement
- Customizable secure path folder names for enhanced protection
- Password management and updates

### Content Management
- Dynamic content editing through admin interface
- File management for CV uploads and replacements
- Media library for portfolio images
- Custom security through folder renaming

### Theme Control
- Dynamic styling and theme switching
- Backup and restore functionality for templates and content
- Template management system

### Portfolio Showcase
- Responsive design for all devices
- JSON-driven content management
- Visitor tracking and analytics

## File Structure

```
Portfolio/
├── assets/
├── CV/
├── json/
├── temp/
├── index.php
├── .htaccess
└── secure-path/
```

## Getting Started

### Prerequisites
- PHP 7.4 or higher
- Apache web server or compatible
- Write permissions for `/json` and `/CV` directories

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/qays3/CyberSecurity-Portfolio-CMS.git
   cd CyberSecurity-Portfolio-CMS
   ```

2. Deploy to your web server directory (e.g., `htdocs`, `www`, or `public_html`)

3. Ensure PHP is enabled on your server

### Initial Setup

1. Navigate to `your-domain.com/secure-path/` in your browser
2. Set your admin password on first login
3. Rename the `secure-path/` folder to something unique
4. Rename the `json/` folder to a custom name for added security
5. Update any references to the old folder names in your configuration

## Usage

### Content Management
- Edit personal information, skills, and experience
- Add, edit, or remove portfolio projects
- Update statistics for visitors, likes, and comments

### Media Management
- Upload new portfolio images through the admin interface
- Upload and replace CV files
- Organize and manage media assets

### Security
- Update admin password regularly
- Keep admin folder name secret and unique
- Regularly backup JSON data files

### Theme Customization
- Apply new CSS templates and color schemes
- Modify portfolio layouts and components
- Create and restore theme backups

## Configuration

### Server Requirements
- PHP Version: 7.4+ (recommended: 8.0+)
- Web Server: Apache with mod_rewrite enabled
- Extensions: Standard PHP extensions for JSON and file handling

### Security Recommendations
1. Change default folder names immediately after installation
2. Use strong passwords for admin access
3. Regularly update and backup your content
4. Monitor access logs for suspicious activity
5. Keep PHP and server software updated

## Contributing

Contributions are welcome! Please submit a Pull Request for any changes. For major changes, open an issue first to discuss your proposed modifications.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

Based on the original [CyberSecurity-Portfolio](https://github.com/qays3/CyberSecurity-Portfolio) project.

## Support

If you encounter issues:
1. Check existing [Issues](https://github.com/qays3/CyberSecurity-Portfolio-CMS/issues)
2. Create a new issue with detailed information
3. Include PHP version, server details, and error messages
