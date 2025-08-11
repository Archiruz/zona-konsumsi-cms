# Zona Konsumsi CMS

A comprehensive Content Management System for managing office consumption inventory with QR code scanning capabilities, role-based access control, and automated limit enforcement.

## 🚀 Features

### For Administrators
- **Consumption Type Management**: Create and manage consumption types (weekly/monthly) with customizable limits
- **Item Management**: Add, edit, and track consumption items with details like description, purchase date, and photos
- **User Management**: Manage user accounts and roles
- **Comprehensive Reports**: View all consumption records and analytics
- **Limit Enforcement**: Set and manage consumption limits per period

### For Employees
- **QR Code Scanning**: Scan QR codes to quickly identify items
- **Item Consumption**: Take items within allocated limits
- **Photo Proof**: Upload photos as proof of consumption
- **Personal Records**: View personal consumption history and usage status
- **Limit Tracking**: Real-time visibility into remaining consumption allowances

### Technical Features
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Instant feedback and status updates
- **Secure Authentication**: NextAuth.js with role-based access control
- **Database Management**: Prisma ORM with SQLite database
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zona-konsumsi-cms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database with initial data**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Default Login Credentials

After running the seed script, you can use these credentials:

### Admin Account
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: Administrator (full access)

### Employee Account
- **Email**: employee@example.com
- **Password**: employee123
- **Role**: Employee (limited access)

## 📱 Usage Guide

### For Administrators

1. **Login with admin credentials**
2. **Manage Consumption Types**:
   - Navigate to "Manage Types" from dashboard
   - Create new types with weekly/monthly periods
   - Set consumption limits for each type

3. **Manage Items**:
   - Navigate to "Manage Items" from dashboard
   - Add new consumption items
   - Assign items to consumption types
   - Set quantities and descriptions

4. **View Records**:
   - Access "View Records" to see all consumption data
   - Monitor usage patterns across all users

### For Employees

1. **Login with employee credentials**
2. **Scan QR Codes**:
   - Navigate to "Scan QR Code" from dashboard
   - Enter item ID or scan QR code
   - Fill in consumption details
   - Upload photo proof
   - Submit consumption record

3. **View Personal Records**:
   - Access "My Records" to see personal consumption history
   - Monitor usage against limits
   - Track consumption patterns

## 🗄️ Database Schema

The system uses the following main entities:

- **User**: Authentication and role management
- **ConsumptionType**: Defines consumption categories with limits
- **ConsumptionItem**: Individual items available for consumption
- **ConsumptionRecord**: Tracks when items are taken by users

## 🔧 Development

### Project Structure
```
zona-konsumsi-cms/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── prisma/                # Database schema and migrations
├── scripts/               # Database seeding scripts
└── public/                # Static assets
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with initial data

### Database Commands

- `npx prisma studio` - Open Prisma Studio for database management
- `npx prisma migrate dev` - Run database migrations
- `npx prisma generate` - Generate Prisma client

## 📱 Responsive Design

The CMS is fully responsive and optimized for:
- **Desktop**: Full-featured interface with sidebars and detailed views
- **Tablet**: Adaptive layouts with touch-friendly controls
- **Mobile**: Streamlined interface optimized for small screens

## 🔒 Security Features

- **Authentication**: Secure login with NextAuth.js
- **Authorization**: Role-based access control
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **Session Management**: Secure JWT-based sessions

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
1. Build the application: `npm run build`
2. Start the production server: `npm run start`
3. Set environment variables for production
4. Use a process manager like PM2 for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Contact the development team

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Bulk import/export functionality
- [ ] Mobile app development
- [ ] Integration with external inventory systems
- [ ] Advanced reporting and charts
- [ ] Multi-language support
- [ ] API for third-party integrations

---

**Built with ❤️ using Next.js, Prisma, and shadcn/ui**
