import React, { useState, useEffect } from 'react';
import { X, QrCode, Copy, Check, Clock, CreditCard, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { Order, PaymentChannel } from '../types';

interface PaymentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSimulatePaySuccess: (orderId: number) => void;
  formatRupiah: (val: number) => string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onSimulatePaySuccess,
  formatRupiah
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins in seconds

  useEffect(() => {
    if (!isOpen || order.payment_status === 'paid') return;
    const interval = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, order.payment_status]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const vaNumber = order.va_number || `8820${order.customer_phone.slice(-4)}${order.id.toString().slice(-4)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E8DFD5] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="p-6 bg-[#FAF8F5] border-b border-[#E8DFD5] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#9B786F] font-semibold">
              GATEWAY PEMBAYARAN TERENKRIPSI
            </span>
            <h3 className="font-serif-luxury text-xl font-bold text-[#1F1C1A]">
              Instruksi Pembayaran: {order.payment_method_name}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-[#736B63] hover:text-[#1F1C1A] rounded-full hover:bg-white transition">
            <X size={18} />
          </button>
        </div>

        {/* Payment Content */}
        <div className="p-6 space-y-6 text-xs">
          {/* Amount Box */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DFD5] flex justify-between items-center">
            <div>
              <div className="text-[#736B63]">Total Tagihan Transaksi:</div>
              <div className="text-xl font-bold text-[#1F1C1A] mt-0.5">{formatRupiah(order.grand_total)}</div>
            </div>
            {order.payment_status === 'paid' ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs">
                ✓ LUNAS
              </span>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1 rounded-full font-mono text-xs">
                <Clock size={13} />
                <span>Batas: {timerStr}</span>
              </div>
            )}
          </div>

          {/* Conditional view based on channel */}
          {order.payment_channel === 'qris' ? (
            <div className="text-center space-y-4">
              <p className="text-[#5C544E]">
                Buka aplikasi perbankan digital (BCA Mobile, Livin, BRImo) atau e-wallet (GoPay, OVO, ShopeePay) lalu scan kode QRIS di bawah ini:
              </p>
              <div className="mx-auto w-52 h-52 bg-white p-3 rounded-2xl border-2 border-[#1F1C1A] shadow-md flex items-center justify-center">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021226600016ID.CO.AURA.WWW0118936000020110000000002030035104000053033605802ID5913AURA_BOTANICA6007JAKARTA6304A8F2"
                  alt="QRIS Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[11px] text-[#736B63]">NMID: ID1020039485923 &bull; AURA BOTANICA INDONESIA</div>
            </div>
          ) : order.payment_channel.includes('va') ? (
            <div className="space-y-4">
              <div className="p-4 bg-white border border-[#E8DFD5] rounded-xl space-y-2">
                <div className="flex justify-between items-center text-[#736B63]">
                  <span>Nomor Virtual Account</span>
                  <span>{order.payment_method_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl font-bold tracking-wider text-[#1F1C1A]">{vaNumber}</span>
                  <button
                    onClick={() => copyToClipboard(vaNumber)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#FAF8F5] border border-[#E8DFD5] hover:bg-[#EAE2D8] rounded-lg font-medium text-[#2C2724]"
                  >
                    {copied ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                    <span>{copied ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD5] space-y-1.5 text-[#5C544E]">
                <div className="font-semibold text-[#1F1C1A]">Cara Pembayaran ATM / Mobile Banking:</div>
                <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                  <li>Pilih menu <strong>Transfer / Bayar</strong> &gt; <strong>Virtual Account</strong>.</li>
                  <li>Masukkan nomor VA: <code>{vaNumber}</code>.</li>
                  <li>Pastikan nama merchant tertera <strong>AURA BOTANICA INDONESIA</strong>.</li>
                  <li>Konfirmasi dan transaksi selesai secara instan tanpa perlu upload bukti transfer.</li>
                </ol>
              </div>
            </div>
          ) : order.payment_channel === 'credit_card' ? (
            <div className="p-4 bg-white border border-[#E8DFD5] rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-[#1F1C1A] font-semibold">
                <CreditCard size={18} className="text-[#9B786F]" />
                <span>Pembayaran Kartu Kredit 3D Secure</span>
              </div>
              <p className="text-[#5C544E]">
                Transaksi diamankan dengan enkripsi PCI-DSS Level 1 dan autentikasi OTP bank penerbit kartu.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-white border border-[#E8DFD5] rounded-xl space-y-2">
              <div className="font-semibold text-[#1F1C1A]">Metode: {order.payment_method_name}</div>
              <p className="text-[#5C544E]">
                Pesanan Anda telah dicatat dalam antrean pengiriman logistik. Siapkan dana pas sebesar <strong>{formatRupiah(order.grand_total)}</strong> saat kurir mengantarkan paket.
              </p>
            </div>
          )}

          {/* Quick Simulation Button for Testing */}
          {order.payment_status !== 'paid' && (
            <div className="pt-2 border-t border-[#E8DFD5]">
              <button
                onClick={() => {
                  onSimulatePaySuccess(order.id);
                  onClose();
                }}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <Check size={16} />
                <span>Simulasi: Sukseskan Pembayaran Sekarang (Test Gateway)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
