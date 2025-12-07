import { useState, useMemo } from 'react';
import axios, { AxiosError } from 'axios';
import { Send, Loader2, Plus, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MethodSelect } from './ui/method-select';
import { Card, CardContent } from './ui/card';
import type { ResponseData } from '../types';

interface TransaksiItem {
  produk_id: string;
  qty: string;
  harga_satuan: string;
  subtotal: number;
}

interface TransaksiTabProps {
  onSendRequest: (url: string, method: string, body: unknown) => Promise<ResponseData>;
  loading: boolean;
}

function TransaksiTab({ onSendRequest, loading }: TransaksiTabProps) {
  const [method, setMethod] = useState<string>('POST');
  // Get base URL from environment variable
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost';
  const defaultUrl = `${baseUrl}/DBREST/api/transaksi.php`;
  const [url, setUrl] = useState(defaultUrl);
  const [error, setError] = useState<string>('');
  const [fetchingData, setFetchingData] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    id: '',
    tanggal: new Date().toISOString().split('T')[0],
    nama_pelanggan: ''
  });
  const [items, setItems] = useState<TransaksiItem[]>([
    {
      produk_id: '',
      qty: '',
      harga_satuan: '',
      subtotal: 0
    }
  ]);

  const totalPembayaran = useMemo(() => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }, [items]);

  const updateItem = (index: number, field: keyof TransaksiItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate subtotal
    const qty = parseFloat(newItems[index].qty) || 0;
    const hargaSatuan = parseFloat(newItems[index].harga_satuan) || 0;
    newItems[index].subtotal = qty * hargaSatuan;
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        produk_id: '',
        qty: '',
        harga_satuan: '',
        subtotal: 0
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleFetchData = async () => {
    if (!url) {
      setError('URL endpoint harus diisi');
      return;
    }

    if (!formData.id || formData.id.trim() === '') {
      setError('ID harus diisi untuk mengambil data');
      return;
    }

    setFetchingData(true);
    setError('');

    try {
      // Build URL dengan ID di query parameter
      let fetchUrl = url;
      const separator = fetchUrl.includes('?') ? '&' : '?';
      fetchUrl = `${fetchUrl}${separator}id=${encodeURIComponent(formData.id)}`;

      // Handle localhost URL untuk mengatasi CORS
      let processedUrl = fetchUrl;
      if (fetchUrl.startsWith('http://localhost/') || fetchUrl.startsWith('http://127.0.0.1/')) {
        const urlObj = new URL(fetchUrl);
        processedUrl = urlObj.pathname + urlObj.search;
        processedUrl = '/localhost' + processedUrl;
      } else if (fetchUrl.startsWith('localhost/') || fetchUrl.startsWith('127.0.0.1/')) {
        processedUrl = '/localhost/' + fetchUrl.replace(/^(localhost|127\.0\.0\.1)\/?/, '');
      }

      // Fetch data langsung dengan axios (tidak melalui onSendRequest agar tidak menampilkan response)
      const response = await axios.get(processedUrl, {
        timeout: 30000,
        withCredentials: false
      });

      // Parse response data
      let transaksiData: any = null;
      if (response.data) {
        // Jika response adalah array, ambil item pertama
        if (Array.isArray(response.data)) {
          transaksiData = response.data[0];
        } else if (typeof response.data === 'object') {
          transaksiData = response.data;
        }
      }

      // Debug: log data untuk melihat struktur
      console.log('Transaksi Data:', transaksiData);
      if (transaksiData?.items) {
        console.log('Items Data:', transaksiData.items);
        if (transaksiData.items[0]) {
          console.log('First Item:', transaksiData.items[0]);
        }
      }

      if (transaksiData) {
        // Isi form dengan data yang didapat
        setFormData(prev => ({
          ...prev,
          tanggal: transaksiData.tanggal?.toString() || prev.tanggal,
          nama_pelanggan: transaksiData.nama_pelanggan?.toString() || ''
        }));

        // Isi items jika ada
        if (transaksiData.items && Array.isArray(transaksiData.items) && transaksiData.items.length > 0) {
          // Fungsi untuk mendapatkan produk_id dari item
          const getProdukId = async (item: any): Promise<string> => {
            // Cek apakah produk_id sudah ada langsung di item
            if (item.produk_id !== undefined && item.produk_id !== null && item.produk_id !== '') {
              return String(item.produk_id);
            }
            if (item.id_produk !== undefined && item.id_produk !== null && item.id_produk !== '') {
              return String(item.id_produk);
            }
            if (item.produkId !== undefined && item.produkId !== null && item.produkId !== '') {
              return String(item.produkId);
            }
            if (item.product_id !== undefined && item.product_id !== null && item.product_id !== '') {
              return String(item.product_id);
            }
            
            // Jika produk adalah object, ambil id-nya
            if (item.produk !== undefined && item.produk !== null) {
              if (typeof item.produk === 'object' && item.produk.id !== undefined) {
                return String(item.produk.id);
              } else {
                return String(item.produk);
              }
            }
            
            // Jika tidak ada produk_id, coba cari dari nama_parfum (jika ada)
            // Ambil base URL dari transaksi URL
            if (item.nama_parfum && url) {
              try {
                const baseUrl = url.replace(/\/transaksi\.php.*$/, '/produk.php');
                const produkUrl = `${baseUrl}?nama_parfum=${encodeURIComponent(item.nama_parfum)}`;
                
                // Handle localhost URL
                let processedUrl = produkUrl;
                if (produkUrl.startsWith('http://localhost/') || produkUrl.startsWith('http://127.0.0.1/')) {
                  const urlObj = new URL(produkUrl);
                  processedUrl = urlObj.pathname + urlObj.search;
                  processedUrl = '/localhost' + processedUrl;
                } else if (produkUrl.startsWith('localhost/') || produkUrl.startsWith('127.0.0.1/')) {
                  processedUrl = '/localhost/' + produkUrl.replace(/^(localhost|127\.0\.0\.1)\/?/, '');
                }
                
                const produkResponse = await axios.get(processedUrl, {
                  timeout: 5000,
                  withCredentials: false
                });
                
                if (produkResponse.data) {
                  let produkData: any = null;
                  if (Array.isArray(produkResponse.data)) {
                    // Cari produk yang cocok dengan nama_parfum
                    produkData = produkResponse.data.find((p: any) => 
                      p.nama_parfum === item.nama_parfum || 
                      p.nama_parfum?.toLowerCase() === item.nama_parfum?.toLowerCase()
                    ) || produkResponse.data[0];
                  } else if (typeof produkResponse.data === 'object') {
                    produkData = produkResponse.data;
                  }
                  
                  if (produkData && produkData.id !== undefined) {
                    return String(produkData.id);
                  }
                }
              } catch (err) {
                console.warn('Gagal fetch produk_id dari nama_parfum:', err);
              }
            }
            
            return '';
          };
          
          // Map items dengan async, tunggu semua selesai
          const fetchedItemsPromises = transaksiData.items.map(async (item: any) => {
            const qty = parseFloat(item.qty?.toString() || '0') || 0;
            const hargaSatuan = parseFloat(item.harga_satuan?.toString() || '0') || 0;
            const produkId = await getProdukId(item);
            
            return {
              produk_id: produkId,
              qty: item.qty !== undefined && item.qty !== null ? String(item.qty) : '',
              harga_satuan: item.harga_satuan !== undefined && item.harga_satuan !== null ? String(item.harga_satuan) : '',
              subtotal: qty * hargaSatuan
            };
          });
          
          const fetchedItems = await Promise.all(fetchedItemsPromises);
          setItems(fetchedItems);
        } else {
          // Jika tidak ada items, set default satu item kosong
          setItems([{
            produk_id: '',
            qty: '',
            harga_satuan: '',
            subtotal: 0
          }]);
        }
      } else {
        setError('Data transaksi tidak ditemukan atau format response tidak valid');
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      if (axiosError.response) {
        setError(`Gagal mengambil data: ${axiosError.response.status} ${axiosError.response.statusText}`);
      } else {
        setError('Terjadi kesalahan saat mengambil data transaksi');
      }
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!url) {
      setError('URL endpoint harus diisi');
      return;
    }

    // Validasi untuk PUT/PATCH
    if ((method === 'PUT' || method === 'PATCH') && (!formData.id || formData.id.trim() === '')) {
      setError('ID wajib diisi untuk method PUT/PATCH');
      return;
    }

    let requestUrl = url;
    let requestBody: unknown = undefined;

    // Handle DELETE - ID di query param
    if (method === 'DELETE') {
      if (!formData.id) {
        setError('ID wajib diisi untuk method DELETE');
        return;
      }
      const separator = requestUrl.includes('?') ? '&' : '?';
      requestUrl = `${requestUrl}${separator}id=${encodeURIComponent(formData.id)}`;
      await onSendRequest(requestUrl, method, undefined);
      return;
    }

    // Handle GET - ID di query param jika ada
    if (method === 'GET') {
      if (formData.id) {
        const separator = requestUrl.includes('?') ? '&' : '?';
        requestUrl = `${requestUrl}${separator}id=${encodeURIComponent(formData.id)}`;
      }
      await onSendRequest(requestUrl, method, undefined);
      return;
    }

    // Handle HEAD/OPTIONS - tidak ada body
    if (method === 'HEAD' || method === 'OPTIONS') {
      await onSendRequest(requestUrl, method, undefined);
      return;
    }

    // Handle POST/PUT/PATCH - build body
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      // Filter items yang valid (harus ada produk_id, qty, dan harga_satuan)
      const validItems = items.filter(item => {
        const hasProdukId = item.produk_id && item.produk_id.trim() !== '';
        const hasQty = item.qty && item.qty.trim() !== '';
        const hasHarga = item.harga_satuan && item.harga_satuan.trim() !== '';
        return hasProdukId && hasQty && hasHarga;
      });

      if (validItems.length === 0) {
        setError('Minimal satu item harus diisi dengan lengkap (Produk ID, Qty, Harga Satuan)');
        return;
      }

      const body: Record<string, unknown> = {};
      
      // POST: tidak sertakan ID
      if (method === 'POST') {
        body.tanggal = formData.tanggal;
        body.nama_pelanggan = formData.nama_pelanggan;
        body.items = validItems.map(item => {
          const produkId = parseInt(item.produk_id);
          const qty = parseInt(item.qty);
          const hargaSatuan = parseFloat(item.harga_satuan);
          
          return {
            produk_id: isNaN(produkId) ? item.produk_id : produkId,
            qty: isNaN(qty) ? item.qty : qty,
            harga_satuan: isNaN(hargaSatuan) ? item.harga_satuan : hargaSatuan
          };
        });
      } else {
        // PUT/PATCH: sertakan ID di body DAN query parameter (untuk kompatibilitas dengan berbagai backend)
        // Pastikan ID selalu dikirim, baik sebagai string atau number
        if (formData.id && formData.id.trim() !== '') {
          const idNum = parseInt(formData.id);
          body.id = isNaN(idNum) ? formData.id : idNum;
          
          // Tambahkan ID ke query parameter juga
          const separator = requestUrl.includes('?') ? '&' : '?';
          requestUrl = `${requestUrl}${separator}id=${encodeURIComponent(formData.id)}`;
        } else {
          // Jika ID kosong tapi method PUT/PATCH, tetap kirim ID kosong (untuk error handling di backend)
          body.id = formData.id || '';
        }
        
        // Field lainnya
        body.tanggal = formData.tanggal;
        body.nama_pelanggan = formData.nama_pelanggan;
        body.items = validItems.map(item => {
          const produkId = parseInt(item.produk_id);
          const qty = parseInt(item.qty);
          const hargaSatuan = parseFloat(item.harga_satuan);
          
          return {
            produk_id: isNaN(produkId) ? item.produk_id : produkId,
            qty: isNaN(qty) ? item.qty : qty,
            harga_satuan: isNaN(hargaSatuan) ? item.harga_satuan : hargaSatuan
          };
        });
      }

      requestBody = body;
    }

    await onSendRequest(requestUrl, method, requestBody);
  };

  // Conditional rendering berdasarkan method
  const showIdField = method === 'PUT' || method === 'PATCH' || method === 'DELETE' || method === 'GET';
  const showFormFields = !['DELETE', 'GET', 'HEAD', 'OPTIONS'].includes(method);
  const idRequired = method === 'PUT' || method === 'PATCH' || method === 'DELETE';
  const hasFormFields = showFormFields;

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col shadow-card">
        <CardContent className={`p-6 space-y-6 ${hasFormFields ? 'h-full flex flex-col overflow-y-auto' : ''} animate-fade-in`}>
          {/* Method Select & URL Input */}
          <div className="flex items-center gap-3 animate-slide-in">
          <div className="w-32">
            <MethodSelect value={method} onChange={setMethod} />
          </div>
          <Input
            type="text"
            placeholder={defaultUrl}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            className="flex-1 font-mono text-sm h-11 rounded-xl"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-rose-50 border border-rose-200 rounded-xl p-3 animate-scale-in shadow-sm">
            <AlertCircle className="w-4 h-4 animate-pulse" />
            {error}
          </div>
        )}

        {/* ID Field (conditional) */}
        {showIdField && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              ID {idRequired && <span className="text-destructive">*</span>}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder={idRequired ? "ID (wajib)" : "ID (opsional)"}
                value={formData.id}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, id: e.target.value }));
                  setError('');
                }}
                required={idRequired}
                className="flex-1"
              />
              {(method === 'PUT' || method === 'PATCH') && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleFetchData}
                  disabled={fetchingData || !formData.id || !url}
                  className="h-10 w-10 flex-shrink-0"
                  title="Load data transaksi"
                >
                  {fetchingData ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Form Fields (conditional) */}
        {showFormFields && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="grid grid-cols-3 gap-4 flex-shrink-0">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Tanggal</label>
                <Input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Nama Pelanggan</label>
                <Input
                  type="text"
                  placeholder="Nama pelanggan"
                  value={formData.nama_pelanggan}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama_pelanggan: e.target.value }))}
                />
              </div>
            </div>

            {/* Total Pembayaran */}
            <div className="space-y-2 flex-shrink-0">
              <label className="text-xs font-medium text-muted-foreground">Total Pembayaran</label>
              <Input
                type="text"
                value={`Rp ${totalPembayaran.toLocaleString('id-ID')}`}
                readOnly
                className="bg-muted font-semibold"
              />
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Items</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="h-8 text-xs"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah Item
                </Button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-3 font-semibold text-muted-foreground text-xs">Produk ID</th>
                        <th className="text-left p-3 font-semibold text-muted-foreground text-xs">Qty</th>
                        <th className="text-left p-3 font-semibold text-muted-foreground text-xs">Harga Satuan</th>
                        <th className="text-left p-3 font-semibold text-muted-foreground text-xs">Subtotal</th>
                        <th className="text-left p-3 font-semibold text-muted-foreground text-xs w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index} className="border-b border-slate-200 last:border-b-0 transition-all duration-150 hover:bg-slate-50/50">
                          <td className="p-3">
                            <Input
                              type="number"
                              placeholder="ID Produk"
                              value={item.produk_id}
                              onChange={(e) => updateItem(index, 'produk_id', e.target.value)}
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              placeholder="Qty"
                              value={item.qty}
                              onChange={(e) => updateItem(index, 'qty', e.target.value)}
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              placeholder="Harga Satuan"
                              value={item.harga_satuan}
                              onChange={(e) => updateItem(index, 'harga_satuan', e.target.value)}
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="p-3">
                            <div className="text-xs font-medium text-foreground">
                              Rp {item.subtotal.toLocaleString('id-ID')}
                            </div>
                          </td>
                          <td className="p-3">
                            {items.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(index)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex-shrink-0 animate-fade-in">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:translate-x-1" />
                    Kirim
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Submit Button (untuk method tanpa form fields) */}
        {!showFormFields && (
          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Kirim
                </>
              )}
            </Button>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TransaksiTab;

