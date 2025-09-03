# CyberSecurity Portfolio CMS

A personal cybersecurity portfolio with a built-in **Content Management System (CMS)**.  
This project is based on the original [CyberSecurity-Portfolio](https://github.com/qays3/CyberSecurity-Portfolio) but extended with a secure path for managing content, theme, and assets.

---

## Features

- **Secure Path**
  - First-time access requires setting a password.
  - Password can be updated at any time.
  - You should rename the **secure path** folder for better protection.

- **Content Management**
  - Edit and update portfolio content directly from the secure path.
  - Upload CV files and replace them instantly.
  - Upload and manage portfolio images.
  - Rename the **json folder** to a custom name for security.

- **Theme Control**
  - Switch or update styles dynamically.
  - Backup and restore templates and content.

- **Portfolio Showcase**
  - Responsive portfolio layout.
  - JSON-driven content for projects, stats, comments, likes, and visitors.

---

## File Structure

```

Portfolio/
│── assets/            
│── CV/                
│── json/              
│── temp/              
│── index.php          
│── .htaccess          
│── secure-path/       

````

---

## Getting Started

### 1. Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/qays3/CyberSecurity-Portfolio-CMS.git
````

2. Place the project in your local web server directory (e.g., `htdocs` or `www`).

3. Ensure PHP is enabled and running on your server.

---

### 2. First-Time Setup

* Access the **secure path** in your browser.
* Set your **admin password** on the first login.
* Rename both the **secure path** folder and the **json** folder for stronger security.

---

### 3. Usage

* **Update Content:** Add or edit portfolio text, project details, and stats.
* **Manage Media:** Upload new images and update CV files.
* **Change Password:** Reset your password anytime via the secure path.
* **Theme Updates:** Apply new CSS templates and restore backups if needed.

---

## Requirements

* PHP 7.4+
* Apache or compatible web server
* Write permissions on `/json` (renamed) and `/CV` folders

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

