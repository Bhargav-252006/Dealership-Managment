import { useState, useEffect } from 'react';
import API from '../api';
import toast from 'react-hot-toast';

export default function SubscriptionExpired() {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handlePay = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment gateway is still loading...');
      return;
    }
    setLoading(true);
    try {
      // Create order on backend
      const { data: order } = await API.post('/subscriptions/create-order');

      const options = {
        key: 'rzp_test_dummy_key_123', // Dummy key for testing (matches backend)
        amount: order.amount,
        currency: order.currency,
        name: 'DealerConnect',
        description: 'Monthly Subscription Renewal',
        order_id: order.id,
        handler: async function (response) {
          try {
            toast.loading('Verifying payment...', { id: 'verify' });
            // Verify signature on backend
            await API.post('/subscriptions/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature || 'dummy_sig'
            });
            toast.success('Payment successful! Your account is active.', { id: 'verify' });
            // Reload page to reset state
            setTimeout(() => window.location.reload(), 1500);
          } catch (err) {
            toast.error('Payment verification failed.', { id: 'verify' });
          }
        },
        theme: {
          color: '#6c63ff'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        toast.error('Payment failed or cancelled.');
      });
      rzp.open();

    } catch (err) {
      toast.error('Could not initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    setDownloading(true);
    try {
      const response = await API.get('/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'orders_history.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download CSV data.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fade-in" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '80vh', padding: 24, textAlign: 'center'
    }}>
      <div style={{
        background: 'var(--bg-card)', padding: '48px 32px', borderRadius: 24,
        border: '1px solid var(--red-bg)', boxShadow: '0 20px 40px rgba(239, 68, 68, 0.1)',
        maxWidth: 500, width: '100%'
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>
          Subscription Expired
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
          Your monthly subscription to DealerConnect has expired or is inactive. 
          Please renew your subscription to continue managing your shops and placing orders.
        </p>

        <button 
          onClick={handlePay} 
          className="btn btn-primary" 
          disabled={loading || !razorpayLoaded}
          style={{ width: '100%', padding: 14, fontSize: 16, justifyContent: 'center', marginBottom: 16 }}
        >
          {loading ? 'Initiating...' : 'Pay ₹499 & Renew Now'}
        </button>

        <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid var(--glass-border)' }}>
          <h4 style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 8 }}>Want to stop using DealerConnect?</h4>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            You can download all your historical order data as a CSV file below.
          </p>
          <button 
            onClick={handleDownloadCSV} 
            className="btn btn-secondary" 
            disabled={downloading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {downloading ? 'Downloading...' : '📥 Download CSV History'}
          </button>
        </div>
      </div>
    </div>
  );
}
