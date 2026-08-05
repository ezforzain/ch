import { Router } from 'express';

import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import sellerRoutes from './seller.routes.js';
import customerRoutes from './customer.routes.js';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import leadRoutes from './lead.routes.js';
import projectRoutes from './project.routes.js';
import serviceRoutes from './service.routes.js';
import appointmentRoutes from './appointment.routes.js';
import messageRoutes from './message.routes.js';
import blogRoutes from './blog.routes.js';
import galleryRoutes from './gallery.routes.js';
import testimonialRoutes from './testimonial.routes.js';
import teamMemberRoutes from './teamMember.routes.js';
import cityRoutes from './city.routes.js';
import faqRoutes from './faq.routes.js';
import notificationRoutes from './notification.routes.js';
import settingRoutes from './setting.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import reportRoutes from './report.routes.js';
import uploadRoutes from './upload.routes.js';
import activityLogRoutes from './activityLog.routes.js';

const router = Router();

router.get('/', (req, res) => res.json({ success: true, message: 'Chaudhary Electronics API v1' }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sellers', sellerRoutes);
router.use('/customers', customerRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/leads', leadRoutes);
router.use('/projects', projectRoutes);
router.use('/services', serviceRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/messages', messageRoutes);
router.use('/blog', blogRoutes);
router.use('/gallery', galleryRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/team', teamMemberRoutes);
router.use('/cities', cityRoutes);
router.use('/faqs', faqRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/uploads', uploadRoutes);
router.use('/activity', activityLogRoutes);

export default router;
