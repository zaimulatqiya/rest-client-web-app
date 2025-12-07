import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Send, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MethodSelect } from './ui/method-select';
import { Card, CardContent } from './ui/card';
import type { ResponseData } from '../types';

interface ProdukTabProps {
  onSendRequest: (url: string, method: string, body: unknown) => Promise<ResponseData>;
  loading: boolean;
}

function ProdukTab({ onSendRequest, loading }: ProdukTabProps) {
  const [method, setMethod] = useState<string>('POST');
  // Get base URL from environment variable
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost';
  const defaultUrl = `${baseUrl}/DBREST/api/produk.php`;
  const [url, setUrl] = useState(defaultUrl);
  const [error, setError] = useState<string>('');
  const [fetchingData, setFetchingData] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    id: '',
    nama_parfum: '',
    ukuran_ml: '',
    harga: '',
    stok: '',
    kategori: '',
    deskripsi: '',
    rating: '',
    foto: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
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
      let productData: any = null;
      if (response.data) {
        // Jika response adalah array, ambil item pertama
        if (Array.isArray(response.data)) {
          productData = response.data[0];
        } else if (typeof response.data === 'object') {
          productData = response.data;
        }
      }

      if (productData) {
        // Isi form dengan data yang didapat
        setFormData(prev => ({
          ...prev,
          nama_parfum: productData.nama_parfum?.toString() || '',
          ukuran_ml: productData.ukuran_ml?.toString() || '',
          harga: productData.harga?.toString() || '',
          stok: productData.stok?.toString() || '',
          kategori: productData.kategori?.toString() || '',
          deskripsi: productData.deskripsi?.toString() || '',
          rating: productData.rating?.toString() || '',
          foto: productData.foto?.toString() || ''
        }));
      } else {
        setError('Data produk tidak ditemukan atau format response tidak valid');
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      if (axiosError.response) {
        setError(`Gagal mengambil data: ${axiosError.response.status} ${axiosError.response.statusText}`);
      } else {
        setError('Terjadi kesalahan saat mengambil data produk');
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
      // Add ID to query params
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
      const body: Record<string, unknown> = {};
      
      // POST: tidak sertakan ID
      if (method === 'POST') {
        if (formData.nama_parfum) body.nama_parfum = formData.nama_parfum;
        if (formData.ukuran_ml) body.ukuran_ml = parseInt(formData.ukuran_ml) || formData.ukuran_ml;
        if (formData.harga) body.harga = parseFloat(formData.harga) || formData.harga;
        if (formData.stok) body.stok = parseInt(formData.stok) || formData.stok;
        if (formData.kategori) body.kategori = formData.kategori;
        if (formData.deskripsi) body.deskripsi = formData.deskripsi;
        if (formData.rating) body.rating = parseFloat(formData.rating) || formData.rating;
        if (formData.foto) body.foto = formData.foto;
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
        if (formData.nama_parfum) body.nama_parfum = formData.nama_parfum;
        if (formData.ukuran_ml) body.ukuran_ml = parseInt(formData.ukuran_ml) || formData.ukuran_ml;
        if (formData.harga) body.harga = parseFloat(formData.harga) || formData.harga;
        if (formData.stok) body.stok = parseInt(formData.stok) || formData.stok;
        if (formData.kategori) body.kategori = formData.kategori;
        if (formData.deskripsi) body.deskripsi = formData.deskripsi;
        if (formData.rating) body.rating = parseFloat(formData.rating) || formData.rating;
        if (formData.foto) body.foto = formData.foto;
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
                type="text"
                placeholder={idRequired ? "ID (wajib)" : "ID (opsional)"}
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
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
                  title="Load data produk"
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Nama Parfum</label>
                <Input
                  type="text"
                  placeholder="Nama parfum"
                  value={formData.nama_parfum}
                  onChange={(e) => handleInputChange('nama_parfum', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Ukuran (ml)</label>
                <Input
                  type="number"
                  placeholder="Ukuran dalam ml"
                  value={formData.ukuran_ml}
                  onChange={(e) => handleInputChange('ukuran_ml', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Harga</label>
                <Input
                  type="number"
                  placeholder="Harga"
                  value={formData.harga}
                  onChange={(e) => handleInputChange('harga', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Stok</label>
                <Input
                  type="number"
                  placeholder="Stok"
                  value={formData.stok}
                  onChange={(e) => handleInputChange('stok', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Kategori</label>
                <Input
                  type="text"
                  placeholder="Kategori"
                  value={formData.kategori}
                  onChange={(e) => handleInputChange('kategori', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Rating</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Rating (0-5)"
                  value={formData.rating}
                  onChange={(e) => handleInputChange('rating', e.target.value)}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Deskripsi</label>
                <textarea
                  placeholder="Deskripsi produk"
                  value={formData.deskripsi}
                  onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-input bg-background text-sm resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Foto (URL)</label>
                <Input
                  type="text"
                  placeholder="URL foto"
                  value={formData.foto}
                  onChange={(e) => handleInputChange('foto', e.target.value)}
                />
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

export default ProdukTab;

