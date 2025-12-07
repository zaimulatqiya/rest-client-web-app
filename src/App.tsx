import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import HistoryPanel from './components/HistoryPanel';
import RequestPanel from './components/RequestPanel';
import ResponsePanel from './components/ResponsePanel';
import Tabs from './components/Tabs';
import ProdukTab from './components/ProdukTab';
import TransaksiTab from './components/TransaksiTab';
import { Send, Package, Receipt } from 'lucide-react';
import type { Header, ResponseData, HistoryItem } from './types';

function App() {
  const [method, setMethod] = useState<string>('GET');
  const [url, setUrl] = useState<string>('');
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }]);
  const [body, setBody] = useState<string>('');
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Load history dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem('restHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, []);

  // Generic request function untuk semua tab
  const sendGenericRequest = async (
    requestUrl: string,
    requestMethod: string,
    requestBody?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<ResponseData> => {
    setLoading(true);
    setResponse(null);

    try {
      // Convert headers array ke object atau gunakan custom headers
      const headersObj: Record<string, string> = customHeaders || {};
      if (!customHeaders) {
        headers.forEach(h => {
          if (h.key && h.value) {
            headersObj[h.key] = h.value;
          }
        });
      }

      // Set Content-Type jika ada body
      if (requestBody && !headersObj['Content-Type']) {
        headersObj['Content-Type'] = 'application/json';
      }

      // Handle localhost URL untuk mengatasi CORS
      let processedUrl = requestUrl;
      if (requestUrl.startsWith('http://localhost/') || requestUrl.startsWith('http://127.0.0.1/')) {
        const urlObj = new URL(requestUrl);
        processedUrl = urlObj.pathname + urlObj.search;
        processedUrl = '/localhost' + processedUrl;
      } else if (requestUrl.startsWith('localhost/') || requestUrl.startsWith('127.0.0.1/')) {
        processedUrl = '/localhost/' + requestUrl.replace(/^(localhost|127\.0\.0\.1)\/?/, '');
      }

      const config: {
        method: string;
        url: string;
        headers: Record<string, string>;
        data?: unknown;
        timeout?: number;
        withCredentials?: boolean;
      } = {
        method: requestMethod.toLowerCase(),
        url: processedUrl,
        headers: headersObj,
        timeout: 30000,
        withCredentials: false,
      };

      // Tambah body untuk method yang support
      if (['post', 'put', 'patch'].includes(requestMethod.toLowerCase()) && requestBody) {
        config.data = requestBody;
      }

      const startTime = Date.now();
      const res = await axios(config);
      const endTime = Date.now();

      // Convert axios headers to Record format
      const responseHeaders: Record<string, string | string[]> = {};
      Object.keys(res.headers).forEach(key => {
        const value = res.headers[key];
        if (value !== undefined) {
          responseHeaders[key] = Array.isArray(value) ? value : String(value);
        }
      });

      const responseData: ResponseData = {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        data: res.data,
        time: `${endTime - startTime}ms`
      };

      setResponse(responseData);

      // Simpan ke history
      const newHistoryItem: HistoryItem = {
        method: requestMethod,
        url: requestUrl,
        time: new Date().toLocaleString()
      };

      const newHistory = [newHistoryItem, ...history].slice(0, 20);
      setHistory(newHistory);
      localStorage.setItem('restHistory', JSON.stringify(newHistory));

      return responseData;

    } catch (error) {
      const axiosError = error as AxiosError;
      
      let errorMessage = axiosError.message;
      
      if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {
        errorMessage = `Network Error: Tidak bisa terhubung ke server.
        
🔧 SOLUSI CEPAT:
1. Pastikan server PHP berjalan (XAMPP/WAMP - Apache harus Running)
2. Test URL di browser: Buka ${requestUrl} langsung di browser
3. TAMBAHKAN CORS HEADERS di file PHP Anda (penting!)

📝 Cara menambahkan CORS di PHP:
Tambahkan di bagian paling atas file transaksi.php:

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

Lihat file CORS_HEADER_EXAMPLE.php untuk contoh lengkap.

Kemungkinan penyebab:
• Server PHP tidak berjalan (cek XAMPP/WAMP)
• Masalah CORS - perlu tambah headers di PHP (paling sering!)
• URL salah atau tidak bisa diakses
• Firewall memblokir koneksi`;
      } else if (axiosError.code === 'ECONNREFUSED') {
        errorMessage = `Connection Refused: Server menolak koneksi. Pastikan server berjalan di ${requestUrl}`;
      } else if (axiosError.code === 'ETIMEDOUT') {
        errorMessage = `Request Timeout: Server tidak merespon dalam waktu yang ditentukan`;
      } else if (axiosError.response) {
        errorMessage = axiosError.message;
      }
      
      const errorResponse: ResponseData = {
        error: true,
        message: errorMessage,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data
      };

      setResponse(errorResponse);
      return errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Request function untuk tab Request (existing functionality)
  const sendRequest = async () => {
    if (!url) {
      alert('Please enter a URL');
      return;
    }

    let requestBody: unknown = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (body) {
        try {
          requestBody = JSON.parse(body);
        } catch {
          requestBody = body;
        }
      }
    }

    await sendGenericRequest(url, method, requestBody);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setMethod(item.method);
    setUrl(item.url);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('restHistory');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100/50 overflow-hidden">
      <HistoryPanel 
        history={history} 
        onSelectHistory={loadFromHistory}
        onClearHistory={clearHistory}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs
          tabs={[
            {
              id: 'request',
              label: 'Request',
              icon: <Send className="w-4 h-4" />,
              content: (
                <div className="h-full flex flex-col lg:flex-row overflow-hidden gap-4 p-4">
                  <div className="flex-1 min-w-0 flex flex-col">
                    <RequestPanel
                      method={method}
                      url={url}
                      headers={headers}
                      body={body}
                      loading={loading}
                      onMethodChange={setMethod}
                      onUrlChange={setUrl}
                      onHeadersChange={setHeaders}
                      onBodyChange={setBody}
                      onSendRequest={sendRequest}
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <ResponsePanel response={response} loading={loading} />
                  </div>
                </div>
              )
            },
            {
              id: 'produk',
              label: 'Produk',
              icon: <Package className="w-4 h-4" />,
              content: (
                <div className="h-full flex flex-col lg:flex-row overflow-hidden gap-4 p-4">
                  <div className="flex-1 min-w-0 flex flex-col">
                    <ProdukTab
                      onSendRequest={sendGenericRequest}
                      loading={loading}
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <ResponsePanel response={response} loading={loading} />
                  </div>
                </div>
              )
            },
            {
              id: 'transaksi',
              label: 'Transaksi',
              icon: <Receipt className="w-4 h-4" />,
              content: (
                <div className="h-full flex flex-col lg:flex-row overflow-hidden gap-4 p-4">
                  <div className="flex-1 min-w-0 flex flex-col">
                    <TransaksiTab
                      onSendRequest={sendGenericRequest}
                      loading={loading}
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <ResponsePanel response={response} loading={loading} />
                  </div>
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  );
}

export default App;
