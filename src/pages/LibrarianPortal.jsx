import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../services/firebase';
import {
  Library,
  Plus,
  BookOpen,
  CheckSquare,
  Search,
  Trash2,
  RefreshCw,
  Edit,
  ArrowRight,
  TrendingUp,
  Activity,
  History
} from 'lucide-react';

export const LibrarianPortal = ({ subPage }) => {
  const { user } = useAuth();
  
  if (subPage === 'circulation') return <LibrarianCirculation librarian={user} />;
  if (subPage === 'analytics') return <LibrarianAnalytics librarian={user} />;
  if (subPage === 'eresources') return <LibrarianEresources librarian={user} />;
  if (subPage === 'fines') return <LibrarianFines librarian={user} />;
  return <LibrarianInventory librarian={user} />;
};

// 1. LIBRARY INVENTORY PANEL
const LibrarianInventory = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  // Create/Edit form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState('CSE');
  const [totalCopies, setTotalCopies] = useState(5);
  const [editingBookId, setEditingBookId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getBooks();
      setBooks(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!title || !author || !isbn) return;

    try {
      setSubmitting(true);
      if (editingBookId) {
        await mockDB.updateBook(editingBookId, { title, author, isbn, category, totalCopies: Number(totalCopies) });
        showToast('Textbook information updated successfully!', 'success');
      } else {
        await mockDB.addBook(title, author, isbn, category, totalCopies);
        showToast('New textbook added to catalog!', 'success');
      }
      
      // Reset form
      setTitle('');
      setAuthor('');
      setIsbn('');
      setCategory('CSE');
      setTotalCopies(5);
      setEditingBookId(null);
      loadBooks();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (book) => {
    setEditingBookId(book.bookId);
    setTitle(book.title);
    setAuthor(book.author);
    setIsbn(book.isbn);
    setCategory(book.category);
    setTotalCopies(book.totalCopies);
  };

  const handleDelete = (bookId) => {
    setConfirmDeleteId(bookId);
  };

  const executeDelete = async (bookId) => {
    try {
      await mockDB.deleteBook(bookId);
      showToast('Textbook deleted successfully.', 'info');
      loadBooks();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn.includes(search)
  );

  return (
    <div className="space-y-6 text-xs font-semibold font-sans text-white">
      
      {/* Title Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-teal-900/50 to-emerald-900/50 backdrop-blur-xl border border-teal-500/30 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-between gap-4">
        <div>
          <span className="px-3.5 py-1 bg-teal-500/20 text-teal-200 border border-teal-400/30 text-[10px] font-black uppercase tracking-wider rounded-full drop-shadow-md inline-block mb-2">
            Central Catalog
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-white">Library Inventory & Asset Management</h2>
          <p className="text-xs text-gray-100 font-medium drop-shadow-md mt-0.5">Librarian: Madam Pince • KBN Central Catalog Registry</p>
        </div>
        <div className="p-4 bg-white/10 rounded-2xl border border-white/20 shadow-md backdrop-blur-md shrink-0">
          <Library size={26} className="text-teal-300 drop-shadow" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Book Catalog Form */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] self-start space-y-4 text-white">
          <h3 className="text-sm font-extrabold text-gray-100 uppercase tracking-wider drop-shadow-md border-b border-white/15 pb-3">
            {editingBookId ? 'Edit Textbook Record' : 'Register New Textbook'}
          </h3>
          <form onSubmit={handleCreateOrUpdate} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 mb-1.5 uppercase font-bold text-[10px]">Book Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Fundamentals of Computer Networks"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium text-xs shadow-inner"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1.5 uppercase font-bold text-[10px]">Author name(s)</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g., Andrew S. Tanenbaum"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium text-xs shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-1.5 uppercase font-bold text-[10px]">ISBN Number</label>
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="e.g., 978-01321"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium text-xs shadow-inner"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1.5 uppercase font-bold text-[10px]">Subject Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-bold cursor-pointer"
                >
                  <option value="CSE" className="bg-slate-900 text-white">CSE</option>
                  <option value="CSE (AI & ML)" className="bg-slate-900 text-white">CSE (AI & ML)</option>
                  <option value="CSE (Data Science)" className="bg-slate-900 text-white">CSE (Data Science)</option>
                  <option value="ECE" className="bg-slate-900 text-white">ECE</option>
                  <option value="EEE" className="bg-slate-900 text-white">EEE</option>
                  <option value="Mechanical" className="bg-slate-900 text-white">Mechanical</option>
                  <option value="Civil" className="bg-slate-900 text-white">Civil</option>
                  <option value="BCA" className="bg-slate-900 text-white">BCA</option>
                  <option value="BBA" className="bg-slate-900 text-white">BBA</option>
                  <option value="MBA" className="bg-slate-900 text-white">MBA</option>
                  <option value="MCA" className="bg-slate-900 text-white">MCA</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-1.5 uppercase font-bold text-[10px]">Total Copies Count</label>
              <input
                type="number"
                min="1"
                value={totalCopies}
                onChange={(e) => setTotalCopies(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium text-xs shadow-inner"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-500/25 border border-teal-400/40 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <Plus size={14} />
                <span>{editingBookId ? 'Save Edits' : 'Register Book'}</span>
              </button>
              {editingBookId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingBookId(null);
                    setTitle('');
                    setAuthor('');
                    setIsbn('');
                    setCategory('CSE');
                    setTotalCopies(5);
                  }}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-gray-200 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Textbook Table List */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col justify-between text-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <span className="text-xs font-extrabold text-gray-200 uppercase tracking-wider">Catalog Inventory</span>
              <button onClick={loadBooks} className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/10"><RefreshCw size={12} /></button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search catalog by title, author, isbn..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 text-xs focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium shadow-inner"
              />
            </div>

            {loading ? (
              <div className="py-20 text-center animate-pulse text-gray-400">Loading books list...</div>
            ) : filteredBooks.length === 0 ? (
              <div className="py-20 text-center text-gray-400">No books found matching search filters.</div>
            ) : (
              <div className="w-full max-w-full overflow-hidden border border-white/10 rounded-2xl bg-black/40 backdrop-blur-md shadow-lg">
                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="w-[45%] px-4 py-3">Book Info</th>
                      <th className="w-[20%] px-4 py-3">Category</th>
                      <th className="w-[20%] px-4 py-3 text-center whitespace-nowrap">Circulation</th>
                      <th className="w-[15%] px-4 py-3 text-center whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-semibold text-gray-200">
                    {filteredBooks.map(book => (
                      <tr key={book.bookId} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 align-middle">
                          <h4 className="font-bold text-white text-xs drop-shadow-sm break-words">{book.title}</h4>
                          <p className="text-[10px] text-gray-400 font-normal mt-0.5 break-words">{book.author} • ISBN: {book.isbn}</p>
                        </td>
                        <td className="px-4 py-3 align-middle break-words">{book.category}</td>
                        <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[9.5px] font-black inline-block ${
                            book.availableCopies === 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {book.availableCopies} / {book.totalCopies} available
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleEdit(book)} className="p-1.5 bg-white/10 hover:bg-white/20 text-cyan-300 rounded-lg transition-all cursor-pointer"><Edit size={12} /></button>
                            <button onClick={() => handleDelete(book.bookId)} className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg transition-all cursor-pointer"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Custom Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm p-6 bg-black/60 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] space-y-6 text-white">
            <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider">Delete Textbook</h4>
            <p className="text-xs text-gray-300 font-medium">
              Are you sure you want to remove this textbook from catalog?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => executeDelete(confirmDeleteId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all cursor-pointer"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-xl font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// 2. LIBRARY CIRCULATION MANAGEMENT
const LibrarianCirculation = () => {
  const [issues, setIssues] = useState([]);
  const [requests, setRequests] = useState([]);
  const [checkouts, setCheckouts] = useState([]);
  const [history, setHistory] = useState([]);
  
  // Search state
  const [circSearch, setCircSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  // Direct checkout states
  const [rollNumber, setRollNumber] = useState('');
  const [bookIsbn, setBookIsbn] = useState('');
  const [borrowerType, setBorrowerType] = useState('student');
  const [issuing, setIssuing] = useState(false);

  const loadCirculationData = async () => {
    try {
      setLoading(true);
      const allIssues = await mockDB.getAllIssuedBooks();
      setIssues(allIssues);
      setRequests(allIssues.filter(i => i.status === 'requested'));
      setCheckouts(allIssues.filter(i => i.status === 'issued'));
      setHistory(allIssues.filter(i => i.status === 'returned'));
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCirculationData();
  }, []);

  const handleApprove = async (tid) => {
    try {
      await mockDB.approveBookRequest(tid);
      showToast('Book issue request approved!', 'success');
      loadCirculationData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReturn = async (tid) => {
    try {
      const returned = await mockDB.returnBook(tid);
      if (returned.fine > 0) {
        showToast(`Book returned! Collected fine of ₹${returned.fine} for overdue delay.`, 'warning');
      } else {
        showToast('Book return processed successfully.', 'success');
      }
      loadCirculationData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDirectIssue = async (e) => {
    e.preventDefault();
    if (!rollNumber || !bookIsbn) return;

    try {
      setIssuing(true);
      const users = await mockDB.getAllUsers();
      const borrower = users.find(u => 
        u.rollNumber?.toLowerCase() === rollNumber.toLowerCase() || 
        u.uid?.toLowerCase() === rollNumber.toLowerCase()
      );

      if (!borrower) {
        showToast('Borrower Roll Number or UID not found in KBN database.', 'error');
        return;
      }

      await mockDB.issueBookDirectly(
        borrower.uid,
        borrower.fullName,
        borrower.rollNumber || borrower.uid,
        borrowerType,
        bookIsbn
      );

      showToast(`Book issued directly to ${borrower.fullName}!`, 'success');
      setRollNumber('');
      setBookIsbn('');
      loadCirculationData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIssuing(false);
    }
  };

  // Filter lists based on search string
  const filteredRequests = requests.filter(r => 
    r.studentName.toLowerCase().includes(circSearch.toLowerCase()) ||
    r.bookTitle.toLowerCase().includes(circSearch.toLowerCase()) ||
    r.rollNumber.toLowerCase().includes(circSearch.toLowerCase())
  );

  const filteredCheckouts = checkouts.filter(c => 
    c.studentName.toLowerCase().includes(circSearch.toLowerCase()) ||
    c.bookTitle.toLowerCase().includes(circSearch.toLowerCase()) ||
    c.rollNumber.toLowerCase().includes(circSearch.toLowerCase())
  );

  const filteredHistory = history.filter(h => 
    h.studentName.toLowerCase().includes(circSearch.toLowerCase()) ||
    h.bookTitle.toLowerCase().includes(circSearch.toLowerCase()) ||
    h.rollNumber.toLowerCase().includes(circSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs font-semibold font-sans">
      
      {/* 1. CIRCULATION BANNER (BLUE TINTED GLASS) */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-xl border border-blue-500/30 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-between gap-4">
        <div>
          <span className="px-3.5 py-1 bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider rounded-full drop-shadow-md inline-block mb-2">
            Library Asset Operations
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-white">Circulation Board & Checkout Logs</h2>
          <p className="text-xs text-gray-100 font-medium drop-shadow-md mt-0.5">Approve checkout requests, record returns, and audit library ledger</p>
        </div>
        <div className="p-4 bg-white/10 rounded-2xl border border-white/20 shadow-md backdrop-blur-md shrink-0">
          <CheckSquare size={26} className="text-blue-300 drop-shadow" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* 2. DIRECT BOOK ISSUE PANEL */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] self-start space-y-5 text-white">
          <h3 className="text-sm font-extrabold text-gray-100 tracking-widest uppercase drop-shadow-md border-b border-white/15 pb-3">
            Direct Book Issue
          </h3>
          <form onSubmit={handleDirectIssue} className="space-y-4">
            <div>
              <label className="block text-white font-bold drop-shadow-sm mb-2 uppercase text-[10.5px]">Borrower Roll No. / Employee ID</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g., CSE-2023-001"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-medium text-xs shadow-inner"
              />
            </div>

            <div>
              <label className="block text-white font-bold drop-shadow-sm mb-2 uppercase text-[10.5px]">Book ISBN Number</label>
              <input
                type="text"
                value={bookIsbn}
                onChange={(e) => setBookIsbn(e.target.value)}
                placeholder="e.g., 978-0262033848"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-medium text-xs shadow-inner"
              />
            </div>

            <div>
              <label className="block text-white font-bold drop-shadow-sm mb-2 uppercase text-[10.5px]">Borrower Role Class</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-gray-100 font-bold drop-shadow-sm">
                  <input
                    type="radio"
                    name="borrowerType"
                    checked={borrowerType === 'student'}
                    onChange={() => setBorrowerType('student')}
                    className="accent-blue-500"
                  />
                  <span>Student (Fine Applicable)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-100 font-bold drop-shadow-sm">
                  <input
                    type="radio"
                    name="borrowerType"
                    checked={borrowerType === 'faculty'}
                    onChange={() => setBorrowerType('faculty')}
                    className="accent-blue-500"
                  />
                  <span>Faculty (Exempted)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={issuing}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 border border-blue-400/40 flex items-center justify-center gap-2 drop-shadow cursor-pointer hover:scale-[1.02]"
            >
              <span>{issuing ? 'Processing...' : 'Complete Direct Issue'}</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

        {/* 3. AUDIT & CIRCULATION RECORDS PANEL */}
        <div className="lg:col-span-3 space-y-6">
          
          <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white">
            
            <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-4">
              <span className="text-sm font-extrabold text-gray-100 tracking-widest uppercase drop-shadow-md">Audit & Filter Records</span>
              <button onClick={loadCirculationData} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/10 shadow-sm"><RefreshCw size={14} /></button>
            </div>

            <div className="relative mb-5">
              <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions by borrower name, roll no, or title..."
                value={circSearch}
                onChange={(e) => setCircSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-medium text-xs shadow-inner"
              />
            </div>

            {/* Subsections */}
            <div className="space-y-6">
              
              {/* Requests */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-extrabold text-gray-200 block tracking-wider drop-shadow-sm">Pending Borrow Requests ({filteredRequests.length})</span>
                {filteredRequests.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-white/20 rounded-xl text-gray-300">No pending student checkout requests.</div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredRequests.map(req => (
                      <div key={req.transactionId} className="p-3.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center justify-between shadow-sm">
                        <div>
                          <h4 className="font-extrabold text-white text-xs drop-shadow-sm">{req.bookTitle}</h4>
                          <p className="text-[10px] text-gray-200 mt-0.5 font-semibold">Borrower: {req.studentName} ({req.rollNumber})</p>
                        </div>
                        <button
                          onClick={() => handleApprove(req.transactionId)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black shadow-md border border-emerald-400/40 cursor-pointer hover:scale-[1.02]"
                        >
                          Approve Request
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active checkouts */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-extrabold text-gray-200 block tracking-wider drop-shadow-sm">Active Borrow Checkouts ({filteredCheckouts.length})</span>
                {filteredCheckouts.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-white/20 rounded-xl text-gray-300">No books currently checked out.</div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredCheckouts.map(item => (
                      <div key={item.transactionId} className="p-3.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center justify-between shadow-sm">
                        <div>
                          <h4 className="font-extrabold text-white text-xs drop-shadow-sm">{item.bookTitle}</h4>
                          <p className="text-[10px] text-gray-200 mt-0.5 font-semibold">Checked out to: {item.studentName} ({item.rollNumber})</p>
                          <div className="flex gap-2 items-center mt-1 text-[9.5px] font-bold text-gray-300">
                            <span>Issued: {item.issueDate}</span>
                            <span>●</span>
                            <span>Due: {item.dueDate}</span>
                            {item.fine > 0 && (
                              <>
                                <span>●</span>
                                <span className="text-rose-400 font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Fine: ₹{item.fine}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleReturn(item.transactionId)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-[10px] font-black shadow-md border border-indigo-400/40 cursor-pointer hover:scale-[1.02]"
                        >
                          Record Return
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Return History */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-extrabold text-gray-200 block tracking-wider drop-shadow-sm">Recent Return Logs ({filteredHistory.length})</span>
                {filteredHistory.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-white/20 rounded-xl text-gray-300">No returned transaction records found.</div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {filteredHistory.map(hist => (
                      <div key={hist.transactionId} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                          <h4 className="font-extrabold text-white text-xs drop-shadow-sm">{hist.bookTitle}</h4>
                          <p className="text-[9.5px] text-gray-300 mt-0.5">Borrower: {hist.studentName} ({hist.rollNumber})</p>
                          <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Returned on: {hist.returnDate} {hist.fine > 0 && `(Fine paid: ₹${hist.fine})`}</p>
                        </div>
                        <span className="text-[9.5px] px-2.5 py-0.5 bg-white/10 border border-white/20 text-gray-200 rounded font-black uppercase">Returned</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
// 3. EXECUTIVE LIBRARY ANALYTICS
const LibrarianAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await mockDB.getLibraryAnalytics();
        setStats(data);
      } catch (_) {}
      finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="py-20 text-center animate-pulse text-gray-400">Loading library metrics...</div>;
  }

  return (
    <div className="space-y-6 text-xs font-semibold text-white">
      {/* Title Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-xl border border-blue-500/30 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-between gap-4">
        <div>
          <span className="px-3.5 py-1 bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider rounded-full drop-shadow-md inline-block mb-2">
            Asset Intelligence
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-white">Executive Library Analytics</h2>
          <p className="text-xs text-gray-100 font-medium drop-shadow-md mt-0.5">Real-time circulation metrics, inventory turnover, and checkout trends</p>
        </div>
        <div className="p-4 bg-white/10 rounded-2xl border border-white/20 shadow-md backdrop-blur-md shrink-0">
          <Activity size={26} className="text-cyan-300 drop-shadow" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-between hover:bg-black/50 transition-all">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Book Titles</span>
            <p className="text-3xl font-black text-white mt-1.5">{stats?.totalTitles}</p>
          </div>
          <div className="p-3 bg-blue-500/20 text-cyan-300 rounded-2xl border border-blue-500/30"><BookOpen size={20} /></div>
        </div>
        <div className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-between hover:bg-black/50 transition-all">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Shelf Copies</span>
            <p className="text-3xl font-black text-white mt-1.5">{stats?.totalCopies}</p>
          </div>
          <div className="p-3 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-500/30"><Library size={20} /></div>
        </div>
        <div className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-between hover:bg-black/50 transition-all">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Active Checked Out</span>
            <p className="text-3xl font-black text-emerald-400 mt-1.5">{stats?.activeIssued}</p>
          </div>
          <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-500/30"><RefreshCw size={20} /></div>
        </div>
        <div className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-between hover:bg-black/50 transition-all">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Overdue Returns</span>
            <p className="text-3xl font-black text-rose-400 mt-1.5">{stats?.overdueCount}</p>
          </div>
          <div className="p-3 bg-rose-500/20 text-rose-300 rounded-2xl border border-rose-500/30"><TrendingUp size={20} /></div>
        </div>
      </div>
    </div>
  );
};

// 4. DIGITAL E-RESOURCES & RESEARCH JOURNALS
const LibrarianEresources = () => {
  const [resources, setResources] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('IEEE Journal');
  const [accessType, setAccessType] = useState('Open Campus IP');
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await mockDB.getEresources();
      setResources(data);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleAddEresource = async (e) => {
    e.preventDefault();
    if (!title || !author) return;
    try {
      await mockDB.addEresource(title, author, category, accessType, '#');
      showToast('Digital E-Resource published to repository!', 'success');
      setTitle('');
      setAuthor('');
      loadResources();
    } catch (_) {
      showToast('Could not publish resource.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold text-white">
      {/* Title Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-xl border border-blue-500/30 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-between gap-4">
        <div>
          <span className="px-3.5 py-1 bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider rounded-full drop-shadow-md inline-block mb-2">
            Digital Repository
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-white">E-Resources & Research Journals</h2>
          <p className="text-xs text-gray-100 font-medium drop-shadow-md mt-0.5">Publish and curate IEEE, Springer, ACM, and open access repositories</p>
        </div>
        <div className="p-4 bg-white/10 rounded-2xl border border-white/20 shadow-md backdrop-blur-md shrink-0">
          <BookOpen size={26} className="text-cyan-300 drop-shadow" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] self-start space-y-4 text-white">
          <h3 className="text-sm font-extrabold text-gray-100 border-b border-white/15 pb-3">Publish Digital E-Resource / Journal</h3>
          <form onSubmit={handleAddEresource} className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Publication Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. IEEE Transactions on AI 2026" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium text-xs shadow-inner" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Publisher / Author</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required placeholder="e.g. Springer Nature" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium text-xs shadow-inner" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Resource Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-bold cursor-pointer">
                  <option value="IEEE Journal" className="bg-slate-900 text-white">IEEE Journal</option>
                  <option value="Springer Book" className="bg-slate-900 text-white">Springer Book</option>
                  <option value="ScienceDirect" className="bg-slate-900 text-white">ScienceDirect</option>
                  <option value="ACM Digital" className="bg-slate-900 text-white">ACM Digital</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">Access Protocol</label>
                <input type="text" value={accessType} onChange={(e) => setAccessType(e.target.value)} placeholder="Campus IP" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium text-xs shadow-inner" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 border border-blue-400/40 cursor-pointer hover:scale-[1.02] mt-2">
              Publish Digital Asset
            </button>
          </form>
        </div>

        <div className="lg:col-span-3 p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-4 text-white">
          <span className="text-xs font-extrabold text-gray-200 uppercase tracking-wider block border-b border-white/15 pb-4">Catalogued E-Journals & Repositories</span>
          {loading ? (
            <div className="py-20 text-center animate-pulse text-gray-400">Loading catalog...</div>
          ) : (
            <div className="space-y-3">
              {resources.map(res => (
                <div key={res.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-xs drop-shadow-sm">{res.title}</h4>
                      <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Author: {res.author} • Protocol: {res.accessType}</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-blue-500/20 text-cyan-300 border border-blue-500/30 rounded font-black text-[9.5px]">{res.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 5. FINES & NO-DUES CLEARANCE DESK
const LibrarianFines = () => {
  const [rollNumber, setRollNumber] = useState('CSE-2023-001');
  const [student, setStudent] = useState(null);
  const { showToast } = useAuth();

  const handleSearchStudent = async () => {
    try {
      const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
      const found = users.find(u => u.role === 'student' && u.rollNumber?.toLowerCase() === rollNumber.toLowerCase());
      if (!found) {
        showToast('Student record not found.', 'warning');
        setStudent(null);
        return;
      }
      setStudent(found);
    } catch (_) {}
  };

  useEffect(() => {
    handleSearchStudent();
  }, []);

  const handleIssueNoDues = async () => {
    if (!student) return;
    try {
      await mockDB.issueNoDuesClearance(student.uid);
      showToast(`Library No-Dues Clearance Certificate generated for ${student.fullName}!`, 'success');
    } catch (_) {
      showToast('Could not issue clearance.', 'error');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-xs font-semibold space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-white">Library Fines & Graduation No-Dues Desk</h3>
          <p className="text-xs text-gray-400 mt-1">Search student roll number to clear library fine balances and release official No-Dues clearance</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Roll Number (e.g. CSE-2023-001)"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-400 text-xs focus:outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium shadow-inner"
          />
          <button onClick={handleSearchStudent} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all cursor-pointer shadow-md">Search</button>
        </div>
      </div>

      {student ? (
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm text-white">{student.fullName}</h4>
              <span className="text-[10px] text-gray-400 font-bold">Roll: {student.rollNumber} • Dept: {student.department || 'CSE'}</span>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase">Zero Active Penalties</span>
          </div>

          <div className="flex justify-end pt-2 border-t border-white/10">
            <button onClick={handleIssueNoDues} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow cursor-pointer hover:scale-[1.02]">
              Issue Library No-Dues Certificate
            </button>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-gray-400">Search a student roll number above to audit dues.</div>
      )}
    </div>
  );
};
