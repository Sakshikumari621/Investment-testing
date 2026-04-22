import React from 'react';
import { Mail, MessageCircle, Clock, ShieldCheck } from 'lucide-react';

export default function SupportView() {
  const supportEmail = "support@investpro.com"; // You can change this to your actual support email

  return (
    <div className="support-view animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Customer Support</h2>
        <p style={{ color: 'var(--text-secondary)' }}>We're here to help you with any questions or issues.</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px' 
      }}>
        {/* Email Support Card */}
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            padding: '12px', 
            borderRadius: '12px', 
            width: 'fit-content',
            marginBottom: '16px'
          }}>
            <Mail size={24} color="#3b82f6" />
          </div>
          <h3 style={{ marginBottom: '12px' }}>Email Support</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.6' }}>
            For general inquiries, account issues, or technical assistance, please send us an email. Our team typically responds within 24 hours.
          </p>
          <a 
            href={`mailto:${supportEmail}`}
            className="btn-primary"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              textDecoration: 'none',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            <Mail size={18} />
            {supportEmail}
          </a>
        </div>

        {/* Support Info Card */}
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ 
            backgroundColor: 'rgba(16, 185, 129, 0.1)', 
            padding: '12px', 
            borderRadius: '12px', 
            width: 'fit-content',
            marginBottom: '16px'
          }}>
            <Clock size={24} color="#10b981" />
          </div>
          <h3 style={{ marginBottom: '12px' }}>Support Hours</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Monday - Friday</span>
              <span style={{ fontWeight: '500' }}>9:00 AM - 6:00 PM</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Saturday</span>
              <span style={{ fontWeight: '500' }}>10:00 AM - 2:00 PM</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Sunday</span>
              <span style={{ fontWeight: '500' }}>Closed</span>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '24px', 
            paddingTop: '20px', 
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <ShieldCheck size={20} color="#10b981" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Your data is secure and encrypted.
            </span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '24px', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          By contacting support, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
