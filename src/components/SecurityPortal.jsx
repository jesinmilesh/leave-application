import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { 
  ShieldCheck, 
  QrCode, 
  Search, 
  LogOut, 
  LogIn, 
  CheckCircle2, 
  Clock, 
  User, 
  Camera,
  VideoOff,
  History,
  FileText,
  Filter,
  RefreshCw,
  Zap,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

export default function SecurityPortal({ 
  leaves, 
  onMarkExit, 
  onMarkEntry, 
  activeSecurity 
}) {
  const [activeTab, setActiveTab] = useState('desk'); // 'desk' | 'history'
  const [searchId, setSearchId] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'out' | 'returned'
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerFeedback, setScannerFeedback] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const norm = (s) => (s || '').toUpperCase().replace(/_/g, ' ');

  const gateLeaves = leaves.filter(l => ['READY FOR GATE', 'STUDENT OUT', 'RETURNED', 'STUDENT RETURNED'].includes(norm(l.status)));
  const activeOutStudents = leaves.filter(l => norm(l.status) === 'STUDENT OUT');
  const readyAtGateStudents = leaves.filter(l => norm(l.status) === 'READY FOR GATE');

  const filteredHistoryLeaves = gateLeaves.filter(l => {
    const query = historySearch.toLowerCase().trim();
    const matchesSearch = !query || 
      l.studentName?.toLowerCase().includes(query) ||
      l.registerNo?.toLowerCase().includes(query) ||
      l.leaveId?.toLowerCase().includes(query) ||
      l.dept?.toLowerCase().includes(query);

    const statusUpper = norm(l.status);
    if (historyFilter === 'out') return matchesSearch && statusUpper === 'STUDENT OUT';
    if (historyFilter === 'returned') return matchesSearch && ['RETURNED', 'STUDENT RETURNED'].includes(statusUpper);
    return matchesSearch;
  });

  // Start Mobile Web Camera Stream (STRICTLY Rear Main Camera Only)
  const startCamera = async () => {
    setCameraError(null);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    try {
      let stream = null;
      // Strictly target mobile rear/environment camera
      const constraintOptions = [
        { video: { facingMode: { exact: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
        { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
        { video: { facingMode: 'environment' } },
        { video: true }
      ];

      for (const opt of constraintOptions) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(opt);
          if (stream) break;
        } catch (e) {}
      }

      if (!stream) {
        throw new Error('Could not access rear main camera.');
      }

      streamRef.current = stream;

      const track = stream.getVideoTracks()[0];
      if (track && track.getCapabilities) {
        const capabilities = track.getCapabilities();
        setHasTorch(!!capabilities.torch);
      } else {
        setHasTorch(false);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        await videoRef.current.play().catch(() => {});
      }

      setCameraActive(true);
      setScannerFeedback({ 
        type: 'info', 
        text: '📷 Mobile Rear Camera Active! Hold student QR Pass in viewfinder.' 
      });
    } catch (err) {
      console.error('Camera Error:', err);
      let errorMsg = 'Unable to start rear camera. Please verify browser camera permissions.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No rear camera found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = 'Camera is in use by another app. Please close other camera applications.';
      }
      setCameraError(errorMsg);
      setCameraActive(false);
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && track.applyConstraints) {
      try {
        const nextState = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setTorchOn(nextState);
      } catch (err) {
        console.warn('Torch constraint error:', err);
      }
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const processScannedData = (rawData) => {
    if (!rawData) return;
    let query = String(rawData).trim();

    if (query.startsWith('{') && query.endsWith('}')) {
      try {
        const parsed = JSON.parse(query);
        if (parsed.leaveId) query = parsed.leaveId;
        else if (parsed.registerNo) query = parsed.registerNo;
      } catch (err) {}
    }

    const found = leaves.find(l => 
      l.leaveId?.toLowerCase() === query.toLowerCase() ||
      l.registerNo?.toLowerCase() === query.toLowerCase() ||
      l.studentName?.toLowerCase().includes(query.toLowerCase())
    );

    if (navigator.vibrate) {
      try { navigator.vibrate([100, 50, 100]); } catch (e) {}
    }

    if (found) {
      setSelectedLeave(found);
      setScannerFeedback({ type: 'success', text: `✓ Verified QR Pass Scanned: ${found.leaveId} • ${found.studentName}` });
    } else {
      setScannerFeedback({ type: 'info', text: `QR Code Scanned (${query}). Pass not found in active gate list.` });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });
        if (code && code.data) {
          processScannedData(code.data);
        } else {
          setScannerFeedback({ type: 'error', text: 'Could not detect a valid QR Code in the selected photo/image.' });
        }
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  // Continuous Camera Frame Barcode / QR Detection Loop using jsQR + Canvas
  useEffect(() => {
    let intervalId = null;

    if (cameraActive && videoRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      intervalId = setInterval(() => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;

        const width = video.videoWidth;
        const height = video.videoHeight;
        if (!width || !height) return;

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(video, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        // 1. Scan frame using jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          processScannedData(code.data);
          return;
        }

        // 2. Native BarcodeDetector Fallback
        if ('BarcodeDetector' in window) {
          try {
            const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128', 'code_39'] });
            barcodeDetector.detect(video).then(barcodes => {
              if (barcodes && barcodes.length > 0) {
                processScannedData(barcodes[0].rawValue);
              }
            }).catch(() => {});
          } catch (e) {}
        }
      }, 200);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [cameraActive, leaves]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    let query = searchId.trim();
    if (!query) return;

    // Support hardware QR Scanners that output JSON payload strings
    if (query.startsWith('{') && query.endsWith('}')) {
      try {
        const parsed = JSON.parse(query);
        if (parsed.leaveId) query = parsed.leaveId;
        else if (parsed.registerNo) query = parsed.registerNo;
      } catch (err) {
        // Not JSON
      }
    }

    const found = leaves.find(l => 
      l.leaveId?.toLowerCase() === query.toLowerCase() ||
      l.registerNo?.toLowerCase() === query.toLowerCase() ||
      l.studentName?.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      setSelectedLeave(found);
      setScannerFeedback({ type: 'success', text: `✓ Verified QR Pass: ${found.leaveId} • ${found.studentName}` });
    } else {
      setSelectedLeave(null);
      setScannerFeedback({ type: 'error', text: `No active leave pass found for search query: ${query}` });
    }
  };

  const simulateScan = (leave) => {
    setScannerActive(true);
    setScannerFeedback({ type: 'info', text: 'Scanning QR Code via Main Gate Camera Scanner...' });
    
    setTimeout(() => {
      setSelectedLeave(leave);
      setScannerActive(false);
      setScannerFeedback({ type: 'success', text: `✓ QR Code Scanned & Verified! Student: ${leave.studentName} (${leave.leaveId})` });
    }, 500);
  };

  const handleExitClick = () => {
    if (!selectedLeave) return;
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formattedDate = now.toLocaleDateString('en-GB');
    const timeStamp = `${formattedDate} ${formattedTime}`;

    onMarkExit(selectedLeave.leaveId, activeSecurity?.name || 'Gate Officer');
    setSelectedLeave({
      ...selectedLeave,
      status: 'STUDENT_OUT',
      outDate: formattedDate,
      outTime: formattedTime,
      gateLog: {
        ...(selectedLeave.gateLog || {}),
        exitTime: timeStamp,
        securityName: activeSecurity?.name || 'Gate Officer'
      }
    });
    setScannerFeedback({ type: 'success', text: `✓ Marked EXIT for ${selectedLeave.studentName} on ${timeStamp}. Student logged OUT.` });
  };

  const handleEntryClick = () => {
    if (!selectedLeave) return;
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formattedDate = now.toLocaleDateString('en-GB');
    const timeStamp = `${formattedDate} ${formattedTime}`;

    onMarkEntry(selectedLeave.leaveId, activeSecurity?.name || 'Gate Officer');
    setSelectedLeave({
      ...selectedLeave,
      status: 'RETURNED',
      returnDate: formattedDate,
      returnTime: formattedTime,
      gateLog: {
        ...(selectedLeave.gateLog || {}),
        returnTime: timeStamp,
        securityName: activeSecurity?.name || 'Gate Officer'
      }
    });
    setScannerFeedback({ type: 'success', text: `✓ Marked RETURN for ${selectedLeave.studentName} on ${timeStamp}. Student returned to campus.` });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🛡️ Main Gate Security Checkpoint
          </h2>
          <p className="text-xs text-slate-400">
            Active Duty: <strong className="text-emerald-400">Main Gate Gatekeeper #1</strong> • Security Officer: {activeSecurity?.name || 'Officer S. Ramu'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-xl text-green-400 font-bold">
            Ready for Exit: {readyAtGateStudents.length}
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 rounded-xl text-orange-400 font-bold">
            Currently Outside: {activeOutStudents.length}
          </div>
        </div>
      </div>

      {/* Tab Navigation Bar: Active Desk vs History */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('desk')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeTab === 'desk'
              ? 'bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Active Gate Verification Desk</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-950/40 text-[10px] font-mono">
            {readyAtGateStudents.length + activeOutStudents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Main Gate History Logs ({gateLeaves.length})</span>
        </button>
      </div>

      {activeTab === 'history' ? (
        /* MAIN GATE HISTORY LOGS VIEW */
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                Main Gate Movement Audit Logs
              </h3>
              <p className="text-xs text-slate-400">
                Complete institutional exit & campus entry history recorded by Main Gate Security Officers.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <button
                onClick={() => setHistoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl border transition ${
                  historyFilter === 'all'
                    ? 'bg-slate-800 text-white border-emerald-500/50'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                All Gate Logs ({gateLeaves.length})
              </button>
              <button
                onClick={() => setHistoryFilter('out')}
                className={`px-3 py-1.5 rounded-xl border transition ${
                  historyFilter === 'out'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Currently Outside ({activeOutStudents.length})
              </button>
              <button
                onClick={() => setHistoryFilter('returned')}
                className={`px-3 py-1.5 rounded-xl border transition ${
                  historyFilter === 'returned'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Returned to Campus ({gateLeaves.filter(l => ['RETURNED', 'STUDENT RETURNED'].includes(norm(l.status))).length})
              </button>
            </div>
          </div>

          {/* Search Bar for History */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search Gate History by Student Name, Register Number, Department, or Leave ID..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* History Data Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Register No</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Leave ID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Actual Exit Time</th>
                  <th className="p-3">Actual Return Time</th>
                  <th className="p-3">Gate Officer</th>
                  <th className="p-3">Gate Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredHistoryLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500 text-xs">
                      No gate movement history records found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredHistoryLeaves.map((l) => {
                    const rawExit = l.gateLog?.exitTime || (l.outDate && l.outTime ? `${l.outDate} ${l.outTime}` : null);
                    const rawReturn = l.gateLog?.returnTime || (l.returnDate && l.returnTime ? `${l.returnDate} ${l.returnTime}` : null);
                    
                    const formatCleanDateTime = (val) => {
                      if (!val) return null;
                      const str = String(val).trim();
                      if (!str) return null;
                      if (str.includes('/') && !str.includes('T')) return str;
                      try {
                        const d = new Date(str);
                        if (isNaN(d.getTime())) return str;
                        const datePart = d.toLocaleDateString('en-GB');
                        const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        return `${datePart} ${timePart}`;
                      } catch {
                        return str;
                      }
                    };

                    const exitDisplay = rawExit ? formatCleanDateTime(rawExit) : 'Pending Exit';
                    const returnDisplay = rawReturn ? formatCleanDateTime(rawReturn) : 'Pending Return';
                    const statusUpper = norm(l.status);

                    return (
                      <tr key={l.leaveId} className="hover:bg-slate-900/60 transition">
                        <td className="p-3 font-semibold text-white">{l.studentName}</td>
                        <td className="p-3 font-mono text-slate-400 text-[11px]">{l.registerNo || '111424149000'}</td>
                        <td className="p-3 text-slate-300">{l.dept || 'CSE'}</td>
                        <td className="p-3 font-mono text-indigo-300 font-bold text-[11px]">{l.leaveId}</td>
                        <td className="p-3 text-slate-400 text-[11px]">{l.leaveType || 'Gate Pass'}</td>
                        <td className="p-3 font-mono text-amber-300 text-[11px]">{exitDisplay}</td>
                        <td className="p-3 font-mono text-emerald-300 text-[11px]">{returnDisplay}</td>
                        <td className="p-3 text-slate-400 text-[11px]">{l.gateLog?.securityName || l.gateLogs?.securityName || 'Officer S. Ramu'}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            statusUpper === 'STUDENT OUT'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : statusUpper === 'RETURNED' || statusUpper === 'STUDENT RETURNED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedLeave(l);
                              setActiveTab('desk');
                            }}
                            className="px-3 py-1 bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-300 text-[11px] font-bold rounded-lg transition"
                          >
                            Inspect Pass
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ACTIVE DESK VIEW */

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Scanner & ID Search */}
        <div className="lg:col-span-5 space-y-6">
          {/* Search Box */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              Manual ID or Register No Search
            </h3>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="PEC-CSE_849201 or 111424149000"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20"
              >
                Search
              </button>
            </form>
          </div>

          {/* Mobile Camera QR Scanner Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                📱 Mobile Rear Camera QR Scanner
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-900 text-emerald-300 border border-slate-800 uppercase">
                  📱 REAR CAMERA
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  cameraActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {cameraActive ? '● CAMERA LIVE' : 'CAMERA OFF'}
                </span>
              </div>
            </div>

            {/* Video Feed / Mobile Viewport */}
            <div className="relative aspect-video rounded-2xl bg-slate-950 border-2 border-emerald-500/40 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
              {/* Always present video tag */}
              <video 
                ref={videoRef} 
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`} 
                autoPlay 
                playsInline 
                muted 
              />

              {!cameraActive && (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <QrCode className="w-12 h-12 text-emerald-400/80 mb-2 animate-pulse" />
                  <p className="text-xs text-slate-200 font-bold z-10">Mobile Rear Camera Scanner</p>
                  <p className="text-[10px] text-slate-400 max-w-xs mt-1">
                    Tap "Start Rear Camera" below to scan using your phone's rear camera, or pick a pass image from your photo gallery.
                  </p>
                </div>
              )}

              {/* Precise Viewfinder Square Overlay for QR Alignment */}
              {cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                  <div className="absolute inset-0 bg-slate-950/30" />

                  {/* Centered QR Viewfinder Target Frame */}
                  <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl border-2 border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.4)] flex items-center justify-center overflow-hidden z-10 bg-transparent">
                    {/* Viewfinder Corner Reticles */}
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-md" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-md" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-md" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-md" />

                    {/* Animated Scanning Laser Line */}
                    <div className="w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0 shadow-[0_0_15px_#34d399] animate-bounce" />
                  </div>

                  <p className="relative z-10 text-[10px] font-bold text-emerald-300 bg-slate-950/85 px-3 py-1 rounded-full border border-emerald-500/40 mt-2.5 shadow-lg font-mono tracking-wider">
                    CENTER QR CODE IN BOX
                  </p>
                </div>
              )}
            </div>

            {cameraError && (
              <p className="text-xs text-rose-400 bg-rose-950/60 p-2.5 rounded-xl border border-rose-500/30 font-medium">
                ⚠️ {cameraError}
              </p>
            )}

            {/* Mobile Rear Camera Controls */}
            <div className="space-y-2">
              {!cameraActive ? (
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Rear Camera</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="w-full py-3 bg-slate-800 hover:bg-rose-900/40 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <VideoOff className="w-4 h-4" />
                  <span>Stop Camera</span>
                </button>
              )}

              <div className="flex items-center gap-2 pt-1">
                {hasTorch && cameraActive && (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      torchOn
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>{torchOn ? 'Flashlight ON' : 'Flashlight OFF'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>Scan Pass Photo from Gallery</span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Quick Demo QR Scan Buttons */}
            <div>
              <p className="text-[11px] text-slate-400 font-semibold mb-2">Select Student Pass for Security Scan:</p>
              <div className="space-y-2">
                {readyAtGateStudents.concat(activeOutStudents).slice(0, 3).map((l) => (
                  <button
                    key={l.leaveId}
                    onClick={() => simulateScan(l)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between text-xs transition"
                  >
                    <div className="truncate">
                      <span className="font-bold text-white block truncate">{l.studentName}</span>
                      <span className="text-[10px] font-mono text-indigo-400">{l.leaveId}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      norm(l.status) === 'READY FOR GATE' ? 'status-badge-green' : 'status-badge-orange'
                    }`}>
                      {l.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Verified Student Gate Pass Verification Screen */}
        <div className="lg:col-span-7 space-y-6">
          {scannerFeedback && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              scannerFeedback.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' :
              scannerFeedback.type === 'error' ? 'bg-rose-950/80 text-rose-300 border-rose-500/40' :
              'bg-indigo-950/80 text-indigo-300 border-indigo-500/40'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{scannerFeedback.text}</span>
            </div>
          )}

          {selectedLeave ? (
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 glow-emerald space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-slate-800">
                <div className="w-24 h-28 rounded-xl bg-slate-800 border-2 border-indigo-500/40 flex flex-col items-center justify-center text-center p-2 shrink-0">
                  <User className="w-10 h-10 text-slate-400" />
                  <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase">VERIFIED</span>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedLeave.studentName}</h3>
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                      {selectedLeave.registerNo}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Dept: <strong>{selectedLeave.department} ({selectedLeave.year})</strong> • Sec {selectedLeave.section}
                  </p>

                  <p className="text-xs text-slate-400">
                    Hostel: {selectedLeave.hostelBlock || 'Boys Hostel - Block A'} (Room {selectedLeave.roomNo || 'AG2'})
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-mono font-extrabold text-amber-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                      LEAVE ID: {selectedLeave.leaveId}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white">
                      STATUS: {selectedLeave.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase font-mono">Valid Out Time</span>
                  <p className="font-bold text-amber-400">{selectedLeave.fromDate} @ {selectedLeave.outTime}</p>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block uppercase font-mono">Expected Return Time</span>
                  <p className="font-bold text-emerald-400">{selectedLeave.toDate} @ {selectedLeave.returnTime}</p>
                </div>
              </div>

              <div className="text-xs space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-semibold">Purpose of Exit:</span>
                <p className="text-slate-200 font-medium">{selectedLeave.subject}</p>
                <p className="text-slate-400 text-[11px]">Parent Phone: {selectedLeave.parentPhone}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Gatekeeper Actions
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleExitClick}
                    disabled={norm(selectedLeave.status) === 'STUDENT OUT' || norm(selectedLeave.status) === 'RETURNED'}
                    className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
                      norm(selectedLeave.status) === 'READY FOR GATE'
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Mark Student EXIT</span>
                  </button>

                  <button
                    onClick={handleEntryClick}
                    disabled={norm(selectedLeave.status) !== 'STUDENT OUT'}
                    className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
                      norm(selectedLeave.status) === 'STUDENT OUT'
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Mark Student RETURN</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Gate Verification Desk Ready</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Scan a student's QR Pass using the live camera simulator on the left, or type the Leave ID / Register Number into the search bar.
              </p>
            </div>
          )}

          {/* Gate Logs Activity Table */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              Recent Main Gate Log Entries
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-mono text-[10px]">
                  <tr>
                    <th className="p-2">Student</th>
                    <th className="p-2">Leave ID</th>
                    <th className="p-2">Actual Exit Time</th>
                    <th className="p-2">Actual Return Time</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Gate Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {gateLeaves.map((l) => {
                    const rawExit = l.gateLog?.exitTime || (l.outDate && l.outTime ? `${l.outDate} ${l.outTime}` : null);
                    const rawReturn = l.gateLog?.returnTime || (l.returnDate && l.returnTime ? `${l.returnDate} ${l.returnTime}` : null);
                    
                    const formatCleanDateTime = (val) => {
                      if (!val) return null;
                      const str = String(val).trim();
                      if (!str) return null;
                      if (str.includes('/') && !str.includes('T')) return str;
                      try {
                        const d = new Date(str);
                        if (isNaN(d.getTime())) return str;
                        const datePart = d.toLocaleDateString('en-GB');
                        const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        return `${datePart} ${timePart}`;
                      } catch {
                        return str;
                      }
                    };

                    const exitDisplay = rawExit ? formatCleanDateTime(rawExit) : 'Pending Exit';
                    const returnDisplay = rawReturn ? formatCleanDateTime(rawReturn) : 'Pending Return';

                    return (
                      <tr key={l.leaveId} className="hover:bg-slate-900/50">
                        <td className="p-2 font-semibold text-white">{l.studentName}</td>
                        <td className="p-2 font-mono text-indigo-300 text-[11px]">{l.leaveId}</td>
                        <td className="p-2 font-mono text-amber-300 text-[11px]">{exitDisplay}</td>
                        <td className="p-2 font-mono text-emerald-300 text-[11px]">{returnDisplay}</td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600/30 text-indigo-300">
                            {l.status}
                          </span>
                        </td>
                        <td className="p-2 text-slate-400 text-[11px]">{l.gateLog?.securityName || l.gateLogs?.securityName || 'Gate Officer'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
